const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const {
  uploadResume,
  searchCandidates,
  getCandidates
} = require("../controllers/candidateController");

const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("resume"), uploadResume);
router.get("/search", auth, searchCandidates);
router.get("/", auth, getCandidates);

module.exports = router;