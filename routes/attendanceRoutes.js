import express from "express";

import { lecturer, protect } from "../middleware/authMiddleware.js";
import {
	getAttendeesPerCourse,
	markStudentAsAttended,
	getAttendeesPerCourseByStudent,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.route("/:id").get(protect, getAttendeesPerCourseByStudent);
router.route("/:id/:date").get(protect, lecturer, getAttendeesPerCourse);
router
	.route("/:id/mark-as-attended/:date")
	.post(protect, markStudentAsAttended);

export default router;
