import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera as CameraIcon, Upload, X, Check, Loader2, RefreshCw } from 'lucide-react';
import Camera from '../../components/features/Camera';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

const DailyGlitch = () => {
    const { showToast } = useToast();
    const [activeQuest, setActiveQuest] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, active, recording, reviewing, submitting, complete
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

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

    const submitGlitch = async () => {
        setStatus('submitting');

        // Simulate Upload Progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress > 90) clearInterval(interval);
            setUploadProgress(progress);
        }, 200);

        try {
            // In a real app, we would upload the Blob to a bucket (S3) and get a URL.
            // For this mock environment, we'll create a fake URL or base64 string.
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
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-neon-green" size={48} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col relative">
            {/* Quest Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="glass-panel p-4 border-neon-green/30">
                    <h2 className="text-sm font-mono text-neon-green mb-1">
                        // DAILY PROTOCOL
                    </h2>
                    <p className="text-xl font-bold text-white leading-tight">
                        {activeQuest?.quest_text}
                    </p>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-white/50 font-mono">
                            EXPIRES IN: 12:43:02
                        </span>
                        <div className="text-xs px-2 py-1 rounded bg-neon-green/10 text-neon-green border border-neon-green/30">
                            REWARD: 10 AURA
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-black relative overflow-hidden">
                <AnimatePresence mode="wait">

                    {/* Active State: Ready to Record */}
                    {status === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-neon-green/5 border-2 border-neon-green flex items-center justify-center mb-8 relative group cursor-pointer"
                                onClick={() => setStatus('recording')}>
                                <div className="absolute inset-0 rounded-full bg-neon-green/20 animate-ping" />
                                <CameraIcon size={40} className="text-neon-green relative z-10" />
                            </div>
                            <p className="text-white/60 max-w-xs">
                                Tap to initiate capture sequence. Verification required.
                            </p>
                        </motion.div>
                    )}

                    {/* Recording State */}
                    {status === 'recording' && (
                        <Camera
                            onCapture={handleRecordingComplete}
                            onCancel={() => setStatus('active')}
                        />
                    )}

                    {/* Reviewing State */}
                    {status === 'reviewing' && recordedVideo && (
                        <motion.div
                            key="reviewing"
                            className="h-full relative bg-neutral-900"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {/* Video Preview Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                [VIDEO_PREVIEW_LOOP]
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-t from-black to-transparent">
                                <button
                                    onClick={() => setStatus('recording')}
                                    className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md"
                                >
                                    <RefreshCw size={24} />
                                </button>

                                <button
                                    onClick={submitGlitch}
                                    className="flex-1 ml-4 py-4 bg-neon-green text-black font-bold rounded-xl flex items-center justify-center gap-2"
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
                            className="h-full flex flex-col items-center justify-center bg-black/90 z-50 absolute inset-0"
                        >
                            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                                <motion.div
                                    className="h-full bg-neon-green"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="font-mono text-neon-green animate-pulse">
                                ENCRYPTING & UPLOADING... {Math.round(uploadProgress)}%
                            </p>
                        </motion.div>
                    )}

                    {/* Complete State */}
                    {status === 'complete' && (
                        <motion.div
                            key="complete"
                            className="h-full flex flex-col items-center justify-center text-center p-8"
                        >
                            <div className="w-20 h-20 bg-neon-green rounded-full flex items-center justify-center mb-6 text-black">
                                <Check size={40} strokeWidth={4} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Wait for Audit</h2>
                            <p className="text-white/60 mb-8">
                                Your signal is being verified by the network. Check back later for results.
                            </p>
                            <button
                                onClick={() => setStatus('active')} // Reset or go to feed
                                className="text-neon-green hover:underline"
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
