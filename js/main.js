// Global variables
let currentLesson = null;
let currentStepIndex = 0;
let userAnswers = [];

function createErrorEl(form) {
  let el = form.querySelector('.form-error');
  if (!el) {
    el = document.createElement('div');
    el.className = 'form-error';
    el.style.color = '#dc2626';
    el.style.marginTop = '0.5rem';
    el.style.fontSize = '0.9rem';
    form.appendChild(el);
  }
  return el;
}

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = createErrorEl(loginForm);
        if (!email || !password) {
          errorEl.textContent = 'Заполните все поля';
          return;
        }
        try {
          const data = await apiLogin(email, password);
          saveToken(data.token, { name: data.name, email: data.email });
          window.location.href = 'choose.html';
        } catch (err) {
          errorEl.textContent = err.message;
        }
      });
    }

    // Registration Form Handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorEl = createErrorEl(registerForm);
        if (password !== confirmPassword) {
          errorEl.textContent = 'Пароли не совпадают';
          return;
        }
        if (!name || !email || !password) {
          errorEl.textContent = 'Заполните все поля';
          return;
        }
        try {
          await apiRegister(email, password, name);
          const data = await apiLogin(email, password);
          saveToken(data.token, { name: data.name, email: data.email });
          window.location.href = 'choose.html';
        } catch (err) {
          errorEl.textContent = err.message;
        }
      });
    }

    // Logout Handling
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        clearAuth();
        window.location.href = 'index.html';
      });
    }

    // Display user name in dashboard
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        const storedName = localStorage.getItem('userName');
        const storedEmail = localStorage.getItem('userEmail');

        if (storedName) {
            userNameElement.textContent = storedName;
        } else if (storedEmail) {
            // Extract name from email if name is not available
            const nameFromEmail = storedEmail.split('@')[0];
            userNameElement.textContent = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        } else {
            userNameElement.textContent = 'Аналитик';
        }
    }

    // Check if user is logged in for protected pages
    const dashboardSection = document.querySelector('.dashboard-section');
    if (dashboardSection) {
      apiGetMe().then(user => {
        if (!user) {
          window.location.href = 'login.html';
        }
      });
    }
});

// Utility Functions
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    return {
        name: localStorage.getItem('userName') || 'Аналитик',
        email: localStorage.getItem('userEmail')
    };
}

// Load lessons for dashboard
function loadLessons() {
    fetch('lessons.json')
        .then(response => response.json())
        .then(data => {
            const lessonsContainer = document.getElementById('lessonsContainer');
            const lessons = data.lessons;
            
            lessonsContainer.innerHTML = '';
            
            lessons.forEach((lesson, index) => {
                // Check if previous lesson is completed to unlock next one
                const isUnlocked = index === 0 || isLessonCompleted(index);
                
                const lessonCard = document.createElement('div');
                lessonCard.className = 'lesson-card';
                lessonCard.innerHTML = `
                    <div class="lesson-number">${lesson.id}</div>
                    <div class="lesson-content">
                        <h4>${lesson.title}</h4>
                        <p>${getLessonDescription(lesson.id)}</p>
                    </div>
                    <div class="lesson-status">
                        <span class="status ${getLessonStatusClass(lesson.id, isUnlocked)}">
                            ${getLessonStatusText(lesson.id, isUnlocked)}
                        </span>
                    </div>
                `;
                
                if (isUnlocked) {
                    lessonCard.style.cursor = 'pointer';
                    lessonCard.addEventListener('click', () => {
                        window.location.href = `lesson.html?id=${lesson.id}`;
                    });
                }
                
                lessonsContainer.appendChild(lessonCard);
            });
        })
        .catch(error => {
            console.error('Error loading lessons:', error);
        });
}

// Helper functions for lesson status
function getLessonDescription(lessonId) {
    const descriptions = {
        1: "Основные понятия и принципы системного анализа",
        2: "Методы и техники сбора требований от заинтересованных сторон",
        3: "Моделирование поведения системы с помощью диаграмм прецедентов",
        4: "Бизнес-процессы и их моделирование с использованием BPMN",
        5: "Создание качественной документации для системных требований"
    };
    return descriptions[lessonId] || "";
}

function isLessonCompleted(lessonId) {
    return localStorage.getItem(`lesson_${lessonId}_completed`) === 'true';
}

function getLessonStatusClass(lessonId, isUnlocked) {
    if (isLessonCompleted(lessonId)) {
        return 'completed';
    } else if (isUnlocked) {
        return 'in-progress';
    } else {
        return 'locked';
    }
}

function getLessonStatusText(lessonId, isUnlocked) {
    if (isLessonCompleted(lessonId)) {
        return 'Завершён';
    } else if (isUnlocked) {
        return 'Доступен';
    } else {
        return 'Заблокирован';
    }
}

// Load individual lesson
function loadLesson(lessonId) {
    fetch('lessons.json')
        .then(response => response.json())
        .then(data => {
            const lesson = data.lessons.find(l => l.id === lessonId);
            if (lesson) {
                currentLesson = lesson;
                currentStepIndex = 0;
                userAnswers = [];
                displayLessonStep();
            } else {
                window.location.href = 'dashboard.html';
            }
        })
        .catch(error => {
            console.error('Error loading lesson:', error);
        });
}

