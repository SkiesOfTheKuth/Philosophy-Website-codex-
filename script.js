const SELECTORS = Object.freeze({
    themeToggle: "[data-js='theme-toggle']",
    menuToggle: "[data-js='menu-toggle']",
    primaryNav: '.primary-nav',
    primaryLinks: '.primary-nav__list a',
    faq: "[data-js='faq']",
    faqTrigger: '.faq-item > button',
    contactForm: "[data-js='contact-form']",
    newsletter: "[data-js='newsletter']",
    year: "[data-js='year']"
});

const STORAGE_KEYS = Object.freeze({
    theme: 'aurora-theme-preference'
});

const storage = {
    get(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            console.warn('Local storage unavailable', error);
            return null;
        }
    },
    set(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            console.warn('Local storage unavailable', error);
        }
    }
};

const BREAKPOINTS = Object.freeze({
    desktop: 900
});

class ThemeController {
    constructor(toggle) {
        this.toggle = toggle;
        this.html = document.documentElement;
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.bindEvents();
        this.applyInitialTheme();
    }

    bindEvents() {
        if (!this.toggle) return;
        this.toggle.addEventListener('click', () => this.toggleTheme());
        this.mediaQuery.addEventListener('change', () => this.handleSystemChange());
    }

    applyInitialTheme() {
        const stored = storage.get(STORAGE_KEYS.theme);
        const initial = stored || (this.mediaQuery.matches ? 'dark' : 'light');
        this.setTheme(initial, false);
    }

    setTheme(mode, persist = true) {
        const normalized = ['light', 'dark'].includes(mode) ? mode : 'light';
        document.documentElement.setAttribute('data-theme', normalized);
        document.body.dataset.theme = normalized;
        if (persist) storage.set(STORAGE_KEYS.theme, normalized);
        this.updateToggleState(normalized);
    }

    toggleTheme() {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
    }

    handleSystemChange() {
        const stored = storage.get(STORAGE_KEYS.theme);
        if (stored) return;
        this.setTheme(this.mediaQuery.matches ? 'dark' : 'light', false);
    }

    updateToggleState(mode) {
        if (!this.toggle) return;
        const isDark = mode === 'dark';
        this.toggle.setAttribute('aria-pressed', String(isDark));
        this.toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        this.toggle.textContent = isDark ? '☀️' : '🌙';
    }
}

class MobileNavController {
    constructor(toggle, nav) {
        this.toggle = toggle;
        this.nav = nav;
        this.links = nav ? nav.querySelectorAll(SELECTORS.primaryLinks) : [];
        this.isOpen = false;
        this.handleToggle = this.handleToggle.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.bindEvents();
    }

    bindEvents() {
        if (!this.toggle || !this.nav) return;
        this.toggle.addEventListener('click', this.handleToggle);
        this.links.forEach(link => link.addEventListener('click', () => this.close()));
        document.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('resize', this.handleResize);
    }

    handleToggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.toggle.setAttribute('aria-expanded', 'true');
        this.nav.classList.add('primary-nav--open');
        document.body.classList.add('is-nav-open');
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.toggle.setAttribute('aria-expanded', 'false');
        this.nav.classList.remove('primary-nav--open');
        document.body.classList.remove('is-nav-open');
    }

    handleKeydown(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.close();
            this.toggle.focus();
        }
    }

    handleResize() {
        if (window.innerWidth >= BREAKPOINTS.desktop) {
            this.close();
        }
    }
}

class FAQAccordion {
    constructor(container) {
        this.container = container;
        this.triggers = container ? container.querySelectorAll(SELECTORS.faqTrigger) : [];
        this.bindEvents();
    }

    bindEvents() {
        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', () => this.toggle(trigger));
            trigger.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.toggle(trigger);
                }
            });
        });
    }

    toggle(trigger) {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const targetId = trigger.getAttribute('aria-controls');
        const content = document.getElementById(targetId);
        if (!content) return;
        trigger.setAttribute('aria-expanded', String(!expanded));
        content.hidden = expanded;
        content.parentElement?.toggleAttribute('open', !expanded);
    }
}

class FormValidator {
    constructor(form) {
        this.form = form;
        this.fields = Array.from(form.querySelectorAll('input, textarea'));
    }

    validateField(field) {
        const errorElement = this.form.querySelector(`.form__error[data-field='${field.name}']`);
        if (!errorElement) return true;
        let message = '';
        if (field.hasAttribute('required') && !field.value.trim()) {
            message = 'This field is required.';
        } else if (field.type === 'email' && field.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
            if (!emailPattern.test(field.value.trim())) {
                message = 'Enter a valid business email.';
            }
        }
        errorElement.textContent = message;
        field.setAttribute('aria-invalid', String(Boolean(message)));
        return message.length === 0;
    }

