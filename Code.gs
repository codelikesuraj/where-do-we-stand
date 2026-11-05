/**
 * Where Do We Stand: Google Sheet backend
 *
 * Paste this into Extensions > Apps Script of a new Google Sheet.
 * 1. Run `setup` once (approve the permissions). It creates the
 *    "Responses" tab and logs your secret RESULTS KEY.
 * 2. Deploy > New deployment > Web app
 *      Execute as: Me
 *      Who has access: Anyone
 *    Copy the Web app URL into config.js.
 */

const SHEET_NAME = 'Responses';
const QUESTION_COUNT = 25;
const VALID = ['A', 'B', 'C', 'D'];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  const headers = ['Submitted at', 'Name'];
  for (let i = 1; i <= QUESTION_COUNT; i++) headers.push('Q' + i);
  headers.push('Client ID');
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);

  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('RESULTS_KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '');
    props.setProperty('RESULTS_KEY', key);
  }
  Logger.log('Your RESULTS KEY is: ' + key);
  Logger.log('Results link: <your site>/results.html?key=' + key);
}

/** Submissions from the questions page. */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ ok: false, error: 'bad_request' });
  }

  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const clientId = String(body.clientId || '').slice(0, 64);
  const answers = body.answers || {};
  if (!name) return json({ ok: false, error: 'missing_name' });
  if (!clientId) return json({ ok: false, error: 'bad_request' });

  const row = [new Date(), name];
  for (let i = 1; i <= QUESTION_COUNT; i++) {
    const a = answers[i] || answers[String(i)];
    if (VALID.indexOf(a) === -1) return json({ ok: false, error: 'incomplete', question: i });
    row.push(a);
  }
  row.push(clientId);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const last = sheet.getLastRow();
    if (last > 1) {
      const ids = sheet.getRange(2, QUESTION_COUNT + 3, last - 1, 1).getValues();
      if (ids.some(r => r[0] === clientId)) return json({ ok: true, duplicate: true });
    }
    // Prefix text cells that could be read as formulas
    if (/^[=+\-@]/.test(row[1])) row[1] = "'" + row[1];
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return json({ ok: true });
}

/** Results for the results page. Requires ?key=RESULTS_KEY */
function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('RESULTS_KEY');
  if (!key || !e.parameter || e.parameter.key !== key) {
    return json({ ok: false, error: 'unauthorized' });
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let r = 1; r < values.length; r++) {
    const v = values[r];
    if (!v[1]) continue;
    const answers = {};
    for (let i = 1; i <= QUESTION_COUNT; i++) {
      const a = String(v[i + 1]).trim();
      if (VALID.indexOf(a) !== -1) answers[i] = a;
    }
    rows.push({
      submittedAt: v[0] instanceof Date ? v[0].toISOString() : String(v[0]),
      name: String(v[1]).replace(/^'/, ''),
      answers: answers
    });
  }
  return json({ ok: true, rows: rows });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
