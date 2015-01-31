var flipped = false;

$(document).ready(function(){
    var backend = chrome.runtime.connect({name: "connectionToBackend"});
    var flashcardTemplate = '\
    <div class="zingerStage">\
        <div class="zingerFlashcard">\
            <div class="zingerFront">\
                <p id="zingerCardWord"></p>\
            </div>\
            <div class="zingerBack">\
                <p id="zingerCardMeaning"></p>\
                <p id="zingerExampleTxt" style="display:none;"></p>\
                <input type="button" value="Example" id="zingerExampleToggle"/>\
                <p>Did you know this word?</p>\
                <input type="button" value="Yes" id="zingerYes"/>\
                <input type="button" value="No" id="zingerNo"/>\
            </div>\
        </div>\
    </div>';

    $('body').prepend(flashcardTemplate);

    $('#zingerYes').click(function(e){
        backend.postMessage({type: "click", word: $("#zingerCardWord").text(), knew: true});
        $(".zingerStage").hide();
    });

    $('#zingerNo').click(function(e){
        backend.postMessage({type: "click", word: $("#zingerCardWord").text(), knew: false});
        $(".zingerStage").hide();
    });

    $('#zingerExampleToggle').click(function(){
        if ($('#zingerExampleTxt').is(':hidden')) {
            // Show example and hide meaning
            $('#zingerExampleTxt').show();
            $('#zingerCardMeaning').hide();
            $('#zingerExampleToggle').val('Meaning');
        } else {
           // Show meaning and hide example
            $('#zingerExampleTxt').hide();
            $('#zingerCardMeaning').show();
            $('#zingerExampleToggle').val('Example');
        }
     });

    $('.zingerFlashcard').on('click', function(e) {
        if ($(e.target).is('#zingerExampleToggle')) {
            // Don't flip card on example button click
            return;
        }

        flipped = !flipped;
        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });

    $(".zingerStage").draggable();
});

// To listen to new word event
chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.type === "showFlashCard") {
        //use msg.word, msg.meaning and msg.context
        $("#zingerCardWord").html(msg.word);
        $("#zingerCardMeaning").html(msg.meaning);
        $("#zingerExampleTxt").html(msg.context);

        if ($('#zingerCardMeaning').is(':hidden')) {
            // Show meaning and hide example
            $('#zingerExampleTxt').hide();
            $('#zingerCardMeaning').show();
            $('#zingerExampleToggle').val('Example');
        }

        if (flipped) {
            jQuery(".zingerFlashcard")[0].click();
            flipped = false;
        }

        $(".zingerStage").show();
    }
});
