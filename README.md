# Where Do We Stand

A public questionnaire of 25 marriage and family scenarios. Anyone with the link enters a name, answers every scenario, and submits once. Answers land in a Google Sheet. A private results page compares everyone side by side.

## Files

| File | What it is |
|---|---|
| `index.html` | The public questions page |
| `results.html` | The private comparison page (needs the key in its link) |
| `config.js` | Where you paste your Google web-app URL |
| `questions.js` | The 25 scenarios and their options |
| `styles.css` | Shared styling, light and dark mode |
| `Code.gs` | The Google Apps Script that saves and serves answers |

## Setup (about 5 minutes)

### 1. Create the Google Sheet backend

1. Create a new Google Sheet, e.g. "Where Do We Stand responses".
2. Open **Extensions → Apps Script**.
3. Delete what's in `Code.gs` there and paste in the contents of this folder's `Code.gs`. Save.
4. In the function dropdown at the top, choose **setup** and click **Run**. Approve the permission prompts (choose your account → Advanced → Go to project).
5. Open **Execution log**. Copy the line `Your RESULTS KEY is: …`. Keep it private.
6. Click **Deploy → New deployment**. Click the gear icon, choose **Web app**, then set:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).

### 2. Connect the pages

Open `config.js` and replace `PASTE_YOUR_WEB_APP_URL_HERE` with the Web app URL.

### 3. Publish on GitHub Pages

1. Create a new repository, e.g. `where-do-we-stand`, and upload all files from this folder (`Code.gs` and `README.md` can stay in too; they're harmless).
2. Go to **Settings → Pages**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. After a minute your site is live at `https://codelikesuraj.github.io/where-do-we-stand/`.

### 4. Your two links

- **Share with everyone:** `https://codelikesuraj.github.io/where-do-we-stand/`
- **Keep private, share only with people who should compare:**
  `https://codelikesuraj.github.io/where-do-we-stand/results.html?key=YOUR_RESULTS_KEY`

## How it behaves

- People enter a name first, can jump between scenarios freely, and their progress is kept in their browser until they submit.
- Submit only works when all 25 scenarios have an answer. After submitting, the page locks and their answers can't be changed.
- Each submission adds one row to the **Responses** tab: time, name, Q1–Q25, and a browser ID used to block accidental double submits.
- The results page is live: press **Refresh** to load new submissions.

## Good to know

- The lock is per browser. Someone who clears their browser data or switches device could submit again. Duplicates are easy to spot in the Sheet by name and time; delete the extra row to remove it from the results.
- To remove anyone from the comparison, delete their row in the Sheet.
- To change the results key: in Apps Script go to **Project Settings → Script properties**, edit `RESULTS_KEY`. Old results links stop working immediately.
- If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → Version: New version** so the same URL keeps working.
