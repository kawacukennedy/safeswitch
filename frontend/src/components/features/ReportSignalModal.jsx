import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const REASONS = [
    'harassment',
    'dangerous',
    'spam',
    'other'
];

const ReportSignalModal = ({ signalId, onClose }) => {
    const { showToast } = useToast();
    const [reason, setReason] = useState(REASONS[0]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.submitReport({
                signal_id: signalId,
                reason,
                description
            });
            showToast({ message: 'Report submitted. Thank you.', type: 'success' });
            onClose();
        } catch (err) {
            console.error(err);
            showToast({ message: 'Failed to submit report', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-6"
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} />
                        report signal
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider">reason</label>
                        <div className="grid grid-cols-2 gap-2">
                            {REASONS.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`p-2 rounded-lg text-sm border transition-all ${reason === r
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-white/70 border-white/20 hover:border-white/50'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider">details (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-white/30 h-24 resize-none"
                            placeholder="provide more context..."
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">
                        cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                        submit report
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default ReportSignalModal;
