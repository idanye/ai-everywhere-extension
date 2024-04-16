chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "highlight",
        title: "Highlight Text in Yellow",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Check if the URL is not a Chrome URL
    if (!tab.url.startsWith('chrome://')) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: highlightText
        }).catch(error => {
            console.error('Script failed to execute:', error.message);
        });
    } else {
        console.log('Highlighting is not allowed on chrome:// URLs.');
    }
});

function highlightText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.backgroundColor = 'yellow';
        span.textContent = selection.toString();
        range.deleteContents();
        range.insertNode(span);
        selection.removeAllRanges(); // Optionally clear the selection
    }
}
