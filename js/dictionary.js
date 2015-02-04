function fetchMeaningWordnik(word, callback) {
    var apiBaseUrl = "https://api.wordnik.com/v4";
    var requestUrl = apiBaseUrl + "/word.json/" + word + "/definitions?";
    var data = {
        "limit": 1,
        "includeRelated": false,
        "sourceDictionaries": "all",
        "useCanonical": true,
        "includeTags": false,
        "api_key": config.apiKeyWordnik
    }

    $.ajax({
        url: requestUrl,
        data: data,
        dataType: "json",
        success: function (response) {
            if (response.length == 0 || response == null) {
                callback(noMeaningFoundError);
            } else {
                callback(response[0].text);
            }
        },

        statusCode: {
            404: function() {
                callback(otherError);
            }
        }
    });
}

function fetchMeaningCambridge(word, callback) {
    var apiBaseUrl = "https://dictionary.cambridge.org/api/v1";
    var requestUrl = apiBaseUrl + "/dictionaries/british/search/first/";
    var data = {
        "q": word,
        "format": "html",
        "limit": 4
    }

    $.ajax({
        url: requestUrl,
        headers: {'accessKey': config.apiKeyCambridge},
        data: data,
        dataType: "json",
        success: function (response) {
            var htmlContent = response.entryContent;
            var output = "";
            $(htmlContent).find(".def").each(function(index){
                // Don't show more than 3 meanings
                if (index == 3) {
                    return false;
                }

                var meaning = $(this).text();
                output += (
                    (index + 1)  +
                    ". " +
                    removeTrailingColon(capitaliseFirstLetter(meaning)) +
                    "<br><br>"
                );
            });

            callback(output);
            //console.log(htmlContent);
            console.log(output);
        },

        statusCode: {
            404: function() {
                callback(noMeaningFoundError);
            }
        }
    });
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeTrailingColon(string) {
    string = string.trim();  // To remove extra whitespaces
    if (string.charAt(string.length - 1) == ":") {
        string = string.substring(0, string.length - 1);
    }


    return string + ".";
}
