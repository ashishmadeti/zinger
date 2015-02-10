var meaning, word, context;

var backend = chrome.runtime.connect({name: "connectionToBackend"});

$(document).ready(function () {
    $(document).dblclick(function(e){
        // Don't show meaning on double click on input
        if ($(document.activeElement).is('input, textarea')) {
            return;
        }

        var wordObject = window.getSelection();
        word = $.trim(wordObject.toString().toLowerCase());
        var result = word.split(/[\n\r\s]+/);
        // To disable multiple words selection
        // and null selection
        if (result.length != 1 || !isValidInput(word)) {
            return;
        }

        showQtip(e.target, e);
        fetchMeaningCambridge(word, function(message){
            meaning = message;
            changeQtipText(meaning);
        });

        context = getContext(wordObject);
    });
});

function showQtip(selector, e) {
    $(selector).qtip({
        id: 'meaningTooltip',
        content: {
            text: "Searching for meaning.....",
            button: true
        },

        position: {
            target: [e.pageX, e.pageY],
            viewport: $(window),
            adjust: {
                y: 12,
                mouse: false
            }
        },

        show: {
            ready: true
        },

        style: {
            width: "250px",
            height: "100px"
        },

        hide: {
            event: 'unfocus'
        },

        events: {
            hide: function(event, api) {
                if (!meaning || meaning === noMeaningFoundError || meaning == otherError) {
                    // First destroy the qTip
                    api.destroy();

                    // Don't save the word
                    return;
                }

                // Save the word if user has selected to
                if ($('#zingerShowLater').is(':checked')) {
                    backend.postMessage({type: "saveWord", word: word, meaning: meaning, context: context});
                }

                // When next time this function is called and meaning
                // is not updated (i.e still searching for meaning)
                // then don't use the previous meaning
                meaning = null;
                api.destroy();
            }
        }
    });

}


function changeQtipText(newText) {
    newText += "<br>\
    <strong>\
        <p>Show later: <input type='checkbox' id='zingerShowLater' checked></p>\
    </strong>";
    $('#qtip-meaningTooltip').qtip('option', 'content.text', newText);
}

function isValidInput(string) {
    if(/^[a-zA-Z]+$/.test(string) == false) {
        return false;
    } else {
        return true;
    }
}

// Listen for incoming requests from browser_action script
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getSelection") {
        sendResponse({data: window.getSelection().toString(), context:getContext(window.getSelection())});
    } else {
        sendResponse({}); // snub them.
    }
});
