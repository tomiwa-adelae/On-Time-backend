import asyncHandler from "../middleware/asyncHandler.js";
import Course from "../models/courseModel.js";
import StudentCourse from "../models/studentCourseModel.js";
import Attendance from "../models/attendanceModel.js";

// @desc    Fetch all course by students
// @route   GET /api/courses/students
// @access  Public
const getAllCoursesByStudent = asyncHandler(async (req, res) => {
	const keyword = req.query.keyword
		? {
				$or: [
					{
						code: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						title: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						unit: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
				],
		  }
		: {};

	const courses = await Course.find({ ...keyword })
		.sort({
			createdAt: -1,
		})
		.populate("user");

	res.status(200).json(courses);
});

// @desc    Fetch all student's courses by students
// @route   GET /api/courses/students/mine
// @access  Public
const getStudentCourses = asyncHandler(async (req, res) => {
	const courses = await StudentCourse.find({ user: req.user._id })
		.sort({
			createdAt: -1,
		})
		.populate({
			path: "course",
			populate: { path: "user" },
		});

	res.status(200).json(courses);
});

// @desc    Add a course to offer by students
// @route   POST /api/courses/students
// @access  Private
const addCourseByStudent = asyncHandler(async (req, res) => {
	const { id } = req.body;

	const courseExist = await StudentCourse.findOne({
		user: req.user._id,
		course: id,
	});

	if (courseExist) {
		res.status(400);
		throw new Error("You are already offering this course!");
	}

	const course = await StudentCourse.create({
		user: req.user._id,
		course: id,
	});

	if (course) {
		res.status(201).json({
			message: "You have successfully added the course!",
		});
	} else {
		res.status(404);
		throw new Error("Internal error occurred! Course not added!");
	}
});

// @desc    Fetch a course details by students
// @route   GET /api/courses/students/:id
// @access  Private
const getCourseById = asyncHandler(async (req, res) => {
	const course = await Course.findOne({
		_id: req.params.id,
	}).populate("user");

	if (course) {
		res.status(200).json(course);
	} else {
		res.status(404);
		throw new Error("Internal error occurred!");
	}
});

// @desc    Fetch all course the lecturer is taking by lecturers
// @route   GET /api/courses/lecturers
// @access  Private
const getCoursesByLecturer = asyncHandler(async (req, res) => {
	const keyword = req.query.keyword
		? {
				$or: [
					{
						code: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						title: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
					{
						unit: {
							$regex: req.query.keyword,
							$options: "i",
						},
					},
				],
		  }
		: {};

	const courses = await Course.find({ ...keyword, user: req.user._id })
		.sort({
			createdAt: -1,
		})
		.populate("user");

	res.status(200).json(courses);
});

// @desc    Fetch a course details by lecturers
// @route   GET /api/courses/lecturers/:id
// @access  Private
const getLecturerCourseById = asyncHandler(async (req, res) => {
	const course = await Course.findOne({
		user: req.user._id,
		_id: req.params.id,
	}).populate("user");

	if (course) {
		res.status(200).json(course);
	} else {
		res.status(404);
		throw new Error("Internal error occurred!");
	}
});

// @desc    Create a course by lecturers
// @route   POST /api/courses/lecturers
// @access  Private
const createCourseByLecturer = asyncHandler(async (req, res) => {
	const { title, code, unit } = req.body;

	const courseExist = await Course.findOne({
		code,
	});

	if (courseExist) {
		res.status(400);
		throw new Error("Course with that code exist!");
	}

	const course = await Course.create({
		user: req.user._id,
		code,
		title,
		unit,
	});

	if (course) {
		await Attendance.create({
			user: req.user._id,
			course: course._id,
		});

		res.status(201).json({
			message: "You have successfully created a course!",
		});
	} else {
		res.status(404);
		throw new Error("Internal error occurred!");
	}
});

export {
	getAllCoursesByStudent,
	addCourseByStudent,
	getStudentCourses,
	getCoursesByLecturer,
	createCourseByLecturer,
	getLecturerCourseById,
	getCourseById,
};
