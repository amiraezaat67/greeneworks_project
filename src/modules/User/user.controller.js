import bcrypt from "bcryptjs"
import { userModel } from "../../../DB/models/user.model.js"
import { sendEmailService } from "../../services/sendEmailService.js"
import { emailTemplate } from "../../utils/emailTemplate.js"
import { generateToken, verifyToken } from "../../utils/tokenFunctions.js"


//============================================= Sign Up API =============================================//
/**
 * desturct data from the request body
 * check if the email is already registered
 * if email already registered return error
 * send confirmation email
 * create user
 * send response
 */
export const signUp = async (req, res, next) => {
    const { username , email , password , role } = req.body
    // 1- check if the email is already registered

    const isEmailDuplicate = await userModel.findOne({ email })
    if(isEmailDuplicate) return next(new Error('Email is already registered, please enter different email', { cause: 400 }))

    // 2- send confirmation email
    const token = generateToken({
            payload: {
            email,
            },
            signature: process.env.CONFIRMATION_EMAIL_TOKEN,
            expiresIn: '1h',
    })
    const conirmationlink = `${req.protocol}://${req.headers.host}/api/users/confirm/${token}`
    const isEmailSent = sendEmailService({ 
                to: email,
                subject:'Activate your account',
                message:emailTemplate({
                    link: conirmationlink,
                    linkData: 'Please click on the link to activate your account',
                    subject: 'Confirmation Email',
                })
        }) 
    if (!isEmailSent) {
        return next(new Error('fail to sent confirmation email', { cause: 400 }))
    }
    // 3- create user
    const userInstance = new userModel({ username , email , password , role })
    await userInstance.save()
    // 4- send response
    res.status(201).json({message:'User Registered Successfully. please check your email to activate your account'})
      
}


// =============================== Confirm Email API ===============================//
/**
 * desturct token from the request params
 * verify the token
 * check if the email is already confirmed
 * if email already confirmed return error
 * if not confirmed befor so update user to confirmed
 * send response
 */
export const confirmEmail = async (req, res, next) => {
    //1-desturct token from the request params
    const { token } = req.params
    // 2- verify the token
    const decode = verifyToken({
      token,
      signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    })
    // 3- check if the email is already confirmed and update the user to confirmed if not confirmed befor
    const user = await userModel.findOneAndUpdate(
      { email: decode?.email, isConfirmed: false },
      { isConfirmed: true },
      { new: true },
    )
    // 4- if email already confirmed return error
    if (!user) {
      return next(new Error('Your email is already confirmed, please login', { cause: 400 }))
    }
    // 5- send response
    res.status(200).json({ messge: 'Confirmed done, please try to login' })
  }
  

//=============================== Log In API ===============================//
/**
   * desturct data from the request body
   * check if the email exists
   * if email not exists return error
   * check if the password is correct
   * if password not correct return error
   * generate token
   * update the user with the token
   * send response
   */
  export const logIn = async (req, res, next) => {
    // 1- desturct data from the request body
    const { email, password } = req.body
    // 2- check if the email exists
    const user = await userModel.findOne({ email })
    // 3- if email not exists return error
    if (!user) {
      return next(new Error('invalid login credentials', { cause: 400 }))
    }
    // 4- check if the password is correct
    const isPassMatch = bcrypt.compareSync(password, user.password)
    // 5- if password not correct return error
    if (!isPassMatch) {
      return next(new Error('invalid login credentials', { cause: 400 }))
    }
    // 6-generate token
    const token = generateToken({
      payload: {
        email,
        _id: user._id,
        role: user.role,
      },
      signature: process.env.ACCESS_TOKEN_SIGNATURE,
      expiresIn: '1h',
    })
    // 7- update the user with the token
    await userModel.findOneAndUpdate(
        { email },
        {
          token
        }
      )
    // 8- send response
    res.status(200).json({ messge: 'Login Success', Access_tokn:token })
  }



// =============================== Update Account API ===============================//
/**
 * desturct data from the request body
 * if the user update the email we need to check if the new email is already registered before or not
 * if not registered before send confirmation email to the new email
 * if registered before return error
 * if the user update the username 
 * update the loggedIn user with the updatedObject
 * return response after update
 */
export const updateAccount = async (req, res, next) => {
    const { username , email } = req.body
    const {_id} = req.authUser
    let updatedObject = {}
    // if user want to update the email
    if(email){
        // 1- check if the email is already registered
        const isEmailDuplicate = await userModel.findOne({ email })
        if(isEmailDuplicate) return next(new Error('Email is already registered, please enter different email', { cause: 400 }))
    
        // 2- send confirmation email to the new email
        const token = generateToken({
                payload: {
                email,
                },
                signature: process.env.CONFIRMATION_EMAIL_TOKEN,
                expiresIn: '1h',
        })
        const conirmationlink = `${req.protocol}://${req.headers.host}/api/users/confirm/${token}`
        const isEmailSent = sendEmailService({ 
                    to: email,
                    subject:'Activate your account',
                    message:emailTemplate({
                        link: conirmationlink,
                        linkData: 'Please click on the link to activate your account',
                        subject: 'Confirmation Email',
                    })
            }) 
        if (!isEmailSent) {
            return next(new Error('fail to sent confirmation email', { cause: 400 }))
        }
        // 3- add the new email to the updatedObject to update it
        updatedObject.email = email
        updatedObject.isConfirmed = false
    }
    // if user want to update the username
    if(username){
        updatedObject.username = username
    }
   
    // update the loggedIn user with the updatedObject
    const user = await userModel.findByIdAndUpdate(_id,updatedObject,{new:true})
    if(!user) return next(new Error('User Not Found', { cause: 404 }))
    // return response after update
    res.status(200).json({message:'User Updated Successfully',user})
}





// =============================== Delete Account API ===============================//
/**
 * desturct data from the authenticated user data
 * delete the loggedIn user account
 * return response after delete
 */
export const deleteAccount  = async (req, res, next) => {
    const {_id} = req.authUser
    // delete the loggedIn user account
    const user = await userModel.findByIdAndDelete(_id)
    if(!user) return next(new Error('User Not Found', { cause: 404 }))
    // return response after delete
    res.status(200).json({message:'User Deleted Successfully'})
}
