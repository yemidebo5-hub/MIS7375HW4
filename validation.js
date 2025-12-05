/*
Program name: validation.js
Author: Muhammad Adnan
Date created: October 15, 2025
Date last edited: December 4, 2025
Version: 4.0
Description: Real-time validation with local storage integration for Project 4
*/

// Global error tracking
let formErrors = {};

// Initialize validation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeValidation();
    checkFormValidity();
});

// Initialize all field validations
function initializeValidation() {
    // Personal Information
    addFieldValidation('first-name', validateFirstName, 'First name must be 1-30 characters, letters, apostrophes, and dashes only');
    addFieldValidation('middle-initial', validateMiddleInitial, 'Middle initial must be a single letter (optional)');
    addFieldValidation('last-name', validateLastName, validateLastNameMessage);
    addFieldValidation('dob', validateDateOfBirth, 'Date must be in MM/DD/YYYY format, not in future, not more than 120 years ago');
    
    // SSN with auto-formatting
    const ssnField = document.getElementById('ssn');
    ssnField.addEventListener('input', formatSSN);
    addFieldValidation('ssn', validateSSN, 'SSN must be 9 digits in XXX-XX-XXXX format');
    
    // Address Information
    addFieldValidation('address1', validateAddress, 'Address must be 2-30 characters');
    addFieldValidation('address2', validateAddressOptional, 'Address must be 2-30 characters if entered');
    addFieldValidation('city', validateCity, 'City must be 2-30 characters');
    addFieldValidation('state', validateState, 'Please select a state');
    addFieldValidation('zip', validateZip, 'Zip code must be 5 digits');
    
    // Contact Information
    const emailField = document.getElementById('email');
    emailField.addEventListener('blur', function() {
        this.value = this.value.toLowerCase();
    });
    addFieldValidation('email', validateEmail, 'Email must be in format name@domain.tld');
    
    // Phone with auto-formatting
    const phoneField = document.getElementById('phone');
    phoneField.addEventListener('input', formatPhone);
    addFieldValidation('phone', validatePhone, 'Phone must be in format 000-000-0000');
    
    // Account Information
    const userIdField = document.getElementById('userid');
    userIdField.addEventListener('blur', function() {
        this.value = this.value.toLowerCase();
    });
    addFieldValidation('userid', validateUserId, 'User ID must be 5-20 characters, start with letter, no spaces or special characters except dash and underscore');
    addFieldValidation('password', validatePassword, 'Password must be 8+ characters with at least 1 uppercase, 1 lowercase, and 1 digit');
    addFieldValidation('confirm-password', validateConfirmPassword, 'Passwords must match');
    
    // Radio button validations
    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener('change', () => validateRadioGroup('gender', 'Please select a gender'));
    });
    document.querySelectorAll('input[name="vaccinated"]').forEach(radio => {
        radio.addEventListener('change', () => validateRadioGroup('vaccinated', 'Please select vaccination status'));
    });
    document.querySelectorAll('input[name="insurance"]').forEach(radio => {
        radio.addEventListener('change', () => validateRadioGroup('insurance', 'Please select insurance status'));
    });
}

// Add validation to a field with real-time checking
function addFieldValidation(fieldId, validationFunc, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Validate on input
    field.addEventListener('input', function() {
        validateField(fieldId, validationFunc, errorMessage);
    });
    
    // Validate on blur
    field.addEventListener('blur', function() {
        validateField(fieldId, validationFunc, errorMessage);
    });
}

// Validate individual field
function validateField(fieldId, validationFunc, errorMessage) {
    const field = document.getElementById(fieldId);
    const value = field.value;
    const errorSpan = document.getElementById(fieldId + '-error');
    
    let isValid = validationFunc(value);
    
    if (isValid) {
        showSuccess(fieldId);
        delete formErrors[fieldId];
    } else {
        showError(fieldId, errorMessage);
        formErrors[fieldId] = errorMessage;
    }
    
    checkFormValidity();
    return isValid;
}

// Show error message
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + '-error');
    
    field.classList.add('input-error');
    field.classList.remove('input-success');
    
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
}

// Show success state
function showSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + '-error');
    
    field.classList.remove('input-error');
    field.classList.add('input-success');
    
    if (errorSpan) {
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
    }
}

