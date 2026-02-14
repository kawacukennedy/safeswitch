import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';

const WeeklyRecap = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecap = async () => {
            try {
                const user = await api.getMe();
                // We're using the user ID to fetch the recap
                const data = await api.getRecap(user.id);

                // Transform data into slides
                setSlides([
                    { type: 'text', content: `you completed ${data.total_glitches} glitches this week.` },
                    { type: 'text', content: `your most chaotic day was ${data.most_chaotic_day}.` },
                    { type: 'stat', label: 'aura gained', value: `+${data.aura_change}` },
                    { type: 'stat', label: 'audit accuracy', value: `${data.audit_accuracy}%` },
                ]);
                setLoading(false);
            } catch (err) {
                console.error(err);
                showToast({ message: 'No recap available yet', type: 'info' });
                navigate('/profile');
            }
        };
        fetchRecap();
    }, [navigate, showToast]);

    if (loading) return <div className="fixed inset-0 bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            navigate('/profile');
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        showToast({ message: 'recap shared!', type: 'success' });
    };

    return (
        <div
            className="recap-page fixed inset-0 z-50 bg-black text-white"
            onClick={handleNext}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                background: 'black',
                color: 'white',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '4px', padding: '16px 8px' }}>
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        style={{
                            flex: 1,
                            height: '4px',
                            background: idx <= currentIndex ? 'white' : 'rgba(255,255,255,0.2)',
                            borderRadius: '2px',
                            transition: 'background 0.3s'
                        }}
                    />
                ))}
            </div>

            {/* Close Button */}
            <button
                onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 60, padding: '8px' }}
            >
                <X size={24} />
            </button>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        style={{ textAlign: 'center' }}
                    >
                        {slides[currentIndex].type === 'text' && (
                            <h2 style={{ fontSize: '32px', fontWeight: '700', lineHeight: 1.3 }}>
                                {slides[currentIndex].content}
                            </h2>
                        )}

                        {slides[currentIndex].type === 'stat' && (
                            <div>
                                <div style={{ fontSize: '18px', color: 'var(--color-text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {slides[currentIndex].label}
                                </div>
                                <div style={{ fontSize: '64px', fontWeight: '800', color: 'var(--color-aura-positive)', textShadow: '0 0 30px rgba(124, 255, 178, 0.4)' }}>
                                    {slides[currentIndex].value}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Share */}
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={handleShare}
                    className="glass-button"
                    style={{
                        padding: '12px 24px',
                        borderRadius: '99px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500'
                    }}
                >
                    <Share2 size={18} />
                    share recap
                </button>
            </div>
        </div>
    );
};

export default WeeklyRecap;
