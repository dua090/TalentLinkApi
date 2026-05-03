const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.parseResumeWithAI = async (text) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash",
    });

    const prompt = `
You are an AI resume parser.

Extract accurate details from the resume below.

RULES:
- Do NOT return empty fields unless truly missing
- Guess intelligently if format is unclear
- Extract skills even if mentioned in sentences
- Experience should be total years (estimate if needed)
- Return STRICT JSON only (no markdown, no explanation)

FORMAT:
{
  "name": string,
  "email": string,
  "phone": string,
  "skills": string[],
  "experience": number,
  "education": string[],
  "projects": string[]
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
// const OpenAI = require("openai");

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// exports.parseResumeWithAI = async (text) => {
//   const prompt = `
// Extract structured information from this resume.

// Return ONLY valid JSON in this format:
// {
//   "name": "",
//   "email": "",
//   "phone": "",
//   "skills": [],
//   "experience": number,
//   "education": [],
//   "projects": []
// }

// Resume:
// ${text}
// `;

//   const response = await client.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0
//   });

//   const result = response.choices[0].message.content;

//   try {
//     return JSON.parse(result);
//   } catch (err) {
//     console.error("JSON parse error:", result);
//     return null;
//   }
// };
