import { userModel } from "../../DB/models/user.model.js"
import { generateToken, verifyToken } from "../utils/tokenFunctions.js"


export const isAuth = (accessRoles) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers
      if (!authorization) {
        return next(new Error('Please login first', { cause: 400 }))
      }
      if (!authorization.startsWith('greeneworks__')) {
        return next(new Error('invalid token prefix', { cause: 400 }))
      }
      const splitedToken = authorization.split('__')[1]
      try {
        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.ACCESS_TOKEN_SIGNATURE,
        })
        console.log(decodedData);
        const findUser = await userModel.findById(
          decodedData._id,
          'email username role',
        )
        if (!findUser) {
          return next(new Error('Please SignUp', { cause: 400 }))
        }
        //================== Authorization==================
        if (!accessRoles.includes(findUser.role)) {
          return next(new Error('UnAuthorized to access', { cause: 401 }))
        }
        req.authUser = findUser
        next()
      } catch (error) {
        console.log(error);
        // if token expired we will refresh the token and send it back to the FE
        if (error == 'TokenExpiredError: jwt expired') {
          // refresh token
          const user = await userModel.findOne({ token: splitedToken })
          if (!user) {
            return next(new Error('Wrong token', { cause: 400 }))
          }
          // generate new token
          const userToken = generateToken({
            payload: {
              email: user.email,
              _id: user._id,
            },
            signature: process.env.ACCESS_TOKEN_SIGNATURE,
            expiresIn: 20,
          })

          if (!userToken) {
            return next(
              new Error('token generation fail, payload canot be empty', {
                cause: 400,
              }),
            )
          }

          user.token = userToken
          await user.save()
          return res.status(200).json({ message: 'Token refreshed successfully', refreshedToken: userToken })
        }
        return next(new Error('invalid token', { cause: 500 }))
      }
    } catch (error) {
      next(new Error('Opps, the middleware execution fails for unknown error in auth.middleware.js file', { cause: 500 }))
    }
  }
}