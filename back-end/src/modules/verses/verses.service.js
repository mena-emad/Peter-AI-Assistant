import AppError from '../../utils/AppError.js'

class VersesService{
    constructor(versesRepository) {
        this.versesRepository = versesRepository;
    }

    async searchByKeyword(keyword) {
        if(!keyword || keyword.trim() === ''){
            throw new AppError('لا يمكن ان تكون كلمة البحث فارغة',400);
        };
        return this.versesRepository.searchByKeyword(keyword);
    }
}

export default VersesService;