import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },
  joinedQueues: [
    {
      queueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Queue",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      position: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, userType: this.userType },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
