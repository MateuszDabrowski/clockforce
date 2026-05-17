/* App entry point — module orchestration */

/* Clickjacking defense. X-Frame-Options / CSP frame-ancestors are header-
   only and cannot be delivered on GitHub Pages (see SECURITY.md), so this
   JS frame-buster is the fallback. Clockforce is never legitimately embedded
   in a frame, so breaking out (or hiding, if a cross-origin parent blocks
   navigation) is always safe. */
if (window.self !== window.top) {
  try {
    window.top.location = window.self.location.href;
  } catch (_) {
    document.documentElement.style.display = 'none';
  }
}

import * as theme from './theme.js?v=2.4.1';
import * as clocks from './clocks.js?v=2.4.1';
import * as mce from './mce.js?v=2.4.1';
import * as toolbar from './toolbar.js?v=2.4.1';
import * as sidebarTz from './sidebar-tz.js?v=2.4.1';
import * as sidebarScripts from './sidebar-scripts.js?v=2.4.1';
import * as timeline from './timeline.js?v=2.4.1';
import * as saveload from './saveload.js?v=2.4.1';

// Toast notification
let toastTimeout;
function showToast(msg) {
  const el = document.getElementById('notification-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.add('hidden'), 3000);
}

// Load shared state from URL if present (before module init)
saveload.loadFromURL();

// Initialize modules in order
theme.init();

clocks.init({
  onClocksChange: () => {
    sidebarTz.refresh();
    toolbar.updateResetVisibility();
    timeline.render();
  },
  toast: showToast,
  onClockClick: (tz) => toolbar.setPickerTz(tz)
});

mce.init({
  showScripts: (iana, isLocal) => sidebarScripts.showForTimezone(iana, isLocal)
});

sidebarTz.init();
sidebarTz.setOnRename(() => {
  clocks.rerender();
  timeline.render();
});
sidebarScripts.init();
toolbar.setToast(showToast);
toolbar.init();
