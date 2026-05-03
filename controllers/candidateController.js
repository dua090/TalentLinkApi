const Candidate = require("../models/Candidate");
const { parseResume } = require("../services/parserService");
const { parseResumeWithAI } = require("../services/aiService");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Extract text
    const text = await parseResume(filePath);

    // AI parsing
    const aiData = await parseResumeWithAI(text);

    if (!aiData) {
      return res.status(500).json({ msg: "AI parsing failed" });
    }

    // Save
    const candidate = await Candidate.create({
      name: aiData?.name || "Unknown",
      email: aiData?.email || "",
      phone: aiData?.phone || "",
      skills: aiData?.skills || [],
      experience: aiData?.experience || 0,
      resumeUrl: filePath
    });

    res.json(candidate);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed" });
  }
};

exports.searchCandidates = async (req, res) => {
  const { skill, experience } = req.query;

  const candidates = await Candidate.find({
    skills: { $in: [skill] },
    experience: { $gte: experience || 0 }
  });

  res.json(candidates);
};