const env = require("dotenv").config(); //here dotenv module is imported to load environment variables from a .env file into process.env, allowing us to keep sensitive information like database credentials and JWT secrets out of our codebase.
const express = require("express"); //requests meaning importing a module. here express module is imported
const cors = require("cors"); //here cors module is imported to handle cross-origin requests, allowing the frontend (running on a different port) to communicate with the backend without issues.
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

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

app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log("database name", process.env.DB_SERVER);
});
