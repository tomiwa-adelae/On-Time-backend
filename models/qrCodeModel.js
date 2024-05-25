import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
	qrCode: {
		required: true,
		type: String,
	},
	id: {
		type: String,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 3600,
	},
});

const QrCode = mongoose.model("QrCode", qrCodeSchema);

export default QrCode;
