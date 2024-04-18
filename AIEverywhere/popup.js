document.addEventListener('DOMContentLoaded', function() {
    function formatResults(text) {
        // Split the text by newlines and wrap each line in <p> tags
        // or convert them to list items if they appear to be bullet points
        return text.split('\n').map(line => {
            if (line.trim().startsWith('-')) { // Simple check for bullet points
                return '<li>' + line.trim().substring(1).trim() + '</li>';
            } else {
                return '<p>' + line.trim() + '</p>';
            }
        }).join('');
    }

    function updateResults() {
        chrome.storage.local.get(['result'], function(data) {
            const resultsContainer = document.getElementById('results');
            if (data.result) {
                // Format and set the results as HTML
                resultsContainer.innerHTML = formatResults(data.result);
            } else {
                resultsContainer.textContent = "No results to display.";
            }
        });
    }

    // Update results upon opening the popup
    updateResults();
});
