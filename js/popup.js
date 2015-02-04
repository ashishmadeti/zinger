var backend = chrome.runtime.connect({name: "connectionToBackend"});
// FIXME: Maintain only single copy of error messages
var noMeaningFoundError = "No meaning found";
var otherError = "Some error occurred. Please try later";


$(document).ready(function(){
    $("#zingerFreqSlider").slider({
        min: 1,
        max: 30,
        animate: "fast",
        orientation: "horizontal",
        change: function(event, ui) {
            var val = parseInt(ui.value) * 1000;
            backend.postMessage({type: "updateInterval", value: val});
        }
    });

    $("#zingerLookupBtn").click(function(){
        var word = $("#zingerLookupInp").val().toLowerCase();
        var context = "No context found!";

        if(!isValidInput(word)) {
            $("#zingerMeaning").html('Please enter a valid word...');
            return false;
        }

        $("#zingerMeaning").html('<strong>Searching for meaning...</strong>');
        $("#zingerLookupDiv").hide();
        fetchAndSaveWord(word, context);
    });

    // When user clicks the browser_action icon
    // get selected text
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {method: 'getSelection'}, function (response) {
            if (!response || !response.data) {
                return false;
            }

            $("#zingerLookupDiv").hide();
            var word = response.data.toLowerCase();
            var context = response.context;

            if(!isValidInput(word)) {
                $("#zingerMeaning").html('Please make a valid selection...');
                return false;
            }

            $("#zingerMeaning").html('<strong>Searching for meaning...</strong>');
            fetchAndSaveWord(word, context);
        });
    });

    // Communicating to backend
    backend.postMessage({type: "getInterval"});
    backend.onMessage.addListener(function(msg) {
        if (msg.type === "getIntervalReply") {
            $("#zingerFreqSlider").slider("value", parseInt(msg.value) / 1000);
        }
    });
});

function isValidInput(string) {
    if(/^[a-zA-Z ]+$/.test(string) == false) {
        return false;
    } else {
        return true;
    }
}

function fetchAndSaveWord(word, context) {
    fetchMeaningCambridge(word, function(meaning){
        $("#zingerMeaning").html('<h2>' + word + '</h2>');
        $("#zingerMeaning").append('<p>' + meaning + '</p>');

        if (meaning == noMeaningFoundError || meaning == otherError) {
            return false;
        }

        backend.postMessage({type: "saveWord", word: word, meaning: meaning, context: context});
    });
}
