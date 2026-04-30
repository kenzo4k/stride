import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access-token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const createUser = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
            const { user, token } = response.data;
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('access-token', token);
            setUser(user);
            setLoading(false);
            return response;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            const { user, token } = response.data;
            
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('access-token', token);
            setUser(user);
            setLoading(false);
            return response;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const logOut = () => {
        setLoading(true);
        localStorage.removeItem('access-token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        window.location.href = '/Auth/login';
    };

    // Keep for compatibility if needed, but it might not work without Firebase
    const googleSignIn = () => {
        console.warn('Google Sign-In is not implemented for custom MongoDB auth.');
        return Promise.reject(new Error('Google Sign-In not implemented.'));
    };

    const updateUserProfile = async () => {
        // This should probably call a backend endpoint now
        // For now, let's just update local state if needed
        console.warn('updateUserProfile needs backend implementation');
        return Promise.resolve();
    };

    const authInfo = { user, loading, createUser, signIn, googleSignIn, updateUserProfile, logOut };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
