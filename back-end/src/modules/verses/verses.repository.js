import fs from 'fs';
import path from 'path';

class VersesRepository{
    constructor(filePath = "./src/data/verses.json"){
        this.filePath = path.resolve(filePath);
    }

    _readData(){
        try{
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        }catch(err){
            console.error("خطأ في قراءة ملف الأيات", err);
            return [];
        }
    }

    async searchByKeyword(keyword){
        const verses = this._readData();
        return verses.filter(verse => verse.text.includes(keyword) || verse.book.includes(keyword));
    }

}

export default VersesRepository;