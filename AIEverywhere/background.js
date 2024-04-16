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
            'Authorization': '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',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => callback(data.choices[0].text))
        .catch(error => console.error('Error:', error));
}

function replaceText(newText) {
    document.execCommand('insertText', false, newText);
}
