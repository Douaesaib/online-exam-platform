// Check if user is logged in and is a student
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.userType !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    // Display user name
    document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;

    // Initialize event listeners
    initializeEventListeners();
    loadAvailableExams();
});

function initializeEventListeners() {
    // Navigation
    document.getElementById('availableExamsLink').addEventListener('click', showAvailableExams);
    document.getElementById('myResultsLink').addEventListener('click', showMyResults);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Exam navigation
    document.getElementById('prevQuestion').addEventListener('click', showPreviousQuestion);
    document.getElementById('nextQuestion').addEventListener('click', showNextQuestion);
}

function showAvailableExams(e) {
    e.preventDefault();
    document.getElementById('availableExamsSection').classList.remove('d-none');
    document.getElementById('myResultsSection').classList.add('d-none');
    document.getElementById('availableExamsLink').classList.add('active');
    document.getElementById('myResultsLink').classList.remove('active');
    loadAvailableExams();
}

function showMyResults(e) {
    e.preventDefault();
    document.getElementById('availableExamsSection').classList.add('d-none');
    document.getElementById('myResultsSection').classList.remove('d-none');
    document.getElementById('availableExamsLink').classList.remove('active');
    document.getElementById('myResultsLink').classList.add('active');
    loadResults();
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function loadAvailableExams() {
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const results = JSON.parse(localStorage.getItem('results')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter out exams that the student has already taken
    const takenExamIds = results
        .filter(result => result.studentEmail === currentUser.email)
        .map(result => result.examId);
    
    const availableExams = exams.filter(exam => !takenExamIds.includes(exam.id));
    
    const examsList = document.getElementById('examsList');
    examsList.innerHTML = '';

    if (availableExams.length === 0) {
        examsList.innerHTML = '<p class="text-center">No available exams at the moment.</p>';
        return;
    }

    availableExams.forEach(exam => {
        const examElement = document.createElement('div');
        examElement.className = 'list-group-item';
        examElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${exam.title}</h5>
                    <p class="mb-1">Duration: ${exam.duration} minutes | Questions: ${exam.questions.length}</p>
                    <p class="mb-1">Passing Score: ${exam.passingScore}%</p>
                </div>
                <button class="btn btn-primary start-exam" data-exam-id="${exam.id}">Start Exam</button>
            </div>
        `;
        examsList.appendChild(examElement);
    });

    // Add event listeners for start exam buttons
    document.querySelectorAll('.start-exam').forEach(button => {
        button.addEventListener('click', (e) => {
            const examId = e.target.dataset.examId;
            startExam(examId);
        });
    });
}

let currentExam = null;
let currentQuestionIndex = 0;
let examTimer = null;
let questionTimer = null;
let answers = [];

function startExam(examId) {
    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    currentExam = exams.find(e => e.id === parseInt(examId));
    
    if (!currentExam) return;

    // Initialize exam state
    currentQuestionIndex = 0;
    answers = new Array(currentExam.questions.length).fill(null);
    
    // Show exam modal
    const examModal = new bootstrap.Modal(document.getElementById('examModal'));
    document.getElementById('examTitle').textContent = currentExam.title;
    
    // Start exam timer
    const duration = currentExam.duration * 60; // Convert to seconds
    startExamTimer(duration);
    
    // Show first question
    showQuestion();
    
    examModal.show();
}

function startExamTimer(duration) {
    let timeLeft = duration;
    const timerDisplay = document.getElementById('examTimer');
    
    if (examTimer) clearInterval(examTimer);
    
    examTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(examTimer);
            submitExam();
        }
        
        timeLeft--;
    }, 1000);
}

function showQuestion() {
    const question = currentExam.questions[currentQuestionIndex];
    const questionContainer = document.getElementById('questionContainer');
    
    // Clear previous question timer
    if (questionTimer) clearInterval(questionTimer);
    
    // Start question timer
    let timeLeft = question.timeLimit;
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer mb-3';
    timerDisplay.textContent = `Time left: ${timeLeft} seconds`;
    
    questionTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time left: ${timeLeft} seconds`;
        
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            showNextQuestion();
        }
    }, 1000);
    
    // Create question HTML
    let questionHTML = `
        <div class="question-card">
            <h5>Question ${currentQuestionIndex + 1} of ${currentExam.questions.length}</h5>
            <p class="mb-3">${question.text}</p>
            ${timerDisplay.outerHTML}
    `;
    
    if (question.type === 'multiple') {
        questionHTML += `
            <div class="options-list">
                ${question.options.map((option, index) => `
                    <div class="option-btn ${answers[currentQuestionIndex] === index ? 'selected' : ''}"
                         data-option="${index}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        questionHTML += `
            <div class="mb-3">
                <input type="text" class="form-control" id="directAnswer" 
                       value="${answers[currentQuestionIndex] || ''}"
                       placeholder="Enter your answer">
            </div>
        `;
    }
    
    questionHTML += '</div>';
    questionContainer.innerHTML = questionHTML;
    
    // Add event listeners for multiple choice options
    if (question.type === 'multiple') {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedOption = parseInt(e.target.dataset.option);
                answers[currentQuestionIndex] = selectedOption;
                
                // Update UI
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    } else {
        // Add event listener for direct answer input
        document.getElementById('directAnswer').addEventListener('input', (e) => {
            answers[currentQuestionIndex] = e.target.value;
        });
    }
    
    // Update navigation buttons
    document.getElementById('prevQuestion').disabled = currentQuestionIndex === 0;
    document.getElementById('nextQuestion').textContent = 
        currentQuestionIndex === currentExam.questions.length - 1 ? 'Submit' : 'Next';
}

function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function showNextQuestion() {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        submitExam();
    }
}

function submitExam() {
    // Clear timers
    if (examTimer) clearInterval(examTimer);
    if (questionTimer) clearInterval(questionTimer);
    
    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    
    currentExam.questions.forEach((question, index) => {
        totalPoints += question.points;
        
        if (question.type === 'multiple') {
            if (answers[index] === question.correctAnswer) {
                earnedPoints += question.points;
            }
        } else {
            // For direct answers, we'll consider it correct if it's not empty
            // In a real application, you might want to implement more sophisticated checking
            if (answers[index] && answers[index].trim() !== '') {
                earnedPoints += question.points;
            }
        }
    });
    
    const score = Math.round((earnedPoints / totalPoints) * 100);
    
    // Save result
    const results = JSON.parse(localStorage.getItem('results')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    results.push({
        examId: currentExam.id,
        examTitle: currentExam.title,
        studentEmail: currentUser.email,
        studentName: currentUser.name,
        score: score,
        passed: score >= currentExam.passingScore,
        submittedAt: new Date().toISOString(),
        answers: answers
    });
    
    localStorage.setItem('results', JSON.stringify(results));
    
    // Close modal and show results
    const examModal = bootstrap.Modal.getInstance(document.getElementById('examModal'));
    examModal.hide();
    
    alert(`Exam completed! Your score: ${score}% (${score >= currentExam.passingScore ? 'Passed' : 'Failed'})`);
    showMyResults({ preventDefault: () => {} });
}

function loadResults() {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const userResults = results.filter(result => result.studentEmail === currentUser.email);
    
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';

    if (userResults.length === 0) {
        resultsList.innerHTML = '<p class="text-center">No exam results yet.</p>';
        return;
    }

    userResults.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'list-group-item';
        resultElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">${result.examTitle}</h5>
                    <p class="mb-1">Score: ${result.score}%</p>
                    <p class="mb-1">Status: ${result.passed ? 'Passed' : 'Failed'}</p>
                    <small>Submitted: ${new Date(result.submittedAt).toLocaleString()}</small>
                </div>
                <button class="btn btn-outline-primary view-result" data-result-id="${result.examId}">View Details</button>
            </div>
        `;
        resultsList.appendChild(resultElement);
    });

    // Add event listeners for view result buttons
    document.querySelectorAll('.view-result').forEach(button => {
        button.addEventListener('click', (e) => {
            const examId = e.target.dataset.resultId;
            viewResult(examId);
        });
    });
}

