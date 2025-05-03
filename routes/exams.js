const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { auth, isTeacher, isStudent } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Créer le dossier uploads si besoin
const fs = require('fs');
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

// Get all exams (for teachers)
router.get('/', auth, isTeacher, async (req, res) => {
    try {
        const exams = await Exam.find({ createdBy: req.user.userId })
            .populate('questions')
            .sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams', error: error.message });
    }
});

// Get available exams (for students)
router.get('/available', async (req, res) => {
    try {
        const exams = await Exam.find().populate('questions');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available exams', error: error.message });
    }
});

// Create new exam
router.post('/', auth, isTeacher, upload.array('mediaFiles'), async (req, res) => {
    try {
        const { title, duration } = req.body;
        let questions = JSON.parse(req.body.questions);
        // Associer les fichiers uploadés aux questions
        if (req.files && req.files.length > 0) {
            questions = questions.map((q, idx) => {
                if (req.files[idx]) {
                    q.media = '/uploads/' + req.files[idx].filename;
                }
                return q;
            });
        }
        const exam = new Exam({ title, duration, questions, createdBy: req.user.userId });
        await exam.save();
        res.status(201).json(exam);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la création de l'examen", error: err.message });
    }
});

// Modifier une question d'un examen
router.put('/:examId/questions/:questionIndex', auth, isTeacher, async (req, res) => {
    try {
        const { examId, questionIndex } = req.params;
        const updatedQuestion = req.body;
        const exam = await Exam.findOne({ _id: examId, createdBy: req.user.userId });
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        if (!exam.questions[questionIndex]) return res.status(404).json({ message: 'Question not found' });
        exam.questions[questionIndex] = { ...exam.questions[questionIndex].toObject(), ...updatedQuestion };
        await exam.save();
        res.json(exam);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la modification de la question', error: err.message });
    }
});

// Supprimer une question d'un examen
router.delete('/:examId/questions/:questionIndex', auth, isTeacher, async (req, res) => {
    try {
        const { examId, questionIndex } = req.params;
        const exam = await Exam.findOne({ _id: examId, createdBy: req.user.userId });
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        if (!exam.questions[questionIndex]) return res.status(404).json({ message: 'Question not found' });
        exam.questions.splice(questionIndex, 1);
        await exam.save();
        res.json(exam);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la question', error: err.message });
    }
});

// Get exam by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('questions')
            .populate('createdBy', 'name email');
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // If student, don't send correct answers
        if (req.user.userType === 'student') {
            exam.questions = exam.questions.map(q => {
                const question = q.toObject();
                if (question.type === 'multiple-choice') {
                    question.options = question.options.map(opt => ({
                        text: opt.text
                    }));
                }
                delete question.correctAnswer;
                return question;
            });
        }

        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam', error: error.message });
    }
});

// Update exam
router.put('/:id', auth, isTeacher, async (req, res) => {
    try {
        const exam = await Exam.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.userId },
            req.body,
            { new: true }
        );
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error updating exam', error: error.message });
    }
});

// Delete exam
router.delete('/:id', auth, isTeacher, async (req, res) => {
    try {
        const exam = await Exam.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.userId
        });
        
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exam', error: error.message });
    }
});

// Liste des examens (pour tous)
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des examens", error: err.message });
    }
});

module.exports = router; 