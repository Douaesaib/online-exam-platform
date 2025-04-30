const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { auth, isTeacher, isStudent } = require('../middleware/auth');

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
router.get('/available', auth, isStudent, async (req, res) => {
    try {
        const now = new Date();
        const exams = await Exam.find({
            isActive: true,
            startTime: { $lte: now },
            endTime: { $gte: now }
        }).populate('questions');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available exams', error: error.message });
    }
});

// Create new exam
router.post('/', auth, isTeacher, async (req, res) => {
    try {
        const exam = new Exam({
            ...req.body,
            createdBy: req.user.userId
        });
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Error creating exam', error: error.message });
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

module.exports = router; 