function viewResult(examId) {
    const results = JSON.parse(localStorage.getItem('results')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const result = results.find(r => r.examId === parseInt(examId) && r.studentEmail === currentUser.email);
    
    if (!result) return;

    const exams = JSON.parse(localStorage.getItem('exams')) || [];
    const exam = exams.find(e => e.id === parseInt(examId));
    
    if (!exam) return;

    // Create modal to display result details
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${exam.title} - Results</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p><strong>Score:</strong> ${result.score}%</p>
                    <p><strong>Status:</strong> ${result.passed ? 'Passed' : 'Failed'}</p>
                    <p><strong>Submitted:</strong> ${new Date(result.submittedAt).toLocaleString()}</p>
                    <hr>
                    <h6>Your Answers:</h6>
                    ${exam.questions.map((q, index) => `
                        <div class="mb-3">
                            <p><strong>${index + 1}. ${q.text}</strong></p>
                            <p>Your Answer: ${q.type === 'multiple' ? q.options[result.answers[index]] : result.answers[index]}</p>
                            ${q.type === 'multiple' ? `
                                <p>Correct Answer: ${q.options[q.correctAnswer]}</p>
                            ` : ''}
                            <p>Points: ${result.answers[index] === (q.type === 'multiple' ? q.correctAnswer : '') ? q.points : 0}/${q.points}</p>
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