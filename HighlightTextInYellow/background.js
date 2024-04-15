chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "highlight-text",
        title: "HighlightTextInYellow",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "highlight-text") {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: setPageBackgroundColor
        });
    }
});

function setPageBackgroundColor() {
    chrome.tabs.executeScript({
        code: 'document.execCommand("HiliteColor", false, "yellow");'
    });
}
