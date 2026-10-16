import { bulkEnabled, enableBulk, disableBulk } from './lib.js';

// "Submit Bulk" is switched on per Argo site: the user grants that origin, then the content script is
// registered for it. Only shown when the active tab is an https page.
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
let origin = null;
try {
  const u = new URL(tab?.url ?? '');
  if (u.protocol === 'https:') origin = u.origin;
} catch { /* chrome:// etc. */ }

if (origin) {
  const box = document.getElementById('bulk');
  const status = document.getElementById('bulk-status');
  const toggle = document.getElementById('bulk-toggle');
  box.hidden = false;

  // The background worker registers the script once the permission lands, so after a click wait
  // (briefly) for the state to flip before redrawing.
  const refresh = async (expectOn = null, retries = 5) => {
    const on = await bulkEnabled(origin);
    if (expectOn !== null && on !== expectOn && retries > 0) {
      await new Promise(r => setTimeout(r, 300));
      return refresh(expectOn, retries - 1);
    }
    status.textContent = on ? `Bulk submit is on for ${origin}` : `Bulk submit is off for ${origin}`;
    toggle.textContent = on ? 'Disable on this site' : 'Enable bulk submit on this site';
    toggle.onclick = async () => {
      try {
        if (on) await disableBulk(origin); else await enableBulk(origin);
      } catch (e) {
        status.textContent = `Failed: ${e.message}`;
        return;
      }
      refresh(!on);
    };
  };
  refresh();
}
