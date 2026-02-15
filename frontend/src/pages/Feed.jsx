import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-react';
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

        try {
            if (currentSignal) {
                await api.submitAudit(currentSignal.id, type);
                showToast({
                    message: type === 'human' ? 'Verified Human' : 'Flagged as Slop',
                    type: type === 'human' ? 'success' : 'error'
                });
            }

            // Advance to next
            if (activeIndex < signals.length - 1) {
                setActiveIndex(prev => prev + 1);
            } else {
                showToast({ message: 'All caught up!', type: 'info' });
            }
        } catch (err) {
            showToast({ message: err.message, type: 'error' });
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
            <div className="h-full w-full relative">
                <AnimatePresence>
                    <motion.div
                        key={currentSignal.id || 'empty'}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="h-full w-full relative"
                    >
                        {/* Placeholder for Video */}
                        <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                            <span className="font-mono text-white/20 text-center">
                                SIGNAL_{currentSignal.id}
                                <br />
                                {currentSignal.video_url}
                            </span>
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                        {/* Controls & Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 pb-24">
                            <div className="mb-4">
                                <h3 className="text-white font-bold text-lg drop-shadow-md">
                                    @{currentSignal.handle || 'unknown'}
                                </h3>
                                <p className="text-white/80 text-sm drop-shadow-md">
                                    Aura: {currentSignal.aura_score || '?'}
                                </p>
                            </div>

                            {/* Audit Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleVote('slop')}
                                    className="flex-1 py-4 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 backdrop-blur-md flex flex-col items-center gap-1 transition-colors"
                                >
                                    <ThumbsDown className="text-red-500" size={24} />
                                    <span className="text-xs font-bold text-red-400">SLOP</span>
                                </button>

                                <button
                                    onClick={() => handleVote('human')}
                                    className="flex-1 py-4 rounded-xl bg-neon-green/20 hover:bg-neon-green/40 border border-neon-green/50 backdrop-blur-md flex flex-col items-center gap-1 transition-colors"
                                >
                                    <ThumbsUp className="text-neon-green" size={24} />
                                    <span className="text-xs font-bold text-neon-green">HUMAN</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
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
