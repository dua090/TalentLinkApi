const express = require("express");
const cors = require("cors");

const app = express();
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/analytics", analyticsRoutes);
app.use("/api/search", require("./routes/candidateRoutes"));

module.exports = app;