


export const errorHandler = (API)=>{
    return ( req, res, next) => {
        API(req,res,next).catch((error)=>{
            console.log(error);
            return next(new Error('Opps, the API execution fails for unknown error', { cause: 500 }))
        })
    }
}


export const globalResponseHandler = (err, req, res, next) => {
    if(err){
        const {cause, message} = err
        return res.status(cause || 500 ).json({
            status: cause,
            message: message || req.validationErrors,
        })
    }
}