// Validation functions
function validateFirstName(name) {
    if (!name) return false;
    const pattern = /^[a-zA-Z'-]{1,30}$/;
    return pattern.test(name);
}

function validateMiddleInitial(initial) {
    if (!initial) return true; // Optional
    const pattern = /^[a-zA-Z]$/;
    return pattern.test(initial);
}

function validateLastName(name) {
    if (!name) return false;
    const pattern = /^[a-zA-Z'-]{1,30}$/;
    return pattern.test(name);
}

function validateLastNameMessage(name) {
    return 'Last name must be 1-30 characters, letters, apostrophes, and dashes only';
}

function validateDateOfBirth(dob) {
    if (!dob) return false;
    
    const pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!pattern.test(dob)) return false;
    
    // Parse the date
    const parts = dob.split('/');
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the future
    if (inputDate > today) return false;
    
    // Check if date is more than 120 years ago
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (inputDate < minDate) return false;
    
    // Validate the date is real (e.g., not Feb 31)
    if (inputDate.getMonth() !== month - 1 || inputDate.getDate() !== day) return false;
    
    return true;
}

function formatSSN(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 9) {
        value = value.substr(0, 9);
    }
    
    let formatted = '';
    if (value.length > 0) {
        formatted = value.substr(0, 3);
        if (value.length > 3) {
            formatted += '-' + value.substr(3, 2);
        }
        if (value.length > 5) {
            formatted += '-' + value.substr(5, 4);
        }
    }
    
    e.target.value = formatted;
}

function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 10) {
        value = value.substr(0, 10);
    }
    
    let formatted = '';
    if (value.length > 0) {
        formatted = value.substr(0, 3);
        if (value.length > 3) {
            formatted += '-' + value.substr(3, 3);
        }
        if (value.length > 6) {
            formatted += '-' + value.substr(6, 4);
        }
    }
    
    e.target.value = formatted;
}

function validateSSN(ssn) {
    if (!ssn) return false;
    const pattern = /^\d{3}-\d{2}-\d{4}$/;
    return pattern.test(ssn);
}

function validateEmail(email) {
    if (!email) return false;
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

function validatePhone(phone) {
    if (!phone) return true; // Optional field
    const pattern = /^\d{3}-\d{3}-\d{4}$/;
    return pattern.test(phone);
}

function validateAddress(address) {
    if (!address) return false;
    return address.length >= 2 && address.length <= 30;
}

function validateAddressOptional(address) {
    if (!address) return true; // Optional
    return address.length >= 2 && address.length <= 30;
}

function validateCity(city) {
    if (!city) return false;
    return city.length >= 2 && city.length <= 30;
}

function validateState(state) {
    return state !== '' && state !== null;
}

function validateZip(zip) {
    if (!zip) return false;
    const pattern = /^\d{5}$/;
    return pattern.test(zip);
}

function validateUserId(userId) {
    if (!userId) return false;
    // Must start with letter, 5-20 chars, letters/numbers/dash/underscore only
    if (userId.length < 5 || userId.length > 20) return false;
    if (/^\d/.test(userId)) return false; // Can't start with number
    const pattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
    return pattern.test(userId);
}

function validatePassword(password) {
    if (!password) return false;
    
    // Must be 8+ characters
    if (password.length < 8) return false;
    
    // Must have at least 1 uppercase, 1 lowercase, 1 digit
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    
    if (!hasUpper || !hasLower || !hasDigit) return false;
    
    // Password cannot equal user ID
    const userIdField = document.getElementById('userid');
    if (userIdField && userIdField.value && password.toLowerCase() === userIdField.value.toLowerCase()) {
        return false;
    }
    
    return true;
}

function validateConfirmPassword(confirmPass) {
    const password = document.getElementById('password').value;
    return confirmPass === password && confirmPass !== '';
}

function validateRadioGroup(name, errorMessage) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    const errorSpan = document.getElementById(name + '-error');
    
    if (selected) {
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
        delete formErrors[name];
    } else {
        if (errorSpan) {
            errorSpan.textContent = errorMessage;
            errorSpan.style.display = 'block';
        }
        formErrors[name] = errorMessage;
    }
    
    checkFormValidity();
}

function validatePasswordsMatch(pass1, pass2) {
    return pass1 === pass2;
}

function validatePasswordNotUserId(password, userId) {
    return !password.includes(userId) && !userId.includes(password.substring(0, userId.length));
}

