const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Enable CORS for all origins (adjust in production)
app.use(cors());

//Show uploaded image
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Create uploads directory if not exists
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ---- ROUTES ----

// File upload endpoint
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.json({
    fileName: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
  });
});

// File download endpoint
app.get('/api/files/download/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.download(filePath, req.params.filename, (err) => {
    if (err) res.status(500).send('Download error');
  });
});

// List uploaded files (optional)
app.get('/api/files', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).send('Failed to list files');
    res.json(files);
  });
});

// DELETE endpoint to delete a file
app.delete('/api/files/:filename', (req, res) => {
  const fileName = decodeURIComponent(req.params.filename); // optional, safer
  const filePath = path.join(__dirname, 'uploads', fileName);

  console.log('Attempting to delete:', filePath);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Delete error:', err.message);
      return res.status(500).json({ error: 'Failed to delete file.' });
    }

    console.log('File deleted:', fileName);
    res.json({ message: 'File deleted successfully.' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
