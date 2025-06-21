import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

// ES module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html']
}));

// API endpoint for file uploads
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = await fileTypeFromBuffer(req.file.buffer);
    if (!fileType) {
      return res.status(400).json({ error: 'Unrecognized file type' });
    }

    const ext = fileType.ext;
    const form = new FormData();
    form.append("fileToUpload", req.file.buffer, `file.${ext}`);
    form.append("reqtype", "fileupload");

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    // Return the URL with your domain (proxy through your domain)
    const catboxUrl = response.data;
    const yourDomainUrl = `${req.protocol}://${req.get('host')}/file/${encodeURIComponent(catboxUrl)}`;
    
    res.json({ 
      originalUrl: catboxUrl,
      yourDomainUrl: yourDomainUrl,
      directUrl: catboxUrl // For reference
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Proxy route to serve files through your domain
app.get('/file/:url', async (req, res) => {
  try {
    const originalUrl = decodeURIComponent(req.params.url);
    const response = await axios.get(originalUrl, { responseType: 'stream' });
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Error fetching file');
  }
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});