const { check, validationResult } = require('express-validator')

const registerValidationResults = () => {
    return [
        check('name')
            .notEmpty().withMessage('Name is required')
            .isAlpha().withMessage('Name must contain only alphabets')
            .isLength({ min: 2, max: 30 }).withMessage('Name must be between 2 and 30 characters'),

        check('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Enter a valid email address'),

        check('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/).withMessage('Password must contain at least one number')
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),

        check('pic')
            .optional()
            .isURL().withMessage('Please enter a valid image URL')
    ]
}

const loginValidationResults = () => {
    return [
        check('email')
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Enter a valid email address'),

        check('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
            .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/).withMessage('Password must contain at least one number')
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    ]
}

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    registerValidationResults,
    loginValidationResults,
    validateRequest
}