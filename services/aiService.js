const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.parseResumeWithAI = async (text) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const prompt = `
Extract structured information from this resume.

Return ONLY valid JSON (no explanation, no markdown) in this format:
{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "experience": number,
  "education": [],
  "projects": []
}

Resume:
${text}
`;

    const result = await model.generateContent(prompt);

    let responseText = result.response.text();

    // 🔥 Clean unwanted markdown (VERY IMPORTANT)
    responseText = responseText.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.error("JSON parse error:", responseText);
      return null;
    }

  } catch (error) {
    console.error("Gemini error:", error);
    return null;
  }
};