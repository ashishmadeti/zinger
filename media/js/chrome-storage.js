function storeInChrome(newWord) {
    //Convert newWord into a key-value pair
    var w = {};
    w[newWord.word] = newWord.properties;
    chrome.storage.local.set(w, function() {
        console.debug("Saved word ", newWord.word);
    });
}

//Store the value of interval in chrome storage
function storeInterval(newVal) {
    var newInterval = {};
    newInterval[intervalPropertyName] = newVal;
    chrome.storage.local.set(newInterval, function() {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            return false;
        }
        console.debug("Saved word ", intervalPropertyName);
    });
}

//Load all words from chrome storage into arrays
function fetchAllWordsFromChrome() {
    chrome.storage.local.get(null, function(wordObjects) {
        var words = Object.keys(wordObjects);
        if (wordObjects[intervalPropertyName]) {
            updateInterval(wordObjects[intervalPropertyName]);
            intervalSetFlag = true;
        }

        for (var i = 0; i < words.length; i++) {
            if (words[i] === intervalPropertyName) {
                continue;
            }

            var wordToAdd = {};
            wordToAdd.word = words[i];
            wordToAdd.properties = wordObjects[words[i]];
            console.debug(wordToAdd);
            if (wordToAdd.properties.count < 0) {
                newWords.push(wordToAdd);
            } else if (wordToAdd.properties.count < 4) {
                learningWords.push(wordToAdd);
            } else {
                masteredWords.push(wordToAdd);
            }
        }
        shuffle(newWords);
        shuffle(learningWords);
        shuffle(masteredWords);

        if (!intervalSetFlag) {
            updateInterval(defaultInterval);
        }
    });
}

