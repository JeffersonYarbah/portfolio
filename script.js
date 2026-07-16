/* =========================================================
   Jefferson T. Yarbah — Portfolio
   Vanilla ES6+ (no jQuery). Modular, self-contained functions
   wired up from a single DOMContentLoaded entry point.
   ========================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initMobileMenu();
    initSmoothScroll();
    initScrollProgress();
    initScrollSpy();
    initBackToTop();
    initScrollReveal();
    initCounters();
    initSkillBars();
    initRipple();
    initParallax();
    initContactForm();
    initFooterYear();
    initTypewriter();
    initEduSlider();
    initCustomCursor();
    initTilt();
    initMagneticButtons();
    initNetworkBackground();
});

/* ---------------------------------------------------------
   Preloader — hide once the window has fully loaded
--------------------------------------------------------- */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const hide = () => preloader.classList.add('hide');

    // hide as soon as everything (images, fonts) is ready,
    // with a small minimum-display time so it doesn't just flash
    const minTime = new Promise((resolve) => setTimeout(resolve, 500));
    const loaded = new Promise((resolve) => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve, { once: true });
    });

    Promise.all([minTime, loaded]).then(hide);
}

/* ---------------------------------------------------------
   Mobile hamburger menu
--------------------------------------------------------- */
function initMobileMenu() {
    const menuBtn = document.getElementById('menu');
    const header = document.getElementById('siteHeader');
    const overlay = document.getElementById('menuOverlay');
    if (!menuBtn || !header || !overlay) return;

    const closeMenu = () => {
        header.classList.remove('toggle');
        menuBtn.classList.remove('open');
        overlay.classList.remove('show');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    };

    const toggleMenu = () => {
        const isOpen = header.classList.toggle('toggle');
        menuBtn.classList.toggle('open', isOpen);
        overlay.classList.toggle('show', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('no-scroll', isOpen);
    };

    menuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    // close after choosing a link (mobile)
    header.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    // close when resizing back up to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) closeMenu();
    });
}

/* ---------------------------------------------------------
   Smooth scrolling for in-page anchor links
--------------------------------------------------------- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

/* ---------------------------------------------------------
   Scroll progress indicator (top bar)
--------------------------------------------------------- */
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;

    const update = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    };

    update();
    window.addEventListener('scroll', throttle(update, 50), { passive: true });
    window.addEventListener('resize', update);
}

/* ---------------------------------------------------------
   Scroll-spy: highlight the nav link for the visible section
--------------------------------------------------------- */
function initScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const setActive = (id) => {
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
        });
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
}

/* ---------------------------------------------------------
   Back-to-top button visibility
--------------------------------------------------------- */
function initBackToTop() {
    const topBtn = document.querySelector('.top');
    if (!topBtn) return;

    const toggle = () => topBtn.classList.toggle('show', window.scrollY > 300);
    toggle();
    window.addEventListener('scroll', throttle(toggle, 100), { passive: true });
}

