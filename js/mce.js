/* MCE date conversion and script generation */

import { getTzByIana, getOffsetMinutes } from './timezones.js?v=2.4.0';
import * as clocks from './clocks.js?v=2.4.0';

let scriptsPanel = null;

export function init({ showScripts }) {
  scriptsPanel = showScripts;
}

export function applyMceDate(inputVal) {
  if (!inputVal) return { success: false, message: 'No input provided.' };

  // Pre-process common variations
  inputVal = inputVal.replace(/(\d)(AM|PM)/i, '$1 $2');
  inputVal = inputVal.replace(/([a-z]{3}\s\d{1,2})\s(\d{4})/i, '$1, $2');

  const nominalDate = new Date(inputVal);

  if (isNaN(nominalDate.getTime())) {
    return { success: false, message: 'Invalid format.' };
  }

  const year = nominalDate.getFullYear();
  const month = nominalDate.getMonth();
  const day = nominalDate.getDate();
  const hour = nominalDate.getHours();
  const min = nominalDate.getMinutes();
  const sec = nominalDate.getSeconds();
  const ms = nominalDate.getMilliseconds();

  // UTC = SalesforceTime + 6 hours
  const override = new Date(Date.UTC(year, month, day, hour + 6, min, sec, ms));
  clocks.setOverrideTime(override);

  return { success: true, message: 'Locked to Salesforce (UTC-6)' };
}

/**
 * Hemisphere-agnostic DST detection with minute-precision transition timestamps.
 *
 * Returns one of:
 *   { hasDST: false }
 *   { hasDST: true, springTransition: Date, fallTransition: Date,
 *     standardOffset: number, dstOffset: number }
 *
 * springTransition = the moment DST begins (clocks jump forward).
 * fallTransition   = the moment DST ends   (clocks fall back).
 * Northern hemisphere: spring < fall in calendar order.
 * Southern hemisphere: fall < spring in calendar order (DST spans Jan).
 */
export function getDSTTransitions(iana, year) {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jul1 = new Date(Date.UTC(year, 6, 1));
  const nextJan1 = new Date(Date.UTC(year + 1, 0, 1));

  const offsetJan = getOffsetMinutes(iana, jan1);
  const offsetJul = getOffsetMinutes(iana, jul1);

  if (offsetJan === offsetJul) return { hasDST: false };

  const transition1 = findTransitionExact(jan1.getTime(), jul1.getTime(), iana, offsetJan);
  const transition2 = findTransitionExact(jul1.getTime(), nextJan1.getTime(), iana, offsetJul);
  const isNorthern = offsetJan < offsetJul;

  return {
    hasDST: true,
    springTransition: isNorthern ? transition1 : transition2,
    fallTransition: isNorthern ? transition2 : transition1,
    standardOffset: Math.min(offsetJan, offsetJul),
    dstOffset: Math.max(offsetJan, offsetJul),
  };
}

/**
 * Binary-search the boundary in [startMs, endMs] where the offset changes
 * away from `startOffset`. Returns the first instant on the new offset,
 * resolved to ±1 minute.
 */
function findTransitionExact(startMs, endMs, iana, startOffset) {
  let left = startMs;
  let right = endMs;
  while (right - left > 60000) {
    const mid = Math.floor((left + right) / 2);
    if (getOffsetMinutes(iana, new Date(mid)) === startOffset) left = mid;
    else right = mid;
  }
  return new Date(right);
}

