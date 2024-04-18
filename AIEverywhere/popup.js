// popup.js
document.addEventListener('DOMContentLoaded', function() {
    function formatQuizResults(text) {
        const questionBlocks = text.split(/\d+\./).slice(1); // Split by question number and remove the first empty element
        return questionBlocks.map(block => {
            const lines = block.trim().split('\n');
            const question = lines[0].trim();
            const options = lines.slice(1);
            let optionsHTML = '';

            for (let i = 0; i < options.length; i++) {
                if (i === 0) { // Assuming the first option is the correct one
                    optionsHTML += `<li><strong style="color: green;">${options[i].trim()}</strong></li>`;
                } else {
                    optionsHTML += `<li>${options[i].trim()}</li>`;
                }
            }

            return `<p>${question}</p><ul>${optionsHTML}</ul>`;
        }).join('');
    }

    function formatResults(text) {
        // Check if the text is in the format of an AI-generated quiz
        if (text.trim().match(/^\d+\./)) {
            return formatQuizResults(text);
        }

        // Original formatting for non-quiz text
        return text.split('\n').map(line => {
            if (line.trim().startsWith('-')) {
                return `<li>${line.trim().substring(1).trim()}</li>`;
            } else {
                return `<p>${line.trim()}</p>`;
            }
        }).join('');
    }

    function updateResults() {
        chrome.storage.local.get(['result'], function(data) {
            const resultsContainer = document.getElementById('results');
            if (data.result) {
                resultsContainer.innerHTML = formatResults(data.result);
            } else {
                resultsContainer.textContent = "No results to display.";
            }
        });
    }

    updateResults();
});
