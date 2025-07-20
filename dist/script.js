"use strict";
document.addEventListener('DOMContentLoaded', () => {
    // --- HEADER LOGIC ---
    const header = document.querySelector('header');
    const menuIcon = document.querySelector('#menu-icon');
    const menulist = document.querySelector('.menulist');
    // Sticky header on scroll
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // 50px se zyada scroll karne par
                header.classList.add('scrolled');
            }
            else { // Top par wapas aane par
                header.classList.remove('scrolled');
            }
        });
    }
    // Mobile menu toggle
    if (menuIcon && menulist) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            menulist.classList.toggle('open');
        };
    }
    // --- HERO SECTION & AOS ---
    const typed = new Typed('.input', {
        strings: ['Web Developer.', 'UI/UX Designer.', 'Graphic Designer.'],
        typeSpeed: 70,
        backSpeed: 65,
        loop: true,
    });
    AOS.init({
        offset: 1,
    });
    // --- CONTACT MODAL LOGIC ---
    const openModalBtn = document.getElementById('open-contact-modal-btn');
    const closeModalBtn = document.getElementById('close-contact-modal-btn');
    const contactModal = document.getElementById('contact-modal-main');
    const contactForm = document.getElementById('main-contact-form');
    const openModal = () => {
        if (contactModal)
            contactModal.classList.add('active');
    };
    const closeModal = () => {
        if (contactModal)
            contactModal.classList.remove('active');
    };
    if (openModalBtn) {
        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (contactModal) {
        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) {
                closeModal();
            }
        });
    }
    // --- FORM VALIDATION & SUBMISSION ---
    if (contactForm) {
        emailjs.init('ijnsnC9WfNBT-MVy_');
        const emailInput = contactForm.querySelector('input[name="email"]');
        const emailFormGroup = contactForm.querySelector('.email-form-group');
        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };
        // Real-time validation as user types
        emailInput.addEventListener('input', () => {
            const emailValue = emailInput.value;
            if (emailValue === '') {
                emailFormGroup.classList.remove('valid', 'invalid');
            }
            else if (isValidEmail(emailValue)) {
                emailFormGroup.classList.add('valid');
                emailFormGroup.classList.remove('invalid');
            }
            else {
                emailFormGroup.classList.add('invalid');
                emailFormGroup.classList.remove('valid');
            }
        });
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!isValidEmail(emailInput.value)) {
                alert('Please enter a valid email address.');
                return;
            }
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            emailjs.sendForm('service_0rwuxsb', 'template_3sque6w', contactForm)
                .then(() => {
                alert('Message sent successfully!');
                contactForm.reset();
                emailFormGroup.classList.remove('valid', 'invalid'); // Reset validation on success
                closeModal();
            }, (error) => {
                alert('Failed to send the message. Please try again.');
                console.log('FAILED...', error);
            })
                .finally(() => {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
});
