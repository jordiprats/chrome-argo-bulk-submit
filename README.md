# Argo Submit

A Chrome extension that bridges the Argo Workflows web UI with the `argo` CLI and provides a **bulk submission** feature for running multiple workflow templates in sequence.

## Installation

### Extension

1. Clone the repo.
2. Load the `extension/` directory as an unpacked extension in Chrome:
   - Go to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `extension/` folder

## Usage

### Bulk submitting workflows

1. Navigate to an Argo Workflows namespace page.
2. Click **Submit Bulk** (next to the normal "Submit New Workflow" button).
3. Type your commands, one per line, e.g.:
   ```
   --from workflowtemplate/helm-create-kyverno -p region=$region -p clusterName=$cluster -p dryRun=false
   --from workflowtemplate/helm-create-kyverno-addons -p region=$region -p clusterName=$cluster -p dryRun=false
   ```
4. Select the desired regions and clusters from the pickers.
5. Click **Validate** to dry-run, or **Run** to submit.

## Supported command syntax

Each line follows the `argo submit` CLI format:

```
--from workflowtemplate/<name> -p <name>=<value> [-p ...]
```

- `--from workflowtemplate/<name>` — the template to submit (required)
- `-p` / `--parameter` — parameters as `name=value`
- `--wait` / `--watch` — ignored (the runner always waits)
- `-n` / `--namespace` — **not allowed** (namespace comes from the page)
- Lines starting with `#` are treated as comments
- Backslash continuation (`\` at end of line) joins with the next line
- `$region`, `${region}`, `$cluster`, `$clusterName`, `${clusterName}` are replaced by picker selections

## Development

### Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (Manifest V3) |
| `background.js` | Service worker: cookie sync, bulk script registration |
| `lib.js` | Shared library: cookie reading, settings, native messaging, bulk script helpers |
| `parse.js` | Parser for `argo submit`-style command lines (also usable in Node) |
| `bulk.js` | Content script: injects "Submit Bulk" modal |
| `popup.html` / `popup.js` | Toolbar popup UI for token actions |
| `popup-bulk.js` | Popup logic for enabling/disabling bulk per site |
| `options.html` / `options.js` | Settings page for host configuration |

### Tests

```bash
node --test test/parse.test.js
```
