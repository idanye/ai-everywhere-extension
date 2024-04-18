// popup.js
document.addEventListener('DOMContentLoaded', function() {
    function updateResults() {
        chrome.storage.local.get(['result'], function(data) {
            if (data.result) {
                document.getElementById('results').textContent = data.result;
            } else {
                document.getElementById('results').textContent = "No results to display.";
            }
        });
    }

    // Update results upon opening the popup
    updateResults();

    // Optionally, add a manual refresh button or periodically update the results
    document.getElementById('refresh').addEventListener('click', function() {
        updateResults();
    });

    // To handle updates more dynamically, you might consider using a chrome.storage.onChanged listener here
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (var key in changes) {
            if (key === 'result') {
                updateResults();
            }
        }
    });
});
