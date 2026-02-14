import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import clsx from 'clsx';

const STEPS = {
    VOUCH: 0,
    HANDLE: 1,
    OATH: 2
};

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEPS.VOUCH);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State for inputs
    const [vouchCode, setVouchCode] = useState('');
    const [handle, setHandle] = useState('');
    const [isHandleAvailable, setIsHandleAvailable] = useState(null);

    // Oath hold state
    const [holdProgress, setHoldProgress] = useState(0);
    const holdIntervalRef = useRef(null);

    const handleVouchSubmit = async () => {
        if (!vouchCode) return;
        setLoading(true);
        setError('');

        // Mock validation
        setTimeout(() => {
            setLoading(false);
            if (vouchCode.toLowerCase() === 'error') {
                setError('invalid or expired code');
            } else {
                setStep(STEPS.HANDLE);
            }
        }, 1000);
    };

    const handleHandleCheck = (value) => {
        const val = value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
        setHandle(val);
        setIsHandleAvailable(null);

        if (val.length < 3) return;

        // Mock check
        setTimeout(() => {
            setIsHandleAvailable(val !== 'taken');
        }, 500);
    };

    const handleHandleSubmit = () => {
        if (isHandleAvailable) {
            setStep(STEPS.OATH);
        }
    };

    const startHold = () => {
        setHoldProgress(0);
        const duration = 3000; // 3 seconds
        const interval = 50;
        const step = 100 / (duration / interval);

        holdIntervalRef.current = setInterval(() => {
            setHoldProgress(prev => {
                if (prev >= 100) {
                    clearInterval(holdIntervalRef.current);
                    completeOath();
                    return 100;
                }
                return prev + step;
            });
        }, interval);
    };

    const stopHold = () => {
        if (holdProgress < 100) {
            clearInterval(holdIntervalRef.current);
            setHoldProgress(0);
        }
    };

    const completeOath = () => {
        // Navigate to app
        navigate('/daily-glitch');
    };

    return (
        <div className="onboarding-page min-h-screen">
            <Header showBack={step > 0} />

            <main className="container" style={{ marginTop: '40px' }}>
                <AnimatePresence mode="wait">

                    {step === STEPS.VOUCH && (
                        <motion.div
                            key="step-vouch"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '8px' }}>enter vouch code</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                                glitch is invite-only. get a code from a verified human.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <Input
                                    label="vouch code"
                                    placeholder="e.g. human-8821"
                                    value={vouchCode}
                                    onChange={(e) => setVouchCode(e.target.value)}
                                    error={error}
                                    autoFocus
                                />
                                <Button
                                    isLoading={loading}
                                    onClick={handleVouchSubmit}
                                    disabled={!vouchCode}
                                >
                                    verify
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.HANDLE && (
                        <motion.div
                            key="step-handle"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 style={{ marginBottom: '8px' }}>choose your handle</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                                this is your permanent identity on the network.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Input
                                        label="handle"
                                        placeholder="lowercase_only"
                                        value={handle}
                                        onChange={(e) => handleHandleCheck(e.target.value)}
                                        autoFocus
                                    />
                                    {handle.length >= 3 && isHandleAvailable !== null && (
                                        <span style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '42px',
                                            color: isHandleAvailable ? 'var(--color-aura-positive)' : 'var(--color-aura-negative)',
                                            fontSize: '14px'
                                        }}>
                                            {isHandleAvailable ? '✓ available' : '✗ taken'}
                                        </span>
                                    )}
                                </div>

                                <Button
                                    onClick={handleHandleSubmit}
                                    disabled={!isHandleAvailable}
                                >
                                    continue
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.OATH && (
                        <motion.div
                            key="step-oath"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{ textAlign: 'center', marginTop: '40px' }}
                        >
                            <h2 style={{ marginBottom: '32px' }}>the oath</h2>

                            <Card style={{ marginBottom: '48px', padding: '32px' }}>
                                <p style={{ fontSize: '24px', lineHeight: '1.4', fontStyle: 'italic' }}>
                                    "i am human.<br />
                                    i will not use ai.<br />
                                    i will glitch with chaos."
                                </p>
                            </Card>

                            <div
                                onMouseDown={startHold}
                                onMouseUp={stopHold}
                                onTouchStart={startHold}
                                onTouchEnd={stopHold}
                                onMouseLeave={stopHold}
                                style={{ position: 'relative', display: 'inline-block', width: '100%' }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: `${holdProgress}%`,
                                    height: '100%',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: 'var(--radius-full)',
                                    transition: 'width 0.05s linear'
                                }} />

                                <Button
                                    className={clsx({ 'animate-pulse': holdProgress > 0 && holdProgress < 100 })}
                                    style={{ position: 'relative', zIndex: 1 }}
                                >
                                    {holdProgress >= 100 ? 'welcome, human.' : 'hold to swear'}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

export default Onboarding;
