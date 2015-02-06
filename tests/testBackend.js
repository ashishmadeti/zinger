var testWord = "xxTestWordxx";
var testMeaning = "xxTestMeaningxx";
var testContext = "xxTestContextxx";

QUnit.test("shuffle()", function(assert) {
    var array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var shuffledArray = array.slice();
    shuffle(shuffledArray);
    assert.notDeepEqual(array, shuffledArray, "Shuffled array is not equal to original array");
});

QUnit.test("saveWord()", function(assert) {
    assert.expect(2);
    saveWord(testWord, testMeaning, testContext);

    var found = false;
    for (var i = 0; i < newWords.length; i++) {
        if (newWords[i].word === testWord) {
            found = true;
            newWords.splice(i, 1);
            break;
        }
    }
    for (var i = 0; i < learningWords.length; i++) {
        if (learningWords[i].word === testWord) {
            found = true;
            learningWords.splice(i, 1);
            break;
        }
    }
    for (var i = 0; i < masteredWords.length; i++) {
        if (masteredWords[i].word === testWord) {
            found = true;
            masteredWords.splice(i, 1);
            break;
        }
    }
    assert.ok(found, "testWord found in arrays");

    var done = assert.async();
    found = false;
    chrome.storage.local.get(testWord, function(items) {
        assert.ok(items[testWord].meaning == testMeaning &&
            items[testWord].context == testContext, "testWord found in chrome storage");
        chrome.storage.local.remove(testWord, function() {
            console.log("Removed testWord from storage");
        });
        done();
    });
});

QUnit.test("existsInDatabase()", function(assert) {
    assert.expect(4);
    var w = {};
    w.word = testWord;

    assert.ok(!existsInDatabase(testWord), "Returned false when testWord was not present in arrays");

    newWords.push(w);
    assert.ok(existsInDatabase(testWord), "Returned true when testWord was in newWords[]");
    newWords.pop();

    learningWords.push(w);
    assert.ok(existsInDatabase(testWord), "Returned true when testWord was in learningWords[]");
    learningWords.pop();

    masteredWords.push(w);
    assert.ok(existsInDatabase(testWord), "Returned true when testWord was in masteredWords[]");
    masteredWords.pop();
});

QUnit.test("getNextWordFrom()", function(assert) {
    assert.expect(4);
    var array = ["first", "second", "last"];
    var emptyArray = [];
    var currentIndex = {value: 0};

    var nextWord = getNextWordFrom(array, currentIndex);
    assert.ok((nextWord === "first") && (currentIndex.value == 1),
              "Returned right word and updated currentIndex");

    nextWord = getNextWordFrom(array, currentIndex);
    assert.ok((nextWord === "second") && (currentIndex.value == 2),
              "Returned right word and updated currentIndex");

    nextWord = getNextWordFrom(array, currentIndex);
    assert.ok((nextWord === "last") && (currentIndex.value == 0),
              "Returned right word and updated currentIndex");

    nextWord = getNextWordFrom(emptyArray, currentIndex);
    assert.ok(!nextWord, "Returned false when empty array was passed");
});
