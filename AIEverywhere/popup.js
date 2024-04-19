document.addEventListener('DOMContentLoaded', function() {
    let lastUpdateTime = 0;

    function displayLoader(shouldDisplay) {
        const loader = document.querySelector('.loader'); // Use class selector instead of ID
        const results = document.getElementById('results');
        if(loader && results) {
            loader.style.display = shouldDisplay ? 'block' : 'none';
            results.style.display = shouldDisplay ? 'none' : 'block';
        } else {
            console.error('Loader or Results elements not found!');
        }
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
        // First, ensure that text is a string
        if (typeof text !== 'string') {
            console.error('formatQuizResults: text is not a string', text);
            return '';
        }

        // Adjust the regex to handle the last question correctly and split on the question number followed by a period
        const questionBlocks = text.split(/\n(?=\d+\.)/);
        return questionBlocks.map(block => {
            // Remove any trailing dashes that might be separators
            block = block.trim();

            const parts = block.split('\n').map(part => part.trim()); // Trim all parts
            if (parts.length < 3) { // There should be at least a question, answers, and a correct answer
                console.error('formatQuizResults: not enough parts in block', block);
                return '';
            }
            const question = parts[0];

            // Find the correct answer line index and extract the answer, making the search case-insensitive
            const correctAnswerIndex = parts.findIndex(part => part.toLowerCase().startsWith('correct answer:'));
            if (correctAnswerIndex === -1) {
                console.error('formatQuizResults: correct answer line not found in block', block);
                return '';
            }
            const correctAnswer = parts[correctAnswerIndex].split(':').slice(1).join(':').trim();

            // Collect all answer choices except the 'Correct answer:' line
            const answers = parts.slice(1, correctAnswerIndex);

            let questionHTML = `<p><strong>${question}</strong></p>`;
            let answersHTML = answers.map(answer => {
                // Check if the current answer is the correct one.
                const isCorrect = answer === correctAnswer;
                return `<div${isCorrect ? ' style="color: green;"' : ''}>${answer}</div>`; // Use div instead of li for answers
            }).join('');

            return `${questionHTML}<div>${answersHTML}</div>`; // Use div to wrap answers
        }).join('');
    }

    function formatResults(text) {
        // Detect if the text is in the format of an AI-generated quiz
        if (text.trim().startsWith('1.')) {
            return formatQuizResults(text);
        }

        return text.split('\n').map(line => `<${line.trim().startsWith('-') ? 'li' : 'p'}>${line.trim().startsWith('-') ? line.trim().substring(1).trim() : line.trim()}</${line.trim().startsWith('-') ? 'li' : 'p'}>`).join('');
    }

    function updateResults() {
        chrome.storage.local.get(['result', 'requestPending', 'menuItemId', 'siteName'], function(data) {
            console.log('Storage Data:', data); // Added for debugging
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
