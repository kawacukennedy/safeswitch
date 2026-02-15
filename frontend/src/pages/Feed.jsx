import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MoreVertical, Activity } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

import ReportSignalModal from '../components/features/ReportSignalModal';

const Feed = () => {
    const { showToast } = useToast();
    const [signals, setSignals] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);

    // Fetch Signals
    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const data = await api.getFeed();
                // Ensure data is array
                if (Array.isArray(data)) {
                    setSignals(data);
                } else {
                    setSignals([]);
                }
            } catch (err) {
                console.error(err);
                showToast({ message: 'Failed to load feed', type: 'error' });
            }
        };
        fetchSignals();

        // Realtime Updates (SSE)
        try {
            const eventSource = new EventSource(api.realtimeUrl);

            eventSource.onmessage = (event) => {
                // Ping or generic message
            };

            eventSource.addEventListener('new_signal', (e) => {
                try {
                    const newSignal = JSON.parse(e.data);
                    showToast({ message: 'New glitch detected somewhere...', type: 'info' });
                    setSignals(prev => [newSignal, ...prev]);
                } catch (parseErr) {
                    console.error('SSE Parse Error', parseErr);
                }
            });

            return () => {
                eventSource.close();
            };
        } catch (sseErr) {
            console.error('SSE Setup Error', sseErr);
        }
    }, [showToast]);

    const handleVote = async (type) => { // 'human' or 'slop'
        const currentSignal = signals[activeIndex];

        if (!currentSignal?.id) {
            console.error("Attempted to vote on signal without ID:", currentSignal);
            showToast({ message: "Invalid signal data. Skipping.", type: "error" });
            // Advance to next even if invalid
            if (activeIndex < signals.length - 1) {
                setActiveIndex(prev => prev + 1);
            }
            return;
        }

        try {
            await api.submitAudit(currentSignal.id, type);
            showToast({
                message: type === 'human' ? 'Verified Human' : 'Flagged as Slop',
                type: type === 'human' ? 'success' : 'error'
            });

            // Advance to next
            if (activeIndex < signals.length - 1) {
                setActiveIndex(prev => prev + 1);
            } else {
                showToast({ message: 'All caught up!', type: 'info' });
            }
        } catch (err) {
            console.error(err);
            if (err.message && err.message.toLowerCase().includes('already voted')) {
                showToast({ message: 'You already voted on this. Skipping...', type: 'info' });
                // Advance to next
                if (activeIndex < signals.length - 1) {
                    setActiveIndex(prev => prev + 1);
                } else {
                    showToast({ message: 'All caught up!', type: 'info' });
                }
            } else {
                showToast({ message: err.message, type: 'error' });
            }
        }
    };

    if (signals.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-white/50">
                No signals detected. Be the first.
            </div>
        );
    }

    const currentSignal = signals[activeIndex] || {};

    return (
        <div className="h-full relative bg-neutral-900 overflow-hidden">
            {/* Header / Status bar */}
            <div className="absolute top-4 left-0 right-0 z-20 flex justify-between items-center px-4">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono text-white/70">
                    LIVE FEED • {signals.length} ACTIVE
                </div>
                <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:bg-white/10 transition-colors"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Video Card Stack */}
            <div className="h-full w-full relative flex justify-center bg-black">
                <div className="h-full w-full max-w-md relative bg-neutral-900">
                    <AnimatePresence>
                        <motion.div
                            key={currentSignal.id || 'empty'}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -100 }}
                            className="h-full w-full relative"
                        >
                            {/* Video Player */}
                            {currentSignal.video_url ? (
                                <video
                                    src={currentSignal.video_url}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    playsInline
                                    muted={true}
                                    controls={false}
                                    onError={(e) => {
                                        console.error("Video load error:", currentSignal.video_url);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex'; // Show fallback
                                    }}
                                />
                            ) : null}

                            {/* Fallback for missing/broken video */}
                            <div className="absolute inset-0 bg-neutral-800 flex flex-col items-center justify-center hidden" style={{ display: !currentSignal.video_url ? 'flex' : 'none' }}>
                                <div className="p-4 rounded-full bg-white/5 mb-4 animate-pulse">
                                    <Activity className="text-white/20" size={48} />
                                </div>
                                <span className="font-mono text-white/40 text-center text-xs tracking-widest uppercase">
                                    SIGNAL LOST<br />
                                    {currentSignal.id}
                                </span>
                            </div>

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                            {/* Controls & Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-black text-2xl tracking-tight drop-shadow-md">
                                            @{currentSignal.handle || 'unknown'}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white/80 border border-white/20">
                                            PRO
                                        </span>
                                    </div>
                                    <p className="text-white/60 text-sm font-medium tracking-wide">
                                        Active Aura: <span className="text-neon-green">{currentSignal.aura_score || '0'}</span>
                                    </p>
                                </div>

                                {/* Audit Actions */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleVote('slop')}
                                        className="flex-1 h-14 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center gap-3 transition-all active:scale-95 active:bg-red-500/20 hover:border-red-500/50 group"
                                    >
                                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-red-500/20 transition-colors">
                                            <ThumbsDown className="text-white group-hover:text-red-500 transition-colors" size={20} />
                                        </div>
                                        <span className="text-xs font-black tracking-widest text-white group-hover:text-red-500">SLOP</span>
                                    </button>

                                    <button
                                        onClick={() => handleVote('human')}
                                        className="flex-1 h-14 rounded-2xl bg-white text-black border border-white flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-neon-green hover:border-neon-green group shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    >
                                        <div className="p-2 rounded-full bg-black/10">
                                            <ThumbsUp className="text-black" size={20} />
                                        </div>
                                        <span className="text-xs font-black tracking-widest text-black">HUMAN</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <ReportSignalModal
                        signalId={currentSignal.id}
                        onClose={() => setShowReportModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Feed;
