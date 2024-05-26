import { body, validationResult } from "express-validator";

export const validate = (validations) => {
	return async (req, res, next) => {
		for (let validation of validations) {
			const result = await validation.run(req);
			if (!result.isEmpty()) {
				break;
			}
		}

		const errors = validationResult(req);
		if (errors.isEmpty()) {
			return next();
		}
		return res.status(422).json({ errors: errors.array() });
	};
};

export const loginValidator = [
	body("email").trim().isEmail().withMessage("Email is required"),
	body("password").notEmpty().withMessage("Password is required!"),
];

export const registerValidator = [
	body("name").notEmpty().withMessage("Name is required!"),
	body("email").trim().isEmail().withMessage("Email is required"),
	body("matricNumber")
		.notEmpty()
		.withMessage("Matriculation/Admission number is required!"),
	body("matricNumber")
		.trim()
		.isLength({ min: 8, max: 12 })
		.withMessage("Enter valid matriculation/admission number!"),
	body("level").notEmpty().withMessage("Academic level is required!"),
	body("department").notEmpty().withMessage("Department is required!"),
	body("faculty").notEmpty().withMessage("Faculty is required!"),
	body("password").notEmpty().withMessage("Password is required!"),
	body("password")
		.trim()
		.isLength({ min: 6 })
		.withMessage("Password should contain at least 6 characters!"),
	body("phoneNumber")
		.isLength({ min: 11, max: 11 })
		.withMessage("Valid phone number is required!"),
];

export const courseValidator = [
	body("title").notEmpty().withMessage("Course title is required!"),
	body("code").notEmpty().withMessage("Course code is required!"),
	body("unit").notEmpty().withMessage("Course unit is required!"),
];

export const updatePasswordValidator = [
	body("currentPassword")
		.notEmpty()
		.withMessage("Current password is required!"),
	body("newPassword").notEmpty().withMessage("New password is required!"),
	body("confirmPassword")
		.notEmpty()
		.withMessage("Confirm password is required!"),
	body("newPassword")
		.trim()
		.isLength({ min: 6 })
		.withMessage("Password should contain at least 6 characters!"),
];

export const resetPasswordValidator = [
	body("email").trim().isEmail().withMessage("Email is required"),
];

export const verifyCodeValidator = [
	body("email").trim().isEmail().withMessage("Email is required"),
	body("code").notEmpty().withMessage("Code is required!"),
];

export const updateNewPasswordValidator = [
	body("id").notEmpty().withMessage("Internal server error!"),
	body("code").notEmpty().withMessage("Internal server error!"),
	body("newPassword").notEmpty().withMessage("New password is required!"),
	body("confirmPassword")
		.notEmpty()
		.withMessage("Confirm password is required!"),
];
