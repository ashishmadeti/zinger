var backend = chrome.runtime.connect({name: "connectionToBackend"});
// FIXME: Maintain only single copy of error messages
var noMeaningFoundError = "No meaning found";
var otherError = "Some error occurred. Please try later";


$(document).ready(function(){

    $("#zingerFreqSlider").slider({
        min: 1,
        max: 30,
        animate: "slow",
        orientation: "horizontal",
        change: function(event, ui) {
            var val = parseInt(ui.value) * 60 * 1000;
            backend.postMessage({type: "updateInterval", value: val});
        }
    });

    chrome.storage.local.get({"m_slider"}, function(defaultSliderValue){
        $("#zingerFreqSlider").slider({value: defaultSliderValue["m_slider"]});
    });

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

                if (meaning == noMeaningFoundError || meaning == otherError) {
                    return;
                }

                backend.postMessage({type: "saveWord", word: word, meaning: meaning, context: context});
            });

        });
    });
});