export function generateScriptsForTimezone(iana, isLocal, forceDST = false) {
  const tzEntry = getTzByIana(iana);
  const windowsName = tzEntry ? tzEntry.windows : 'Target Standard Time';
  const now = clocks.getOverrideTime() || new Date();
  const isUtc = iana === 'UTC';

  const systemOffset = -360; // SFMC is fixed UTC-6
  const currentYear = now.getFullYear();

  // Render the transition timestamp as it appears in the *target* timezone —
  // that's the wall-clock instant that AMPScript/SSJS will compare against.
  const transition = getDSTTransitions(iana, currentYear);
  const hasDST = transition.hasDST;

  const standardOffsetHours = ((hasDST ? transition.standardOffset : getOffsetMinutes(iana, new Date(Date.UTC(currentYear, 0, 1)))) - systemOffset) / 60;
  const dstOffsetHours = ((hasDST ? transition.dstOffset : getOffsetMinutes(iana, new Date(Date.UTC(currentYear, 6, 1)))) - systemOffset) / 60;

  // Timezone shortcut for alias
  let tzShort = 'TZ';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'short' });
    tzShort = formatter.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'TZ';
  } catch {
    // Fallback to default if Intl doesn't support this timezone
  }

  const sanitizedTz = tzShort
    .replace(/\+/g, '_plus_')
    .replace(/-/g, '_minus_')
    .replace(/:/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  // SQL
  const sqlSnippet = `[DateColumn] AT TIME ZONE 'Central America Standard Time' AT TIME ZONE '${windowsName}' AS [DateColumn_${sanitizedTz}]`;

  let ampSnippet, ssjsSnippet;

  if (isLocal) {
    ampSnippet = `%%[\n    VAR @date, @convertedDate\n    SET @date = [DateColumn]\n    SET @convertedDate = SystemDateToLocalDate(@date)\n]%%`;
    ssjsSnippet = `<script runat="server">\n    Platform.Load('Core', '1.1.1');\n    var date = Attribute.GetValue('DateColumn');\n    var convertedDate = Platform.Function.SystemDateToLocalDate(date);\n</script>`;
  } else if ((!hasDST && !forceDST) || isUtc) {
    // Simple fixed offset — no DST
    const fixedOffset = standardOffsetHours;
    ampSnippet = `%%[\n    VAR @date, @convertedDate\n    SET @date = [DateColumn]\n    SET @convertedDate = DateAdd(@date, ${fixedOffset}, 'H')\n]%%`;
    ssjsSnippet = `<script runat="server">\n    Platform.Load('Core', '1.1.1');\n    var date = Attribute.GetValue('DateColumn');\n    var convertedDate = Platform.Function.DateAdd(date, ${fixedOffset}, 'H');\n</script>`;
  } else {
    // DST-aware code with minute-precision boundaries.
    // Northern: dstStart = spring (begin), dstEnd = fall (end), DST is between.
    // Southern: spring is later in the year — DST wraps Jan, so we invert the comparison.
    const isNorthern = transition.hasDST
      ? transition.springTransition.getTime() < transition.fallTransition.getTime()
      : true;

    const dstStartMMDDHHMM = transition.hasDST
      ? formatTransitionInTz(transition.springTransition, iana)
      : { mmdd: '03-30', hhmm: '02:00' };
    const dstEndMMDDHHMM = transition.hasDST
      ? formatTransitionInTz(transition.fallTransition, iana)
      : { mmdd: '10-26', hhmm: '02:00' };

    const dstStart = `${dstStartMMDDHHMM.mmdd} ${dstStartMMDDHHMM.hhmm}`;
    const dstEnd = `${dstEndMMDDHHMM.mmdd} ${dstEndMMDDHHMM.hhmm}`;
    const summerOff = transition.hasDST ? dstOffsetHours : standardOffsetHours + 1;
    const winterOff = standardOffsetHours;

    // For Southern Hemisphere DST wraps the year boundary, so the IF
    // becomes an OR (date >= springStart OR date <= fallEnd).
    const ampDstCondition = isNorthern
      ? 'IF @date >= @dstStart AND @date < @dstEnd THEN'
      : 'IF @date >= @dstStart OR @date < @dstEnd THEN';

    const ssjsDstCondition = isNorthern
      ? '(date >= dstStart && date < dstEnd)'
      : '(date >= dstStart || date < dstEnd)';

    ampSnippet = `%%[
    VAR @date, @dstStart, @dstEnd, @offset, @convertedDate
    SET @date = [DateColumn]
    /* Verify boundaries match your timezone (MM-DD HH:MM, target-zone wall time) */
    SET @dstStart = CONCAT(DatePart(@date, 'Y'), '-${dstStart}')
    SET @dstEnd = CONCAT(DatePart(@date, 'Y'), '-${dstEnd}')

    ${ampDstCondition}
        SET @offset = ${summerOff} /* DST offset */
    ELSE
        SET @offset = ${winterOff} /* Standard offset */
    ENDIF

    SET @convertedDate = DateAdd(@date, @offset, 'H')
]%%`;

    ssjsSnippet = `<script runat="server">
    Platform.Load('Core', '1.1.1');

    var date = new Date(Attribute.GetValue('DateColumn'));
    var year = date.getFullYear();
    // Verify boundaries match your timezone (MM-DD HH:MM, target-zone wall time)
    var dstStart = new Date(year + '-${dstStart.replace(' ', 'T')}');
    var dstEnd = new Date(year + '-${dstEnd.replace(' ', 'T')}');

    // DST offset: ${summerOff}, Standard offset: ${winterOff}
    var offset = ${ssjsDstCondition} ? ${summerOff} : ${winterOff};
    var convertedDate = Platform.Function.DateAdd(date, offset, 'H');
</script>`;
  }

  return { sql: sqlSnippet, ampscript: ampSnippet, ssjs: ssjsSnippet, isLocal, hasDST, forceDST };
}

/**
 * Format a transition Date as MM-DD and HH:MM in the *target* timezone's
 * wall-clock — the value AMPScript/SSJS will see when reading the row.
 */
function formatTransitionInTz(date, iana) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: iana,
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (t) => parts.find(p => p.type === t)?.value || '00';
  // Intl can render hour as "24" at midnight in some locales — normalize.
  let hh = get('hour');
  if (hh === '24') hh = '00';
  return { mmdd: `${get('month')}-${get('day')}`, hhmm: `${hh}:${get('minute')}` };
}
