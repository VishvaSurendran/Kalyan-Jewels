// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 1. UPDATED SCHEMA: Added Employee tracking fields
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  storeLocation: { type: String, required: true },
  executiveName: { type: String, default: '' },
  category: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'Pending' }, 
  resolvedByEmployeeName: { type: String, default: '' }, // NEW
  resolvedByEmployeeId: { type: String, default: '' },   // NEW
  submittedAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

app.post('/api/feedback', async (req, res) => {
  try {
    const newFeedback = new Feedback(req.body);
    await newFeedback.save();
    res.status(201).json({ success: true, message: 'Feedback submitted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit feedback' });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ submittedAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch feedback' });
  }
});

// 2. UPDATED PATCH ROUTE: Accept employee details
app.patch('/api/feedback/:id/status', async (req, res) => {
  try {
    const { status, resolvedByEmployeeName, resolvedByEmployeeId } = req.body;
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id, 
      { status, resolvedByEmployeeName, resolvedByEmployeeId }, 
      { new: true }
    );
    res.status(200).json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));