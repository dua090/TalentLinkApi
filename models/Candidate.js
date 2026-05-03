const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  skills: [String],
  experience: Number,
  resumeUrl: String,
  embedding: [Number] // for AI matching
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);