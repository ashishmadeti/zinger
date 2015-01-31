$(document).ready(function(){

    // When user clicks the browser_action icon
    // get selected text
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {method: 'getSelection'}, function (response) {
            alert(response.data);
        });
    });

    testFunction();
});
