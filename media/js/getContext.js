function getContext(wordSelection){
    var wordNode = wordSelection.anchorNode.parentNode;
    var parentNodeText = $(wordNode).parent().text();
    var paragraphText = $(wordNode).text();
    var sentences;
    // If only word in the tag like in case of bold
    if (paragraphText.split(" ").length == 1)
    {
        sentences = parentNodeText.split(". ");
    }
    else{
        sentences = paragraphText.split(". ");
    }
    var context = '';
    for (var i=0;i<sentences.length;i++)
    {
        if (sentences[i].search(word) != -1){
            context = sentences[i];
            break;
        }
    }
    return context;
}