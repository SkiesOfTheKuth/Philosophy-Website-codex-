document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Check for saved theme preference in localStorage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    // Add click event listener to the toggle button
    darkModeToggle.addEventListener('click', () => {
        // Get the current theme
        let theme = document.documentElement.getAttribute('data-theme');

        // Switch the theme
        if (theme === 'dark') {
            // If it's dark, switch to light (remove the attribute)
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('theme');
        } else {
            // If it's light, switch to dark
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
});
