/* ============================================
   PORTFOLIO INTERACTIVE FEATURES — SCRIPT.JS

   Features:
     1. Hamburger Menu   — mobile nav slide-in drawer
     2. Smooth Scroll    — anchor links scroll with header offset
     3. Dark/Light Mode  — pill toggle switch + localStorage
     4. Skill Bar Anim   — bars animate in when section scrolls into view
     5. Active Nav Highlight — neon colour on current section link
   ============================================ */

/* ---- DOM References ---- */

// Hamburger icon and mobile nav menu
const navToggle  = document.getElementById('nav-toggle');
const navMenu    = document.getElementById('nav-menu');
const navLinkEls = document.querySelectorAll('.nav__link');

// Dark / Light mode checkbox and icon
const themeCheckbox = document.getElementById('theme-checkbox');
const toggleIcon    = document.getElementById('toggle-icon');

// Skill bar fill elements (animated on scroll)
const skillBarFills = document.querySelectorAll('.skill-bar__fill');

// All sections with IDs (for active nav highlight)
const sections = document.querySelectorAll('section[id]');

/* ============================================================
   FEATURE 1: HAMBURGER MENU
   Toggles the mobile side-drawer open/closed.
   'active' class on both elements drives CSS animation.
   ============================================================ */

/**
 * toggleMenu — Opens or closes the mobile navigation drawer.
 * Adds/removes 'active' on the menu (slides it in) and on the
 * toggle icon (animates the hamburger lines into an X).
 */
function toggleMenu() {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Click handler on the hamburger button
navToggle.addEventListener('click', toggleMenu);

// Close the drawer automatically after any link is tapped
navLinkEls.forEach(function(link) {
    link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

/* ============================================================
   FEATURE 2: SMOOTH SCROLL
   Intercepts anchor clicks, calculates the target element's
   position minus the sticky header height, and scrolls smoothly.
   ============================================================ */

/**
 * smoothScrollHandler — Prevents instant jump to anchor,
 * calculates the correct scroll offset accounting for the
 * fixed header (68px), then smoothly scrolls to it.
 *
 * @param {Event} e - Click event on an anchor link
 */
function smoothScrollHandler(e) {
    const targetId = this.getAttribute('href');

    // Only handle internal anchor links (e.g. "#home")
    if (targetId && targetId.startsWith('#')) {
        e.preventDefault();

        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        const HEADER_HEIGHT = 68; // px — matches .nav height in CSS
        const elementTop    = targetEl.getBoundingClientRect().top;
        const scrollTo      = elementTop + window.pageYOffset - HEADER_HEIGHT;

        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
    }
}

// Attach smooth scroll to every nav link
navLinkEls.forEach(function(link) {
    link.addEventListener('click', smoothScrollHandler);
});

/* ============================================================
   FEATURE 3: DARK / LIGHT MODE TOGGLE
   The toggle is a styled <label> wrapping a hidden <input
   type="checkbox">. Checking/unchecking it drives the CSS
   thumb slide animation and switches .light-mode on <body>.
   Preference is saved in localStorage for persistence.
   ============================================================ */

/**
 * applyTheme — Adds/removes the 'light-mode' class on <body>
 * and updates the icon inside the toggle thumb.
 *
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
    if (theme === 'light') {
        // Activate light mode: add class, check the checkbox, show sun
        document.body.classList.add('light-mode');
        themeCheckbox.checked = true;
        toggleIcon.textContent = '☀️';
    } else {
        // Activate dark mode: remove class, uncheck checkbox, show moon
        document.body.classList.remove('light-mode');
        themeCheckbox.checked = false;
        toggleIcon.textContent = '🌙';
    }
}

/**
 * onToggleChange — Fired whenever the hidden checkbox changes.
 * Reads the new checked state, picks the theme, applies it,
 * and saves the preference to localStorage.
 */
function onToggleChange() {
    // Checkbox checked = light mode; unchecked = dark mode
    const newTheme = themeCheckbox.checked ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('portfolioTheme', newTheme);
}

// Listen for the checkbox change (triggered when the label is clicked)
themeCheckbox.addEventListener('change', onToggleChange);

// On page load: restore the previously saved theme (default = 'dark')
const savedTheme = localStorage.getItem('portfolioTheme') || 'dark';
applyTheme(savedTheme);

/* ============================================================
   FEATURE 4: SKILL BAR ANIMATION
   When the #skills section scrolls into the viewport,
   each .skill-bar__fill animates to its target width.
   Uses IntersectionObserver for performance.
   ============================================================ */

// Store the target widths, then reset them to 0 initially
const targetWidths = [];
skillBarFills.forEach(function(bar, i) {
    // Save the CSS width set inline (e.g. "80%")
    targetWidths[i] = bar.style.width;
    // Start at 0 so we can animate in
    bar.style.width = '0%';
});

/**
 * animateSkillBars — Called once when the skills section enters
 * the viewport. Restores each bar to its target width so CSS
 * transition plays the fill animation.
 */
function animateSkillBars() {
    skillBarFills.forEach(function(bar, i) {
        // Small stagger: each bar starts 100ms after the previous
        setTimeout(function() {
            bar.style.width = targetWidths[i];
        }, i * 100);
    });
}

// Observe the #skills section
const skillsSection = document.getElementById('skills');
if (skillsSection) {
    const skillsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateSkillBars();
                // Stop observing after the first trigger
                skillsObserver.unobserve(skillsSection);
            }
        });
    }, { threshold: 0.25 }); // Fire when 25% of the section is visible

    skillsObserver.observe(skillsSection);
}

