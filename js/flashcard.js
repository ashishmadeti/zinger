var dragged = false;

$(document).ready(function() {
    var backend = chrome.runtime.connect({name: "connectionToBackend"});
    var flashcardTemplate = '\
    <div class="zingerStage" style="left: 40% !important;">\
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
        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });

    $('#zingerNo').click(function(e) {
        backend.postMessage({type: "click", word: $("#zingerCardWord").text().toLowerCase(), knew: false});
        $(".zingerStage").hide();
        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });

    $('#zingerHintBtn').click(function() {
        // Show hint and hide button
        $('#zingerCardWord').css('margin-top', '4%');
        $('#zingerExampleTxt').show();
        $('#zingerHintBtn').hide();
     });

    $('.zingerFlashcard').on('click', function(e) {
        // Don't flip card on button clicks
        if ($(e.target).is(':button')) {
            return false;
        }

        if (dragged) {
            dragged = false;
            return false;
        }

        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });

    $(".zingerStage").pep({
        constrainTo: 'window',
        shouldEase: false,

        start: function() {
            dragged = true;
        }
    });

    $('#zingerCardMeaning').enscroll({
        showOnHover: true,
        verticalTrackClass: 'track3',
        verticalHandleClass: 'handle3',
        addPaddingToPane: false
    });
});

// To listen to new word event
chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.type === "showFlashCard") {
        // Don't change card if user is viewing meaning
        if ($(".zingerFlashcard").hasClass('zingerFlipped')) {
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

        // Revert to initial state of card
        // Hide the example and show hint button
        $('#zingerCardWord').css('margin-top', '20%');
        $('#zingerExampleTxt').hide();
        $('#zingerHintBtn').show();
        $('.zingerFlashcard').removeClass('zingerFlipped');

        // Set the new content
        $("#zingerCardWord").html(msg.word);
        $("#zingerCardMeaning").html(msg.meaning);
        $("#zingerExampleTxt").html(msg.context);

        // Show the card
        $(".zingerStage").show();
    }
});
