// EduPortal — shared frontend API helper
// Change API_BASE to your deployed backend URL when you go live (e.g. Render).
const API_BASE = 'http://localhost:4000/api';

function getToken() {
    return localStorage.getItem('eduportal_token');
}

function setSession(token, fullName, registrationNumber) {
    localStorage.setItem('eduportal_token', token);
    localStorage.setItem('eduportal_name', fullName || '');
    localStorage.setItem('eduportal_reg', registrationNumber || '');
}

function clearSession() {
    localStorage.removeItem('eduportal_token');
    localStorage.removeItem('eduportal_name');
    localStorage.removeItem('eduportal_reg');
}

function isLoggedIn() {
    return Boolean(getToken());
}

// Redirects to login if there's no token. Call at the top of any page
// that requires the student to be signed in (accommodation, fees).
function requireLogin() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Wraps fetch with the JSON headers, the Authorization header (if logged in),
// and consistent error handling. Returns the parsed JSON body.
async function apiRequest(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
    }
    return data;
}

// Shows a dismissible message banner above a form. Pass an existing
// element id to reuse, or it creates one before the given form.
function showMessage(formEl, text, type = 'error') {
    let box = formEl.parentElement.querySelector('.form-message');
    if (!box) {
        box = document.createElement('div');
        box.className = 'form-message';
        formEl.parentElement.insertBefore(box, formEl);
    }
    box.textContent = text;
    box.style.padding = '12px 16px';
    box.style.borderRadius = '6px';
    box.style.marginBottom = '18px';
    box.style.fontSize = '14px';
    if (type === 'error') {
        box.style.background = '#fdecea';
        box.style.color = '#b3261e';
        box.style.border = '1px solid #f5c2c0';
    } else {
        box.style.background = '#e6f7ec';
        box.style.color = '#0f7a3d';
        box.style.border = '1px solid #b7e4c7';
    }
}