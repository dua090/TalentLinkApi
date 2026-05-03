const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const {
  uploadResume,
  searchCandidates
} = require("../controllers/candidateController");

const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("resume"), uploadResume);
router.get("/search", auth, searchCandidates);

module.exports = router;