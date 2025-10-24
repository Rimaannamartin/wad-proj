const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDb = require("./config/connect")
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes'); // ADD THIS LINE
const session = require("express-session");

dotenv.config();

connectDb()
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "supersecreatkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

const cors = require("cors");
app.use(cors({ 
    origin: "http://localhost:3000", // Changed to match your frontend port
    credentials: true 
}));

// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve index.html as root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// API Routes
app.use('/api/v1/userAuth', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/profile', profileRoutes); // ADD THIS LINE

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Images must be 5MB or less and videos 50MB or less.'
    });
  }
  
  // Multer file type error
  if (['Only image or video files are allowed!', 'Unsupported media type'].includes(err.message)) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// For client-side routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, (error) => {
    if (error) {
        console.log('Server error:', error);
    } else {
        console.log(`Server running successfully at port ${PORT}`);
    }
});