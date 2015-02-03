var apiBaseUrl = "https://api.wordnik.com/v4";

function fetchMeaning(word, callback) {
    var requestUrl = apiBaseUrl + "/word.json/" + word + "/definitions?";
    var data = {
        "limit": 1,
        "includeRelated": false,
        "sourceDictionaries": "all",
        "useCanonical": true,
        "includeTags": false,
        "api_key": config.apiKey
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
