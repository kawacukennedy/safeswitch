import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import '../styles/glass.css';

const Login = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await api.requestMagicLink(email);
            setIsSent(true);
            showToast('Magic link sent! Check your email (or console)', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to send link', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="landing-page" style={{ paddingBottom: '40px' }}>
            <Header showBack={true} />

            <main className="container" style={{ marginTop: '40px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>login</h1>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            enter your email to receive a magic link
                        </p>
                    </div>

                    <Card style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
                        {isSent ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
                                <h3 style={{ marginBottom: '12px' }}>Check your email</h3>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
                                    We sent a magic link to <strong>{email}</strong>
                                </p>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsSent(false)}
                                    className="w-full"
                                >
                                    Try distinct email
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoFocus
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending...' : 'Send Magic Link'}
                                </Button>
                            </form>
                        )}
                    </Card>
                </motion.div>
            </main>
        </div>
    );
};

export default Login;