    validateForm() {
        return this.fields.every(field => this.validateField(field));
    }
}

class ContactFormController {
    constructor(form) {
        this.form = form;
        this.feedback = form?.querySelector('.form__feedback');
        this.validator = form ? new FormValidator(form) : null;
        this.bindEvents();
    }

    bindEvents() {
        if (!this.form) return;
        this.form.addEventListener('submit', event => this.handleSubmit(event));
        this.form.addEventListener('input', event => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                this.validator?.validateField(event.target);
            }
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (!this.validator?.validateForm()) {
            this.updateFeedback('Please correct the highlighted fields.', false);
            return;
        }

        this.setSubmitting(true);
        try {
            await this.simulateNetwork();
            this.form.reset();
            this.updateFeedback('Thank you! Our team will reach out within one business day.', true);
        } catch (error) {
            console.error(error);
            this.updateFeedback('Something went wrong. Please try again or email hello@auroraan.ai.', false);
        } finally {
            this.setSubmitting(false);
        }
    }

    setSubmitting(isSubmitting) {
        const button = this.form.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = isSubmitting;
            button.textContent = isSubmitting ? 'Sending…' : 'Submit';
        }
    }

    updateFeedback(message, isSuccess) {
        if (!this.feedback) return;
        this.feedback.textContent = message;
        this.feedback.dataset.state = isSuccess ? 'success' : 'error';
    }

    simulateNetwork() {
        return new Promise((resolve) => {
            window.setTimeout(resolve, 1200);
        });
    }
}

class NewsletterController {
    constructor(form) {
        this.form = form;
        this.feedback = form?.querySelector('.newsletter__feedback');
        this.bindEvents();
    }

    bindEvents() {
        if (!this.form) return;
        this.form.addEventListener('submit', event => this.handleSubmit(event));
    }

    async handleSubmit(event) {
        event.preventDefault();
        const emailInput = this.form.querySelector('input[type="email"]');
        if (!(emailInput instanceof HTMLInputElement)) return;
        const emailValue = emailInput.value.trim();
        if (!emailValue) {
            this.updateFeedback('Enter your work email to subscribe.', false);
            return;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
        if (!emailPattern.test(emailValue)) {
            this.updateFeedback('That email looks incorrect. Try again?', false);
            return;
        }
        this.setSubmitting(true);
        try {
            await this.simulateNetwork();
            this.updateFeedback('Subscribed! Look out for our next insights report.', true);
            this.form.reset();
        } catch (error) {
            console.error(error);
            this.updateFeedback('Unable to subscribe right now. Please try again later.', false);
        } finally {
            this.setSubmitting(false);
        }
    }

    setSubmitting(isSubmitting) {
        const button = this.form.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = isSubmitting;
            button.textContent = isSubmitting ? 'Subscribing…' : 'Subscribe';
        }
    }

    updateFeedback(message, isSuccess) {
        if (!this.feedback) return;
        this.feedback.textContent = message;
        this.feedback.dataset.state = isSuccess ? 'success' : 'error';
    }

    simulateNetwork() {
        return new Promise(resolve => {
            window.setTimeout(resolve, 900);
        });
    }
}

class AuroraApp {
    constructor() {
        this.themeToggle = document.querySelector(SELECTORS.themeToggle);
        this.menuToggle = document.querySelector(SELECTORS.menuToggle);
        this.primaryNav = document.querySelector(SELECTORS.primaryNav);
        this.faqContainer = document.querySelector(SELECTORS.faq);
        this.contactForm = document.querySelector(SELECTORS.contactForm);
        this.newsletterForm = document.querySelector(SELECTORS.newsletter);
        this.yearTarget = document.querySelector(SELECTORS.year);
    }

    init() {
        new ThemeController(this.themeToggle);
        new MobileNavController(this.menuToggle, this.primaryNav);
        new FAQAccordion(this.faqContainer);
        new ContactFormController(this.contactForm);
        new NewsletterController(this.newsletterForm);
        this.setCurrentYear();
        this.enhanceScroll();
    }

    setCurrentYear() {
        if (!this.yearTarget) return;
        this.yearTarget.textContent = new Date().getFullYear().toString();
    }

    enhanceScroll() {
        if ('scrollBehavior' in document.documentElement.style) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new AuroraApp();
    app.init();
});
