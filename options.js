/* global chrome: false */
/* eslint-env browser */

/** Loads options from chrome.storage. */
function loadOptions() {
  chrome.storage.sync.get(
    {
      allow: '',
      block: '',
    },
    (items) => {
      document.getElementById('allow').value = items.allow;
      document.getElementById('block').value = items.block;
    },
  );
}

/** Saves options to chrome.storage. */
function saveOptions() {
  // No validation--this is just for my own use.
  const allow = document.getElementById('allow').value;
  const block = document.getElementById('block').value;
  chrome.storage.sync.set(
    { allow, block },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'saved!';
      newBlockRules = block.split('\n').map(value => value.trim()).filter((v) => v != "").map((t, i) => {return {
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
      newAllowRules = allow.split('\n').map(value => value.trim()).filter((v) => v != "").map((t, i) => {return {
        action: {
          type: "allow",
        },
        priority: 2,
        condition: {
          urlFilter: "*://*" + t + "*/*",
          resourceTypes: ["main_frame"]
        },
        id: newBlockRules.length+i+1
      }});

      if (newAllowRules.length > 0) {
        newAllowRules.push({
          id: newAllowRules.length + newBlockRules.length + 1,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              url: 'data:text/html;base64,ICA8IURPQ1RZUEUgaHRtbD4NCiAgPGh0bWw+PGhlYWQ+PHRpdGxlPk5JQ0UgVFJZPC90aXRsZT48L2hlYWQ+PGJvZHk+PHNwYW4gc3R5bGU9ImZvbnQtZmFjZTogYm9sZDsgZm9udC1zaXplOiAzMGVtOyI+Tk9QRTwvc3Bhbj48L2JvZHk+PC9odG1sPg=='
            }
          },
          condition: {
            urlFilter: "*",
            resourceTypes: ["main_frame"]
          }
        })
      }

      chrome.declarativeNetRequest.getDynamicRules().then((r) => {
        const oldIds = r.map((v) => v.id)
        chrome.declarativeNetRequest.updateDynamicRules({addRules: [...newBlockRules, ...newAllowRules], removeRuleIds: oldIds})
      });

      setTimeout(() => { status.textContent = ''; }, 750);
    },
  );
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
