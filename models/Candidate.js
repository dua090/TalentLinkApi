const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: [String],
  experience: Number,
  education: Array,
  projects: Array,
  resumeUrl: String
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);