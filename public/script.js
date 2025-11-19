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

class ApiError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

class ValidationApiError extends ApiError {
    constructor(message, errors, body) {
        super(message, 422, body);
        this.name = 'ValidationApiError';
        this.errors = errors;
    }
}

class ApiClient {
    constructor(basePath = '/api') {
        this.basePath = basePath;
    }

    async post(endpoint, payload) {
        const response = await fetch(`${this.basePath}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const body = await this.parseBody(response);
        if (!response.ok) {
            const message = body?.message || 'Unable to complete the request right now.';
            if (response.status === 422 && body?.errors) {
                throw new ValidationApiError(message, body.errors, body);
            }
            throw new ApiError(message, response.status, body);
        }

        return body;
    }

    async parseBody(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            try {
                return await response.json();
            } catch (error) {
                console.warn('Unable to parse JSON response', error);
            }
        }
        return null;
    }
}

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
        this.clearFieldError(field);
        const value = field.value.trim();
        let message = '';
        if (field.hasAttribute('required') && !value) {
            message = 'This field is required.';
        } else if (field.type === 'email' && value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u;
            if (!emailPattern.test(value)) {
                message = 'Enter a valid business email.';
            }
        }
        if (message) {
            errorElement.textContent = message;
            field.setAttribute('aria-invalid', 'true');
        }
        return message.length === 0;
    }

    validateForm() {
        return this.fields.every(field => this.validateField(field));
    }

    clearFieldError(field) {
        const errorElement = this.form.querySelector(`.form__error[data-field='${field.name}']`);
        if (!errorElement) return;
        errorElement.textContent = '';
        field.setAttribute('aria-invalid', 'false');
    }

    clearAll() {
        this.fields.forEach(field => this.clearFieldError(field));
    }

    applyErrors(errors) {
        Object.entries(errors || {}).forEach(([fieldName, messages]) => {
            const field = this.form.querySelector(`[name='${fieldName}']`);
            const errorElement = this.form.querySelector(`.form__error[data-field='${fieldName}']`);
            if (!field || !errorElement) return;
            const message = Array.isArray(messages) ? messages[0] : messages;
            if (!message) return;
            errorElement.textContent = message;
            field.setAttribute('aria-invalid', 'true');
        });
    }
}

class ContactFormController {
    constructor(form, apiClient) {
        this.form = form;
        this.feedback = form?.querySelector('.form__feedback');
        this.validator = form ? new FormValidator(form) : null;
        this.api = apiClient;
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
        this.validator?.clearAll();
        if (!this.validator?.validateForm()) {
            this.updateFeedback('Please correct the highlighted fields.', false);
            return;
        }

        this.setSubmitting(true);
        try {
            const payload = this.serializeForm();
            const response = await this.api?.post('/contact', payload);
            this.form.reset();
            this.validator?.clearAll();
            const successMessage = response?.message || 'Thank you! Our team will reach out within one business day.';
            this.updateFeedback(successMessage, true);
        } catch (error) {
            if (error instanceof ValidationApiError) {
                this.validator?.applyErrors(error.errors);
                this.updateFeedback(error.message || 'Please review the highlighted fields.', false);
            } else {
                console.error(error);
                this.updateFeedback('Something went wrong. Please try again or email hello@auroraan.ai.', false);
            }
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

    serializeForm() {
        const formData = new FormData(this.form);
        return Array.from(formData.entries()).reduce((accumulator, [key, value]) => {
            if (typeof value === 'string') {
                accumulator[key] = value.trim();
            }
            return accumulator;
        }, {});
    }
}

class NewsletterController {
    constructor(form, apiClient) {
        this.form = form;
        this.feedback = form?.querySelector('.newsletter__feedback');
        this.api = apiClient;
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
            const response = await this.api?.post('/newsletter', { email: emailValue });
            const successMessage = response?.message || 'Subscribed! Look out for our next insights report.';
            this.updateFeedback(successMessage, true);
            this.form.reset();
        } catch (error) {
            if (error instanceof ValidationApiError && error.errors?.email) {
                const message = Array.isArray(error.errors.email) ? error.errors.email[0] : error.errors.email;
                this.updateFeedback(message || 'Please enter a valid email address.', false);
            } else {
                console.error(error);
                this.updateFeedback('Unable to subscribe right now. Please try again later.', false);
            }
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
        this.apiClient = new ApiClient();
    }

    init() {
        new ThemeController(this.themeToggle);
        new MobileNavController(this.menuToggle, this.primaryNav);
        new FAQAccordion(this.faqContainer);
        new ContactFormController(this.contactForm, this.apiClient);
        new NewsletterController(this.newsletterForm, this.apiClient);
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
