import dotenv from "dotenv";
dotenv.config();

import Mailjet from "node-mailjet";

import { v4 as uuidv4 } from "uuid";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import Token from "../models/tokenModel.js";
import cloudinary from "../middleware/cloudinaryMiddleware.js";

const mailjet = Mailjet.apiConnect(
	process.env.MAILJET_API_PUBLIC_KEY,
	process.env.MAILJET_API_PRIVATE_KEY
);

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
	const {
		name,
		email,
		matricNumber,
		level,
		phoneNumber,
		department,
		faculty,
		password,
	} = req.body;

	const userExist = await User.findOne({ email });

	if (userExist) {
		res.status(400);
		throw new Error("User already exists!");
	}

	const matricNumberExist = await User.findOne({ matricNumber });

	if (matricNumberExist) {
		res.status(400);
		throw new Error(
			"User with matriculation/admission number already exist!"
		);
	}

	const user = await User.create({
		name,
		email,
		matricNumber,
		department,
		faculty,
		level,
		phoneNumber,
		password,
	});

	if (user) {
		const token = generateToken(res, user._id);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			matricNumber: user.matricNumber,
			phoneNumber: user.phoneNumber,
			level: user.level,
			department: user.department,
			faculty: user.faculty,
			image: user.image,
			isLecturer: user.isLecturer,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Internal server error!");
	}
});

// @desc    Register a new lecturer
// @route   POST /api/users/lecturer
// @access  Public
const registerLecturer = asyncHandler(async (req, res) => {
	const { name, email, department, faculty, password, phoneNumber } =
		req.body;

	const userExist = await User.findOne({ email });

	if (userExist) {
		res.status(400);
		throw new Error("User already exists!");
	}

	const user = await User.create({
		name,
		email,
		matricNumber: uuidv4(),
		department,
		faculty,
		phoneNumber,
		password,
		level,
		isLecturer: true,
	});

	if (user) {
		const token = generateToken(res, user._id);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			matricNumber: user.matricNumber,
			phoneNumber: user.phoneNumber,
			level: user.level,
			department: user.department,
			faculty: user.faculty,
			image: user.image,
			isLecturer: user.isLecturer,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Internal server error!");
	}
});

// @desc    Auth a user
// @route   POST /api/users/auth
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });
	// @ts-ignore
	if (user && (await user.matchPassword(password))) {
		const token = generateToken(res, user._id);
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			matricNumber: user.matricNumber,
			phoneNumber: user.phoneNumber,
			level: user.level,
			department: user.department,
			faculty: user.faculty,
			image: user.image,
			isLecturer: user.isLecturer,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Invalid email or password!");
	}
});

// @desc    Update a user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		user.name = req.body.name || user.name;
		user.email = user.email;
		user.matricNumber = req.body.matricNumber || user.matricNumber;
		user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
		user.department = req.body.department || user.department;
		user.level = req.body.level || user.level;
		user.faculty = req.body.faculty || user.faculty;
		user.image = user.image;

		const updatedUser = await user.save();
		const token = generateToken(res, user._id);

		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			matricNumber: updatedUser.matricNumber,
			phoneNumber: updatedUser.phoneNumber,
			department: updatedUser.department,
			level: updatedUser.level,
			faculty: updatedUser.faculty,
			image: updatedUser.image,
			isLecturer: updatedUser.isLecturer,
			token,
		});
	} else {
		res.status(404);
		throw new Error("Internal server error!");
	}
});

// @desc    Update a user password
// @route   PUT /api/users/password
// @access  Private
const updateUserPassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword, confirmPassword } = req.body;

	const user = await User.findById(req.user._id);

	if (user) {
		if (newPassword !== confirmPassword) {
			res.status(400);
			throw new Error("Passwords do not match!");
		}
		// @ts-ignore
		if (user && (await user.matchPassword(currentPassword))) {
			user.password = newPassword;

			await user.save();
			res.status(200).json({ message: "Password changed successfully!" });
		} else {
			res.status(400);
			throw new Error("Invalid current password");
		}
	} else {
		res.status(404);
		throw new Error("Internal server error!");
	}
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public;
const logoutUser = (req, res) => {
	res.cookie("jwt", "", {
		httpOnly: true,
		expires: new Date(0),
	});
	res.status(200).json({ message: "Logged out successfully" });
};

