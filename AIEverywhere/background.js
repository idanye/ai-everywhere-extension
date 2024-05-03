const API_KEY='sk-proj-7wv0MMqO1qUwMppbQL4BT3BlbkFJLdl7NT7suxhUFBGVR3Bk'

chrome.runtime.onInstalled.addListener(() => {
    const contexts = ["selection"];
    const menuItems = [
        {id: "improveEnglish", title: "Improve English"},
        {id: "improveEnglishCreative", title: "Improve English - Creative"},
        {id: "addCommentsToText", title: "Add Comments to Text"},
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
        let options = {
            temperature: info.menuItemId === 'improveEnglishCreative' ? 1.0 : 0.5,
            systemPrompt: "You are an English teacher",
            userPrompt: `${info.menuItemId === 'improveEnglish' ? "Improve this text's english:\n" :
                    info.menuItemId === 'improveEnglishCreative' ? "Improve this text's english and be creative:\n" :
                    info.menuItemId === 'addCommentsToText' ? "Add comments to the text as bullets. Keep it appropriate to the amount of text:\n" : 
                    info.menuItemId === 'summarizeToSingleParagraph' ? "Summarize this text to a single paragraph, capture the main essence:\n" :
                    "Create 10 multiple choice questions from this text, state the correct answer to each question:\n"}${info.selectionText}`
        };
        callChatGPT(info.selectionText, options, response => {
            chrome.storage.local.set({result: response, requestPending: true, menuItemId: info.menuItemId, siteName: new URL(tab.url).hostname});
        }, tab.id);
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

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": options.systemPrompt},
                {"role": "user", "content": options.userPrompt}
            ],
            "temperature": options.temperature
        }),
    })
        .then(response => {
            console.log('API Response Received:', response);
            return response.json();
        })
        .then(data => {
            console.log('API Data:', data); // Log the actual data received
            if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content.trim() !== '') {
                console.log('API Result:\n', data.choices[0].message.content);
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
