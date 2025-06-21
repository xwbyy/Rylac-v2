import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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
    const mime = fileType.mime;
    const form = new FormData();
    form.append("fileToUpload", req.file.buffer, `file.${ext}`);
    form.append("reqtype", "fileupload");

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    const catboxUrl = response.data;
    const fileId = path.basename(catboxUrl);
    const yourDomainUrl = `${req.protocol}://${req.get('host')}/f/${fileId}`;
    
    res.json({ 
      url: yourDomainUrl,
      type: mime,
      size: req.file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Proxy route to serve files through your domain
app.get('/f/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const originalUrl = `https://files.catbox.moe/${fileId}`;
    
    const response = await axios.get(originalUrl, { 
      responseType: 'stream',
      validateStatus: () => true // To handle 404 errors
    });

    if (response.status !== 200) {
      return res.status(404).send('File not found');
    }

    // Set appropriate headers
    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'public, max-age=31536000' // 1 year cache
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Error fetching file');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});