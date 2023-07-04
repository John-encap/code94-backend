const jwt= require('jsonwebtoken');

const checkToken = async (req,res,next) =>{
    console.log("checking the token")
    // console.log(req.headers['authorization'])
    // console.log(req.headers)

    if(req.headers['authorization']){

        const accessToken = req.headers['authorization'].split(' ')[1]
        console.log(accessToken)

        jwt.verify(accessToken,process.env.JWTACCESSSECRET,(err,ADesirealized) => {
            if(err){
                console.log('Accesstoken expired')
                return res.json({
                    success:false,
                    authorized:false,
                    error:"Accesstoken expired"
                })
            }
            req.user = ADesirealized
            return next() 
        })
    }else{
        console.log("Accesstoken is missing")
        return res.json({
            success:false,
            authorized: false,
            error:"Authentication Error"
        })
    }
}

module.exports = checkToken