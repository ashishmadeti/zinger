//"New" category words
var newWords = [];
//"Learning category words
var learningWords = [];
//"Mastered category words
var masteredWords = [];

//Save a new word
function saveWord(word, meaning, context) {
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
