class VersesService{
    constructor(versesRepository) {
        this.versesRepository = versesRepository;
    }

    async searchByKeyword(keyword) {
        if(!keyword || keyword.trim() === ''){
            throw new Error('لا يمكن ان تكون كلمة البحث فارغة');
        };
        return this.versesRepository.searchByKeyword(keyword);
    }
}

export default VersesService;