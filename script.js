document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('primary-navigation');
    const navbar = document.getElementById('navbar');
    const faqButtons = document.querySelectorAll('.faq-item button');
    const yearEl = document.getElementById('year');

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        darkModeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }

    darkModeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem('theme');
            darkModeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            darkModeToggle.textContent = '☀️';
        }
    });

    mobileMenuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        mobileMenuToggle.classList.toggle('open', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            mobileMenuToggle.classList.remove('open');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    const handleScroll = () => {
        if (window.scrollY > 24) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isOpen = item.classList.toggle('open');
            button.setAttribute('aria-expanded', String(isOpen));
        });
    });
});
