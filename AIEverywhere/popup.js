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
        // Ensure text is a string
        if (typeof text !== 'string') {
            console.error('formatQuizResults: text is not a string', text);
            return '';
        }

        // Split the text into blocks for each question
        const questionBlocks = text.split(/\n(?=\d+\.)/).filter(Boolean);
        return questionBlocks.map(block => {
            // Trim each block and remove any trailing separators
            block = block.trim().replace(/-+$/, '');

            const parts = block.split('\n').map(part => part.trim()); // Trim all parts
            const question = parts[0];
            const correctAnswerLine = parts.find(part => part.toLowerCase().startsWith('correct answer:'));
            const correctAnswerIndex = parts.indexOf(correctAnswerLine);

            // Validate block structure
            if (correctAnswerIndex === -1 || parts.length < correctAnswerIndex + 1) {
                console.error('formatQuizResults: correct answer line not found in block or block structure is incorrect', block);
                return '';
            }

            // Extract the correct answer and the list of answers
            const correctAnswer = correctAnswerLine.split(':').slice(1).join(':').trim();
            const answers = parts.slice(1, correctAnswerIndex); // Everything between question and correct answer

            let questionHTML = `<div class="question-block"><p><strong>${question}</strong></p>`;
            let answersHTML = answers.map(answer => {
                const isCorrect = answer.trim() === correctAnswer;
                return `<div class="answer-block${isCorrect ? ' correct-answer' : ''}">${answer}</div>`;
            }).join('');

            return `${questionHTML}${answersHTML}</div>`;
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
