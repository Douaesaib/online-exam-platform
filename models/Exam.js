const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: String,
    options: [String],
    answer: String
});

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // en minutes
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Exam', examSchema); 