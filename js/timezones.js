/* Timezone database and utility functions */

/**
 * Year for which `expectedJanOffset` / `expectedJulOffset` were captured.
 * Bump when refreshing the snapshot below. The stale-IANA banner only fires
 * when the runtime year matches this value — outside that window we assume
 * legitimate drift (rule changes since snapshot) rather than browser bugs.
 */
export const EXPECTED_OFFSETS_YEAR = 2026;

/**
 * Each entry includes:
 *   - iana, windows, label, aliases — as before
 *   - expectedJanOffset / expectedJulOffset (minutes east of UTC)
 *     captured from a current ICU snapshot at EXPECTED_OFFSETS_YEAR.
 *     If a user's browser disagrees, the script-generation panel
 *     surfaces a stale-IANA warning.
 */
export const timezoneDatabase = [
  { iana: 'Etc/GMT+12', windows: 'Dateline Standard Time', label: 'International Date Line West', aliases: [], expectedJanOffset: -720, expectedJulOffset: -720 },
  { iana: 'Etc/GMT+11', windows: 'UTC-11', label: 'Coordinated Universal Time-11', aliases: [], expectedJanOffset: -660, expectedJulOffset: -660 },
  { iana: 'Pacific/Honolulu', windows: 'Hawaiian Standard Time', label: 'USA / Honolulu', aliases: ['Maui', 'Oahu', 'Kauai', 'Hilo'], expectedJanOffset: -600, expectedJulOffset: -600 },
  { iana: 'America/Anchorage', windows: 'Alaskan Standard Time', label: 'USA / Anchorage', aliases: ['Fairbanks', 'Juneau'], expectedJanOffset: -540, expectedJulOffset: -480 },
  { iana: 'America/Los_Angeles', windows: 'Pacific Standard Time', label: 'USA / Los Angeles', aliases: ['San Francisco', 'Seattle', 'Portland', 'Las Vegas', 'San Diego', 'Sacramento', 'Vancouver'], expectedJanOffset: -480, expectedJulOffset: -420 },
  { iana: 'America/Denver', windows: 'Mountain Standard Time', label: 'USA / Denver', aliases: ['Salt Lake City', 'Albuquerque', 'Boise', 'Calgary', 'Edmonton'], expectedJanOffset: -420, expectedJulOffset: -360 },
  { iana: 'America/Phoenix', windows: 'US Mountain Standard Time', label: 'USA / Phoenix', aliases: ['Tucson', 'Mesa', 'Scottsdale'], expectedJanOffset: -420, expectedJulOffset: -420 },
  { iana: 'America/Chicago', windows: 'Central Standard Time', label: 'USA / Chicago', aliases: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Minneapolis', 'Milwaukee', 'Nashville', 'New Orleans', 'Memphis', 'Oklahoma City', 'Winnipeg'], expectedJanOffset: -360, expectedJulOffset: -300 },
  { iana: 'America/Regina', windows: 'Canada Central Standard Time', label: 'Canada / Regina', aliases: ['Saskatoon'], expectedJanOffset: -360, expectedJulOffset: -360 },
  { iana: 'America/New_York', windows: 'Eastern Standard Time', label: 'USA / New York', aliases: ['Washington', 'Boston', 'Philadelphia', 'Atlanta', 'Miami', 'Detroit', 'Charlotte', 'Pittsburgh', 'Orlando', 'Tampa', 'Cleveland', 'Toronto', 'Montreal', 'Ottawa'], expectedJanOffset: -300, expectedJulOffset: -240 },
  { iana: 'America/Halifax', windows: 'Atlantic Standard Time', label: 'Canada / Halifax', aliases: ['Fredericton', 'Charlottetown'], expectedJanOffset: -240, expectedJulOffset: -180 },
  { iana: 'America/St_Johns', windows: 'Newfoundland Standard Time', label: 'Canada / St. Johns', aliases: [], expectedJanOffset: -210, expectedJulOffset: -150 },
  { iana: 'America/Sao_Paulo', windows: 'E. South America Standard Time', label: 'Brazil / Sao Paulo', aliases: ['Rio de Janeiro', 'Brasilia', 'Belo Horizonte'], expectedJanOffset: -180, expectedJulOffset: -180 },
  { iana: 'America/Bogota', windows: 'SA Pacific Standard Time', label: 'Colombia / Bogota', aliases: ['Medellin', 'Lima', 'Quito'], expectedJanOffset: -300, expectedJulOffset: -300 },
  { iana: 'America/Argentina/Buenos_Aires', windows: 'Argentina Standard Time', label: 'Argentina / Buenos Aires', aliases: ['Cordoba', 'Rosario', 'Mendoza'], expectedJanOffset: -180, expectedJulOffset: -180 },
  { iana: 'Atlantic/Azores', windows: 'Azores Standard Time', label: 'Portugal / Azores', aliases: [], expectedJanOffset: -60, expectedJulOffset: 0 },
  { iana: 'Atlantic/Cape_Verde', windows: 'Cape Verde Standard Time', label: 'Cape Verde / Praia', aliases: [], expectedJanOffset: -60, expectedJulOffset: -60 },
  { iana: 'Europe/London', windows: 'GMT Standard Time', label: 'UK / London', aliases: ['Manchester', 'Birmingham', 'Glasgow', 'Edinburgh', 'Liverpool', 'Dublin', 'Belfast', 'Lisbon'], expectedJanOffset: 0, expectedJulOffset: 60 },
  { iana: 'Europe/Paris', windows: 'Romance Standard Time', label: 'France / Paris', aliases: ['Lyon', 'Marseille', 'Toulouse', 'Brussels', 'Amsterdam', 'Luxembourg', 'Madrid', 'Barcelona'], expectedJanOffset: 60, expectedJulOffset: 120 },
  { iana: 'Europe/Berlin', windows: 'W. Europe Standard Time', label: 'Germany / Berlin', aliases: ['Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Vienna', 'Zurich', 'Bern', 'Rome', 'Milan', 'Copenhagen', 'Stockholm', 'Oslo'], expectedJanOffset: 60, expectedJulOffset: 120 },
  { iana: 'Europe/Warsaw', windows: 'Central European Standard Time', label: 'Poland / Warsaw', aliases: ['Krakow', 'Wroclaw', 'Gdansk', 'Poznan', 'Prague', 'Budapest', 'Bratislava', 'Ljubljana', 'Zagreb', 'Belgrade'], expectedJanOffset: 60, expectedJulOffset: 120 },
  { iana: 'Europe/Athens', windows: 'GTB Standard Time', label: 'Greece / Athens', aliases: ['Thessaloniki', 'Bucharest', 'Sofia', 'Istanbul', 'Helsinki', 'Tallinn', 'Riga', 'Vilnius', 'Kyiv'], expectedJanOffset: 120, expectedJulOffset: 180 },
  { iana: 'Europe/Moscow', windows: 'Russian Standard Time', label: 'Russia / Moscow', aliases: ['Saint Petersburg', 'Minsk'], expectedJanOffset: 180, expectedJulOffset: 180 },
  { iana: 'Africa/Lagos', windows: 'W. Central Africa Standard Time', label: 'Nigeria / Lagos', aliases: ['Abuja', 'Kano', 'Ibadan', 'Douala', 'Yaounde', 'Kinshasa', 'Luanda', 'Libreville', 'Bangui', 'Ndjamena', 'Niamey', 'Porto-Novo', 'Malabo', 'West Africa Time'], expectedJanOffset: 60, expectedJulOffset: 60 },
  { iana: 'Africa/Cairo', windows: 'Egypt Standard Time', label: 'Egypt / Cairo', aliases: ['Alexandria', 'Giza'], expectedJanOffset: 120, expectedJulOffset: 180 },
  { iana: 'Africa/Johannesburg', windows: 'South Africa Standard Time', label: 'South Africa / Johannesburg', aliases: ['Cape Town', 'Durban', 'Pretoria', 'Harare', 'Maputo'], expectedJanOffset: 120, expectedJulOffset: 120 },
  { iana: 'Africa/Nairobi', windows: 'E. Africa Standard Time', label: 'Kenya / Nairobi', aliases: ['Mombasa', 'Kisumu', 'Addis Ababa', 'Dar es Salaam', 'Kampala', 'Mogadishu', 'Asmara', 'Djibouti', 'Khartoum', 'Juba', 'Antananarivo', 'East Africa Time'], expectedJanOffset: 180, expectedJulOffset: 180 },
  { iana: 'Asia/Jerusalem', windows: 'Israel Standard Time', label: 'Israel / Jerusalem', aliases: ['Tel Aviv', 'Haifa'], expectedJanOffset: 120, expectedJulOffset: 180 },
  { iana: 'Asia/Riyadh', windows: 'Arab Standard Time', label: 'Saudi Arabia / Riyadh', aliases: ['Jeddah', 'Mecca', 'Kuwait City', 'Doha', 'Bahrain', 'Manama'], expectedJanOffset: 180, expectedJulOffset: 180 },
  { iana: 'Asia/Dubai', windows: 'Arabian Standard Time', label: 'UAE / Dubai', aliases: ['Abu Dhabi', 'Sharjah', 'Muscat'], expectedJanOffset: 240, expectedJulOffset: 240 },
  { iana: 'Asia/Tehran', windows: 'Iran Standard Time', label: 'Iran / Tehran', aliases: ['Isfahan', 'Tabriz', 'Mashhad'], expectedJanOffset: 210, expectedJulOffset: 210 },
  { iana: 'Asia/Karachi', windows: 'Pakistan Standard Time', label: 'Pakistan / Karachi', aliases: ['Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'], expectedJanOffset: 300, expectedJulOffset: 300 },
  { iana: 'Asia/Kolkata', windows: 'India Standard Time', label: 'India / Kolkata', aliases: ['Delhi', 'New Delhi', 'Mumbai', 'Bangalore', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Calcutta', 'Surat'], expectedJanOffset: 330, expectedJulOffset: 330 },
  { iana: 'Asia/Dhaka', windows: 'Bangladesh Standard Time', label: 'Bangladesh / Dhaka', aliases: ['Chittagong'], expectedJanOffset: 360, expectedJulOffset: 360 },
  { iana: 'Asia/Yekaterinburg', windows: 'Ekaterinburg Standard Time', label: 'Russia / Yekaterinburg', aliases: ['Chelyabinsk', 'Perm'], expectedJanOffset: 300, expectedJulOffset: 300 },
  { iana: 'Asia/Bangkok', windows: 'SE Asia Standard Time', label: 'Thailand / Bangkok', aliases: ['Hanoi', 'Ho Chi Minh City', 'Jakarta', 'Phnom Penh'], expectedJanOffset: 420, expectedJulOffset: 420 },
  { iana: 'Asia/Novosibirsk', windows: 'N. Central Asia Standard Time', label: 'Russia / Novosibirsk', aliases: ['Omsk'], expectedJanOffset: 420, expectedJulOffset: 420 },
  { iana: 'Asia/Shanghai', windows: 'China Standard Time', label: 'China / Shanghai', aliases: ['Beijing', 'Shenzhen', 'Guangzhou', 'Hong Kong', 'Taipei', 'Singapore', 'Kuala Lumpur', 'Manila'], expectedJanOffset: 480, expectedJulOffset: 480 },
  { iana: 'Asia/Krasnoyarsk', windows: 'North Asia Standard Time', label: 'Russia / Krasnoyarsk', aliases: [], expectedJanOffset: 420, expectedJulOffset: 420 },
  { iana: 'Asia/Irkutsk', windows: 'North Asia East Standard Time', label: 'Russia / Irkutsk', aliases: [], expectedJanOffset: 480, expectedJulOffset: 480 },
  { iana: 'Asia/Tokyo', windows: 'Tokyo Standard Time', label: 'Japan / Tokyo', aliases: ['Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Seoul', 'Busan'], expectedJanOffset: 540, expectedJulOffset: 540 },
  { iana: 'Asia/Yakutsk', windows: 'Yakutsk Standard Time', label: 'Russia / Yakutsk', aliases: [], expectedJanOffset: 540, expectedJulOffset: 540 },
  { iana: 'Asia/Vladivostok', windows: 'Vladivostok Standard Time', label: 'Russia / Vladivostok', aliases: [], expectedJanOffset: 600, expectedJulOffset: 600 },
  { iana: 'Asia/Magadan', windows: 'Magadan Standard Time', label: 'Russia / Magadan', aliases: [], expectedJanOffset: 660, expectedJulOffset: 660 },
  { iana: 'Australia/Darwin', windows: 'AUS Central Standard Time', label: 'Australia / Darwin', aliases: [], expectedJanOffset: 570, expectedJulOffset: 570 },
  { iana: 'Australia/Adelaide', windows: 'Cen. Australia Standard Time', label: 'Australia / Adelaide', aliases: [], expectedJanOffset: 630, expectedJulOffset: 570 },
  { iana: 'Australia/Brisbane', windows: 'E. Australia Standard Time', label: 'Australia / Brisbane', aliases: ['Gold Coast'], expectedJanOffset: 600, expectedJulOffset: 600 },
  { iana: 'Australia/Sydney', windows: 'AUS Eastern Standard Time', label: 'Australia / Sydney', aliases: ['Melbourne', 'Canberra', 'Hobart'], expectedJanOffset: 660, expectedJulOffset: 600 },
  { iana: 'Australia/Perth', windows: 'W. Australia Standard Time', label: 'Australia / Perth', aliases: [], expectedJanOffset: 480, expectedJulOffset: 480 },
  { iana: 'Pacific/Guam', windows: 'West Pacific Standard Time', label: 'Guam / Hagatna', aliases: [], expectedJanOffset: 600, expectedJulOffset: 600 },
  { iana: 'Pacific/Auckland', windows: 'New Zealand Standard Time', label: 'New Zealand / Auckland', aliases: ['Wellington', 'Christchurch'], expectedJanOffset: 780, expectedJulOffset: 720 },
  { iana: 'Pacific/Tongatapu', windows: 'Tonga Standard Time', label: 'Tonga / Nuku\'alofa', aliases: [], expectedJanOffset: 780, expectedJulOffset: 780 },
  { iana: 'Pacific/Fiji', windows: 'Fiji Standard Time', label: 'Fiji / Suva', aliases: [], expectedJanOffset: 720, expectedJulOffset: 720 },
  { iana: 'Pacific/Pago_Pago', windows: 'UTC-11', label: 'Midway Island / Samoa', aliases: [], expectedJanOffset: -660, expectedJulOffset: -660 },
  { iana: 'UTC', windows: 'UTC', label: 'UTC', aliases: ['Greenwich', 'Zulu'], expectedJanOffset: 0, expectedJulOffset: 0 },
  { iana: 'Etc/GMT+6', windows: 'Central America Standard Time', label: 'Salesforce / MCE', aliases: ['SFMC', 'Marketing Cloud', 'ExactTarget'], expectedJanOffset: -360, expectedJulOffset: -360 }
];

/**
 * Compare the user's browser Intl offsets against the snapshot baked into
 * `timezoneDatabase`. Returns true when either Jan or Jul disagrees — that's
 * the trigger for the inline stale-IANA warning above the generated scripts.
 *
 * Falsy result when no expected values exist or when the runtime year is
 * outside the snapshot year (legitimate drift through time isn't a bug).
 */
export function isOffsetStale(iana, runtimeYear = new Date().getFullYear()) {
  if (runtimeYear !== EXPECTED_OFFSETS_YEAR) return false;
  const tz = tzByIana.get(iana);
  if (!tz || typeof tz.expectedJanOffset !== 'number') return false;
  const jan = new Date(Date.UTC(runtimeYear, 0, 1));
  const jul = new Date(Date.UTC(runtimeYear, 6, 1));
  const runtimeJan = getOffsetMinutes(iana, jan);
  const runtimeJul = getOffsetMinutes(iana, jul);
  return runtimeJan !== tz.expectedJanOffset || runtimeJul !== tz.expectedJulOffset;
}

// Pre-built lookup map for O(1) timezone data access
const tzByIana = new Map(timezoneDatabase.map(tz => [tz.iana, tz]));
export function getTzByIana(iana) { return tzByIana.get(iana) || null; }

export function getOffsetMinutes(timeZone, referenceDate = new Date()) {
  try {
    const str = referenceDate.toLocaleString('en-US', { timeZone, timeZoneName: 'longOffset' });
    const match = str.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const mins = parseInt(match[3], 10);
    return sign * (hours * 60 + mins);
  } catch (e) {
    return 0;
  }
}

export function getOffsetString(timeZone, referenceDate = new Date()) {
  try {
    const str = referenceDate.toLocaleString('en-US', { timeZone, timeZoneName: 'longOffset' });
    const match = str.match(/GMT([+-]\d{2}:\d{2})/);
    return match ? `GMT${match[1]}` : 'GMT+00:00';
  } catch (e) {
    return 'GMT+00:00';
  }
}

// Pre-processed timezone list sorted by offset
export function getProcessedTimezones() {
  // Probe winter and summer to collect both standard and daylight abbreviations (e.g. CET/CEST, EST/EDT)
  const year = new Date().getFullYear();
  const winterDate = new Date(year, 0, 15);
  const summerDate = new Date(year, 6, 15);

  return timezoneDatabase.map(tz => {
    const offsetMins = getOffsetMinutes(tz.iana);
    const sign = offsetMins >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMins);
    const h = Math.floor(abs / 60).toString().padStart(2, '0');
    const m = (abs % 60).toString().padStart(2, '0');
    const offsetLabel = `GMT${sign}${h}:${m}`;

    const aliasStr = (tz.aliases || []).join(' ').toLowerCase();

    const winterAbbr = getTimezoneShortCode(tz.iana, winterDate);
    const summerAbbr = getTimezoneShortCode(tz.iana, summerDate);
    const abbrList = [...new Set([winterAbbr, summerAbbr])]
      .filter(a => a && !a.startsWith('GMT'));
    // Mark abbreviations with ^caret^ tokens so exact abbrev matches can be prioritised
    const abbrTokens = abbrList.map(a => `^${a.toLowerCase()}^`).join(' ');
    const abbrs = abbrList.join(' ');

    return {
      id: tz.iana,
      city: tz.label,
      windows: tz.windows,
      aliases: tz.aliases || [],
      abbrs: abbrList,
      offsetMins,
      offsetLabel,
      searchStr: (tz.label + " " + tz.iana + " " + tz.windows + " " + aliasStr + " " + abbrs + " " + abbrTokens).toLowerCase(),
      original: tz
    };
  }).sort((a, b) => a.offsetMins - b.offsetMins);
}

// Find which alias matched a search term
export function findMatchingAlias(aliases, filter) {
  if (!filter || !aliases || !aliases.length) return null;
  const lower = filter.toLowerCase();
  return aliases.find(a => a.toLowerCase().includes(lower)) || null;
}

// Find which abbreviation matched a search term (e.g. "CEST" → "CEST")
export function findMatchingAbbr(tzId, filter, ref = new Date()) {
  if (!filter || !tzId) return null;
  const lower = filter.toLowerCase();
  const year = ref.getFullYear();
  const winterDate = new Date(year, 0, 15);
  const summerDate = new Date(year, 6, 15);
  const candidates = [
    getTimezoneShortCode(tzId, winterDate),
    getTimezoneShortCode(tzId, summerDate),
  ].filter(a => a && !a.startsWith('GMT'));
  return candidates.find(a => a.toLowerCase().includes(lower)) || null;
}

// Common long-name-to-abbreviation map for when Intl returns GMT+X
const longNameAbbreviations = {
  'British Summer Time': 'BST', 'Greenwich Mean Time': 'GMT',
  'Central European Standard Time': 'CET', 'Central European Summer Time': 'CEST',
  'Eastern European Standard Time': 'EET', 'Eastern European Summer Time': 'EEST',
  'Western European Standard Time': 'WET', 'Western European Summer Time': 'WEST',
  'Moscow Standard Time': 'MSK',
  'Japan Standard Time': 'JST', 'Korea Standard Time': 'KST',
  'China Standard Time': 'CST', 'Hong Kong Standard Time': 'HKT',
  'India Standard Time': 'IST', 'Pakistan Standard Time': 'PKT',
  'Arabian Standard Time': 'AST', 'Gulf Standard Time': 'GST',
  'Israel Standard Time': 'IST', 'Israel Daylight Time': 'IDT',
  'Iran Standard Time': 'IRST', 'Iran Daylight Time': 'IRDT',
  'Australian Eastern Standard Time': 'AEST', 'Australian Eastern Daylight Time': 'AEDT',
  'Australian Central Standard Time': 'ACST', 'Australian Central Daylight Time': 'ACDT',
  'Australian Western Standard Time': 'AWST',
  'New Zealand Standard Time': 'NZST', 'New Zealand Daylight Time': 'NZDT',
  'South Africa Standard Time': 'SAST', 'East Africa Time': 'EAT',
  'West Africa Standard Time': 'WAT',
  'Bangladesh Standard Time': 'BST', 'Indochina Time': 'ICT',
};

export function getTimezoneShortCode(tz, ref = new Date()) {
  try {
    // Try Intl short name first
    const short = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(ref).find(p => p.type === 'timeZoneName')?.value || '';
    if (short && !short.startsWith('GMT')) return short;

    // Fallback: derive from long name
    const long = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'long' })
      .formatToParts(ref).find(p => p.type === 'timeZoneName')?.value || '';
    if (long && longNameAbbreviations[long]) return longNameAbbreviations[long];

    // Last resort: build from long name initials (e.g. "Central European Summer Time" → "CEST")
    if (long) {
      const initials = long.split(' ').map(w => w[0]).join('').toUpperCase();
      if (initials.length >= 2 && initials.length <= 5) return initials;
    }

    return short; // Return GMT+X if nothing else
  } catch (e) {
    return '';
  }
}
