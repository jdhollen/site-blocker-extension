// Loads options from chrome.storage.
function load_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    work: '',
    always: ''
  }, function(items) {
    document.getElementById('work').value = items.work;
    document.getElementById('always').value = items.always;
  });
}

// Saves options to chrome.storage.
function save_options() {
  // No validation--this is just for my own use.
  var work = document.getElementById('work').value;
  var always = document.getElementById('always').value;
  chrome.storage.sync.set({
    work: work,
    always: always
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', save_options);
