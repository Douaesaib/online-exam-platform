const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { auth, isTeacher } = require('../middleware/auth');

// Get all questions (for teachers)
router.get('/', auth, isTeacher, async (req, res) => {
    try {
        const questions = await Question.find({ createdBy: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
});

// Create new question
router.post('/', auth, isTeacher, async (req, res) => {
    try {
        const question = new Question({
            ...req.body,
            createdBy: req.user.userId
        });
        await question.save();
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error creating question', error: error.message });
    }
});

// Get question by ID
router.get('/:id', auth, isTeacher, async (req, res) => {
    try {
        const question = await Question.findOne({
            _id: req.params.id,
            createdBy: req.user.userId
        });
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching question', error: error.message });
    }
});

// Update question
router.put('/:id', auth, isTeacher, async (req, res) => {
    try {
        const question = await Question.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.userId },
            req.body,
            { new: true }
        );
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error updating question', error: error.message });
    }
});

// Delete question
router.delete('/:id', auth, isTeacher, async (req, res) => {
    try {
        const question = await Question.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.userId
        });
        
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question', error: error.message });
    }
});

module.exports = router; 