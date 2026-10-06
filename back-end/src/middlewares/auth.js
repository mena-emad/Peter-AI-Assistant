import jwt from "jsonwebtoken"
export async function protect(req,res,next){
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }else if(req.cookies && req.cookies.accessToken){
        token = req.cookies.accessToken;
    }
    if(!token)
        return res.status(401).json({message:"Not authorized"});
    try{
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        if(!decoded.userId) return res.status(401).json({message:"Not authorized"});
        req.user = {userId:String(decoded.userId)};
        next();
    }catch(err){
        return res.status(401).json({message:"Not authorized"});
    }

}