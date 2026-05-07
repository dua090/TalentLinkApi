const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      required: true,
      default: [],
    },

    experience: {
      type: Number,
      required: true,
      default: 0,
    },

    education: {
      type: Array,
      default: [],
    },

    projects: {
      type: Array,
      default: [],
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    // 🔥 REQUIRED SOURCE
    source: {
      type: String,
      enum: ["ai", "manual"],
      default: "ai",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);