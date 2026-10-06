import  getEmbedding  from "./embedding.js";
/**
 * @param chapterData  - {book , chapter , text , verseNumber}
 * @param chunkSize - default 3
**/
function createChunks(bible,maxCharacters = 500){
        
    const chunks = [];

    for(const chapterData of bible){
        
        const {book , chapter , verses} = chapterData;
        let chunkId = "";
        let currentChunk = "";
        let currentVerseNumbers =[];

        for(const verse of verses){
            if((currentChunk + " " + verse.text).length > maxCharacters && currentChunk.length > 0){
                chunkId = `${book}-${chapter}-${currentVerseNumbers[0]}-${currentVerseNumbers.at(-1)}`
                chunks.push({book , chapter , verseNumber:currentVerseNumbers , text:currentChunk, chunkId});
                currentChunk = verse.text;
                currentVerseNumbers = [verse.number];
            }else{
                currentChunk += (currentChunk ? " " : "") + verse.text;
                currentVerseNumbers.push(verse.number);
            }
        }

        if(currentChunk.length > 0){
            let chunkId = `${book}-${chapter}-${currentVerseNumbers[0]}-${currentVerseNumbers.at(-1)}`
            chunks.push({book , chapter , verseNumber:currentVerseNumbers , text:currentChunk, chunkId});
        }

    }




    return chunks
}

export default createChunks