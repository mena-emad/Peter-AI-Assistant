
class AuthRepository{
    constructor(userModel,sessionModel){
        this.userModel = userModel;
        this.sessionModel = sessionModel
    }

    async findByEmail(email){
        return this.userModel.findOne({email})
    }

    async findById(userId){
        return this.userModel.findById(userId).select('_id name email googleId')
    }

    async create(user){
        return this.userModel.create(user)
    }

    async saveSession({userId,refreshTokenHash,expiresAt}){
        return this.sessionModel.findOneAndUpdate(
            {userId},
            {refreshTokenHash,expiresAt},
            {upsert:true,new:true,setDefaultsOnInsert:true},
        )
    }

    async findSession(userId,refreshTokenHash){
        return this.sessionModel.findOne({userId,refreshTokenHash,expiresAt:{$gt:new Date()}})
    }

    async deleteSession(userId,refreshTokenHash){
        return this.sessionModel.deleteOne({userId,refreshTokenHash})
    }


}

export default AuthRepository