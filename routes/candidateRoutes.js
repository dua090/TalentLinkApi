const router = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const { smartSearch } = require("../controllers/searchController");
const {
  uploadResume,
  searchCandidates,
  getCandidates,
  addCandidateManual,
} = require("../controllers/candidateController");

const upload = multer({ dest: "uploads/" });

router.post("/upload", auth, upload.single("resume"), uploadResume);
router.post("/manual", auth, addCandidateManual);
router.get("/search", auth, searchCandidates);
router.post("/smart-search", auth, smartSearch);
router.get("/", auth, getCandidates);

module.exports = router;