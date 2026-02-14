import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Header } from '../components/layout/Header';
import '../styles/glass.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page" style={{ paddingBottom: '40px' }}>
            <Header showBack={false} />

            <main className="container" style={{ marginTop: '20px' }}>
                {/* Hero Section */}
                <section className="hero-section" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 style={{
                            fontSize: '48px',
                            lineHeight: '1.1',
                            marginBottom: '16px',
                            background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            the internet<br />is full of ghosts
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '32px'
                        }}>
                            glitch is how you prove you're real
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/onboarding')}
                                className="animate-pulse"
                            >
                                request vouch
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/daily-glitch')}
                            >
                                watch today's glitch
                            </Button>
                        </div>
                    </motion.div>
                </section>

                {/* Social Proof */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    style={{ marginBottom: '40px' }}
                >
                    <Card className="flex-center" style={{ flexDirection: 'column', gap: '8px', padding: '24px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>live aura generated</span>
                        <span style={{
                            fontSize: '32px',
                            fontWeight: '600',
                            color: 'var(--color-aura-positive)',
                            textShadow: '0 0 20px rgba(124, 255, 178, 0.3)'
                        }}>
                            8,492,104
                        </span>
                    </Card>
                </motion.section>

                {/* How it works */}
                <section>
                    <h3 style={{ marginBottom: '16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>how it works</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['get vouched by a human', 'complete daily glitch', 'earn aura', 'audit others'].map((step, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + (i * 0.1) }}
                            >
                                <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px'
                                    }}>{i + 1}</span>
                                    <span>{step}</span>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Landing;
