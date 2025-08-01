const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      text: { type: String, required: true },
      value: { type: Number, required: true }, // e.g., 0 for "Not at all", 3 for "Nearly every day"
    },
  ],
  category: {
      type: String,
      enum: ['anxiety', 'depression', 'stress'],
      required: true
  }
});

module.exports = mongoose.model('quiz', QuizSchema);