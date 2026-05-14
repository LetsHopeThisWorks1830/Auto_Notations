# Google Apps Script Setup

## 1. Create Google Drive Folders

Create this folder structure in Google Drive:

```text
Auto Notations/
  PLAUD Incoming Transcripts/
  PLAUD Processed Transcripts/
  PLAUD Formatted Notes/
```

The incoming transcript folder is already configured:

```text
PLAUD Incoming Transcripts: 1KwOOWBrUEL8i9vRk4FNWDesJDdZWLd66
```

Open the processed and formatted notes folders and copy their folder IDs from
the URL.

## 2. Create The Apps Script Project

1. Go to https://script.google.com/.
2. Create a new project named `Auto Notations`.
3. Add the contents of `apps-script/Code.gs`.
4. Open project settings and enable `Show "appsscript.json" manifest file in editor`.
5. Replace the manifest with `apps-script/appsscript.json`.

## 3. Configure Folder IDs

In `Code.gs`, update `configureAutoNotations()`:

```js
properties.setProperties({
  INCOMING_FOLDER_ID: '1KwOOWBrUEL8i9vRk4FNWDesJDdZWLd66',
  OUTPUT_FOLDER_ID: 'your formatted notes folder ID',
  PROCESSED_FOLDER_ID: 'your processed transcripts folder ID'
}, true);
```

Run `configureAutoNotations()` once from the Apps Script editor.

## 4. Install The Timer

Run `installTimeTrigger()` once from the Apps Script editor.

The script will then run `processPlaudTranscripts()` every 10 minutes.

## 5. Test It

1. Export a completed PLAUD transcript as `.txt`.
2. Upload the file to `PLAUD Incoming Transcripts`.
3. Run `processPlaudTranscripts()` manually once.
4. Confirm that:
   - a Google Doc appears in `PLAUD Formatted Notes`
   - the transcript moves to `PLAUD Processed Transcripts`
   - the original file description includes `auto-notations:processed`

## Notes

- This first pass only processes `.txt` transcript exports.
- It creates placeholder summary and decision sections.
- It lightly detects action items by looking for phrases like `action item`, `follow up`, and `next step`.
- The next pass can add AI formatting while keeping this same folder workflow.
