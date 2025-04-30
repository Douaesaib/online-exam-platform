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
        const processedAnswers = answers.map(answer => {
            const question = exam.questions.find(q => q._id.toString() === answer.questionId);
            let isCorrect = false;
            let marksObtained = 0;

            if (question) {
                if (question.type === 'multiple-choice') {
                    const correctOption = question.options.find(opt => opt.isCorrect);
                    isCorrect = correctOption && correctOption.text === answer.selectedOption;
                } else if (question.type === 'true-false') {
                    isCorrect = question.correctAnswer === answer.selectedOption;
                } else if (question.type === 'short-answer') {
                    isCorrect = question.correctAnswer.toLowerCase() === answer.selectedOption.toLowerCase();
                }

                marksObtained = isCorrect ? question.marks : 0;
                totalMarksObtained += marksObtained;
            }

            return {
                question: answer.questionId,
                selectedOption: answer.selectedOption,
                isCorrect,
                marksObtained
            };
        });

        // Create result
        const result = new Result({
            exam: examId,
            student: req.user.userId,
            answers: processedAnswers,
            totalMarksObtained,
            startTime: new Date(),
            endTime: new Date(),
            status: 'completed'
        });

        await result.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting exam', error: error.message });
    }
});

// Get result by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const result = await Result.findById(req.params.id)
            .populate('exam')
            .populate('student', 'name email');

        if (!result) {
            return res.status(404).json({ message: 'Result not found' });
        }

        // Check if user has permission to view this result
        if (req.user.userType === 'student' && result.student._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.user.userType === 'teacher') {
            const exam = await Exam.findById(result.exam._id);
            if (exam.createdBy.toString() !== req.user.userId) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching result', error: error.message });
    }
});

module.exports = router; 