var emailError = document.getElementById('email-error');
var passError = document.getElementById('pass-error');
var submitError = document.getElementById('submit-error');

function validateEmail() {
    var email = document.getElementById('Email').value;

    if (email.length == 0) {
        emailError.innerHTML = '**Email is required';
        return false
    }
    if (email.indexOf('@') <= 0) {
        emailError.innerHTML = '**Invalid email format';
        return false
    }
    if ((email.charAt(email.length - 4) != '.') && (email.charAt(email.length - 3) != '.')) {
        emailError.innerHTML = '**invalid email format ';
        return false
    }
    emailError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}


function validatePassword() {
    var pass = document.getElementById('Password').value;

    if (pass.length == 0) {
        passError.innerHTML = '**Password is required';
        return false
    }
    if (pass.length <= 8) {
        passError.innerHTML = '**Invalid password format';
        return false
    }
    passError.innerHTML = '<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>';
    return true
}

function validateForm() {
    if (!validateEmail() || !validatePassword()) {
        submitError.style.display = 'block'
        submitError.innerHTML = 'Please fill the form';
        setTimeout(function () { submitError.style.display = 'none' }, 2000)
        return false;
    }
}
