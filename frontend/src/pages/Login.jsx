import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
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
            showToast('Magic link sent! Check your email', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to send link', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_30%_40%,rgba(124,255,178,0.04)_0%,transparent_50%)]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(124,255,178,0.03)_0%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center px-6 pt-6 pb-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 rounded-full glass-button hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={20} className="text-white/70" />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <AnimatePresence mode="wait">
                    {!isSent ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
                            className="w-full max-w-sm"
                        >
                            {/* Logo / Title */}
                            <div className="text-center mb-10">
                                <motion.h1
                                    className="text-5xl font-black tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    GLITCH
                                </motion.h1>
                                <motion.p
                                    className="text-[10px] font-bold tracking-[0.3em] text-neon-green/60 uppercase"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    /// IDENTITY_PROTOCOL
                                </motion.p>
                            </div>

                            {/* Glass Card */}
                            <motion.div
                                className="glass-card p-8 border-white/10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                                        <Mail size={18} className="text-neon-green" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Access Portal</h2>
                                        <p className="text-xs text-neutral-500">Enter your email to authenticate</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoFocus
                                            required
                                            className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 text-white text-base placeholder:text-neutral-600 focus:outline-none focus:border-neon-green/40 focus:ring-1 focus:ring-neon-green/20 transition-all font-medium"
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-green/5 to-transparent pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !email}
                                        className="relative w-full h-14 rounded-2xl bg-white text-black font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>SEND MAGIC LINK</>
                                        )}
                                    </button>
                                </form>
                            </motion.div>

                            {/* Footer hint */}
                            <motion.p
                                className="text-center text-[11px] text-neutral-600 mt-6 leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                No password needed. We&apos;ll send a secure<br />
                                one-time link to your inbox.
                            </motion.p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sent"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
                            className="w-full max-w-sm text-center"
                        >
                            {/* Success Icon */}
                            <motion.div
                                className="w-24 h-24 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mx-auto mb-8"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                            >
                                <CheckCircle size={40} className="text-neon-green" />
                            </motion.div>

                            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                                LINK TRANSMITTED
                            </h2>
                            <p className="text-neutral-400 mb-2 text-sm">
                                A secure access link was sent to
                            </p>
                            <p className="text-neon-green font-bold text-base mb-8 break-all">
                                {email}
                            </p>

                            <div className="glass-card p-5 mb-8 border-neon-green/10">
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Check your inbox and spam folder. The link expires in <span className="text-neon-green font-bold">15 minutes</span>.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsSent(false)}
                                className="text-sm font-bold text-neutral-500 hover:text-white tracking-widest transition-colors border-b border-transparent hover:border-white/20 pb-1"
                            >
                                TRY DIFFERENT EMAIL
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom decoration */}
            <div className="relative z-10 text-center pb-8 pt-4">
                <p className="text-[9px] font-mono text-neutral-700 tracking-[0.2em]">
                    GLITCH PROTOCOL v1.0 — HUMANS ONLY
                </p>
            </div>
        </div>
    );
};

export default Login;
