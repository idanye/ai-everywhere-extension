const API_KEY='sk-proj-7wv0MMqO1qUwMppbQL4BT3BlbkFJLdl7NT7suxhUFBGVR3Bk'

chrome.runtime.onInstalled.addListener(() => {
    const contexts = ["selection"];
    const menuItems = [
        {id: "improveEnglish", title: "Improve English"},
        {id: "improveEnglishCreative", title: "Improve English - Creative"},
        {id: "addCommentsToCode", title: "Add Comments to Code"},
        {id: "summarizeToSingleParagraph", title: "Summarize to a Single Paragraph"},
        {id: "aiQuiz", title: "AI Quiz"}
    ];

    menuItems.forEach(item => {
        chrome.contextMenus.create({
            id: item.id,
            title: item.title,
            contexts: contexts
        });
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.selectionText) {
        let options = {};
        switch (info.menuItemId) {
            case 'improveEnglish':
                options = {
                    temperature: 0.5,
                    systemPrompt: "You are an English teacher",
                    userPrompt: "Improve this text's english:\n",
                };
                break;
            case 'improveEnglishCreative':
                options = {
                    temperature: 1.0,
                    systemPrompt: "You are an English teacher",
                    userPrompt: "Improve this text's english and be creative:\n",
                };
                break;
            case 'addCommentsToCode':
                options = {
                    temperature: 0.5,
                    systemPrompt: "You are an English teacher",
                    userPrompt: "Add comments to this text:\n",
                };
                break;
            case 'summarizeToSingleParagraph':
                options = {
                    temperature: 0.5,
                    systemPrompt: "You are an English teacher",
                    userPrompt: "Summarize this text to a single paragraph:\n"
                };
                break;
            case 'aiQuiz':
                options = {
                    temperature: 0.5,
                    systemPrompt: "You are an English teacher",
                    userPrompt: "Create 10 multiple choice questions from this text:\n"
                };
                break;
        }
        callChatGPT(info.selectionText, options, response => {
            replaceText(response);
        });
    }
});

function showError(tabId, errorMessage) {
    // Check if all necessary properties are set correctly
    console.log("Creating notification with error message:", errorMessage);

    chrome.notifications.create('', {  // empty string for the notification ID so Chrome generates one
        type: "basic",
        iconUrl: "icon48.png",  // Make sure this path is correct relative to your extension's directory
        title: "Error Notification",
        message: errorMessage
    }, function(notificationId) {
        if (chrome.runtime.lastError) {
            console.error("Failed to create notification:", chrome.runtime.lastError);
        } else {
            console.log("Notification created with ID:", notificationId);
        }
    });
}

function callChatGPT(text, options, callback, tabId) {
    console.log('Making API Call with:', text, options); // Log the request details
    let bodyData = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": options.systemPrompt // Added system role based on the new structure
            },
            {
                "role": "user",
                "content": options.userPrompt + text,
            }
        ],
        "temperature": options.temperature
    };

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData),
    })
        .then(response => {
            console.log('API Response Received:', response);
            return response.json();
        })
        .then(data => {
            console.log('API Data:', data); // Log the actual data received
            if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content.trim() !== '') {
                callback(data.choices[0].message.content);
            } else {
                showError(tabId, 'No valid response from the API or empty text.');
            }
        })
        .catch(error => {
            console.error('API Request Failed:', error);
            showError(tabId, 'Error making API request: ' + error.message);
        });
}

function replaceText(newText) {
    chrome.storage.local.set({result: newText}, function() {
        console.log('Result saved to storage.');
    });
}
