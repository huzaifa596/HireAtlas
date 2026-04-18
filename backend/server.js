const env     =require('dotenv').config(); //here dotenv module is imported to load environment variables from a .env file into process.env, allowing us to keep sensitive information like database credentials and JWT secrets out of our codebase.
const express = require('express');//requests meaning importing a module. here express module is imported
const cors    = require('cors'); //here cors module is imported to handle cross-origin requests, allowing the frontend (running on a different port) to communicate with the backend without issues.
const app     = express();

app.use(cors({
  origin: 'http://localhost:5173',
  origin:'https://www.thunderclient.com'
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);


});
