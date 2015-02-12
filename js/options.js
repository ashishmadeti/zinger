var wordTemplate = '\
<div class="col-md-4">\
    <div class="panel panel-default">\
        <div class="panel-heading">\
            <span class="glyphicon glyphicon-remove pull-right deleteWord" aria-hidden="true" data-toggle="tooltip" data-placement="top" title="Delete"></span>\
            <h3 class="zingerWord"></h3>\
            <div class="progress">\
                <div class="progress-bar"></div>\
            </div>\
        </div>\
        <div class="panel-body">\
            <p class="zingerWordMeaning"></p>\
        </div>\
    </div>\
</div>';

$(document).ready(function(){

    // Initialize tooltip
    $('[data-toggle="tooltip"]').tooltip();

    chrome.runtime.sendMessage({type: "getListOfAllWords"}, function(response) {
        var listOfWords = jQuery.parseJSON(response);
        var count = 0;

        $.each(listOfWords, function(index, value) {
            if (count % 3 == 0) {
                var div = $("<div/>", {'class': 'row'});
                $(".container").append(div);
            }

            var wordDiv = $(wordTemplate);
            wordDiv.find('.zingerWord').html(value.word.charAt(0).toUpperCase() + value.word.slice(1));
            wordDiv.find('.zingerWordMeaning').html(value.properties.meaning);

            var learningLevel = parseInt(value.properties.count);
            var progressBar = wordDiv.find('.progress-bar');

            if (learningLevel == -1) {
                progressBar.html("New");
                progressBar.addClass('progress-bar-danger');
                progressBar.css('width', '10%');
            } else if (learningLevel == 0) {
                progressBar.html("Learning");
                progressBar.addClass('progress-bar-warning');
                progressBar.css('width', '20%');
            } else if (learningLevel > 0 && learningLevel < 4) {
                progressBar.html("Learning");
                progressBar.addClass('progress-bar-warning');
                progressBar.css('width', ((learningLevel + 1) * 20) + '%');
            } else {
                progressBar.html("Mastered");
                progressBar.addClass('progress-bar-success');
                progressBar.css('width', '100%');
            }

            $(".row").last().append(wordDiv);
            count++;
        });
    });

    $('.container').on('click', '.deleteWord', function(){
        var word = $(this).siblings('.zingerWord').text().toLowerCase();
        chrome.runtime.sendMessage({type: "deleteWord", word: word});
        window.location.href = window.location.href;
    });
});
