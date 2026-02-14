import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLowercase()
        .withMessage("Username should be in lower case")
        .isLength({min:5,max:10})
        .withMessage("Username must have atleast 5 character and atmost 10 character"),
        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required"),
        body("fullname")
        .optional()
         .trim()
    ]
}

const userLoginValidator = () => {
    return[
        body("email")
        .optional()
        .isEmail()
        .withMessage("Email is invalid"),
        body("password")
        .notEmpty()
        .withMessage("password is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old password is require"),
        body("newPassword").notEmpty().withMessage("New password is require")
    ]
}

const userForgotPasswordValidator = () => {
    return[
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid")
    ]
}

const userResetForgotPasswordValidator=()=>{
     return[
        body("newPassword")
        .notEmpty()
        .withMessage("Password is required")
    ]

}

export {userRegisterValidator,userLoginValidator,userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,userResetForgotPasswordValidator
}