$(document).ready(function(){

    var buttonClickedFlag = false;

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
        buttonClickedFlag = true;
        alert("Yes");
        $(".zingerStage").hide();
    });

    $('#zingerNo').click(function(e){
        buttonClickedFlag = true;
        alert("No!");
        $(".zingerStage").hide();
        buttonClickedFlag = true;
    });

    $('.zingerFlashcard').on('click', function() {
        if (buttonClickedFlag) {
            return;
        }

        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });
});
