import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
	const token = req.header("x-auth-token");

	if (token) {
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			if (!decoded.userId) {
				res.status(400);
				throw new Error("User not found!");
			}

			// @ts-ignore
			req.user = await User.findById(decoded.userId).select("-password");

			next();
		} catch (error) {
			console.error(error);
			res.status(401);
			throw new Error("Not authorized, token failed!");
		}
	} else {
		res.status(401);
		throw new Error("Not authorized, no token!");
	}
});

// User must be lecturer
const lecturer = (req, res, next) => {
	// @ts-ignore
	if (req.user && req.user.isLecturer) {
		next();
	} else {
		res.status(401);
		throw new Error("Not authorized as a lecturer");
	}
};

export { protect, lecturer };
