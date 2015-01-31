$(document).ready(function(){

    // When user clicks the browser_action icon
    // get selected text
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {method: 'getSelection'}, function (response) {
            var word = response.data;

            if(/^[a-zA-Z0-9- ]+$/.test(word) == false) {
                $("#zingerMeaning").html('Please make a selection...');
                return;
            }

            fetchMeaning(word.toLowerCase(), function(meaning){
                // alert(meaning);
                $("#zingerMeaning").html('<h2>' + word + '</h2>');
                $("#zingerMeaning").append('<p>' + meaning + '</p>');
            });
        });
    });
});
