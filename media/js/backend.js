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
var interval;
var intervalPropertyName = "m_interval";
var defaultInterval = 0.25 * 60 * 1000;

//Id value of timer
var timerVal;

var intervalSetFlag = false;

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

    storeInChrome(word, properties);
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

//Chooses and returns the next word to flash, returns false if no suitable word is available
//Rough ratio -> 60% from learningWords[], 30% from newWords[], 10% from masteredWords[]
function chooseNextWord() {
    //random number between 0 to 9
    var diceRoll = Math.floor(Math.random() * 10);
    var nextWord;

    switch (diceRoll) {
        case 9: if (masteredWords.length) {
                    if (currentMasteredWordIndex < masteredWords.length) {
                        return masteredWords[currentMasteredWordIndex++];
                    } else {
                        nextWord = masteredWords[currentMasteredWordIndex = 0];
                        shuffle(masteredWords);
                        return nextWord;
                    }
                }
        case 8:
        case 7:
        case 6: if (newWords.length) {
                    if (currentNewWordIndex < newWords.length) {
                        return newWords[currentNewWordIndex++];
                    } else {
                        nextWord = newWords[currentNewWordIndex = 0];
                        shuffle(newWords);
                        return nextWord;
                    }
                }
        case 5:
        case 4:
        case 3:
        case 2:
        case 1:
        case 0: if (learningWords.length) {
                    if (currentLearningWordIndex < learningWords.length) {
                        return learningWords[currentLearningWordIndex++];
                    } else {
                        nextWord = learningWords[currentLearningWordIndex = 0];
                        shuffle(learningWords);
                        return nextWord;
                    }
                } else if (newWords.length) {
                    if (currentNewWordIndex < newWords.length) {
                        return newWords[currentNewWordIndex++];
                    } else {
                        nextWord = newWords[currentNewWordIndex = 0];
                        shuffle(newWords);
                        return nextWord;
                    }
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
        chrome.tabs.sendMessage(tabs[0].id, {type: "showFlashCard",
            word: wordToSend.word,
            meaning: wordToSend.properties.meaning,
            context: wordToSend.properties.context});
    });
}

//Shuffle an array using Fisher-Yates Shuffle
function shuffle(array) {
    var counter = array.length, temp, index;
    while (counter > 0) {
        index = Math.floor(Math.random() * counter);
        counter--;

        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

//New value according to the old value and the user knew the word or not
function getNewValue(oldVal, knew) {
    if (knew) {
        switch (oldVal) {
            case -1: return 1;
            case 0:
            case 1:
            case 2:
            case 3: return oldVal + 1;
            case 4: return oldVal;
        }
    } else {
        return 0;
    }
}

//Handle click of yes or no button on flash card
//change category of the word accordingly
function click(word, knew) {
    var found = false;
    var oldVal, newVal;
    var newWord;
    if (!found) {
        for (var i = 0; i < newWords.length; i++) {
            if (newWords[i].word === word) {
                found = true;
                oldVal = newWords[i].properties.count;
                newVal = getNewValue(oldVal, knew);
                newWords[i].properties.count = newVal;
                storeInChrome(newWords[i].word, newWords[i].properties);
                newWord = newWords[i];
                newWords.splice(i, 1);
                learningWords.push(newWord);
            }
        }
    }
    if (!found) {
        for (var i = 0; i < learningWords.length; i++) {
            if (learningWords[i].word === word) {
                found = true;
                oldVal = learningWords[i].properties.count;
                newVal = getNewValue(oldVal, knew);
                if (newVal != oldVal) {
                    learningWords[i].properties.count = newVal;
                    storeInChrome(learningWords[i].word, learningWords[i].properties);
                    if (newVal == 4) {
                        newWord = learningWords[i];
                        learningWords.splice(i, 1);
                        masteredWords.push(newWord);
                    }
                }
            }
        }
    }
    if (!found) {
        for (var i = 0; i < masteredWords.length; i++) {
            if (masteredWords[i].word === word) {
                found = true;
                oldVal = masteredWords[i].properties.count;
                newVal = getNewValue(oldVal, knew);
                if (newVal != oldVal) {
                    masteredWords[i].properties.count = newVal;
                    storeInChrome(masteredWords[i].word, masteredWords[i].properties);
                    newWord = masteredWords[i];
                    masteredWords.splice(i, 1);
                    learningWords.push(newWord);
                }
            }
        }
    }
}

//Update interval, accepts new value in milliseconds
function updateInterval(newVal) {
    if (interval === newVal) {
        return;
    }

    interval = newVal;
    if (timerVal) {
        clearInterval(timerVal);
    }
    timerVal = setInterval(showFlashCard, interval);
    storeInChrome(intervalPropertyName, newVal);
}

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.type === "saveWord") {
            saveWord(msg.word, msg.meaning, msg.context);
        } else if (msg.type === "click") {
            click(msg.word, msg.knew);
        } else if (msg.type === "updateInterval") {
            updateInterval(msg.value);
        } else if (msg.type === "getInterval") {
            port.postMessage({type: "getIntervalReply", value: interval});
        }
    });
});
