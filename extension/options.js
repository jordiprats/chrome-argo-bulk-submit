import { getSettings, cleanHost } from './lib.js';

const $ = id => document.getElementById(id);
const s = await getSettings();
$('host').value = s.host;
$('writeFile').checked = s.writeFile;

$('save').onclick = async () => {
  const host = cleanHost($('host').value);
  $('host').value = host;
  // Reading the session cookie needs access to that host; must be requested from this click.
  if (host && !(await chrome.permissions.request({ origins: [`https://${host}/*`] }))) {
    $('msg').textContent = 'Permission for that host was not granted.';
    return;
  }
  await chrome.storage.sync.set({ host, writeFile: $('writeFile').checked });
  $('msg').textContent = 'Saved.';
};
