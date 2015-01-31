var buttonClickedFlag = false;

$(document).ready(function(){
    var flashcardTemplate = '\
    <div class="zingerStage">\
        <div class="zingerFlashcard">\
            <div class="zingerFront">\
                <p id="zingerCardWord">Lol</p>\
            </div>\
            <div class="zingerBack">\
                <p id="zingerCardMeaning"></p>\
                <p>Did you know this word?</p>\
                <input type="button" value="Yes" id="zingerYes"/>\
                <input type="button" value="No" id="zingerNo"/>\
            </div>\
        </div>\
    </div>';

    $('body').prepend(flashcardTemplate);

    $('#zingerYes').click(function(e){
        alert("Yes");
        $(".zingerStage").hide();
    });

    $('#zingerNo').click(function(e){
        alert("No!");
        $(".zingerStage").hide();
    });

    $('.zingerFlashcard').on('click', function() {
        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });

    $(".zingerStage").draggable();
});

// To listen to new word event
chrome.runtime.onMessage.addListener(function(msg, sender) {
    //use msg.word, msg.meaning and msg.context

    $("#zingerCardWord").html(msg.word);
    $("#zingerCardMeaning").html(msg.meaning);

    $(".zingerStage").show();
});
