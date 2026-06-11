require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Media = require('./models/Media');
const Inquiry = require('./models/Inquiry');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'shivangiportfolio',
      resource_type: 'auto', // This allows both image and video uploads
    };
  },
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes

// Get all media
app.get('/api/media', async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Upload media
app.post('/api/media', upload.single('file'), async (req, res) => {
  try {
    const { title, type, tag } = req.body;
    
    if (!req.file) {
       return res.status(400).json({ error: 'No file uploaded' });
    }

    const newMedia = new Media({
      title,
      type,
      url: req.file.path,
      tag: tag || 'None',
    });

    await newMedia.save();
    res.status(201).json(newMedia);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Delete media
app.delete('/api/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });
    
    // Optionally: delete from cloudinary as well here

    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// --- INQUIRIES ROUTING ---

// Create a new inquiry
app.post('/api/inquiries', async (req, res) => {
  try {
    const { fullName, email, phone, eventType, eventDate, message } = req.body;
    
    if (!fullName || !email || !phone || !eventType || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newInquiry = new Inquiry({
      fullName,
      email,
      phone,
      eventType,
      eventDate,
      message,
    });

    await newInquiry.save();
    res.status(201).json(newInquiry);
  } catch (err) {
    console.error('Inquiry submission error:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// Get all inquiries (Admin only)
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Delete an inquiry (Admin only)
app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
