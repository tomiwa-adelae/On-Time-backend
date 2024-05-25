import mongoose from "mongoose";

const studentAttendanceSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Course",
		},
		date: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const StudentAttendance = mongoose.model(
	"StudentAttendance",
	studentAttendanceSchema
);

export default StudentAttendance;