// Desc Reset password
// @route POST /api/users/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email });

	if (user) {
		let token = await Token.findOne({ userId: user._id });

		if (!token) {
			token = await new Token({
				userId: user._id,
				code: Math.floor(100000 + Math.random() * 900000),
			}).save();

			const request = mailjet.post("send", { version: "v3.1" }).request({
				Messages: [
					{
						From: {
							Email: "webmasterthetommedia@gmail.com",
							Name: "On Time",
						},
						To: [
							{
								Email: `${email}`,
								Name: `${user.name}`,
							},
						],
						Subject: `Verification code`,
						TextPart: `Your verification code is : ${token.code}`,
						HTMLPart: `<div 
										style="
											font-family: Montserrat, sans-serif;
											font-size: 15px;
											padding: 2rem;
										"
									>
										<h2>On Time</h2>

										<p>We received a request to reset the password for your account. To proceed with the password reset process, please use the following verification code:</p>

										<h5>Your verification code is: </h5>

										<h1>${token.code}</h1>

										<p>Please enter this code on the password reset page to complete the process. There's nothing to do or worry about if it wasn't you. You can keep on keeping on.</p>

										<p>Thank you for your attention to this matter.</p>
										<p>Best regards,</p>
										<p>&copy; 2024 On Time. All Rights Reserved</p>
									</div>
							`,
					},
				],
			});

			// Send email
			request
				.then(() => {
					res.status(201).json({ msg: "Email sent successfully!" });
					return;
				})
				.catch((err) => {
					return err;
				});
		} else {
			res.status(401);
			throw new Error(
				"A verification code has already been dispatched to your email!"
			);
		}
	} else {
		res.status(401);
		throw new Error(
			"The email provided doesn't match any existing user! Please sign up now!"
		);
	}
});

// Desc Verify code
// @route POST /api/users/verify-code
// @access Public
const verifyCode = asyncHandler(async (req, res) => {
	const { email, code } = req.body;

	const user = await User.findOne({ email });

	if (user) {
		const token = await Token.findOne({ userId: user._id, code });

		if (token) {
			res.status(200).json({ id: user._id, message: "Verified!" });
		} else {
			res.status(401);
			throw new Error("Invalid reset code!");
		}
	} else {
		res.status(401);
		throw new Error("Internal server error!");
	}
});

// Desc Update user new passwords
// @route POST /api/users/update-password/:id/:code
// @access Public
const updatePassword = asyncHandler(async (req, res) => {
	const { id, code, newPassword, confirmPassword } = req.body;

	if (newPassword !== confirmPassword) {
		res.status(401);
		throw new Error("Passwords do not match!");
	}

	const user = await User.findById(id);

	if (user) {
		const token = await Token.findOne({
			userId: user._id,
			code,
		});

		if (!token) {
			res.status(401);
			throw new Error("Invalid reset code! Please try again");
		}
		user.password = newPassword;

		await user.save();

		await token.deleteOne({ userId: token.userId });

		res.status(201).json({ message: "Password successfully updated!" });
	} else {
		res.status(401);
		throw new Error("An error occurred! User not found!");
	}
});

// @desc    Update a user image
// @route   PUT /api/users/:id/image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
	const { image } = req.body;
	const user = await User.findById(req.user._id);

	if (user) {
		if (user.imageId) {
			await cloudinary.uploader.destroy(user.imageId, {
				invalidate: true,
			});

			const uploadResponse = await cloudinary.uploader.upload(image, {
				upload_preset: "ontime",
			});

			user.image = uploadResponse.url;
			user.imageId = uploadResponse.public_id;

			const updatedUser = await user.save();

			const token = generateToken(res, updatedUser._id);

			res.json({
				_id: updatedUser._id,
				name: updatedUser.name,
				email: updatedUser.email,
				matricNumber: updatedUser.matricNumber,
				phoneNumber: updatedUser.phoneNumber,
				level: updatedUser.level,
				department: updatedUser.department,
				faculty: updatedUser.faculty,
				image: updatedUser.image,
				isLecturer: updatedUser.isLecturer,
				token,
			});
		} else {
			const uploadResponse = await cloudinary.uploader.upload(image, {
				upload_preset: "ontime",
			});

			user.image = uploadResponse.url;
			user.imageId = uploadResponse.public_id;

			const updatedUser = await user.save();

			const token = generateToken(res, updatedUser._id);

			res.json({
				_id: updatedUser._id,
				name: updatedUser.name,
				email: updatedUser.email,
				matricNumber: updatedUser.matricNumber,
				phoneNumber: updatedUser.phoneNumber,
				level: updatedUser.level,
				department: updatedUser.department,
				faculty: updatedUser.faculty,
				image: updatedUser.image,
				isLecturer: updatedUser.isLecturer,
				token,
			});
		}
	} else {
		res.status(400);
		throw new Error("Internal server error!");
	}
});

export {
	registerUser,
	registerLecturer,
	loginUser,
	updateUserProfile,
	updateUserPassword,
	logoutUser,
	resetPassword,
	verifyCode,
	updatePassword,
	uploadProfileImage,
};
