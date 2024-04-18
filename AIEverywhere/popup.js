document.addEventListener('DOMContentLoaded', function() {
    let lastUpdateTime = 0;

    function displayLoader(shouldDisplay) {
        document.getElementById('loader').style.display = shouldDisplay ? 'block' : 'none';
        document.getElementById('results').style.display = shouldDisplay ? 'none' : 'block';
    }

    function updateTitleAndSiteName(menuItemId, siteName) {
        const titleMap = {
            'improveEnglish': 'Improve English',
            'improveEnglishCreative': 'Improve English - Creative',
            'addCommentsToText': 'Add Comments to Text',
            'summarizeToSingleParagraph': 'Summarize to a Single Paragraph',
            'aiQuiz': 'AI Quiz'
        };
        document.getElementById('optionName').textContent = titleMap[menuItemId];
        document.getElementById('siteName').textContent = siteName;    }

    function formatQuizResults(text) {
        const questionBlocks = text.split(/\n(?=\d+\.)/); // Split by question number, look ahead to keep the number
        return questionBlocks.map(block => {
            const parts = block.split('\n');
            const question = parts[0];
            const answers = parts.slice(1, parts.length - 1);
            const correctAnswerLine = parts[parts.length - 1];
            const correctAnswerMatch = correctAnswerLine.match(/Correct Answer:\s*(.*)/);
            const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1].trim() : '';

            // Format the question
            let questionHTML = `<p><strong>${question}</strong></p>`;

            // Format the answers, highlighting the correct one
            let answersHTML = answers.map(answer => {
                const isCorrect = answer.trim().endsWith(correctAnswer);
                return `<li${isCorrect ? ' style="color: green;"' : ''}>${answer}</li>`;
            }).join('');

            return `${questionHTML}<ul>${answersHTML}</ul>`;
        }).join('');
    }

    function formatResults(text) {
        // Detect if the text is in the format of an AI-generated quiz
        if (text.trim().indexOf('1.') === 0) {
            return formatQuizResults(text);
        }

        return text.split('\n').map(line => `<${line.trim().startsWith('-') ? 'li' : 'p'}>${line.trim().startsWith('-') ? line.trim().substring(1).trim() : line.trim()}</${line.trim().startsWith('-') ? 'li' : 'p'}>`).join('');
    }

    function updateResults() {
        chrome.storage.local.get(['result', 'requestPending', 'menuItemId', 'siteName'], function(data) {
            displayLoader(!!data.requestPending);
            const resultsContainer = document.getElementById('results');
            if (data.result) {
                updateTitleAndSiteName(data.menuItemId, data.siteName);
                resultsContainer.innerHTML = formatResults(data.result);
                chrome.storage.local.set({requestPending: false}); // Set to false when results are shown
            } else if (data.requestPending) {
                resultsContainer.innerHTML = "<p>Processing your request...</p>";
            } else {
                resultsContainer.innerHTML = "<p>No new requests sent.</p>";
                chrome.storage.local.set({requestPending: false}); // Set to false when there is no pending request
            }
            lastUpdateTime = new Date().getTime();
        });
    }
    document.getElementById('refreshButton').addEventListener('click', updateResults);

    setInterval(updateResults, 30000); // Check every minute to see if we should update for no new requests
});
