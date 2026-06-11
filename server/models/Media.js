const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['photo', 'video', 'about_image', 'cover_image', 'sangeet_bg', 'haldi_bg', 'kids_bg', 'corporate_bg', 'cultural_bg', 'fashion_bg'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    enum: ['Sangeet Night', 'Haldi Carnival', 'Kids Celebration', 'Corporate Events', 'Cultural Gigs', 'Fashion Fun', 'None'],
    default: 'None',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Media', mediaSchema);
