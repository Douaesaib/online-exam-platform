const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: String,
    type: { type: String, enum: ['qcm', 'direct'], default: 'qcm' }, // qcm ou direct
    options: [String], // Pour QCM
    answer: String,    // Réponse attendue
    tolerance: { type: Number, default: 0 }, // Pour question directe (pourcentage d'erreur accepté)
    media: String // Chemin du fichier joint (image, audio, vidéo)
});

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // en minutes
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Exam', examSchema); 