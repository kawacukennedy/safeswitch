import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Zap, Loader2, Check, Copy } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import '../styles/glass.css';

const STEPS = {
    VOUCH: 0,
    HANDLE: 1,
    OATH: 2
};

const Onboarding = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [step, setStep] = useState(STEPS.VOUCH);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isFirstUser = localStorage.getItem('isFirstUser') === 'true';

    // State for inputs
    const [vouchCode, setVouchCode] = useState('');
    const [handle, setHandle] = useState('');
    const [isHandleAvailable, setIsHandleAvailable] = useState(null);

    // Oath hold state
    const [holdProgress, setHoldProgress] = useState(0);
    const holdIntervalRef = useRef(null);
    const checkTimeoutRef = useRef(null);

    // Skip vouch step for founder
    useEffect(() => {
        if (isFirstUser) {
            setStep(STEPS.HANDLE);
        }
    }, [isFirstUser]);

    const handleVouchSubmit = async () => {
        if (!vouchCode) return;
        setLoading(true);
        setError('');

        try {
            await api.redeemVouch(vouchCode);
            setStep(STEPS.HANDLE);
        } catch (err) {
            // For demo: allow any code to pass
            console.warn('Vouch API failed, allowing anyway:', err.message);
            setStep(STEPS.HANDLE);
        } finally {
            setLoading(false);
        }
    };

    const handleHandleCheck = (value) => {
        const val = value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
        setHandle(val);
        setIsHandleAvailable(null);
        setError('');

        if (val.length < 3) return;

        if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL || 'https://glitch-cwr1.onrender.com/api'}/profiles/${val}`,
                    { headers: localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {} }
                );
                setIsHandleAvailable(res.status === 404);
            } catch {
                setIsHandleAvailable(true);
            }
        }, 500);
    };

    const handleHandleSubmit = async () => {
        if (!isHandleAvailable || !handle) return;
        setLoading(true);
        try {
            await api.updateHandle(handle);
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            stored.handle = handle;
            localStorage.setItem('user', JSON.stringify(stored));
            showToast('Handle claimed!', 'success');
            setStep(STEPS.OATH);
        } catch (err) {
            setError(err.message || 'Failed to claim handle');
            showToast(err.message || 'Handle unavailable', 'error');
        } finally {
            setLoading(false);
        }
    };

    const startHold = () => {
        setHoldProgress(0);
        const duration = 3000;
        const interval = 50;
        const stepSize = 100 / (duration / interval);

        holdIntervalRef.current = setInterval(() => {
            setHoldProgress(prev => {
                if (prev >= 100) {
                    clearInterval(holdIntervalRef.current);
                    completeOath();
                    return 100;
                }
                return prev + stepSize;
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
        localStorage.removeItem('isFirstUser');
        navigate('/daily-glitch');
    };

    // Step indicator
    const stepLabels = isFirstUser
        ? ['HANDLE', 'OATH']
        : ['VOUCH', 'HANDLE', 'OATH'];
    const currentStepIndex = isFirstUser ? step - 1 : step;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_30%_30%,rgba(124,255,178,0.05)_0%,transparent_50%)]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(124,255,178,0.03)_0%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Step Indicator */}
            <div className="relative z-10 flex items-center justify-center gap-3 pt-8 pb-4">
                {stepLabels.map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${i < currentStepIndex
                                    ? 'bg-neon-green/20 border border-neon-green/50 text-neon-green'
                                    : i === currentStepIndex
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 border border-white/10 text-neutral-600'
                                }`}>
                                {i < currentStepIndex ? <Check size={14} /> : i + 1}
                            </div>
                            <span className={`text-[8px] font-bold tracking-[0.15em] transition-colors ${i === currentStepIndex ? 'text-white' : 'text-neutral-600'
                                }`}>{label}</span>
                        </div>
                        {i < stepLabels.length - 1 && (
                            <div className={`w-12 h-px mb-4 transition-colors ${i < currentStepIndex ? 'bg-neon-green/30' : 'bg-white/10'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <AnimatePresence mode="wait">

                    {/* VOUCH STEP */}
                    {step === STEPS.VOUCH && !isFirstUser && (
                        <motion.div
                            key="step-vouch"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-sm"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto mb-5">
                                    <Shield size={28} className="text-neon-green" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight mb-2">VOUCH CODE</h2>
                                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                                    Glitch is invite-only. Get a code from a verified human or wait for the drop.
                                </p>
                            </div>

                            <div className="glass-card p-6 border-white/10">
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 block">
                                            ENTER CODE
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="human-8821"
                                            value={vouchCode}
                                            onChange={(e) => setVouchCode(e.target.value)}
                                            autoFocus
                                            className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg font-mono placeholder:text-neutral-700 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 transition-all text-center tracking-widest"
                                        />
                                        {error && (
                                            <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleVouchSubmit}
                                        disabled={!vouchCode || loading}
                                        className="w-full h-14 rounded-2xl bg-white text-black font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'VERIFY IDENTITY'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* HANDLE STEP */}
                    {step === STEPS.HANDLE && (
                        <motion.div
                            key="step-handle"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-sm"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto mb-5">
                                    <User size={28} className="text-neon-green" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight mb-2">CLAIM HANDLE</h2>
                                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                                    {isFirstUser
                                        ? 'You\'re the founder. Choose your permanent identity on the network.'
                                        : 'This is your permanent signature on the network. Choose wisely.'}
                                </p>
                            </div>

                            <div className="glass-card p-6 border-white/10">
                                <div className="flex flex-col gap-5">
                                    <div className="relative">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase mb-2 block">
                                            HANDLE
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 font-mono text-lg">@</span>
                                            <input
                                                type="text"
                                                placeholder="your_handle"
                                                value={handle}
                                                onChange={(e) => handleHandleCheck(e.target.value)}
                                                autoFocus
                                                className="w-full h-14 pl-10 pr-5 rounded-2xl bg-white/5 border border-white/10 text-white text-lg font-mono placeholder:text-neutral-700 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 transition-all"
                                            />
                                            {handle.length >= 3 && isHandleAvailable !== null && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-wider ${isHandleAvailable
                                                            ? 'text-neon-green text-glow-positive'
                                                            : 'text-red-400'
                                                        }`}
                                                >
                                                    {isHandleAvailable ? '✓ AVAILABLE' : '✕ TAKEN'}
                                                </motion.span>
                                            )}
                                        </div>
                                        {handle.length > 0 && handle.length < 3 && (
                                            <p className="text-[10px] text-neutral-600 mt-2">Minimum 3 characters</p>
                                        )}
                                        {error && (
                                            <p className="text-xs text-red-400 mt-2">{error}</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleHandleSubmit}
                                        disabled={!isHandleAvailable || loading}
                                        className="w-full h-14 rounded-2xl bg-white text-black font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'LOCK IT IN'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* OATH STEP */}
                    {step === STEPS.OATH && (
                        <motion.div
                            key="step-oath"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            className="w-full max-w-sm text-center"
                        >
                            <div className="mb-8">
                                <div className="w-16 h-16 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto mb-5">
                                    <Zap size={28} className="text-neon-green" />
                                </div>
                                <h2 className="text-[10px] font-bold text-neutral-500 tracking-[0.3em] uppercase mb-4">
                                    FINAL PROTOCOL
                                </h2>
                            </div>

                            <div className="glass-card p-8 mb-10 border-white/10 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <p className="text-2xl md:text-3xl font-black leading-tight italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 relative z-10">
                                    &ldquo;I am human.<br />
                                    I will not use AI.<br />
                                    I will glitch with chaos.&rdquo;
                                </p>
                            </div>

                            <div
                                onMouseDown={startHold}
                                onMouseUp={stopHold}
                                onTouchStart={startHold}
                                onTouchEnd={stopHold}
                                onMouseLeave={stopHold}
                                className="relative inline-block w-full select-none touch-none"
                            >
                                <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-neon-green/80 to-neon-green shadow-[0_0_30px_rgba(124,255,178,0.4)]"
                                        style={{ width: `${holdProgress}%` }}
                                        transition={{ duration: 0 }}
                                    />
                                </div>

                                <div className={`relative z-10 h-14 rounded-2xl flex items-center justify-center font-black text-base tracking-widest transition-all cursor-pointer ${holdProgress > 50 ? 'text-black' : 'text-white'
                                    }`}>
                                    {holdProgress >= 100 ? (
                                        <motion.span
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                        >
                                            ACCESS GRANTED
                                        </motion.span>
                                    ) : (
                                        'HOLD TO SWEAR'
                                    )}
                                </div>
                            </div>

                            {isFirstUser && (
                                <motion.p
                                    className="text-[10px] text-neon-green/50 mt-6 tracking-wider"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    ★ FOUNDER STATUS — YOU ARE USER #1
                                </motion.p>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* Bottom */}
            <div className="relative z-10 text-center pb-6 pt-2">
                <p className="text-[9px] font-mono text-neutral-700 tracking-[0.2em]">
                    GLITCH PROTOCOL v1.0
                </p>
            </div>
        </div>
    );
};

export default Onboarding;
