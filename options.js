/* global chrome: false */
/* eslint-env browser */

/** Loads options from chrome.storage. */
function loadOptions() {
  chrome.storage.sync.get(
    {
      work: '',
      always: '',
    },
    (items) => {
      document.getElementById('work').value = items.work;
      document.getElementById('always').value = items.always;
    },
  );
}

/** Saves options to chrome.storage. */
function saveOptions() {
  // No validation--this is just for my own use.
  const work = document.getElementById('work').value;
  const always = document.getElementById('always').value;
  chrome.storage.sync.set(
    { work, always },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'saved!';
      chrome.declarativeNetRequest.getDynamicRules().then((r) => {
        newRules = always.split('\n').map(value => value.trim()).filter((v) => v != "").map((t, i) => {return {
          action: {
            type: "redirect",
            redirect: {
              url: 'data:text/html;base64,ICA8IURPQ1RZUEUgaHRtbD4NCiAgPGh0bWw+PGhlYWQ+PHRpdGxlPk5JQ0UgVFJZPC90aXRsZT48L2hlYWQ+PGJvZHk+PHNwYW4gc3R5bGU9ImZvbnQtZmFjZTogYm9sZDsgZm9udC1zaXplOiAzMGVtOyI+Tk9QRTwvc3Bhbj48L2JvZHk+PC9odG1sPg=='
            }
          },
          condition: {
            urlFilter: "*://*" + t + "*/*",
            resourceTypes: ["main_frame"]
          },
          id: i+1
        }});
        const oldIds = r.map((v) => v.id)
        chrome.declarativeNetRequest.updateDynamicRules({addRules: newRules, removeRuleIds: oldIds})
      });

      setTimeout(() => { status.textContent = ''; }, 750);
    },
  );
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
