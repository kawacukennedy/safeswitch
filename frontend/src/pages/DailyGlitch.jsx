import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, Upload, X, Check, Loader2, RefreshCw } from 'lucide-react';
import { Camera } from '../components/features/Camera';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

const useCountdown = (targetDate) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!targetDate) return;

        const tick = () => {
            const now = Date.now();
            const end = new Date(targetDate).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('EXPIRED');
                return;
            }

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setTimeLeft(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
};

const DailyGlitch = () => {
    const { showToast } = useToast();
    const [activeQuest, setActiveQuest] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, active, recording, reviewing, submitting, complete
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const cameraRef = useRef(null);

    const countdown = useCountdown(activeQuest?.expires_at);

    // Fetch Quest
    useEffect(() => {
        const fetchQuest = async () => {
            try {
                const quest = await api.getCurrentQuest();
                setActiveQuest(quest);
                setStatus('active');
            } catch (err) {
                console.error(err);
                if (err.message) showToast({ message: 'Failed to load quest: ' + err.message, type: 'error' });
                // Fallback for demo if backend is offline
                setActiveQuest({
                    id: 999,
                    quest_text: "Backend offline: Glitch found in the matrix.",
                    expires_at: new Date(Date.now() + 86400000).toISOString()
                });
                setStatus('active');
            }
        };
        fetchQuest();
    }, [showToast]);

    const handleRecordingComplete = (videoBlob) => {
        setRecordedVideo(videoBlob);
        setStatus('reviewing');
    };

    const handleStartRecording = () => {
        setStatus('recording');
    };



    const submitGlitch = async () => {
        setStatus('submitting');

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress > 90) clearInterval(interval);
            setUploadProgress(progress);
        }, 200);

        try {
            if (activeQuest && recordedVideo) {
                // Upload real video blob
                await api.uploadSignal(activeQuest.id, recordedVideo);
            } else {
                throw new Error("Missing video or quest data");
            }

            clearInterval(interval);
            setUploadProgress(100);

            showToast({ message: 'Glitch uploaded. Aura +10', type: 'success' });
            setTimeout(() => setStatus('complete'), 500);
        } catch (err) {
            clearInterval(interval);
            setStatus('reviewing');
            showToast({ message: err.message || 'Transmission failed', type: 'error' });
        }
    };

    if (status === 'loading') {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-aura-positive)' }} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative bg-black font-sans">
            {/* Quest Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/90 to-transparent pointer-events-none">
                <div className="glass-card p-4 border-neon-green/20 backdrop-blur-xl">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-[10px] font-black tracking-[0.2em] text-neon-green uppercase animate-pulse">
                            /// DAILY_PROTOCOL
                        </h2>
                        <div className="px-2 py-1 rounded bg-neon-green/10 border border-neon-green/30 text-[10px] font-bold text-neon-green">
                            +10 AURA
                        </div>
                    </div>

                    <p className="text-xl font-black text-white leading-tight mb-3 drop-shadow-lg">
                        {activeQuest?.quest_text}
                    </p>

                    <div className="flex justify-end items-center">
                        <span className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 tracking-tighter">
                            {countdown || '00:00:00'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">

                    {/* Active State: Ready to Record */}
                    {status === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            className="flex flex-col items-center justify-center p-8 text-center z-10"
                        >
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                            <button
                                onClick={handleStartRecording}
                                className="group relative w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-transform hover:scale-105 active:scale-95"
                            >
                                <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-spin-slow" />
                                <div className="absolute inset-2 border-2 border-neon-green rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-neon-green/10 rounded-full blur-xl group-hover:bg-neon-green/20 transition-all" />

                                <CameraIcon size={32} className="text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                            </button>

                            <p className="text-sm font-medium text-neutral-400 tracking-wide max-w-[200px]">
                                TAP TO INITIATE<br />VISUAL CAPTURE
                            </p>
                        </motion.div>
                    )}

                    {/* Recording State */}
                    {status === 'recording' && (
                        <motion.div
                            key="recording"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10"
                        >
                            <Camera
                                ref={cameraRef}
                                autoStart={true}
                                onStreamReady={() => {
                                    setTimeout(() => {
                                        if (cameraRef.current) cameraRef.current.startRecording();
                                    }, 500);
                                }}
                                onCapture={handleRecordingComplete}
                                maxDuration={7}
                            />
                            <button
                                onClick={() => {
                                    if (cameraRef.current) cameraRef.current.stop();
                                    setStatus('active');
                                }}
                                className="absolute top-24 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}

                    {/* Reviewing State */}
                    {status === 'reviewing' && recordedVideo && (
                        <motion.div
                            key="reviewing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-10 bg-black"
                        >
                            <video
                                src={URL.createObjectURL(recordedVideo)}
                                autoPlay
                                loop
                                playsInline
                                muted
                                className="w-full h-full object-cover opacity-80"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />

                            <div className="absolute bottom-24 left-0 right-0 p-6 flex items-center justify-between gap-4 z-20">
                                <button
                                    onClick={() => setStatus('recording')}
                                    className="p-4 rounded-full glass-button group"
                                >
                                    <RefreshCw size={24} className="text-white group-hover:-rotate-180 transition-transform duration-500" />
                                </button>

                                <button
                                    onClick={submitGlitch}
                                    className="flex-1 h-14 rounded-full bg-white text-black font-black text-lg tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    <Upload size={20} strokeWidth={3} />
                                    UPLOAD SIGNAL
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Submitting State */}
                    {status === 'submitting' && (
                        <motion.div
                            key="submitting"
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
                        >
                            <div className="relative w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-8">
                                <motion.div
                                    className="absolute top-0 left-0 h-full bg-neon-green shadow-[0_0_15px_rgba(124,255,178,0.5)]"
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ ease: "linear" }}
                                />
                            </div>
                            <div className="font-mono text-neon-green text-sm tracking-widest animate-pulse">
                                ENCRYPTING DATA PACKETS...
                            </div>
                        </motion.div>
                    )}

                    {/* Complete State */}
                    {status === 'complete' && (
                        <motion.div
                            key="complete"
                            className="flex flex-col items-center justify-center text-center p-8 z-20"
                        >
                            <div className="w-24 h-24 rounded-full bg-neon-green/10 border border-neon-green/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(124,255,178,0.2)]">
                                <Check size={48} className="text-neon-green drop-shadow-md" strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 italic">SIGNAL SENT</h2>
                            <p className="text-neutral-400 mb-8 max-w-xs">
                                Verification pending. Await consensus from the network.
                            </p>
                            <button
                                onClick={() => setStatus('active')}
                                className="text-neon-green font-bold tracking-widest text-sm hover:text-white transition-colors border-b border-transparent hover:border-white"
                            >
                                RETURN TO FEED
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default DailyGlitch;
