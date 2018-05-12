// A list of sites that are blocked during working hours.
var work = [];
// A list of sites that are always blocked.
var always = [];

// A base64-encoded webpage that says NOPE in 30em font.
var redirectResult = { redirectUrl: `data:text/html;base64,ICA8IURPQ1RZUEUgaHRtbD4NCiAgPGh0bWw+PGhlYWQ+PHRpdGxlPk5JQ0UgVFJZPC90aXRsZT48L2hlYWQ+PGJvZHk+PHNwYW4gc3R5bGU9ImZvbnQtZmFjZTogYm9sZDsgZm9udC1zaXplOiAzMGVtOyI+Tk9QRTwvc3Bhbj48L2JvZHk+PC9odG1sPg==`}

// There's probably some kind of race condition here if chrome restores tabs,
// but that really, really doesn't matter for my purposes.
chrome.storage.sync.get(
  {
    work: '',
    always: ''
  }, function(items) {
    work = splitAndTrim(items.work);
    always = splitAndTrim(items.always);
  });

chrome.storage.onChanged.addListener(
  function(changes, areaName) {
    if (areaName !== 'sync') {
      return;
    }
    if (changes.hasOwnProperty('work')) {
      work = splitAndTrim(changes.work.newValue);
    }
    if (changes.hasOwnProperty('always')) {
      always = splitAndTrim(changes.always.newValue);
    }
  });

chrome.webRequest.onBeforeRequest.addListener(
  function(request) {
      var splitDomain = new URL(request.url).hostname.split('.');
      var domainToTest = '';

      // "Working Hours" are defined as 09:00 - 16:59.
      var currentHour = new Date().getHours();
      var isWorkTime = (9 <= currentHour && currentHour <= 16);

      // Progressively check "com", "example.com", "www.example.com", etc. to
      // see if they are banned.
      for (var i = splitDomain.length - 1; i >= 0; i--) {
        domainToTest = splitDomain[i] + domainToTest;
        if (always.includes(domainToTest)
            || (isWorkTime && work.includes(domainToTest))) {
          return redirectResult;
        }
        domainToTest = '.' + domainToTest;
      }
      return {};
  },
  // don't block any scripts or anything, this is really just about browsing.
  {urls: ['*://*/*'], types: ['main_frame']},
  // listener must be 'blocking' in order to do redirects.
  ['blocking']);

// Splits a user's domain settings by newlines and trims whitespace off of each
// line, returning an array that should theoretically contain the set of domains
// that the user doesn't want to visit.  Light on validation, as this is really
// just for me.
function splitAndTrim(input) {
  return input.split('\n').map(function(value) { return value.trim(); });
}
