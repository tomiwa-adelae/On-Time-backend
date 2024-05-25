import express from "express";

import {
	getAllCoursesByStudent,
	addCourseByStudent,
	getStudentCourses,
	getCoursesByLecturer,
	createCourseByLecturer,
	getLecturerCourseById,
} from "../controllers/courseController.js";
import { lecturer, protect } from "../middleware/authMiddleware.js";
import { courseValidator, validate } from "../utils/validators.js";

const router = express.Router();

// Student routes
router
	.route("/students")
	.get(protect, getAllCoursesByStudent)
	.post(protect, addCourseByStudent);
router.route("/students/mine").get(protect, getStudentCourses);

// Lecturer routes
router
	.route("/lecturers")
	.get(protect, lecturer, getCoursesByLecturer)
	.post(protect, lecturer, validate(courseValidator), createCourseByLecturer);
router.route("/lecturers/:id").get(protect, lecturer, getLecturerCourseById);

export default router;
