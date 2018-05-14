/* global chrome: false */

// A list of sites that are blocked during working hours.
let work = [];
// A list of sites that are always blocked.
let always = [];

// A base64-encoded webpage that says NOPE in 30em font.
const redirectResult = { redirectUrl: 'data:text/html;base64,ICA8IURPQ1RZUEUgaHRtbD4NCiAgPGh0bWw+PGhlYWQ+PHRpdGxlPk5JQ0UgVFJZPC90aXRsZT48L2hlYWQ+PGJvZHk+PHNwYW4gc3R5bGU9ImZvbnQtZmFjZTogYm9sZDsgZm9udC1zaXplOiAzMGVtOyI+Tk9QRTwvc3Bhbj48L2JvZHk+PC9odG1sPg==' };

/**
 * Splits a user's domain settings by newlines and trims whitespace off of each
 * line, returning an array that should theoretically contain the set of domains
 * that the user doesn't want to visit.  Light on validation, as this is really
 * just for me.
 */
function splitAndTrim(input) {
  return input.split('\n').map(value => value.trim());
}

/**
 * Restore values from storage.  There's probably some kind of race condition
 * here if chrome restores tabs, but that really doesn't matter for my purposes.
 */
chrome.storage.sync.get(
  {
    work: '',
    always: '',
  },
  (items) => {
    work = splitAndTrim(items.work);
    always = splitAndTrim(items.always);
  },
);

/** Listen for changes. */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') {
    return;
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'work')) {
    work = splitAndTrim(changes.work.newValue);
  }
  if (Object.prototype.hasOwnProperty.call(changes, 'always')) {
    always = splitAndTrim(changes.always.newValue);
  }
});

/** The listener that actually blocks sites. */
chrome.webRequest.onBeforeRequest.addListener(
  (request) => {
    const splitDomain = new URL(request.url).hostname.split('.');
    let domainToTest = '';

    // "Working Hours" are defined as 09:00 - 16:59.
    const currentHour = new Date().getHours();
    const isWorkTime = (currentHour >= 9 && currentHour <= 16);

    // Progressively check "com", "example.com", "www.example.com", etc. to
    // see if they are banned.
    for (let i = splitDomain.length - 1; i >= 0; i -= 1) {
      domainToTest = splitDomain[i] + domainToTest;
      if (always.includes(domainToTest)
          || (isWorkTime && work.includes(domainToTest))) {
        return redirectResult;
      }
      domainToTest = `.${domainToTest}`;
    }
    return {};
  },
  // don't block any scripts or anything, this is really just about browsing.
  { urls: ['*://*/*'], types: ['main_frame'] },
  // listener must be 'blocking' in order to do redirects.
  ['blocking'],
);