/* ---------------------------------------------------------
   Scroll-reveal animations (fade/slide-in on view)
--------------------------------------------------------- */
function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    targets.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i % 4, 3) * 0.08}s`;
        observer.observe(el);
    });
}

/* ---------------------------------------------------------
   Animated counters (About section stat boxes)
--------------------------------------------------------- */
function initCounters() {
    const counters = document.querySelectorAll('.count-num');
    if (!counters.length) return;

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10) || 0;
        const duration = 1400;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.6 }
    );

    counters.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Animated skill progress bars (fills when scrolled into view)
--------------------------------------------------------- */
function initSkillBars() {
    const bars = document.querySelectorAll('.skill-per');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const per = bar.dataset.per || '0';
                    bar.style.width = per + '%';
                    bar.setAttribute('data-label', per + '%');
                    bar.closest('.skill')?.classList.add('in-view');
                    obs.unobserve(bar);
                }
            });
        },
        { threshold: 0.4 }
    );

    bars.forEach((bar) => observer.observe(bar));
}

/* ---------------------------------------------------------
   Button ripple effect
--------------------------------------------------------- */
function initRipple() {
    document.querySelectorAll('.btn.ripple').forEach((btn) => {
        btn.addEventListener('click', function (e) {
            const rect = btn.getBoundingClientRect();
            const circle = document.createElement('span');
            const size = Math.max(rect.width, rect.height);

            circle.classList.add('ripple-circle');
            circle.style.width = circle.style.height = `${size}px`;
            circle.style.left = `${e.clientX - rect.left - size / 2}px`;
            circle.style.top = `${e.clientY - rect.top - size / 2}px`;

            btn.appendChild(circle);
            circle.addEventListener('animationend', () => circle.remove());
        });
    });
}

/* ---------------------------------------------------------
   Subtle parallax for hero floating shapes (mouse + scroll)
--------------------------------------------------------- */
function initParallax() {
    const shapes = document.querySelectorAll('.floating-shapes .shape');
    const hero = document.querySelector('.home');
    if (!shapes.length || !hero) return;

    // mouse-driven parallax
    hero.addEventListener('mousemove', (e) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 2;
        const y = (e.clientY / innerHeight - 0.5) * 2;

        shapes.forEach((shape, i) => {
            const depth = (i + 1) * 6;
            shape.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
        });
    });

    // gentle scroll-driven parallax
    window.addEventListener(
        'scroll',
        throttle(() => {
            const offset = window.scrollY * 0.15;
            shapes.forEach((shape, i) => {
                shape.style.marginTop = `${offset * ((i % 3) + 1) * 0.2}px`;
            });
        }, 50),
        { passive: true }
    );
}

/* ---------------------------------------------------------
   Contact form — client-side validation + a real, native
   submission to FormSubmit (see note below), with a
   redirect-back trick so the in-page success animation still
   shows up after FormSubmit sends the visitor back to us.
--------------------------------------------------------- */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const fields = {
        name: form.querySelector('#cf-name'),
        email: form.querySelector('#cf-email'),
        phone: form.querySelector('#cf-phone'),
        message: form.querySelector('#cf-message'),
    };
    const submitBtn = form.querySelector('.submit-btn');
    const nextField = form.querySelector('#cf-next');

    const validators = {
        name: (val) => val.trim().length >= 2,
        email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
        phone: (val) => val.trim() === '' || /^[0-9+\-\s()]{7,}$/.test(val.trim()),
        message: (val) => val.trim().length >= 10,
    };

    const validateField = (key) => {
        const input = fields[key];
        if (!input) return true;
        const valid = validators[key](input.value);
        input.closest('.field')?.classList.toggle('invalid', !valid);
        return valid;
    };

    Object.keys(fields).forEach((key) => {
        const input = fields[key];
        if (!input) return;
        input.addEventListener('blur', () => validateField(key));
        input.addEventListener('input', () => {
            if (input.closest('.field')?.classList.contains('invalid')) validateField(key);
        });
    });

    // Point FormSubmit's "_next" redirect back at this exact page (with a
    // ?sent=true flag) so that after a successful submission the visitor
    // lands back here instead of on FormSubmit's generic confirmation page.
    if (nextField) {
        const cleanUrl = window.location.origin + window.location.pathname;
        nextField.value = `${cleanUrl}?sent=true#contact`;
    }

    form.addEventListener('submit', (e) => {
        const allValid = Object.keys(fields)
            .map(validateField)
            .every(Boolean);

        if (!allValid) {
            e.preventDefault();
            form.querySelector('.field.invalid input, .field.invalid textarea')?.focus();
            return;
        }

        // Deliberately NOT intercepted with fetch()/AJAX here. FormSubmit
        // needs a real, full-page form submission — both to work reliably
        // on every host (file://, GitHub Pages, etc.) and, importantly, to
        // complete its one-time "confirm this address" step the very first
        // time a given email/domain combination is used. AJAX submissions
        // can silently skip that confirmation step and never activate.
        // So: let the browser submit normally, then show the success state
        // when FormSubmit redirects the visitor back (see below).
        submitBtn.classList.add('loading');
    });

    // If we've just been redirected back here after a successful
    // FormSubmit submission, show the in-page success animation.
    const params = new URLSearchParams(window.location.search);
    if (params.get('sent') === 'true') {
        form.classList.add('sent');
        params.delete('sent');
        const query = params.toString();
        const cleanUrl =
            window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

/* ---------------------------------------------------------
   Footer year
--------------------------------------------------------- */
function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------
   Hero typewriter — cycles through role taglines
--------------------------------------------------------- */
function initTypewriter() {
    const el = document.getElementById('typedRole');
    if (!el) return;

    const roles = ['Full Stack Developer', 'Cyber Security Enthusiast'];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
        el.textContent = roles[0];
        return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const TYPE_SPEED = 70;
    const DELETE_SPEED = 40;
    const HOLD_TIME = 1600;

    const tick = () => {
        const current = roles[roleIndex];

        if (!deleting) {
            charIndex++;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(tick, HOLD_TIME);
                return;
            }
            setTimeout(tick, TYPE_SPEED);
        } else {
            charIndex--;
            el.textContent = current.slice(0, charIndex);
            if (charIndex === 0) {
                deleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
            }
            setTimeout(tick, DELETE_SPEED);
        }
    };

    setTimeout(tick, TYPE_SPEED);
}

