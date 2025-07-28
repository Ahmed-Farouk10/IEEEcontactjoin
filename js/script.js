// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_PUBLIC_KEY = 'zeM3HGdfx1DV9fp7U';
const EMAILJS_SERVICE_ID = 'AhmedIEEE';
const CONTACT_TEMPLATE_ID = 'template_cg85xvb';
const JOIN_TEMPLATE_ID = 'template_g02k3ma';

// Initialize EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('EmailJS initialized with key:', EMAILJS_PUBLIC_KEY);
} else {
    console.error('EmailJS not loaded!');
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateRequired(value) {
    return value.trim() !== '';
}

function showMessage(form, message, type) {
    const existingMessage = form.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    form.parentNode.insertBefore(messageElement, form.nextSibling);
    
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 100);

    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.classList.remove('show');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        }
    }, 5000);
}

function setFormLoading(form, isLoading) {
    const submitButton = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input, textarea');
    
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.textContent = 'Sending...';
        inputs.forEach(input => input.disabled = true);
    } else {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.textContent = form.id === 'contact-form' ? 'Send Message' : 'Submit Application';
        inputs.forEach(input => input.disabled = false);
    }
}

function validateForm(form) {
    let isValid = true;
    const formGroups = form.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const errorMessage = group.querySelector('.error-message');
        
        if (errorMessage) {
            errorMessage.remove();
        }
        
        group.classList.remove('error', 'success');
        
        let fieldValid = true;
        let errorText = '';
        
        if (!validateRequired(input.value)) {
            fieldValid = false;
            errorText = 'This field is required.';
        }
        else if (input.type === 'email' && !validateEmail(input.value)) {
            fieldValid = false;
            errorText = 'Please enter a valid email address.';
        }
        
        if (!fieldValid) {
            isValid = false;
            group.classList.add('error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorText;
            group.appendChild(errorDiv);
        } else {
            group.classList.add('success');
        }
    });
    
    return isValid;
}

async function sendEmail(templateId, templateParams, form) {
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS is not loaded. Please include the EmailJS script.');
        showMessage(form, 'Email service is not available. Please try again later.', 'error');
        return Promise.reject('EmailJS not loaded');
    }

    setFormLoading(form, true);
    
    try {
        // Log the incoming parameters
        console.log('=== SENDEMAIL DEBUG START ===');
        console.log('sendEmail called with templateParams:', templateParams);
        console.log('templateParams.to_email value:', templateParams.to_email);
        console.log('templateParams.to_email type:', typeof templateParams.to_email);
        console.log('templateParams.to_email empty check:', !templateParams.to_email);

        // Prepare the parameters for EmailJS
        const emailParams = {
            service_id: EMAILJS_SERVICE_ID,
            template_id: templateId,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
                // Use the provided to_email or email parameter, but don't fall back to hardcoded email
                to_email: templateParams.to_email || templateParams.email,
                from_name: templateParams.from_name || 'Website Contact Form',
                from_email: templateParams.from_email || 'noreply@ieeeaiu.com',
                reply_to: templateParams.reply_to || templateParams.email || 'noreply@ieeeaiu.com',
                subject: templateParams.subject || 'New Form Submission',
                message: templateParams.message || 'No message content.',
                // Add all template params directly as well for backward compatibility
                ...templateParams
            }
        };
        
        // Ensure we have a recipient email
        if (!emailParams.template_params.to_email) {
            throw new Error('No recipient email address provided');
        }

        console.log('Final emailParams.template_params.to_email:', emailParams.template_params.to_email);
        console.log('Final emailParams.template_params:', emailParams.template_params);
        console.log('Full emailParams object:', JSON.stringify(emailParams, null, 2));
        console.log('=== SENDEMAIL DEBUG END ===');
        
        // Send the email using EmailJS
        console.log('About to call emailjs.send with:');
        console.log('- Service ID:', EMAILJS_SERVICE_ID);
        console.log('- Template ID:', templateId);
        console.log('- Template params:', emailParams.template_params);
        console.log('- Public key:', EMAILJS_PUBLIC_KEY);
        
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            templateId,
            emailParams.template_params,
            EMAILJS_PUBLIC_KEY
        );
        
        console.log('Email sent successfully:', response);
        
        // Reset form and show success message
        if (form) {
            form.reset();
            const formGroups = form.querySelectorAll('.form-group');
            formGroups.forEach(group => group.classList.remove('error', 'success'));
        }
        
        return response;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error; // Re-throw to be caught by the caller
    } finally {
        setFormLoading(form, false);
    }
}

