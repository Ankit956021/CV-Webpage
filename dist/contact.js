"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    // Function to show the modal
    const openModal = () => {
        if (contactModal) {
            contactModal.classList.add('show');
        }
    };
    // Function to hide the modal
    const closeModal = () => {
        if (contactModal) {
            contactModal.classList.remove('show');
        }
    };
    // Event listeners
    if (openModalBtn) {
        openModalBtn.addEventListener('click', openModal);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    // Close modal when clicking on the overlay
    if (contactModal) {
        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) {
                closeModal();
            }
        });
    }
    // Handle form submission
    if (contactForm) {
        // Initialize EmailJS with your new Public Key
        emailjs.init('ijnsnC9WfNBT-MVy_');
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevents the default form submission
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            // Use EmailJS to send the form data with new IDs
            emailjs.sendForm('service_0rwuxsb', 'template_3sque6w', contactForm)
                .then(() => {
                alert('Message sent successfully!');
                contactForm.reset(); // Clear the form
                closeModal(); // Close the modal
            }, (error) => {
                alert('Failed to send the message. Please try again.');
                console.log('FAILED...', error);
            })
                .finally(() => {
                // Restore the button to its original state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
});
