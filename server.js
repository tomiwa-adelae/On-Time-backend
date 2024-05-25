import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import qrCodeRoutes from "./routes/qrCodeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

// API Routes
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/qrcode", qrCodeRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/", (req, res) => {
	res.send(" API is up and running... ");
});

// Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
