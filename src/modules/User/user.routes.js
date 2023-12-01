import { Router } from "express";
import * as userController from "./user.controller.js";
import { errorHandler } from "../../utils/errorHandling.js";
import { validationCoreFunction } from "../../middelwares/validation.middleware.js";
import * as validators from "./user.validationSchema.js";
import { isAuth } from "../../middelwares/auth.middleware.js";
import { systemRoles } from "../../utils/systemRoles.js";
const router = Router();


router.post('/', 
    validationCoreFunction(validators.signUpSchema),
    errorHandler(userController.signUp)
)
router.get('/confirm/:token',
    errorHandler(userController.confirmEmail)
)

router.post('/login', 
   errorHandler(userController.logIn)
)

router.put('/',
    isAuth([systemRoles.USER]),
    validationCoreFunction(validators.updateAccountSchema),
    errorHandler(userController.updateAccount)
)
router.delete('/',
    isAuth([systemRoles.USER]),
    errorHandler(userController.deleteAccount)
)

export default router;
