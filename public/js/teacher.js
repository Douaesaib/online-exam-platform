// Check if user is logged in and is a teacher
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.userType !== 'teacher') {
        window.location.href = 'index.html';
        return;
    }

    // Display user name
    document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;

    // Initialize event listeners
    initializeEventListeners();
    loadExams();
});

function initializeEventListeners() {
    // Navigation
    document.getElementById('createExamLink').addEventListener('click', showCreateExam);
    document.getElementById('viewExamsLink').addEventListener('click', showViewExams);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Exam creation
    document.getElementById('addQuestionBtn').addEventListener('click', addQuestion);
    document.getElementById('createExamForm').addEventListener('submit', handleCreateExam);
}

function showCreateExam(e) {
    e.preventDefault();
    document.getElementById('createExamSection').classList.remove('d-none');
    document.getElementById('viewExamsSection').classList.add('d-none');
    document.getElementById('createExamLink').classList.add('active');
    document.getElementById('viewExamsLink').classList.remove('active');
}

function showViewExams(e) {
    e.preventDefault();
    document.getElementById('createExamSection').classList.add('d-none');
    document.getElementById('viewExamsSection').classList.remove('d-none');
    document.getElementById('createExamLink').classList.remove('active');
    document.getElementById('viewExamsLink').classList.add('active');
    loadExams();
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function addQuestion() {
    const template = document.getElementById('questionTemplate');
    const questionsContainer = document.getElementById('questionsContainer');
    const questionElement = template.content.cloneNode(true);
    
    // Add event listener for question type change
    const typeSelect = questionElement.querySelector('.question-type');
    typeSelect.addEventListener('change', (e) => {
        const optionsContainer = e.target.closest('.question-card').querySelector('.options-container');
        if (e.target.value === 'multiple') {
            optionsContainer.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Options</label>
                    <div class="options-list">
                        <div class="input-group mb-2">
                            <input type="text" class="form-control option-text" placeholder="Option 1" required>
                            <div class="input-group-text">
                                <input type="radio" name="correct-${Date.now()}" value="0" required>
                            </div>
                        </div>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control option-text" placeholder="Option 2" required>
                            <div class="input-group-text">
                                <input type="radio" name="correct-${Date.now()}" value="1">
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-outline-secondary btn-sm add-option">Add Option</button>
                </div>
            `;
            
            // Add event listener for adding options
            optionsContainer.querySelector('.add-option').addEventListener('click', addOption);
        } else {
            optionsContainer.innerHTML = '';
        }
    });

    // Add event listener for remove question button
    questionElement.querySelector('.remove-question').addEventListener('click', (e) => {
        e.target.closest('.question-card').remove();
    });

    questionsContainer.appendChild(questionElement);
}

function addOption(e) {
    const optionsList = e.target.previousElementSibling;
    const optionCount = optionsList.children.length;
    const radioName = optionsList.querySelector('input[type="radio"]').name;
    
    const newOption = document.createElement('div');
    newOption.className = 'input-group mb-2';
    newOption.innerHTML = `
        <input type="text" class="form-control option-text" placeholder="Option ${optionCount + 1}" required>
        <div class="input-group-text">
            <input type="radio" name="${radioName}" value="${optionCount}">
        </div>
    `;
    
    optionsList.appendChild(newOption);
}

function handleCreateExam(e) {
    e.preventDefault();
    
    const exam = {
        id: Date.now(),
        title: document.getElementById('examTitle').value,
        duration: parseInt(document.getElementById('examDuration').value),
        passingScore: parseInt(document.getElementById('passingScore').value),
        questions: [],
        createdBy: JSON.parse(localStorage.getItem('currentUser')).email,
        createdAt: new Date().toISOString()
    };

    // Collect questions
    const questionCards = document.querySelectorAll('.question-card');
    questionCards.forEach((card, index) => {
        const question = {
            id: index + 1,
            text: card.querySelector('.question-text').value,
            type: card.querySelector('.question-type').value,
            points: parseInt(card.querySelector('.question-points').value),
            timeLimit: parseInt(card.querySelector('.question-time').value)
        };

        if (question.type === 'multiple') {
            const options = Array.from(card.querySelectorAll('.option-text')).map(input => input.value);
            const correctAnswer = card.querySelector('input[type="radio"]:checked').value;
            question.options = options;
            question.correctAnswer = parseInt(correctAnswer);
        }

        exam.questions.push(question);
    });

    // Save exam
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    exams.push(exam);
    localStorage.setItem('exams', JSON.stringify(exams));

    alert('Exam created successfully!');
    e.target.reset();
    document.getElementById('questionsContainer').innerHTML = '';
    showViewExams({ preventDefault: () => {} });
}

function loadExams() {
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userExams = exams.filter(exam => exam.createdBy === currentUser.email);
    
    const examsList = document.getElementById('examsList');
    examsList.innerHTML = '';

    if (userExams.length === 0) {
        examsList.innerHTML = '<p class="text-center">No exams created yet.</p>';
        return;
    }

    userExams.forEach(exam => {
        const examElement = document.createElement('div');
        examElement.className = 'list-group-item';
        examElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${exam.title}</h5>
                    <p class="mb-1">Duration: ${exam.duration} minutes | Questions: ${exam.questions.length}</p>
                    <small>Created: ${new Date(exam.createdAt).toLocaleDateString()}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary view-exam" data-exam-id="${exam.id}">View</button>
                    <button class="btn btn-sm btn-outline-danger delete-exam" data-exam-id="${exam.id}">Delete</button>
                </div>
            </div>
        `;
        examsList.appendChild(examElement);
    });

    // Add event listeners for view and delete buttons
    document.querySelectorAll('.view-exam').forEach(button => {
        button.addEventListener('click', (e) => {
            const examId = e.target.dataset.examId;
            viewExam(examId);
        });
    });

    document.querySelectorAll('.delete-exam').forEach(button => {
        button.addEventListener('click', (e) => {
            const examId = e.target.dataset.examId;
            deleteExam(examId);
        });
    });
}

function viewExam(examId) {
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const exam = exams.find(e => e.id === parseInt(examId));
    
    if (!exam) return;

    // Create modal to display exam details
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${exam.title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Duration:</strong> ${exam.duration} minutes</p>
                    <p><strong>Passing Score:</strong> ${exam.passingScore}%</p>
                    <p><strong>Questions:</strong> ${exam.questions.length}</p>
                    <hr>
                    <h6>Questions:</h6>
                    ${exam.questions.map((q, index) => `
                        <div class="mb-3">
                            <p><strong>${index + 1}. ${q.text}</strong></p>
                            <p>Type: ${q.type === 'multiple' ? 'Multiple Choice' : 'Direct Answer'}</p>
                            <p>Points: ${q.points}</p>
                            <p>Time Limit: ${q.timeLimit} seconds</p>
                            ${q.type === 'multiple' ? `
                                <p>Options:</p>
                                <ul>
                                    ${q.options.map((opt, i) => `
                                        <li>${opt} ${i === q.correctAnswer ? '(Correct)' : ''}</li>
                                    `).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

function deleteExam(examId) {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const updatedExams = exams.filter(exam => exam.id !== parseInt(examId));
    localStorage.setItem('exams', JSON.stringify(updatedExams));
    
    loadExams();
} 