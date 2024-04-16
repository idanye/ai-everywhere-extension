chrome.runtime.onInstalled.addListener(() => {
    const contexts = ["selection"];
    chrome.contextMenus.create({
        id: "improveEnglish",
        title: "Improve English",
        contexts: contexts
    });
    chrome.contextMenus.create({
        id: "improveEnglishCreative",
        title: "Improve English - Creative",
        contexts: contexts
    });
    chrome.contextMenus.create({
        id: "addCommentsToCode",
        title: "Add Comments to Code",
        contexts: contexts
    });
    chrome.contextMenus.create({
        id: "summarizeToSingleParagraph",
        title: "Summarize to a Single Paragraph",
        contexts: contexts
    });
    chrome.contextMenus.create({
        id: "aiQuiz",
        title: "AI Quiz",
        contexts: contexts
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.selectionText) {
        let options = {};
        switch (info.menuItemId) {
            case 'improveEnglish':
                options = { temperature: 0.5 };
                break;
            case 'improveEnglishCreative':
                options = { temperature: 1.0 };
                break;
            case 'addCommentsToCode':
                options = { temperature: 0.5, prompt: "Add comments to this code: " + info.selectionText };
                break;
            case 'summarizeToSingleParagraph':
                options = { temperature: 0.5, prompt: "Summarize this to a single paragraph: " + info.selectionText };
                break;
            case 'aiQuiz':
                options = { temperature: 0.5, prompt: "Create 10 multiple choice questions from this text: " + info.selectionText };
                break;
        }
        callChatGPT(info.selectionText, options, response => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: replaceText,
                args: [response]
            });
        });
    }
});

function callChatGPT(text, options, callback) {
    const data = { prompt: text, max_tokens: 150, ...options };
    fetch('https://api.openai.com/v1/engines/chatgpt/completions', {
        method: 'POST',
        headers: {
            'Authorization': process.env.OPEN_API_AI_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.choices && data.choices.length > 0) {
                callback(data.choices[0].text);
            } else {
                console.error('No choices available or bad API response', data);
                alert('Failed to get a valid response from the API');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error making API request');
        });
}

function replaceText(newText) {
    document.execCommand('insertText', false, newText);
}
