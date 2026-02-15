import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Radio } from 'lucide-react';
import '../styles/glass.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-30%] w-[160%] h-[160%] bg-[radial-gradient(circle_at_40%_40%,rgba(124,255,178,0.08)_0%,transparent_50%)] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(0,255,200,0.04)_0%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-20 flex items-center justify-between px-6 py-5"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                        <Zap size={16} className="text-neon-green" />
                    </div>
                    <span className="text-base font-black tracking-tight text-white">GLITCH</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-green/5 border border-neon-green/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                        <span className="text-[10px] font-bold tracking-wider text-neon-green/70">LIVE</span>
                    </div>
                </div>
            </motion.header>

            {/* Main */}
            <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 pb-24">

                {/* Hero Text */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-14"
                >
                    <motion.p
                        className="text-[10px] font-bold tracking-[0.4em] text-neon-green/50 uppercase mb-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        /// PROOF_OF_HUMANITY
                    </motion.p>

                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-5 leading-[0.85]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 block">THE INTERNET</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-500 to-neutral-700 block">IS DEAD.</span>
                    </h1>

                    <p className="text-lg text-neutral-500 font-medium tracking-wide max-w-[280px] mx-auto mb-12">
                        Prove you're not a ghost.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/login')}
                            className="relative w-full h-14 rounded-2xl bg-white text-black font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-shadow"
                        >
                            INITIATE PROTOCOL
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/feed')}
                            className="w-full h-12 rounded-2xl bg-transparent border border-white/10 text-neutral-500 hover:text-white hover:border-white/20 text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <Radio size={14} />
                            WATCH THE STREAM
                        </motion.button>
                    </div>
                </motion.div>

                {/* System Status */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="w-full max-w-sm"
                >
                    <div className="glass-card p-6 flex flex-col items-center gap-3 border-white/5">
                        <span className="text-[9px] font-bold tracking-[0.3em] text-neon-green/60 uppercase">SYSTEM STATUS</span>
                        <span className="text-4xl font-mono font-black text-white tracking-wider tabular-nums text-glow-positive">
                            8,492,104
                        </span>
                        <span className="text-[10px] text-neutral-600 tracking-wider font-medium">AURA GENERATED TODAY</span>
                    </div>
                </motion.div>

            </main>

            {/* Bottom */}
            <div className="relative z-10 text-center pb-8">
                <p className="text-[9px] font-mono text-neutral-700 tracking-[0.2em]">
                    GLITCH PROTOCOL v1.0 — HUMANS ONLY
                </p>
            </div>
        </div>
    );
};

export default Landing;