// Display current lesson step
function displayLessonStep() {
    if (!currentLesson || currentStepIndex >= currentLesson.steps.length) {
        return;
    }
    
    const step = currentLesson.steps[currentStepIndex];
    const lessonContent = document.getElementById('lessonContent');
    const lessonTitle = document.getElementById('lessonTitle');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    // Update lesson title
    lessonTitle.textContent = currentLesson.title;
    
    // Update progress
    const progressPercent = ((currentStepIndex + 1) / currentLesson.steps.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `Шаг ${currentStepIndex + 1} из ${currentLesson.steps.length}`;
    
    // Update back button state
    if (prevButton) {
        prevButton.disabled = (currentStepIndex === 0);
        prevButton.onclick = () => {
            if (currentStepIndex > 0) {
                currentStepIndex--;
                displayLessonStep();
            }
        };
    }
    
    // Render step content based on type
    switch(step.type) {
        case 'task':
            renderTaskStep(step, lessonContent, nextButton);
            break;
        case 'answer':
            renderAnswerStep(step, lessonContent, nextButton);
            break;
        case 'theory':
            renderTheoryStep(step, lessonContent, nextButton);
            break;
        case 'complete':
            renderCompleteStep(step, lessonContent, nextButton);
            break;
        default:
            lessonContent.innerHTML = '<p>Неизвестный тип шага</p>';
    }
}

// Render task step (question with options)
function renderTaskStep(step, container, nextButton) {
    container.innerHTML = `
        <div class="lesson-question">
            <h3>${step.question}</h3>
            <div class="options-container" id="optionsContainer">
                ${step.options.map((option, index) => `
                    <button class="option-button" data-index="${index}">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listeners to options
    const optionButtons = container.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            optionButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Enable next button
            nextButton.disabled = false;
            nextButton.textContent = 'Проверить ответ';
            nextButton.onclick = () => checkAnswer(step, parseInt(this.dataset.index));
        });
    });
    
    nextButton.disabled = true;
    nextButton.textContent = 'Выберите ответ';
    nextButton.onclick = null;
}

// Check user answer
function checkAnswer(step, selectedIndex) {
    userAnswers[currentStepIndex] = selectedIndex;
    
    // Disable all option buttons
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(btn => {
        btn.disabled = true;
    });
    
    // Show if answer is correct
    const isCorrect = selectedIndex === step.correct;
    const selectedButton = document.querySelector(`.option-button[data-index="${selectedIndex}"]`);
    
    if (isCorrect) {
        selectedButton.classList.add('correct');
    } else {
        selectedButton.classList.add('incorrect');
        // Highlight correct answer
        const correctButton = document.querySelector(`.option-button[data-index="${step.correct}"]`);
        correctButton.classList.add('correct-answer');
    }
    
    // Change next button to show answer
    const nextButton = document.getElementById('nextButton');
    nextButton.disabled = false;
    nextButton.textContent = 'Показать объяснение';
    nextButton.onclick = () => {
        currentStepIndex++;
        displayLessonStep();
    };
}

// Render answer step
function renderAnswerStep(step, container, nextButton) {
    container.innerHTML = `
        <div class="answer-container">
            <h4>Правильный ответ</h4>
            <p>${step.explanation}</p>
        </div>
    `;
    
    nextButton.disabled = false;
    nextButton.textContent = 'Далее';
    nextButton.onclick = () => {
        currentStepIndex++;
        displayLessonStep();
    };
}

// Simple markdown parser
function parseMarkdown(markdown) {
    // Convert markdown to HTML
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Unordered lists
    html = html.replace(/^\s*-\s(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)+/gs, '<ul>$&</ul>');
    
    // Ordered lists
    html = html.replace(/^\s*\d+\.\s(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)+/gs, '<ol>$&</ol>');
    
    // Paragraphs
    html = html.replace(/^(?!<[hulo])/gm, '<p>') + '</p>';
    html = html.replace(/<\/p><p>/g, '</p>\n<p>');
    html = html.replace(/<p><\/p>/g, '');
    
    // Fix nested lists
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    html = html.replace(/<\/ol>\s*<ol>/g, '');
    
    return html;
}

// Render theory step
function renderTheoryStep(step, container, nextButton) {
    // Parse markdown content if available, otherwise use plain content
    let content = step.markdown ? parseMarkdown(step.markdown) : step.content || '';
    
    // Add SVG if available
    if (step.svg) {
        content += `<div class="svg-container">${step.svg}</div>`;
    }

    container.innerHTML = `
        <div class="theory-container">
            <h4>Теория</h4>
            ${content}
        </div>
    `;

    nextButton.disabled = false;
    nextButton.textContent = 'Далее';
    nextButton.onclick = () => {
        currentStepIndex++;
        displayLessonStep();
    };
}

// Render complete step
function renderCompleteStep(step, container, nextButton) {
    container.innerHTML = `
        <div class="complete-container">
            <h3>Урок завершен!</h3>
            <p>${step.summary}</p>
            <p>🏆 Поздравляем с прохождением урока!</p>
        </div>
    `;
    
    // Mark lesson as completed in localStorage
    localStorage.setItem(`lesson_${currentLesson.id}_completed`, 'true');
    
    nextButton.disabled = false;
    nextButton.textContent = 'Вернуться к урокам';
    nextButton.onclick = () => {
        window.location.href = 'dashboard.html';
    };
}