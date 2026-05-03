const Candidate = require("../models/Candidate");
const { parseResume } = require("../services/parserService");
const { generateEmbedding } = require("../services/aiService");

exports.uploadResume = async (req, res) => {
  const filePath = req.file.path;

  const parsed = await parseResume(filePath);

  const embedding = await generateEmbedding(parsed.text);

  const candidate = await Candidate.create({
    skills: parsed.skills,
    experience: 0, // improve later using NLP
    resumeUrl: filePath,
    embedding
  });

  res.json(candidate);
};

exports.searchCandidates = async (req, res) => {
  const { skill, experience } = req.query;

  const candidates = await Candidate.find({
    skills: { $in: [skill] },
    experience: { $gte: experience || 0 }
  });

  res.json(candidates);
};