async function handleContactForm(event) {
    console.log('=== HANDLE CONTACT FORM START ===');
    event.preventDefault();
    const form = event.target;
    
    // Debug: Log the form element and its contents
    console.log('Form element:', form);
    console.log('Form elements:', form.elements);
    
    if (!validateForm(form)) {
        console.log('Form validation failed');
        return;
    }
    
    setFormLoading(form, true);

    // Get form values using direct element access
    const userName = form.querySelector('[name="user_name"]').value.trim();
    const userEmail = form.querySelector('[name="user_email"]').value.trim();
    const userMessage = form.querySelector('[name="message"]').value.trim();
    
    // Debug log
    console.log('Form values:', { 
        userName, 
        userEmail, 
        userMessage,
        'form.user_name': form.user_name?.value,
        'form.user_email': form.user_email?.value,
        'form.message': form.message?.value
    });

    // Validate email
    if (!userEmail || !validateEmail(userEmail)) {
        showMessage(form, 'Please enter a valid email address', 'error');
        setFormLoading(form, false);
        return;
    }

    // Prepare email parameters
    const templateParams = {
        to_email: userEmail,  // Send to the email entered in the form
        from_name: 'IEEE AIU Contact Form',
        from_email: userEmail,  // Send from the user's email
        reply_to: userEmail,  // Set reply-to to the user's email
        subject: 'New Contact Form Submission',
        name: userName || 'User',
        email: userEmail,
        user_name: userName || 'User',
        user_email: userEmail,  // Include user's email in the template
        message: `New contact form submission from ${userName || 'a user'} (${userEmail}):\n\n${userMessage || 'No message provided'}\n\n---\nThis is an automated message from the IEEE AIU contact form.`
    };
    
    try {
        console.log('Sending email with params:', templateParams);
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            CONTACT_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );
        
        console.log('Email sent successfully:', response);
        showMessage(form, 'Your message has been sent successfully! We will get back to you soon.', 'success');
        form.reset();
    } catch (error) {
        console.error('Error sending email:', {
            status: error.status,
            text: error.text,
            statusText: error.statusText,
            response: error.response
        });
        showMessage(form, 'There was an error sending the test email. Please try again later.', 'error');
    } finally {
        setFormLoading(form, false);
    }
}

// Join form handler
async function handleJoinForm(event) {
    event.preventDefault();
    const form = event.target;
    
    if (!validateForm(form)) {
        return;
    }
    
    setFormLoading(form, true);
    
    // Get form values using direct element access
    const fullName = form.querySelector('[name="full_name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const studentId = form.querySelector('[name="student_id"]').value.trim();
    const major = form.querySelector('[name="major"]').value.trim();
    const motivation = form.querySelector('[name="motivation"]').value.trim();
    
    // Prepare the email parameters
    const templateParams = {
        to_email: email,  // Send to the email entered in the form
        from_name: 'IEEE AIU Join Form',
        from_email: 'noreply@ieeeaiu.com',
        reply_to: email,
        subject: 'New Join Form Submission',
        
        // These parameters are used in the email body
        name: fullName,
        email: email,
        full_name: fullName,
        student_id: studentId,
        major: major,
        motivation: motivation
    };
    
    console.log('Join Us form submission:', templateParams);
    
    try {
        await sendEmail(JOIN_TEMPLATE_ID, templateParams, form);
        showMessage(form, 'Thank you for your application! We will review it and contact you soon.', 'success');
        form.reset();
    } catch (error) {
        console.error('Error sending join form:', {
            status: error.status,
            text: error.text,
            statusText: error.statusText,
            response: error.response
        });
        showMessage(form, 'Failed to submit your application. Please try again later.', 'error');
    } finally {
        setFormLoading(form, false);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add form event listeners
    const contactForm = document.getElementById('contact-form');
    const joinForm = document.getElementById('join-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    if (joinForm) {
        joinForm.addEventListener('submit', handleJoinForm);
    }
    
    // Add real-time validation
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            const formGroup = this.closest('.form-group');
            const errorMessage = formGroup.querySelector('.error-message');
            
            // Remove existing error message
            if (errorMessage) {
                errorMessage.remove();
            }
            
            // Reset classes
            formGroup.classList.remove('error', 'success');
            
            let isValid = true;
            let errorText = '';
            
            // Validate
            if (!validateRequired(this.value)) {
                isValid = false;
                errorText = 'This field is required.';
            } else if (this.type === 'email' && !validateEmail(this.value)) {
                isValid = false;
                errorText = 'Please enter a valid email address.';
            }
            
            if (!isValid) {
                formGroup.classList.add('error');
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = errorText;
                formGroup.appendChild(errorDiv);
            } else {
                formGroup.classList.add('success');
            }
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Fallback email function (using mailto) if EmailJS is not configured
function sendEmailFallback(form, isJoinForm = false) {
    const formData = new FormData(form);
    let subject, body;
    
    if (isJoinForm) {
        subject = 'New Member Application';
        body = `Name: ${formData.get('full_name')}%0D%0A` +
               `Email: ${formData.get('email')}%0D%0A` +
               `Student ID: ${formData.get('student_id')}%0D%0A` +
               `Major: ${formData.get('major')}%0D%0A` +
               `Why Join: ${formData.get('motivation')}`;
    } else {
        subject = 'Contact Form Submission';
        body = `Name: ${formData.get('user_name')}%0D%0A` +
               `Email: ${formData.get('user_email')}%0D%0A` +
               `Message: ${formData.get('message')}`;
    }
    
    const mailtoLink = `mailto:ieee.aiu@gmail.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
    
    showMessage(form, 'Your email client will open. Please send the email to complete your submission.', 'success');
}
