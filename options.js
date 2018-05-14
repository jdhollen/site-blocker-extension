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
      setTimeout(() => { status.textContent = ''; }, 750);
    },
  );
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
