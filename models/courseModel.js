import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		title: {
			type: String,
			required: true,
		},
		code: {
			type: String,
			required: true,
		},
		unit: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
