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
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const filePath = req.file.path;

    // 1️⃣ Extract text
    const text = await extractText(filePath, req.file.mimetype);

    if (!text) {
      return res.status(400).json({ msg: "Could not extract text" });
    }

    // 2️⃣ Try AI parsing
    let parsedData = null;
    try {
      parsedData = await parseResumeWithAI(text);
    } catch (err) {
      console.log("AI failed, using fallback");
    }

    // 3️⃣ Fallback if AI fails
    if (!parsedData) {
      parsedData = fallbackParser(text);
    }

    // 4️⃣ Save to DB
    const candidate = await Candidate.create({
      ...parsedData,
      resumeUrl: filePath
    });

    // 5️⃣ Delete file after processing (optional)
    fs.unlinkSync(filePath);

    // 6️⃣ Return clean response
    res.json({
      msg: "Resume uploaded & parsed successfully",
      candidate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
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