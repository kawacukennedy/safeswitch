import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/common/Card';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import '../styles/glass.css';

const VerifyAuth = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                showToast('No token provided', 'error');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                const data = await api.verifyMagicLink(token);
                // Save token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                setStatus('success');

                if (data.isNewUser) {
                    showToast('Welcome! Let\'s set up your identity.', 'success');
                    setTimeout(() => navigate('/onboarding'), 1000);
                } else {
                    showToast('Welcome back!', 'success');
                    setTimeout(() => navigate('/feed'), 1000);
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
                showToast('Invalid or expired token', 'error');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        verifyToken();
    }, [searchParams, navigate, showToast]);

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card style={{ padding: '40px', textAlign: 'center', minWidth: '300px' }}>
                    {status === 'verifying' && (
                        <>
                            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                            <h3>Verifying...</h3>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <div style={{ fontSize: '40px', marginBottom: '20px', color: 'var(--color-aura-positive)' }}>✓</div>
                            <h3>Authenticated</h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Redirecting...</p>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <div style={{ fontSize: '40px', marginBottom: '20px', color: 'var(--color-error)' }}>✕</div>
                            <h3>Verification Failed</h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Redirecting to login...</p>
                        </>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};

export default VerifyAuth;
