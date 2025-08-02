// Check if user is already logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    if (token) {
        checkAuthStatus();
    }
});

// Tab switching
function showTab(tabName) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
        form.classList.add('hidden');
    });
    
    // Find the tab button that matches the tabName and make it active
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        if ((tabName === 'login' && tab.textContent === 'Login') || 
            (tabName === 'register' && tab.textContent === 'Register')) {
            tab.classList.add('active');
        }
    });
    
    // Show the corresponding form
    const targetForm = document.getElementById(tabName + 'Form');
    targetForm.classList.add('active');
    targetForm.classList.remove('hidden');
}

// Registration handler
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        displayName: formData.get('displayName'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(userData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! You can now login.', 'success');
            // Switch to login tab
            showTab('login');
            // Clear form
            event.target.reset();
        } else {
            showMessage(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error');
    }
}

// Login handler
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Save token to localStorage
            localStorage.setItem('authToken', result.token);
            
            showMessage('Login successful!', 'success');
            
            // Show user info
            showUserInfo(result.user);
            
            // Clear form
            event.target.reset();
        } else {
            showMessage(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Connection error: ' + error.message, 'error');
    }
}

// Check authentication status
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
        const response = await fetch('/api/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            showUserInfo(result.user);
        } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
    }
}

// Show user information
function showUserInfo(user) {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('userInfo').classList.add('show');
    document.getElementById('userInfo').classList.remove('hidden');
    
    document.getElementById('currentUsername').textContent = user.username;
    document.getElementById('currentDisplayName').textContent = user.displayName || user.username;
    document.getElementById('currentUserId').textContent = user.id;
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('userInfo').classList.remove('show');
    document.getElementById('userInfo').classList.add('hidden');
    
    showMessage('Logged out successfully', 'success');
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.innerHTML = `<div class="${messageClass}">${text}</div>`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}
