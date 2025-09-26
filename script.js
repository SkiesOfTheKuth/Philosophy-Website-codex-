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

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        if (darkModeToggle) {
            darkModeToggle.textContent = isDark ? '☀️' : '🌙';
            darkModeToggle.setAttribute('aria-pressed', String(isDark));
            darkModeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
    };

    const prefersDarkScheme = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme) {
        applyTheme(storedTheme);
    } else {
        applyTheme(prefersDarkScheme && prefersDarkScheme.matches ? 'dark' : 'light');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const nextTheme = isDark ? 'light' : 'dark';
            applyTheme(nextTheme);

            if (nextTheme === 'dark') {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.removeItem('theme');
            }
        });
    }

    if (prefersDarkScheme) {
        const handleSchemeChange = (event) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(event.matches ? 'dark' : 'light');
            }
        };

        if (typeof prefersDarkScheme.addEventListener === 'function') {
            prefersDarkScheme.addEventListener('change', handleSchemeChange);
        } else if (typeof prefersDarkScheme.addListener === 'function') {
            prefersDarkScheme.addListener(handleSchemeChange);
        }
    }

    const closeMobileMenu = () => {
        if (!navLinks || !mobileMenuToggle) return;
        navLinks.classList.remove('open');
        mobileMenuToggle.classList.remove('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    };

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            mobileMenuToggle.classList.toggle('open', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));

            if (isOpen && document.activeElement === mobileMenuToggle) {
                const firstLink = navLinks.querySelector('a');
                if (firstLink) {
                    firstLink.focus();
                }
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        document.addEventListener('click', (event) => {
            if (!navLinks.classList.contains('open')) {
                return;
            }

            if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        });
    }

    const handleScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 24) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    const closeFaqItems = (exception) => {
        faqButtons.forEach(button => {
            if (button === exception) return;
            const item = button.closest('.faq-item');
            const answerId = button.getAttribute('aria-controls');
            const answer = answerId ? document.getElementById(answerId) : null;
            button.setAttribute('aria-expanded', 'false');
            if (item) {
                item.classList.remove('open');
            }
            if (answer) {
                answer.hidden = true;
            }
        });
    };

    faqButtons.forEach(button => {
        const answerId = button.getAttribute('aria-controls');
        const answer = answerId ? document.getElementById(answerId) : null;
        if (answer) {
            answer.hidden = button.getAttribute('aria-expanded') !== 'true';
        }

        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            const nextState = !isExpanded;

            closeFaqItems(nextState ? button : undefined);

            button.setAttribute('aria-expanded', String(nextState));
            if (item) {
                item.classList.toggle('open', nextState);
            }
            if (answer) {
                answer.hidden = !nextState;
            }
        });
    });
});
