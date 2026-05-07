const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const Candidate = require("../models/Candidate");
const { parseResumeWithAI } = require("../services/aiService");

// 🔥 Extract text from file
const extractText = async (filePath, mimetype) => {
  if (mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  return "";
};

// 🔥 Regex fallback parser (important)
const fallbackParser = (text) => {
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const phone = text.match(/\b\d{10}\b/);

  return {
    name: text.split("\n")[0] || "Unknown",
    email: email ? email[0] : "Not found",
    phone: phone ? phone[0] : "Not found",
    skills: [],
    experience: 0,
    education: [],
    projects: []
  };
};

// 🔥 MAIN CONTROLLER
exports.uploadResume = async (req, res) => {
  try {
    // 🔥 Check file
    if (!req.file) {
      return res.status(400).json({
        msg: "No file uploaded",
      });
    }

    const filePath = req.file.path;

    // 🔥 Extract text from resume
    const text = await extractText(
      filePath,
      req.file.mimetype
    );

    if (!text) {
      return res.status(400).json({
        msg: "Could not extract text",
      });
    }

    // 🔥 AI Parsing
    let parsedData = null;

    try {
      parsedData = await parseResumeWithAI(text);
    } catch (err) {
      console.log("AI parsing failed, using fallback parser");
    }

    // 🔥 Fallback parser
    if (!parsedData) {
      parsedData = fallbackParser(text);
    }

    // 🔥 Ensure required fields exist
    parsedData.name = parsedData.name || "Unknown";

    parsedData.email =
      parsedData.email || "Not found";

    parsedData.phone =
      parsedData.phone || "Not found";

    parsedData.skills =
      parsedData.skills || [];

    parsedData.experience =
      parsedData.experience || 0;

    parsedData.education =
      parsedData.education || [];

    parsedData.projects =
      parsedData.projects || [];

    // 🔥 Save candidate
    const candidate = await Candidate.create({
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      skills: parsedData.skills,
      experience: parsedData.experience,
      education: parsedData.education,
      projects: parsedData.projects,

      resumeUrl: filePath,

      // 🔥 AI source
      source: "ai",
    });

    // 🔥 Delete uploaded file after parsing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 🔥 Response
    res.status(201).json({
      success: true,
      msg: "Resume uploaded & parsed successfully",
      candidate,
    });

  } catch (error) {
    console.error("UPLOAD RESUME ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
// 🔥 MANUAL ADD CANDIDATE
exports.addCandidateManual = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      skills,
      experience,
      education,
      projects,
    } = req.body;

    // 🔥 Validation
    if (
      !name ||
      !email ||
      !phone ||
      !skills ||
      experience === undefined
    ) {
      return res.status(400).json({
        msg: "name, email, phone, skills, experience are required",
      });
    }

    const candidate = await Candidate.create({
      name,
      email,
      phone,
      skills,
      experience,
      education: education || [],
      projects: projects || [],

      source: "manual",
    });

    res.status(201).json({
      msg: "Candidate added manually",
      candidate,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: "Server error",
    });
  }
};
// 🔥 SEARCH (basic)
exports.searchCandidates = async (req, res) => {
  try {
    const { skill } = req.query;

    let query = {};
    if (skill) {
      query.skills = { $regex: skill, $options: "i" };
    }

    const candidates = await Candidate.find(query);
    res.json(candidates);

  } catch (err) {
    res.status(500).json({ msg: "Search error" });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

    res.status(200).json(candidates);
  } catch (err) {
    console.error("GET CANDIDATES ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch candidates",
    });
  }
};