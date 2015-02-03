// Stores a key-value pair in storage
function storeInChrome(key, value) {
    var newPair = {};
    newPair[key] = value;
    chrome.storage.local.set(newPair, function() {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
            return;
        }
        console.debug("Saved key ", key);
    });
}

// Load all words from chrome storage into arrays
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
