import express from "express";

import { protect, lecturer } from "../middleware/authMiddleware.js";
import { generateQRCode, getQRCode } from "../controllers/qrCodeController.js";

const router = express.Router();

router
	.route("/generate/:id")
	.post(protect, lecturer, generateQRCode)
	.get(protect, lecturer, getQRCode);

export default router;
