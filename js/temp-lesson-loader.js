// Enhanced lesson loader with detailed logging
console.log('Lesson loader script loaded');

(function() {
    console.log('Lesson loader initialized');
    
    // Parse URL parameters
    function getLessonIdFromUrl() {
        console.log('Parsing URL for lesson ID');
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('Found ID in URL:', id);
        return parseInt(id) || null;
    }

    // Initialize lesson loading
    function initializeLesson() {
        console.log('Initializing lesson loading');
        const lessonId = getLessonIdFromUrl();

        if (!lessonId) {
            // No lesson ID provided, redirect to dashboard
            console.log('No lesson ID found, redirecting to dashboard');
            window.location.href = 'dashboard.html';
            return;
        }

        console.log('Loading lesson ID:', lessonId);

        // Wait for main.js to load and loadLesson function to be available
        function checkAndLoadLesson() {
            console.log('Checking if loadLesson function is available');
            if (typeof loadLesson === 'function') {
                console.log('loadLesson function found, loading lesson', lessonId);
                loadLesson(lessonId);
            } else {
                // If main.js hasn't loaded yet, wait a bit more
                console.log('Waiting for loadLesson function to be available...');
                setTimeout(checkAndLoadLesson, 100);
            }
        }

        // Start checking for loadLesson function
        checkAndLoadLesson();
    }

    // Handle page load
    console.log('Document readyState:', document.readyState);
    if (document.readyState === 'loading') {
        console.log('Document still loading, adding DOMContentLoaded listener');
        document.addEventListener('DOMContentLoaded', initializeLesson);
    } else {
        // DOM already loaded
        console.log('Document already loaded, initializing lesson immediately');
        initializeLesson();
    }
})();