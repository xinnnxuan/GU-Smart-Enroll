const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const apiBaseUrl = isDevelopment ? 'http://localhost:5001' : '';

const config = {
    apiBaseUrl: apiBaseUrl,
    isDevelopment: isDevelopment
};

export default config;

window.API_BASE = apiBaseUrl;