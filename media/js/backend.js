//"New" category words
var newWords = [];
var currentNewWordIndex = 0;

//"Learning" category words
var learningWords = [];
var currentLearningWordIndex = 0;

//"Mastered" category words
var masteredWords = [];
var currentMasteredWordIndex = 0;

//Interval between two consecutive card flashes (in milliseconds)
var interval = 0.25 * 60 * 1000

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
    //Convert newWord into a key-value pair
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

//Chooses and returns the next word to flash, returns false if no suitable word is available
//Rough ratio -> 60% from learningWords[], 30% from newWords[], 10% from masteredWords[]
function chooseNextWord() {
    //random number between 0 to 9
    var diceRoll = Math.floor(Math.random() * 10);

    switch (diceRoll) {
        case 9: if (masteredWords.length) {
                    return (currentMasteredWordIndex < masteredWords.length) ?
                        masteredWords[currentMasteredWordIndex++] :
                        masteredWords[currentMasteredWordIndex = 0];
                }
        case 8:
        case 7:
        case 6: if (newWords.length) {
                    return (currentNewWordIndex < newWords.length) ?
                        newWords[currentNewWordIndex++] :
                        newWords[currentNewWordIndex = 0];
                }
        case 5:
        case 4:
        case 3:
        case 2:
        case 1:
        case 0: if (learningWords.length) {
                    return (currentLearningWordIndex < learningWords.length) ?
                        learningWords[currentLearningWordIndex++] :
                        learningWords[currentLearningWordIndex = 0];
                } else if (newWords.length) {
                    return (currentNewWordIndex < newWords.length) ?
                        newWords[currentNewWordIndex++] :
                        newWords[currentNewWordIndex = 0];
                }
        default: break;
    }
    return false;
}

//Send a message to the current tab, asking it to show a flashcard
function showFlashCard() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length < 1) {
            return;
        }

        var wordToSend = chooseNextWord();
        if (!wordToSend) {
            return;
        }
        console.log("sending word ", wordToSend.word);
        chrome.tabs.sendMessage(tabs[0].id, {word: wordToSend.word,
            meaning: wordToSend.properties.meaning,
            context: wordToSend.properties.context});
    });
}

//Call showFlashCard() at specific intervals
setInterval(showFlashCard, interval);

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if(msg.type === "saveWord") {
            saveWord(msg.word, msg.meaning, msg.context);
        }
    });
});
