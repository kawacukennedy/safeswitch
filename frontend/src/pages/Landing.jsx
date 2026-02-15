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
        <div className="landing-page min-h-screen relative overflow-hidden flex flex-col items-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-black z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_50%_50%,rgba(124,255,178,0.15)_0%,transparent_50%)] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1)_0%,transparent_50%)]" />
            </div>

            <Header showBack={false} className="z-20" />

            <main className="container flex-1 flex flex-col justify-center items-center relative z-10 px-6 pb-20">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-12"
                >
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-4 leading-[0.9]">
                        <span className="text-white block">THE INTERNET</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-600 block">IS DEAD.</span>
                    </h1>

                    <p className="text-xl text-neutral-400 font-medium tracking-wide max-w-xs mx-auto mb-10">
                        Prove you're not a ghost.
                    </p>

                    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                        <Button
                            variant="primary"
                            onClick={() => navigate('/onboarding')}
                            className="bg-white text-black hover:bg-neutral-200 h-14 text-lg font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105"
                        >
                            INITIATE PROTOCOL
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/daily-glitch')}
                            className="text-neutral-500 hover:text-white transition-colors"
                        >
                            WATCH THE STREAM
                        </Button>
                    </div>
                </motion.div>

                {/* Social Proof Ticker */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full max-w-sm"
                >
                    <Card className="glass-card !p-6 flex flex-col items-center gap-2 border-white/5">
                        <span className="text-xs font-bold tracking-[0.2em] text-neon-green uppercase">System Status</span>
                        <span className="text-4xl font-mono font-bold text-white tracking-widest tabular-nums text-glow-positive">
                            8,492,104
                        </span>
                        <span className="text-xs text-neutral-500">AURA GENERATED TODAY</span>
                    </Card>
                </motion.div>

            </main>
        </div>
    );
};

export default Landing;
