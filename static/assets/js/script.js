document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('#nav-menu');
    const trackButtons = document.querySelectorAll('.track-btn');

    const setTrack = (track) => {
        body.dataset.activeTrack = track;
        trackButtons.forEach((button) => {
            const isActive = button.dataset.track === track;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', String(isActive));
        });
        try {
            localStorage.setItem('activeTrack', track);
        } catch (error) {
            // Ignore storage errors (private mode, disabled storage).
        }
    };

    if (trackButtons.length > 0) {
        let storedTrack = null;
        try {
            storedTrack = localStorage.getItem('activeTrack');
        } catch (error) {
            storedTrack = null;
        }
        setTrack(storedTrack || body.dataset.activeTrack || 'ai');
        trackButtons.forEach((button) => {
            button.addEventListener('click', () => {
                setTrack(button.dataset.track);
            });
        });
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                body.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') {
                return;
            }
            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });

    const sections = document.querySelectorAll('section');
    if (prefersReducedMotion) {
        sections.forEach((section) => section.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    sections.forEach((section) => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
});
