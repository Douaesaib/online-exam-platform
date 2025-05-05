const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const { auth, isTeacher, isStudent } = require('../middleware/auth');

// Get all results for a teacher's exams
router.get('/teacher', auth, isTeacher, async (req, res) => {
    try {
        const results = await Result.find()
            .populate({
                path: 'exam',
                match: { createdBy: req.user.userId }
            })
            .populate('student', 'name email')
            .sort({ createdAt: -1 });

        // Filter out results where exam is null (exam was deleted)
        const filteredResults = results.filter(result => result.exam);
        
        res.json(filteredResults);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
});

// Get student's results
router.get('/student', auth, isStudent, async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.userId })
            .populate('exam')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
});

// Submit exam result
router.post('/', auth, isStudent, async (req, res) => {
    try {
        const { examId, answers } = req.body;

        // Check if exam exists and is active
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (!exam.isActive) {
            return res.status(400).json({ message: 'Exam is not active' });
        }

        // Check if student has already submitted
        const existingResult = await Result.findOne({
            exam: examId,
            student: req.user.userId,
            status: 'completed'
        });

        if (existingResult) {
            return res.status(400).json({ message: 'You have already submitted this exam' });
        }

        // Calculate total marks
        let totalMarksObtained = 0;
        const
