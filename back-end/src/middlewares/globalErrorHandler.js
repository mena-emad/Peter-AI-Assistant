const gerror =  (err,req,res,next)=>{
    if (res.headersSent) return next(err)
    const statusCode = Number.isInteger(err.statusCode) && err.statusCode >= 400 ? err.statusCode : 500
    console.error('Request failed:',err)
    return res.status(statusCode).json({message:err.isOperational ? err.message : statusCode === 401 ? 'Not authorized' : 'Request failed'});
}

export default gerror