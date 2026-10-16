import { COOKIE_NAME, getSettings, readToken, cookieMatchesHost, pushToHost, syncBulk } from './lib.js';

// Keep ~/.cache/argo-sso/env fresh: push the token to the native host whenever the cookie changes
// and once at browser start.
async function sync() {
  const { host, writeFile } = await getSettings();
  if (!host || !writeFile) return;
  const t = await readToken(host);
  if (!t) return;
  try {
    await pushToHost(host, t.token);
  } catch (e) {
    console.warn('argo-submit: native host not reachable (run install.sh?)', e);
  }
}

chrome.cookies.onChanged.addListener(async ({ cookie, removed }) => {
  if (removed || cookie.name !== COOKIE_NAME) return;
  const { host } = await getSettings();
  if (host && cookieMatchesHost(cookie, host)) sync();
});

chrome.runtime.onStartup.addListener(sync);
chrome.runtime.onInstalled.addListener(sync);
chrome.storage.onChanged.addListener(sync);

// Bulk submit: keep the content-script registrations in step with the sites the user has granted.
chrome.permissions.onAdded.addListener(syncBulk);
chrome.permissions.onRemoved.addListener(syncBulk);
chrome.runtime.onStartup.addListener(syncBulk);
chrome.runtime.onInstalled.addListener(syncBulk);