/* ---------------------------------------------------------
   Education carousel — arrows, dots, autoplay, drag/swipe,
   keyboard navigation. Pure vanilla, no dependency.
--------------------------------------------------------- */
function initEduSlider() {
    const slider = document.getElementById('eduSlider');
    const track = document.getElementById('eduTrack');
    const prevBtn = document.getElementById('eduPrev');
    const nextBtn = document.getElementById('eduNext');
    const dotsWrap = document.getElementById('eduDots');
    if (!slider || !track || !prevBtn || !nextBtn || !dotsWrap) return;

    const slides = Array.from(track.children);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let perView = 1;
    let index = 0;
    let slideStep = 0;
    let autoplayId = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragDelta = 0;
    let baseTranslate = 0;

    const getPerView = () => {
        const styleVal = getComputedStyle(slider).getPropertyValue('--per-view');
        return parseInt(styleVal, 10) || 1;
    };

    const maxIndex = () => Math.max(slides.length - perView, 0);

    const buildDots = () => {
        dotsWrap.innerHTML = '';
        for (let i = 0; i <= maxIndex(); i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
        }
        updateDots();
    };

    const updateDots = () => {
        Array.from(dotsWrap.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    };

    const measure = () => {
        perView = getPerView();
        const first = slides[0];
        const second = slides[1];
        slideStep = second
            ? second.getBoundingClientRect().left - first.getBoundingClientRect().left
            : first.getBoundingClientRect().width;
        index = Math.min(index, maxIndex());
        applyTransform(false);
        buildDots();
    };

    const applyTransform = (animate = true) => {
        track.style.transition = animate ? 'transform .5s cubic-bezier(.4,0,.2,1)' : 'none';
        track.style.transform = `translateX(${-index * slideStep}px)`;
        updateDots();
    };

    const goTo = (i) => {
        index = Math.max(0, Math.min(i, maxIndex()));
        applyTransform(true);
    };

    const next = () => goTo(index >= maxIndex() ? 0 : index + 1);
    const prev = () => goTo(index <= 0 ? maxIndex() : index - 1);

    const startAutoplay = () => {
        if (reduceMotion || autoplayId) return;
        autoplayId = setInterval(next, 4200);
    };
    const stopAutoplay = () => {
        clearInterval(autoplayId);
        autoplayId = null;
    };

    prevBtn.addEventListener('click', () => { prev(); stopAutoplay(); startAutoplay(); });
    nextBtn.addEventListener('click', () => { next(); stopAutoplay(); startAutoplay(); });

    slider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { next(); stopAutoplay(); startAutoplay(); }
        if (e.key === 'ArrowLeft') { prev(); stopAutoplay(); startAutoplay(); }
    });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
    });

    // drag / swipe support (mouse + touch via Pointer Events)
    track.addEventListener('pointerdown', (e) => {
        // don't hijack clicks on links/buttons (e.g. "View Certificate") —
        // only start a drag when the pointer goes down on empty card space
        if (e.target.closest('a, button')) return;

        isDragging = true;
        dragStartX = e.clientX;
        baseTranslate = -index * slideStep;
        track.style.transition = 'none';
        stopAutoplay();
        track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        dragDelta = e.clientX - dragStartX;
        track.style.transform = `translateX(${baseTranslate + dragDelta}px)`;
    });

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(dragDelta) > slideStep * 0.2) {
            dragDelta < 0 ? next() : prev();
        } else {
            applyTransform(true);
        }
        dragDelta = 0;
        startAutoplay();
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', () => { if (isDragging) endDrag(); });

    window.addEventListener('resize', throttle(measure, 150));

    measure();
    startAutoplay();
}

