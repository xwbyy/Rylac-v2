require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { fileTypeFromBuffer } = require('file-type');
const FormData = require('form-data');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Security and logging middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Catbox upload function with retry logic
const catboxUpload = async (buffer, retries = 3) => {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) throw new Error('File type not recognized');
    
    const ext = fileType.ext;
    const bodyForm = new FormData();
    bodyForm.append("fileToUpload", buffer, `file.${ext}`);
    bodyForm.append("reqtype", "fileupload");
    
    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: bodyForm,
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    return await res.text();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying upload... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return catboxUpload(buffer, retries - 1);
    }
    throw error;
  }
};

// Upload endpoint with error handling
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Validate file size
    if (req.file.size > 100 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 100MB limit'
      });
    }

    const url = await catboxUpload(req.file.buffer);
    res.json({ 
      success: true,
      url,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});