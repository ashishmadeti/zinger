//"New" category words
var newWords = [];
//"Learning" category words
var learningWords = [];
//"Mastered" category words
var masteredWords = [];

//Initially fetch all words from storage
fetchAllWordsFromChrome();

//Save a new word
function saveWord(word, meaning, context) {
    if(existsInDatabase(word)) {
        return;
    }
    var properties = {};
    properties.meaning = meaning;
    properties.context = context;
    properties.count = -1;
    properties.timestamp = Date.now();
    var newWord = {};
    newWord.word = word;
    newWord.properties = properties;
    newWords.push(newWord);

    storeInChrome(newWord);
}

//Check if the word already exists in the database
function existsInDatabase(word) {
    for (var i = 0; i < newWords.length; i++) {
        if (newWords[i].word === word) {
            return true;
        }
    }
    for (var i = 0; i < learningWords.length; i++) {
        if (learningWords[i].word === word) {
            return true;
        }
    }
    for (var i = 0; i < masteredWords.length; i++) {
        if (masteredWords[i].word === word) {
            return true;
        }
    }
    return false;
}

function storeInChrome(newWord) {
    //convert newWord into a key-value pair
    var w = {};
    w[newWord.word] = newWord.properties;
    chrome.storage.local.set(w, function() {
        console.debug("Saved word ", newWord.word);
    });
}

function fetchAllWordsFromChrome() {
    chrome.storage.local.get(null, function(wordObjects) {
        var words = Object.keys(wordObjects);
        for (var i = 0; i < words.length; i++) {
            var wordToAdd = {};
            wordToAdd.word = words[i];
            wordToAdd.properties = wordObjects[words[i]];
            if (wordToAdd.properties.count < 0) {
                newWords.push(wordToAdd);
            } else if (wordToAdd.properties.count < 4) {
                learningWords.push(wordToAdd);
            } else {
                masteredWords.push(wordToAdd);
            }
            console.debug(words[i]);
        }
    });
}

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if(msg.type === "saveWord") {
            saveWord(msg.word, msg.meaning, msg.context);
        }
    });
});
