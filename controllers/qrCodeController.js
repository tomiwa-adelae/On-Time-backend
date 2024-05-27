import dotenv from "dotenv";
dotenv.config();

import asyncHandler from "../middleware/asyncHandler.js";
import QRCode from "qrcode";
import QrCode from "../models/qrCodeModel.js";
import Attendance from "../models/attendanceModel.js";

// @desc    Generate QR Code by lecturers
// @route   GET /api/qrcode/generate/:id
// @access  Public
const generateQRCode = asyncHandler(async (req, res) => {
	const { date } = req.body;
	const attendance = await Attendance.findOne({ course: req.params.id });

	if (attendance) {
		attendance.classes.unshift({
			classPerDay: {
				date,
			},
		});

		await attendance.save();

		// const newQrCode = await QRCode.toDataURL(
		// 	`${process.env.BASE_URL}/api/attendance/${req.params.id}/mark-as-attended/${date}`
		// );
		const newQrCode = await QRCode.toDataURL(
			`${process.env.CLIENT_URL}/markattendance?id=${req.params.id}&date=${date}`
		);

		await QrCode.create({
			date,
			id: req.params.id,
			qrCode: newQrCode,
		});

		res.status(200).send(newQrCode);
	} else {
		res.status(400);
		throw new Error("Internal server error!");
	}
});

export { generateQRCode };
