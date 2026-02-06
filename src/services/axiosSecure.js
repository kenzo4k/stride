import axios from 'axios';
import { signOut } from 'firebase/auth';
import auth from '../firebase/firebase.config';

// Create a new axios instance with a base URL
const axiosSecure = axios.create({
    baseURL: 'https://course-management-system-server-woad.vercel.app/api', // Your server's base URL
    withCredentials: true,
});

// Use interceptors to handle requests and responses
axiosSecure.interceptors.request.use(
    (config) => {
        // Get the token from local storage
        const token = localStorage.getItem('access-token');
        if (token) {
            // Add the token to the authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
axiosSecure.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const status = error.response?.status;
        // For 401 or 403 errors, log out the user
        if (status === 401 || status === 403) {
            await signOut(auth); // Log out from Firebase
            // Optionally redirect to login page
            window.location.replace('/login');
        }
        return Promise.reject(error);
    }
);

export default axiosSecure;