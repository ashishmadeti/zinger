QUnit.test("test shuffle()", function(assert) {
    var array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var shuffledArray = array.slice();
    shuffle(shuffledArray);
    assert.notDeepEqual(array, shuffledArray, "Shuffled array is not equal to original array");
});