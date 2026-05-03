const pdfParse = require("pdf-parse");
const fs = require("fs");

exports.parseResume = async (filePath) => {
  const data = await pdfParse(fs.readFileSync(filePath));
  const text = data.text;

  // VERY BASIC extraction (you can improve later)
  const skills = text.match(/JavaScript|React|Node|Python|MongoDB/gi) || [];

  return {
    text,
    skills: [...new Set(skills)]
  };
};