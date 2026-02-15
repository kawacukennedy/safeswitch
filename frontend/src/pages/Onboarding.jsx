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
        <div className="onboarding-page min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_50%)] animate-spin-slow" />
            </div>

            <Header showBack={step > 0} className="z-20 w-full" />

            <main className="container flex flex-col items-center justify-center w-full max-w-md px-6 relative z-10 flex-1">
                <AnimatePresence mode="wait">

                    {step === STEPS.VOUCH && (
                        <motion.div
                            key="step-vouch"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            <h2 className="text-3xl font-black mb-2 tracking-tight">ENTER VOUCH CODE</h2>
                            <p className="text-neutral-400 mb-8 text-sm">
                                Glitch is invite-only. Retrieve a code from a verified human or wait for the drop.
                            </p>

                            <div className="flex flex-col gap-6">
                                <Input
                                    label="VOUCH CODE"
                                    placeholder="human-8821"
                                    value={vouchCode}
                                    onChange={(e) => setVouchCode(e.target.value)}
                                    error={error}
                                    autoFocus
                                    className="bg-zinc-900/50 border-white/10 focus:border-neon-green/50 focus:ring-neon-green/20"
                                />
                                <Button
                                    isLoading={loading}
                                    onClick={handleVouchSubmit}
                                    disabled={!vouchCode}
                                    variant="primary"
                                    className="w-full h-12 text-black font-bold tracking-wide"
                                >
                                    VERIFY IDENTITY
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.HANDLE && (
                        <motion.div
                            key="step-handle"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            <h2 className="text-3xl font-black mb-2 tracking-tight">CLAIM YOUR HANDLE</h2>
                            <p className="text-neutral-400 mb-8 text-sm">
                                This is your permanent signature on the network. Choose wisely.
                            </p>

                            <div className="flex flex-col gap-6">
                                <div className="relative">
                                    <Input
                                        label="HANDLE"
                                        placeholder="lowercase_only"
                                        value={handle}
                                        onChange={(e) => handleHandleCheck(e.target.value)}
                                        autoFocus
                                        className="bg-zinc-900/50 border-white/10"
                                    />
                                    {handle.length >= 3 && isHandleAvailable !== null && (
                                        <motion.span
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={clsx(
                                                "absolute right-4 top-[44px] text-xs font-bold tracking-wider",
                                                isHandleAvailable ? "text-neon-green text-glow-positive" : "text-neon-pink text-glow-negative"
                                            )}
                                        >
                                            {isHandleAvailable ? 'AVAILABLE' : 'TAKEN'}
                                        </motion.span>
                                    )}
                                </div>

                                <Button
                                    onClick={handleHandleSubmit}
                                    disabled={!isHandleAvailable}
                                    variant="primary"
                                    className="w-full h-12 text-black font-bold tracking-wide"
                                >
                                    LOCK IT IN
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.OATH && (
                        <motion.div
                            key="step-oath"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            className="text-center w-full"
                        >
                            <h2 className="text-sm font-bold text-neutral-500 tracking-[0.3em] uppercase mb-8">Final Protocol</h2>

                            <Card className="glass-card mb-12 p-10 border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <p className="text-3xl md:text-4xl font-black leading-tight italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
                                    "I am human.<br />
                                    I will not use AI.<br />
                                    I will glitch with chaos."
                                </p>
                            </Card>

                            <div
                                onMouseDown={startHold}
                                onMouseUp={stopHold}
                                onTouchStart={startHold}
                                onTouchEnd={stopHold}
                                onMouseLeave={stopHold}
                                className="relative inline-block w-full max-w-xs select-none touch-none"
                            >
                                {/* Progress Bar Background */}
                                <div className="absolute inset-0 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-brand shadow-[0_0_30px_rgba(124,255,178,0.4)]"
                                        style={{ width: `${holdProgress}%` }}
                                        transition={{ duration: 0 }}
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    className={clsx(
                                        "relative z-10 w-full h-14 font-bold tracking-widest transition-all",
                                        holdProgress > 0 ? "text-black" : "text-white"
                                    )}
                                >
                                    {holdProgress >= 100 ? 'ACCESS GRANTED' : 'HOLD TO SWEAR'}
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
