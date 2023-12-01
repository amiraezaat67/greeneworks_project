import Joi from "joi";
import { systemRoles } from "../../utils/systemRoles.js";

export const signUpSchema = {
    body: Joi.object({
        username: Joi.string().min(5).max(15).required(),
        email: Joi.string().email({tlds:{allow:['com','org']}}).required(),
        password: Joi
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
        .messages({
          'string.pattern.base': 'please enter a password like Ahmed1122',
        }).required(),
        cPassword: Joi.valid(Joi.ref('password')).required().messages({
            'any.only': 'password and confirm password does not match',
        }),
        role: Joi.string().valid(systemRoles.USER, systemRoles.ADMIN).default(systemRoles.USER)
    }).required()
}

export const signInSchema = {
    body: Joi.object({
        email: Joi.string().email({tlds:{allow:['com','org']}}).required(),
        password: Joi
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
        .messages({
          'string.pattern.base': 'please enter a password like Ahmed1122',
        }).required(),
    }).required()
}

export const updateAccountSchema = {
    body: Joi.object({
        email: Joi.string().email({tlds:{allow:['com','org']}}),
        username:Joi.string().min(5).max(15),
    }).required()
}
