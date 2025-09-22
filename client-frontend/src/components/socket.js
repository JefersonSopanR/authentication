import { io } from 'socket.io-client'

// Function to get token from localStorage or URL
function getAuthToken() {
    // First, try to get token from localStorage
    let token = localStorage.getItem('authToken');
    
    // If not in localStorage, check URL hash (for OAuth redirects)
    if (!token && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        token = hashParams.get('token');
        
        // Save to localStorage if found in URL
        if (token) {
            localStorage.setItem('authToken', token);
            // Clean up URL
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
    
    return token;
}

const socket = io("http://localhost:3001", {
    auth: {
        token: getAuthToken()
    },
    autoConnect: false // Don't connect automatically
});

export default socket;