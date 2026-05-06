const router = require("express").Router();

const auth = require("../middleware/authMiddleware");

const {
  getDashboardAnalytics,
} = require("../controllers/analyticsController");

router.get(
  "/dashboard",
  auth,
  getDashboardAnalytics
);

module.exports = router;