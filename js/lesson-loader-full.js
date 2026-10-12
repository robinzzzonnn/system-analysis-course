console.log('Lesson loader script loaded');

(function() {
    console.log('Lesson loader initialized');
    
    function getLessonIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('Found ID in URL:', id);
        return parseInt(id) || null;
    }

    function initializeLesson() {
        console.log('Initializing lesson loading');
        const lessonId = getLessonIdFromUrl();

        if (!lessonId) {
            console.log('No lesson ID found, redirecting to dashboard');
            window.location.href = 'dashboard.html';
            return;
        }

        console.log('Loading lesson ID:', lessonId);

        function checkAndLoadLesson() {
            console.log('Checking if loadLesson function is available');
            if (typeof loadLesson === 'function') {
                console.log('loadLesson found, loading lesson', lessonId);
                loadLesson(lessonId);
            } else {
                console.log('Waiting for loadLesson...');
                setTimeout(checkAndLoadLesson, 100);
            }
        }

        checkAndLoadLesson();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLesson);
    } else {
        initializeLesson();
    }
})();