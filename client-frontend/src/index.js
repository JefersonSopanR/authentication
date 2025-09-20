import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

//<React.StrictMode> is a React component that acts as a development tool to help you write better React code. It's like a "linter" that runs additional checks and warnings for your React application.