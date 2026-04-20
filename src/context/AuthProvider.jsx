import React, { createContext, useEffect, useState } from 'react';
import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from "firebase/auth";
import auth from '../firebase/firebase.config';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const googleSignIn = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const updateUserProfile = async (data) => {
        try {
            // Update the user's profile in Firebase
            await updateProfile(auth.currentUser, {
                displayName: data.displayName,
                photoURL: data.photoURL
            });

            // Update the user object with the role
            setUser(prev => ({
                ...prev,
                displayName: data.displayName,
                photoURL: data.photoURL,
                role: data.role || 'student' // Default to 'student' if no role is provided
            }));

            // Here you would typically save the user data to your backend
            return Promise.resolve();
        } catch (error) {
            console.error('Error updating profile:', error);
            return Promise.reject(error);
        }
    };

    const logOut = () => {
        setLoading(true);
        localStorage.removeItem('access-token');
        localStorage.removeItem('user');
        return signOut(auth).then(() => {
            window.location.href = '/Auth/login';
        });
    };
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Here you would typically fetch the user's role from your backend
                    // For now, we'll use a default role of 'student' if not set
                    const userWithRole = {
                        ...currentUser,
                        role: currentUser.role || 'student'
                    };
                    setUser(userWithRole);
                    // Get JWT token
                    const tokenResponse = await axios.post(`${API_BASE_URL}/jwt`, {
                        email: currentUser.email,
                        role: userWithRole.role
                    });
                    localStorage.setItem('access-token', tokenResponse.data.token);
                    setLoading(false);
                } catch (error) {
                    console.error('Error during authentication:', error);
                    setLoading(false);
                }
            } else {
                // Check localStorage for hardcoded login
                const localUser = localStorage.getItem('user');
                if (localUser) {
                    setUser(JSON.parse(localUser));
                    setLoading(false);
                } else {
                    setUser(null);
                    localStorage.removeItem('access-token');
                    setLoading(false);
                }
            }
        });
        // On initial mount, check localStorage for hardcoded login
        if (!user) {
            const localUser = localStorage.getItem('user');
            if (localUser) {
                setUser(JSON.parse(localUser));
                setLoading(false);
            }
        }
        return () => unsubscribe();
    }, [user]);

    const authInfo = { user, loading, createUser, signIn, googleSignIn, updateUserProfile, logOut };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
