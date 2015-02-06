var flipped = false;
var dragged = false;

$(document).ready(function() {
    var backend = chrome.runtime.connect({name: "connectionToBackend"});
    var flashcardTemplate = '\
    <div class="zingerStage">\
        <div class="zingerFlashcard">\
            <div class="zingerFront">\
                <p id="zingerCardWord"></p>\
                <p id="zingerExampleTxt" style="display:none;"></p>\
                <input type="button" value="Hint" id="zingerHintBtn" class="zingerBtn zingerBtnPrimary"/>\
            </div>\
            <div class="zingerBack">\
                <p id="zingerCardMeaning"></p>\
                <div class="zingerRemember">\
                    <p>Did you remember?</p>\
                    <input type="button" value="Yes" id="zingerYes" class="zingerBtn zingerBtnSuccess"/>\
                    <input type="button" value="No" id="zingerNo" class="zingerBtn zingerBtnDanger"/>\
                </div>\
            </div>\
        </div>\
    </div>';

    $('body').prepend(flashcardTemplate);

    $('#zingerYes').click(function(e) {
        backend.postMessage({type: "click", word: $("#zingerCardWord").text().toLowerCase(), knew: true});
        $(".zingerStage").hide();
    });

    $('#zingerNo').click(function(e) {
        backend.postMessage({type: "click", word: $("#zingerCardWord").text().toLowerCase(), knew: false});
        $(".zingerStage").hide();
    });

    $('#zingerHintBtn').click(function() {
        // Show hint and hide button
        $('#zingerCardWord').css('margin-top', '4%');
        $('#zingerExampleTxt').show();
        $('#zingerHintBtn').hide();
     });

    $('.zingerFlashcard').on('click', function(e) {
        if (dragged) {
            dragged = false;
            return false;
        }

        if ($(e.target).is('#zingerHintBtn')) {
            // Don't flip card on example button click
            // or card is dragged
            return false;
        }

        flipped = !flipped;
        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });

    $(".zingerStage").draggable({containment: "html"});

    $('.zingerStage').on('drag', function(e) {
        dragged = true;
    });

});

// To listen to new word event
chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.type === "showFlashCard") {
        // Don't change card if user is viewing meaning
        if (flipped) {
            return false;
        }

        // Capitalize first letter
        msg.word = msg.word.charAt(0).toUpperCase() + msg.word.slice(1);

        // Emphasize given word
        var wordsInContext = msg.context.toLowerCase().split(" ");
        $.each(wordsInContext, function(index, value) {
            if (value.indexOf(msg.word.toLowerCase()) > -1) {
                wordsInContext[index] = ("<i><b>" + value + "</b></i>");
            }
        });
        msg.context = wordsInContext.join(" ");

        $(".zingerStage").show();

        // Revert to inital state of card
        if ($('#zingerExampleTxt').is(':visible')) {
            // Hide the example and show hint button
            $('#zingerCardWord').css('margin-top', '20%');
            $('#zingerExampleTxt').hide();
            $('#zingerHintBtn').show();
        }

        $("#zingerCardWord").html(msg.word);
        $("#zingerCardMeaning").html(msg.meaning);
        $("#zingerExampleTxt").html(msg.context);
    }
});