// Check overall form validity and enable/disable submit button
function checkFormValidity() {
    const submitButton = document.getElementById('submit-button');
    if (!submitButton) return;
    
    // Check if there are any errors
    const hasErrors = Object.keys(formErrors).length > 0;
    
    // Check required fields
    const requiredFields = [
        'first-name', 'last-name', 'dob', 'ssn',
        'address1', 'city', 'state', 'zip', 'email',
        'userid', 'password', 'confirm-password'
    ];
    
    let allRequiredFilled = true;
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value) {
            allRequiredFilled = false;
        }
    });
    
    // Check radio buttons
    const genderChecked = document.querySelector('input[name="gender"]:checked');
    const vaccinatedChecked = document.querySelector('input[name="vaccinated"]:checked');
    const insuranceChecked = document.querySelector('input[name="insurance"]:checked');
    
    if (!genderChecked || !vaccinatedChecked || !insuranceChecked) {
        allRequiredFilled = false;
    }
    
    // Enable/disable submit button
    if (!hasErrors && allRequiredFilled) {
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
    } else {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
        submitButton.style.cursor = 'not-allowed';
    }
}

// Review display function
function showReview() {
    const form = document.getElementById('patient-form');
    const reviewArea = document.getElementById('review-area');
    reviewArea.innerHTML = '';

    let reviewHTML = '<h3>PLEASE REVIEW THIS INFORMATION</h3>';
    let hasErrors = false;

    // Validate all fields first
    validateAllFields();

    // Personal Information
    reviewHTML += '<div class="review-block"><h4>Personal Information</h4>';
    const firstName = form['first-name'].value;
    const middleInitial = form['middle-initial'].value;
    const lastName = form['last-name'].value;
    const fullName = `${firstName} ${middleInitial ? middleInitial + ' ' : ''}${lastName}`;
    const nameValid = validateFirstName(firstName) && validateMiddleInitial(middleInitial) && validateLastName(lastName);
    reviewHTML += `<p>Name: ${fullName} <span class="${nameValid ? 'pass' : 'error'}">${nameValid ? 'PASS' : 'ERROR: Invalid name format'}</span></p>`;

    const dob = form['dob'].value;
    const dobValid = validateDateOfBirth(dob);
    reviewHTML += `<p>Date of Birth: ${dob} <span class="${dobValid ? 'pass' : 'error'}">${dobValid ? 'PASS' : 'ERROR: Invalid date or out of range'}</span></p>`;
    reviewHTML += '</div>';

    // Contact Information
    reviewHTML += '<div class="review-block"><h4>Contact Information</h4>';
    const email = form['email'].value;
    const emailValid = validateEmail(email);
    reviewHTML += `<p>Email: ${email} <span class="${emailValid ? 'pass' : 'error'}">${emailValid ? 'PASS' : 'ERROR: Invalid email format'}</span></p>`;

    const phone = form['phone'].value || '';
    const phoneValid = !phone || validatePhone(phone);
    reviewHTML += `<p>Phone: ${phone || 'Not provided'} <span class="${phoneValid ? 'pass' : 'error'}">${phoneValid ? 'PASS' : 'ERROR: Invalid phone format'}</span></p>`;
    reviewHTML += '</div>';

    // Address Information
    reviewHTML += '<div class="review-block"><h4>Address Information</h4>';
    const address1 = form['address1'].value;
    const address2 = form['address2'].value;
    const city = form['city'].value;
    const state = form['state'].value;
    const zip = form['zip'].value;
    const addressValid = validateAddress(address1) && (!address2 || validateAddressOptional(address2)) && validateCity(city) && state && validateZip(zip);
    const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${state} ${zip}`;
    reviewHTML += `<p>Address: ${fullAddress} <span class="${addressValid ? 'pass' : 'error'}">${addressValid ? 'PASS' : 'ERROR: Invalid address or missing required fields'}</span></p>`;
    reviewHTML += '</div>';

    // Medical History
    reviewHTML += '<div class="review-block"><h4>Medical History</h4>';
    const vaccinations = Array.from(form.querySelectorAll('input[name="vaccinations"]:checked')).map(cb => cb.value);
    reviewHTML += '<p>Vaccinations: ' + (vaccinations.length > 0 ? vaccinations.join(', ') : 'None selected') + ' <span class="pass">PASS</span></p>';

    const symptoms = form['symptoms'].value;
    reviewHTML += `<p>Symptoms: ${symptoms || 'None described'} <span class="pass">PASS</span></p>`;
    reviewHTML += '</div>';

    // Additional Information
    reviewHTML += '<div class="review-block"><h4>Additional Information</h4>';
    const gender = form.querySelector('input[name="gender"]:checked')?.value || '';
    const vaccinated = form.querySelector('input[name="vaccinated"]:checked')?.value || '';
    const insurance = form.querySelector('input[name="insurance"]:checked')?.value || '';
    const healthRating = form['health-rating'].value;
    reviewHTML += `<p>Gender: ${gender} <span class="${gender ? 'pass' : 'error'}">${gender ? 'PASS' : 'ERROR: Gender not selected'}</span></p>`;
    reviewHTML += `<p>Vaccinated: ${vaccinated} <span class="${vaccinated ? 'pass' : 'error'}">${vaccinated ? 'PASS' : 'ERROR: Vaccination status not selected'}</span></p>`;
    reviewHTML += `<p>Insurance: ${insurance} <span class="${insurance ? 'pass' : 'error'}">${insurance ? 'PASS' : 'ERROR: Insurance status not selected'}</span></p>`;
    reviewHTML += `<p>Health Rating: ${healthRating}/10 <span class="pass">PASS</span></p>`;
    reviewHTML += '</div>';

    // Account Information
    reviewHTML += '<div class="review-block"><h4>Account Information</h4>';
    const userId = form['userid'].value.toLowerCase();
    const password = form['password'].value;
    const confirmPassword = form['confirm-password'].value;
    const userIdValid = validateUserId(userId);
    const passwordValid = validatePassword(password);
    const passwordsMatch = validatePasswordsMatch(password, confirmPassword);

    reviewHTML += `<p>User ID: ${userId} <span class="${userIdValid ? 'pass' : 'error'}">${userIdValid ? 'PASS' : 'ERROR: Invalid user ID format'}</span></p>`;
    reviewHTML += `<p>Password: ${'*'.repeat(password.length)} <span class="${passwordValid && passwordsMatch ? 'pass' : 'error'}">${passwordValid && passwordsMatch ? 'PASS' : 'ERROR: ' + (!passwordValid ? 'Invalid password complexity or password equals user ID' : 'Passwords do not match')}</span></p>`;
    reviewHTML += '</div>';

    reviewHTML += '<div class="review-buttons"><button type="button" onclick="submitForm()">CONFIRM & SUBMIT</button><button type="button" onclick="clearReview()">EDIT FORM</button></div>';

    reviewArea.innerHTML = reviewHTML;
    reviewArea.style.display = 'block';

    if (!nameValid || !dobValid || !emailValid || !phoneValid || !addressValid || !gender || !vaccinated || !insurance || !userIdValid || !passwordValid || !passwordsMatch) {
        hasErrors = true;
    }

    // Scroll to review area
    reviewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

    return !hasErrors;
}

// Validate all fields
function validateAllFields() {
    validateField('first-name', validateFirstName, 'First name must be 1-30 characters, letters, apostrophes, and dashes only');
    validateField('middle-initial', validateMiddleInitial, 'Middle initial must be a single letter (optional)');
    validateField('last-name', validateLastName, 'Last name must be 1-30 characters, letters, apostrophes, and dashes only');
    validateField('dob', validateDateOfBirth, 'Date must be in MM/DD/YYYY format, not in future, not more than 120 years ago');
    validateField('ssn', validateSSN, 'SSN must be 9 digits in XXX-XX-XXXX format');
    validateField('address1', validateAddress, 'Address must be 2-30 characters');
    validateField('address2', validateAddressOptional, 'Address must be 2-30 characters if entered');
    validateField('city', validateCity, 'City must be 2-30 characters');
    validateField('state', validateState, 'Please select a state');
    validateField('zip', validateZip, 'Zip code must be 5 digits');
    validateField('email', validateEmail, 'Email must be in format name@domain.tld');
    validateField('phone', validatePhone, 'Phone must be in format 000-000-0000');
    validateField('userid', validateUserId, 'User ID must be 5-20 characters, start with letter, no spaces or special characters except dash and underscore');
    validateField('password', validatePassword, 'Password must be 8+ characters with at least 1 uppercase, 1 lowercase, and 1 digit');
    validateField('confirm-password', validateConfirmPassword, 'Passwords must match');
    
    validateRadioGroup('gender', 'Please select a gender');
    validateRadioGroup('vaccinated', 'Please select vaccination status');
    validateRadioGroup('insurance', 'Please select insurance status');
}

function submitForm() {
    const form = document.getElementById('patient-form');
    
    // Final validation
    validateAllFields();
    
    if (Object.keys(formErrors).length === 0) {
        // Convert user ID to lowercase
        form['userid'].value = form['userid'].value.toLowerCase();
        // Convert email to lowercase
        form['email'].value = form['email'].value.toLowerCase();
        form.submit();
    } else {
        alert('Please correct all errors before submitting.');
    }
}

function clearReview() {
    document.getElementById('review-area').style.display = 'none';
    document.getElementById('review-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
}