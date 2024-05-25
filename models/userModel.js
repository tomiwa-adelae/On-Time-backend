import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		matricNumber: {
			type: String,
			required: true,
			unique: true,
		},
		department: {
			type: String,
			required: true,
		},
		faculty: {
			type: String,
			required: true,
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		password: {
			type: String,
		},
		image: {
			type: String,
			required: true,
			default:
				"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
		},
		imageId: {
			type: String,
		},
		isLecturer: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
