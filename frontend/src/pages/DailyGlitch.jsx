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

    // Auto-start camera when entering recording state
    useEffect(() => {
        if (status === 'recording' && cameraRef.current) {
            cameraRef.current.start().then(() => {
                setTimeout(() => {
                    if (cameraRef.current) cameraRef.current.startRecording();
                }, 500);
            });
        }
    }, [status]);

    const submitGlitch = async () => {
        setStatus('submitting');

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress > 90) clearInterval(interval);
            setUploadProgress(progress);
        }, 200);

        try {
            const fakeVideoUrl = `https://cdn.glitch.app/signals/${Date.now()}.webm`;

            if (activeQuest) {
                await api.uploadSignal(activeQuest.id, fakeVideoUrl);
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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Quest Header */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                padding: '16px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
            }}>
                <div className="glass-panel" style={{ padding: '16px', borderColor: 'rgba(124, 255, 178, 0.3)' }}>
                    <h2 style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-aura-positive)', marginBottom: '4px' }}>
                        // DAILY PROTOCOL
                    </h2>
                    <p style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1.3 }}>
                        {activeQuest?.quest_text}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                        <span style={{
                            fontSize: '12px',
                            color: countdown === 'EXPIRED' ? 'var(--color-aura-negative)' : 'rgba(255,255,255,0.5)',
                            fontFamily: 'monospace'
                        }}>
                            EXPIRES IN: {countdown || '...'}
                        </span>
                        <div style={{
                            fontSize: '12px', padding: '4px 8px', borderRadius: '4px',
                            background: 'rgba(124, 255, 178, 0.1)',
                            color: 'var(--color-aura-positive)',
                            border: '1px solid rgba(124, 255, 178, 0.3)'
                        }}>
                            REWARD: 10 AURA
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, background: 'black', position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">

                    {/* Active State: Ready to Record */}
                    {status === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 32px 32px 32px', textAlign: 'center' }}
                        >
                            <div
                                onClick={handleStartRecording}
                                style={{
                                    width: '96px', height: '96px', borderRadius: '50%',
                                    background: 'rgba(124, 255, 178, 0.05)',
                                    border: '2px solid var(--color-aura-positive)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '32px', cursor: 'pointer', position: 'relative'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', inset: 0, borderRadius: '50%',
                                    background: 'rgba(124, 255, 178, 0.2)',
                                    animation: 'pulse 2s infinite ease-in-out'
                                }} />
                                <CameraIcon size={40} style={{ color: 'var(--color-aura-positive)', position: 'relative', zIndex: 1 }} />
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '280px' }}>
                                Tap to initiate capture sequence. Verification required.
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
                            style={{ height: '100%', position: 'relative' }}
                        >
                            <Camera
                                ref={cameraRef}
                                onCapture={handleRecordingComplete}
                                maxDuration={7}
                            />
                            <button
                                onClick={() => {
                                    if (cameraRef.current) cameraRef.current.stop();
                                    setStatus('active');
                                }}
                                style={{
                                    position: 'absolute', top: '80px', right: '16px', zIndex: 20,
                                    padding: '8px', borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)'
                                }}
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    )}

                    {/* Reviewing State */}
                    {status === 'reviewing' && recordedVideo && (
                        <motion.div
                            key="reviewing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ height: '100%', position: 'relative', background: '#111' }}
                        >
                            {/* Video Preview */}
                            <video
                                src={URL.createObjectURL(recordedVideo)}
                                autoPlay
                                loop
                                playsInline
                                muted
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'linear-gradient(to top, black, transparent)'
                            }}>
                                <button
                                    onClick={() => setStatus('recording')}
                                    style={{
                                        padding: '16px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)'
                                    }}
                                >
                                    <RefreshCw size={24} />
                                </button>

                                <button
                                    onClick={submitGlitch}
                                    style={{
                                        flex: 1, marginLeft: '16px', padding: '16px',
                                        background: 'var(--color-aura-positive)', color: 'black',
                                        fontWeight: '700', borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    <Upload size={20} />
                                    TRANSMIT SIGNAL
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Submitting State */}
                    {status === 'submitting' && (
                        <motion.div
                            key="submitting"
                            style={{
                                height: '100%', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(0,0,0,0.9)', position: 'absolute', inset: 0, zIndex: 50
                            }}
                        >
                            <div style={{ width: '256px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
                                <motion.div
                                    style={{ height: '100%', background: 'var(--color-aura-positive)', width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p style={{ fontFamily: 'monospace', color: 'var(--color-aura-positive)', animation: 'pulse 2s infinite' }}>
                                ENCRYPTING & UPLOADING... {Math.round(uploadProgress)}%
                            </p>
                        </motion.div>
                    )}

                    {/* Complete State */}
                    {status === 'complete' && (
                        <motion.div
                            key="complete"
                            style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px' }}
                        >
                            <div style={{
                                width: '80px', height: '80px',
                                background: 'var(--color-aura-positive)', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '24px', color: 'black'
                            }}>
                                <Check size={40} strokeWidth={4} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Wait for Audit</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
                                Your signal is being verified by the network. Check back later for results.
                            </p>
                            <button
                                onClick={() => setStatus('active')}
                                style={{ color: 'var(--color-aura-positive)' }}
                            >
                                Return to Feed
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default DailyGlitch;
