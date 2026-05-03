const pdfParse = require("pdf-parse");
const fs = require("fs");

exports.parseResume = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);

  return {
    text: data.text,
    skills: [...new Set(
      (data.text.match(/JavaScript|React|Node|Python|MongoDB/gi) || [])
    )]
  };
};