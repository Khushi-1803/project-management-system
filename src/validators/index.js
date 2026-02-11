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

export {userRegisterValidator,userLoginValidator}