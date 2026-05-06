// controllers/searchController.js

const Candidate = require("../models/Candidate");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.smartSearch = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ msg: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const result = await model.generateContent(`
You are an AI recruiter assistant.

Extract structured data from the query below.

Rules:
- Always return JSON
- Skills must be array
- If experience not mentioned → null

Query: "${prompt}"

Return:
{
  "skills": ["React"],
  "experience": 2
}
`);

    let text = result.response.text();

    // ✅ Safe JSON extraction
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid AI response");

    const parsed = JSON.parse(match[0]);

    console.log("✅ AI Parsed:", parsed);

    // -------------------------
    // 🔍 BUILD MONGO QUERY
    // -------------------------
    let query = {};

    if (parsed.skills?.length) {
      query.$or = parsed.skills.map((skill) => ({
        skills: { $regex: skill, $options: "i" },
      }));
    }

    if (
      parsed.experience !== null &&
      parsed.experience !== undefined &&
      !isNaN(parsed.experience)
    ) {
      query.experience = { $gte: Number(parsed.experience) };
    }

    const candidates = await Candidate.find(query);

    // -------------------------
    // 🔥 MATCH SCORING LOGIC
    // -------------------------
    const scoredCandidates = candidates.map((candidate) => {
      let score = 0;
      let total = 0;

      // ✅ Skill Matching
      if (parsed.skills?.length) {
        total += parsed.skills.length;

        const matchedSkills = parsed.skills.filter((skill) =>
          candidate.skills.some((cSkill) =>
            cSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );

        score += matchedSkills.length;
      }

      // ✅ Experience Matching
      if (
        parsed.experience !== null &&
        parsed.experience !== undefined &&
        !isNaN(parsed.experience)
      ) {
        total += 1;

        if (candidate.experience >= parsed.experience) {
          score += 1;
        }
      }

      // ✅ Final Percentage
      const matchPercentage =
        total === 0 ? 100 : Math.round((score / total) * 100);

      return {
        ...candidate.toObject(), // FULL DETAILS
        matchPercentage,
      };
    });

    // -------------------------
    // 🔥 SORT BEST → WORST
    // -------------------------
    scoredCandidates.sort(
      (a, b) => b.matchPercentage - a.matchPercentage
    );

    // -------------------------
    // 🚀 FINAL RESPONSE
    // -------------------------
    res.json({
      success: true,
      parsed,
      count: scoredCandidates.length,
      candidates: scoredCandidates,
    });

  } catch (err) {
    console.error("❌ SEARCH ERROR:", err.message);

    res.status(500).json({
      success: false,
      msg: "AI Search failed",
      error: err.message,
    });
  }
};