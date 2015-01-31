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
        }
    });
}
