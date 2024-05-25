import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema({
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

const classPerDaySchema = new mongoose.Schema({
	date: {
		type: String,
		required: true,
	},
	attendees: [attendeeSchema],
});

const classesSchema = new mongoose.Schema({
	classPerDay: classPerDaySchema,
});

const attendanceSchema = new mongoose.Schema(
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
		classes: [classesSchema],
	},
	{ timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