/* ============================================================
   FEATURE 5: ACTIVE NAV LINK HIGHLIGHT ON SCROLL
   As the user scrolls, the nav link whose section is currently
   in the viewport gets coloured with the neon accent.
   ============================================================ */

/**
 * highlightActiveSection — Checks each section's top/bottom
 * relative to the current scroll position and colours the
 * matching nav link.
 */
function highlightActiveSection() {
    const scrollY = window.pageYOffset;

    sections.forEach(function(section) {
        const sectionTop    = section.offsetTop - 100; // 100px lookahead buffer
        const sectionHeight = section.offsetHeight;
        const sectionId     = section.getAttribute('id');

        // Find the nav link that matches this section
        const matchingLink = document.querySelector(
            '.nav__link[href="#' + sectionId + '"]'
        );

        if (matchingLink) {
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                // This section is in view — apply neon colour
                matchingLink.style.color = 'var(--neon)';
            } else {
                // Not in view — reset to default muted colour
                matchingLink.style.color = '';
            }
        }
    });
}

// Run on every scroll event
window.addEventListener('scroll', highlightActiveSection);

// Run once on load so the correct link is highlighted immediately
highlightActiveSection();

/* ============================================================
   FEATURE 6: CONTACT FORM VALIDATION & SUBMISSION
   Validates Name, Email (format check), and Message inputs.
   Provides real-time feedback and success confirmation.
   ============================================================ */

const contactForm   = document.getElementById('contact-form');
const nameInput     = document.getElementById('name');
const emailInput    = document.getElementById('email');
const messageInput  = document.getElementById('message');
const nameError     = document.getElementById('name-error');
const emailError    = document.getElementById('email-error');
const messageError  = document.getElementById('message-error');
const formSuccess   = document.getElementById('form-success');

/**
 * isValidEmail — Validates email format using regex
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        let isValid = true;

        // Clear previous error messages
        nameError.textContent = '';
        emailError.textContent = '';
        messageError.textContent = '';
        formSuccess.textContent = '';

        // Validate Name
        if (nameInput.value.trim() === '') {
            nameError.textContent = 'Please enter your name.';
            isValid = false;
        }

        // Validate Email
        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Please enter your email.';
            isValid = false;
        } else if (!isValidEmail(emailInput.value.trim())) {
            emailError.textContent = 'Please enter a valid email address.';
            isValid = false;
        }

        // Validate Message
        if (messageInput.value.trim() === '') {
            messageError.textContent = 'Please enter your message.';
            isValid = false;
        }

        // If all fields are valid, show success message
        if (isValid) {
            formSuccess.textContent = 'Message sent successfully! Thank you for reaching out.';
            contactForm.reset();

            // Clear success message after 5 seconds
            setTimeout(function() {
                formSuccess.textContent = '';
            }, 5000);
        }
    });
}
