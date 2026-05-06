const express = require("express");
const cors = require("cors");

const app = express();
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/candidates", require("./routes/candidateRoutes"));
<<<<<<< HEAD
app.use("/api/search", require("./routes/candidateRoutes"));
=======
app.use("/api/analytics", analyticsRoutes);
>>>>>>> 4bdb8b1a94f2858d4becf51e62bdfd76fa0c8e9d

module.exports = app;