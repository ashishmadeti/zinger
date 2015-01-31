var backend = chrome.runtime.connect({name: "connectionToBackend"});

$(document).ready(function(){

    // When user clicks the browser_action icon
    // get selected text
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {method: 'getSelection'}, function (response) {
            var word = response.data;
            var context = response.context;

            if(/^[a-zA-Z ]+$/.test(word) == false) {
                $("#zingerMeaning").html('Please make a selection...');
                return;
            }

            fetchMeaning(word.toLowerCase(), function(meaning){
                $("#zingerMeaning").html('<h2>' + word + '</h2>');
                $("#zingerMeaning").append('<p>' + meaning + '</p>');
            });

            backend.postMessage({type: "saveWord", word: word, meaning: meaning, context: context});
        });
    });
});
