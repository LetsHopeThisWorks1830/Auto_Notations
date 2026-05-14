/**
 * Auto Notations - Google Apps Script first pass.
 *
 * Configure the folder IDs once, then install a time trigger.
 * The trigger scans the incoming folder for transcript files and creates
 * formatted Google Docs in the output folder.
 */

const CONFIG_KEYS = {
  incomingFolderId: 'INCOMING_FOLDER_ID',
  outputFolderId: 'OUTPUT_FOLDER_ID',
  processedFolderId: 'PROCESSED_FOLDER_ID'
};

const DEFAULT_TRIGGER_MINUTES = 10;

function configureAutoNotations() {
  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    [CONFIG_KEYS.incomingFolderId]: 'PASTE_INCOMING_FOLDER_ID_HERE',
    [CONFIG_KEYS.outputFolderId]: 'PASTE_OUTPUT_FOLDER_ID_HERE',
    [CONFIG_KEYS.processedFolderId]: 'PASTE_PROCESSED_FOLDER_ID_HERE'
  }, true);
}

function installTimeTrigger() {
  removeExistingTriggers_('processPlaudTranscripts');

  ScriptApp.newTrigger('processPlaudTranscripts')
    .timeBased()
    .everyMinutes(DEFAULT_TRIGGER_MINUTES)
    .create();
}

function processPlaudTranscripts() {
  const config = getConfig_();
  const incomingFolder = DriveApp.getFolderById(config.incomingFolderId);
  const outputFolder = DriveApp.getFolderById(config.outputFolderId);
  const processedFolder = DriveApp.getFolderById(config.processedFolderId);
  const files = incomingFolder.getFiles();

  while (files.hasNext()) {
    const file = files.next();

    if (!shouldProcessFile_(file)) {
      continue;
    }

    try {
      const transcript = extractTranscriptText_(file);
      const formatted = buildFormattedNotes_(file, transcript);
      const doc = createFormattedDoc_(formatted, transcript);
      const docFile = DriveApp.getFileById(doc.getId());

      outputFolder.addFile(docFile);
      DriveApp.getRootFolder().removeFile(docFile);

      moveFile_(file, incomingFolder, processedFolder);
      markFileProcessed_(file, doc.getUrl());
    } catch (error) {
      console.error(`Failed to process ${file.getName()}: ${error.stack || error}`);
    }
  }
}

function shouldProcessFile_(file) {
  const description = file.getDescription() || '';

  if (description.indexOf('auto-notations:processed') !== -1) {
    return false;
  }

  const mimeType = file.getMimeType();
  const name = file.getName().toLowerCase();

  return mimeType === MimeType.PLAIN_TEXT || name.endsWith('.txt');
}

function extractTranscriptText_(file) {
  return file.getBlob().getDataAsString('UTF-8').trim();
}

function buildFormattedNotes_(file, transcript) {
  const title = stripExtension_(file.getName());
  const actionItems = extractActionItemCandidates_(transcript);

  return {
    title,
    sourceFileName: file.getName(),
    sourceFileUrl: file.getUrl(),
    createdAt: new Date(),
    summary: 'Summary placeholder. In the next pass, this section will be generated from the transcript.',
    decisions: [],
    actionItems
  };
}

function createFormattedDoc_(formatted, transcript) {
  const doc = DocumentApp.create(`${formatted.title} - Notes`);
  const body = doc.getBody();

  body.clear();
  body.appendParagraph(formatted.title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(`Created: ${formatted.createdAt.toLocaleString()}`);
  body.appendParagraph(`Source: ${formatted.sourceFileName}`);
  body.appendParagraph(formatted.sourceFileUrl);

  body.appendParagraph('Executive Summary').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(formatted.summary);

  body.appendParagraph('Decisions').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  appendListOrPlaceholder_(body, formatted.decisions, 'No decisions identified yet.');

  body.appendParagraph('Action Items').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  appendListOrPlaceholder_(body, formatted.actionItems, 'No action items identified yet.');

  body.appendParagraph('Open Questions').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('No open questions identified yet.');

  body.appendParagraph('Full Transcript').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph(transcript);

  doc.saveAndClose();
  return doc;
}

function appendListOrPlaceholder_(body, items, placeholder) {
  if (!items.length) {
    body.appendParagraph(placeholder);
    return;
  }

  items.forEach((item) => body.appendListItem(item));
}

function extractActionItemCandidates_(transcript) {
  const actionWords = ['action item', 'follow up', 'todo', 'to do', 'next step', 'need to'];
  const lines = transcript.split(/\r?\n/);

  return lines
    .map((line) => line.trim())
    .filter((line) => {
      const lower = line.toLowerCase();
      return actionWords.some((word) => lower.indexOf(word) !== -1);
    })
    .slice(0, 25);
}

function getConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const config = {
    incomingFolderId: properties.getProperty(CONFIG_KEYS.incomingFolderId),
    outputFolderId: properties.getProperty(CONFIG_KEYS.outputFolderId),
    processedFolderId: properties.getProperty(CONFIG_KEYS.processedFolderId)
  };

  Object.keys(config).forEach((key) => {
    if (!config[key] || config[key].indexOf('PASTE_') === 0) {
      throw new Error(`Missing script property: ${key}`);
    }
  });

  return config;
}

function moveFile_(file, fromFolder, toFolder) {
  toFolder.addFile(file);
  fromFolder.removeFile(file);
}

function markFileProcessed_(file, outputDocUrl) {
  const stamp = new Date().toISOString();
  file.setDescription(`auto-notations:processed\nprocessedAt:${stamp}\noutputDoc:${outputDocUrl}`);
}

function removeExistingTriggers_(handlerName) {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === handlerName)
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
}

function stripExtension_(fileName) {
  return fileName.replace(/\.[^/.]+$/, '');
}
