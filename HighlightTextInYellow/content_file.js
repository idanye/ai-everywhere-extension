document.addEventListener('mouseup', function(event) {
    var selection = window.getSelection().toString();

    if (selection.length > 0) {
        chrome.runtime.sendMessage({
            action: 'highlight'
        });
    }
});
