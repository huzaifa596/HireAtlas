const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});