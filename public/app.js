// Check if user is already logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    if (token) {
        checkAuthStatus();
    }
});

// Tab switching
function showTab(tabName) {
    // Reset all tab buttons to inactive state
    document.querySelectorAll('button[onclick*="showTab"]').forEach(tab => {
        tab.className = "flex-1 p-4 bg-gray-100 text-gray-700 border-none cursor-pointer transition-all duration-300 font-medium hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
        if (tab.textContent === 'Login') {
            tab.className += " rounded-l-md";
        } else {
            tab.className += " rounded-r-md";
        }
    });
    
    // Hide all forms
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('block');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('block');
    
    // Set active tab button
    const tabs = document.querySelectorAll('button[onclick*="showTab"]');
    tabs.forEach(tab => {
        if ((tabName === 'login' && tab.textContent === 'Login') || 
            (tabName === 'register' && tab.textContent === 'Register')) {
            tab.className = tab.className.replace('bg-gray-100 text-gray-700', 'bg-indigo-600 text-white');
        }
    });
    
    // Show the corresponding form
    const targetForm = document.getElementById(tabName + 'Form');
    targetForm.classList.remove('hidden');
    targetForm.classList.add('block');
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
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('block');
    
    document.getElementById('currentUsername').textContent = user.username;
    document.getElementById('currentDisplayName').textContent = user.displayName || user.username;
    document.getElementById('currentUserId').textContent = user.id;
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('block');
    
    showMessage('Logged out successfully', 'success');
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    const messageClasses = type === 'success' 
        ? 'bg-green-50 text-green-800 border border-green-200 p-3 rounded-md text-center mt-4'
        : 'bg-red-50 text-red-800 border border-red-200 p-3 rounded-md text-center mt-4';
    messageDiv.innerHTML = `<div class="${messageClasses}">${text}</div>`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}
