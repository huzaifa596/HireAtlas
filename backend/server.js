require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);

app.use(express.json({ limit: "1mb" }));

const dashboardRoutes = require("./routes/dashboardRoutes");
const user = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");


// Routes
//auth
app.use("/api/auth", require("./routes/authRoutes"));

//dashboard

app.use("/api/dashboard", dashboardRoutes);

//application
app.use("/api/applications", applicationRoutes);
//user

app.use("/api/user", user);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ message: "Invalid JSON body" });
  if (err.message === "Origin is not allowed by CORS") return res.status(403).json({ message: err.message });
  if (err.name === "MulterError" || err.message?.startsWith("Only ")) return res.status(400).json({ message: err.message });
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
