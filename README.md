# Auto Notations

Auto Notations turns exported PLAUD transcripts into formatted Google Docs.

The first pass is a Google Apps Script workflow:

1. Export a completed PLAUD transcript as `.txt`.
2. Upload it to a Google Drive folder named `PLAUD Incoming Transcripts`.
3. Apps Script runs on a time trigger and finds unprocessed files.
4. The script creates a formatted Google Doc in `PLAUD Formatted Notes`.
5. The original transcript is moved to `PLAUD Processed Transcripts`.

## Folder Layout

Create these folders in Google Drive:

```text
Auto Notations/
  PLAUD Incoming Transcripts/
  PLAUD Processed Transcripts/
  PLAUD Formatted Notes/
```

Copy each folder ID from its Google Drive URL. A folder URL looks like:

```text
https://drive.google.com/drive/folders/FOLDER_ID_IS_HERE
```

## Apps Script Files

- `apps-script/Code.gs` contains the workflow.
- `apps-script/appsscript.json` contains the required Apps Script scopes.

See `docs/setup-google-apps-script.md` for setup steps.

## Current Scope

This version formats plain text transcripts with a simple template. It does not
yet call an AI model. The next pass can add an OpenAI formatter that extracts
summaries, decisions, action items, and follow-up tasks from the transcript.

