import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Attendance from "../models/attendanceModel.js";
import StudentAttendance from "../models/studentAttendanceModel.js";

// @desc    Mark student as attended the class with the QRCode link
// @route   POST /api/attendance/:id/mark-as-attended
// @access  Private
const markStudentAsAttended = asyncHandler(async (req, res) => {
	const id = req.params.id;
	const date = req.params.date;

	const attendance = await Attendance.findOne({
		course: id,
	})
		.populate("course")
		.populate("user");

	if (attendance) {
		const classEntry = attendance.classes.find(
			(classItem) => classItem.classPerDay.date === date
		);

		if (!classEntry) {
			return res
				.status(404)
				.send("Class on the specified date not found.");
		}

		const attendeesArray = classEntry.classPerDay.attendees;

		if (
			!attendeesArray.some(
				(attendee) =>
					attendee.student.toString() === req.user._id.toString()
			)
		) {
			attendeesArray.unshift({ student: req.user._id });
		} else {
			res.status(200).json({
				message: "You have already been marked as attended!",
				attendance,
			});
		}

		await attendance.save();

		await StudentAttendance.create({
			user: req.user._id,
			course: req.params.id,
			date,
		});

		res.status(200).send(attendance);
	} else {
		res.status(400);
		throw new Error("Internal server error!");
	}
});

// @desc    Fetch all classes date for a course by a lecturer
// @route   GET /api/attendance/:id/class/dates
// @access  Private
const getClassDatesPerCourse = asyncHandler(async (req, res) => {
	const attendance = await Attendance.findOne({
		user: req.user._id,
		course: req.params.id,
	});

	if (!attendance) {
		res.status(400);
		throw new Error("No attendance record found.");
	}

	const classDates = [];

	attendance.classes.forEach((classItem) => {
		const date = classItem.classPerDay.date;

		classDates.unshift(date);
	});

	res.status(200).json(classDates);
});

// @desc    Fetch all attendees per course by a lecturer
// @route   GET /api/attendance/:id/:date
// @access  Private
const getAttendeesPerCourse = asyncHandler(async (req, res) => {
	const attendance = await Attendance.findOne(
		{
			user: req.user._id,
			course: req.params.id,
			"classes.classPerDay.date": req.params.date,
		},
		{
			"classes.$": 1,
		}
	).populate({
		path: "classes.classPerDay.attendees.student",
		model: "User",
	});

	if (!attendance) {
		res.status(400);
		throw new Error("No attendance record found for the specified date.");
	}

	// Since we used projection, we need to navigate the result correctly
	const classPerDay = attendance.classes[0]?.classPerDay;
	if (!classPerDay) {
		res.status(400);
		throw new Error("No classes found for the specified date.");
	}

	res.status(200).json(classPerDay.attendees);
});

// @desc    Fetch all attendees per course by a student
// @route   GET /api/attendance/:id
// @access  Private
const getAttendeesPerCourseByStudent = asyncHandler(async (req, res) => {
	const attendance = await StudentAttendance.find({
		user: req.user._id,
		course: req.params.id,
	}).populate({
		path: "course",
		populate: { path: "user" },
	});

	res.status(200).json(attendance);
});

export {
	markStudentAsAttended,
	getAttendeesPerCourse,
	getAttendeesPerCourseByStudent,
	getClassDatesPerCourse,
};
