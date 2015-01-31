$(document).ready(function(){
    var flashcardTemplate = '\
    <div class="zingerStage">\
        <div class="zingerFlashcard">\
            <div class="zingerFront">\
                <p id="zingerCardWord">Hello</p>\
            </div>\
            <div class="zingerBack">\
                <p id="zingerCardMeaning">Hello world blah world world blah world world blah world world blah world</p>\
                <p>Did you know this word?</p>\
                <input type="button" value="Yes"/>\
                <input type="button" value="No"/>\
            </div>\
        </div>\
    </div>';

    $('body').prepend(flashcardTemplate);

    $('.zingerFlashcard').on('click', function() {
        $('.zingerFlashcard').toggleClass('zingerFlipped');
    });
});