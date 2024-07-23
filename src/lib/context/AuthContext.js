"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuthentication = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                router.push('/dashboard');
            } else {
                setUser(null);
                router.push('/');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithEmailAndPassword = async (email, password) => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            console.error('Error signing in:', error.message);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error.message);
        }
    };

    const values = {
        user,
        loading,
        signInWithEmailAndPassword,
        signOut,
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
};