/* ---------------------------------------------------------
   Custom animated cursor (desktop, fine-pointer devices only)
--------------------------------------------------------- */
function initCustomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    document.documentElement.classList.add('has-custom-cursor');

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;
    let mouseX = ringX;
    let mouseY = ringY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    const animateRing = () => {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    document.addEventListener('mousedown', () => ring.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => ring.classList.remove('cursor-click'));

    const hoverTargets = 'a, button, .skill, .edu-slide, .about .row .counter .box, .field .box, .field textarea';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) ring.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) ring.classList.remove('cursor-hover');
    });
}

/* ---------------------------------------------------------
   Subtle 3D tilt on hover (skills + stat cards)
--------------------------------------------------------- */
function initTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const targets = document.querySelectorAll('.skill, .about .row .counter .box');
    const MAX_TILT = 8;

    targets.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transition = 'none';
            el.style.transform =
                `perspective(80rem) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateY(-.4rem)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
            el.style.transform = 'perspective(80rem) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

/* ---------------------------------------------------------
   Magnetic buttons — nudge toward the cursor on hover
--------------------------------------------------------- */
function initMagneticButtons() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('.btn, .slider-arrow, .top').forEach((btn) => {
        const strength = 0.35;

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transition = 'transform .1s linear';
            btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

/* ---------------------------------------------------------
   Animated network/particle background (hero section)
   Pure canvas, no dependency — connects nearby particles
   with faint lines for a subtle "cyber network" feel.
--------------------------------------------------------- */
function initNetworkBackground() {
    const canvas = document.getElementById('networkCanvas');
    const hero = document.querySelector('.home');
    if (!canvas || !hero || !canvas.getContext) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');

    const DENSITY = 9000; // px^2 per particle — lower = more particles
    const MAX_LINK_DIST = 130;
    const SPEED = 0.25;
    const MAX_PARTICLES = 90;

    let width = 0;
    let height = 0;
    let particles = [];
    let animId = null;
    let running = false;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
        width = hero.clientWidth;
        height = hero.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(MAX_PARTICLES, Math.round((width * height) / DENSITY));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
        }));
    };

    const step = () => {
        ctx.clearRect(0, 0, width, height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x <= 0 || p.x >= width) p.vx *= -1;
            if (p.y <= 0 || p.y >= height) p.vy *= -1;
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_LINK_DIST) {
                    ctx.strokeStyle = `rgba(255, 40, 40, ${(1 - dist / MAX_LINK_DIST) * 0.35})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = 'rgba(255, 90, 90, 0.85)';
        particles.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
            ctx.fill();
        });

        animId = requestAnimationFrame(step);
    };

    const start = () => {
        if (running || reduceMotion) return;
        running = true;
        step();
    };

    const stop = () => {
        running = false;
        cancelAnimationFrame(animId);
    };

    resize();
    if (reduceMotion) {
        // draw a single static frame so the canvas isn't blank, then stop
        step();
        cancelAnimationFrame(animId);
    } else {
        start();
    }

    window.addEventListener('resize', throttle(resize, 200));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });
}

/* ---------------------------------------------------------
   Utility: throttle
--------------------------------------------------------- */
function throttle(fn, wait) {
    let lastTime = 0;
    let timeout = null;
    return (...args) => {
        const now = Date.now();
        const remaining = wait - (now - lastTime);
        if (remaining <= 0) {
            lastTime = now;
            fn(...args);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                lastTime = Date.now();
                fn(...args);
            }, remaining);
        }
    };
}
