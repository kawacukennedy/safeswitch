import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Camera as CameraIcon, VideoOff } from 'lucide-react';

export const Camera = forwardRef(({
    onStreamReady,
    onError,
    onCapture,
    maxDuration = 7, // seconds
    className
}, ref) => {
    const videoRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        start: startCamera,
        stop: stopCamera,
        startRecording,
        stopRecording,
        video: videoRef.current
    }));

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setHasPermission(true);
                if (onStreamReady) onStreamReady(stream);
            }
        } catch (err) {
            console.error("Camera error:", err);
            setHasPermission(false);
            if (onError) onError(err);
        }
    };

    const stopCamera = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsRecording(false);
        setRecordingTime(0);
    };

    const startRecording = () => {
        if (!streamRef.current) return;

        chunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';

        const recorder = new MediaRecorder(streamRef.current, { mimeType });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            if (onCapture) onCapture(blob);
            setIsRecording(false);
            setRecordingTime(0);
            if (timerRef.current) clearInterval(timerRef.current);
        };

        recorder.start(100); // Collect data every 100ms
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingTime(0);

        // Timer for recording duration
        timerRef.current = setInterval(() => {
            setRecordingTime(prev => {
                const next = prev + 1;
                if (next >= maxDuration) {
                    // Auto-stop at max duration
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        mediaRecorderRef.current.stop();
                    }
                    clearInterval(timerRef.current);
                }
                return next;
            });
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className={className} style={{ position: 'relative', background: 'black', borderRadius: '12px', overflow: 'hidden', aspectRatio: '9/16' }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Recording indicator */}
            {isRecording && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '6px 14px',
                    borderRadius: '99px',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#FF3B30',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'white', fontFamily: 'monospace' }}>
                        {recordingTime}s / {maxDuration}s
                    </span>
                </div>
            )}

            {/* Progress bar */}
            {isRecording && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'rgba(255,255,255,0.2)'
                }}>
                    <div style={{
                        height: '100%',
                        background: 'var(--color-aura-positive)',
                        width: `${(recordingTime / maxDuration) * 100}%`,
                        transition: 'width 1s linear',
                        boxShadow: '0 0 8px rgba(124, 255, 178, 0.5)'
                    }} />
                </div>
            )}

            {hasPermission === false && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)' }}>
                    <VideoOff size={48} style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.5)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Camera permission denied</span>
                </div>
            )}

            {hasPermission === null && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)' }}>
                    <span className="loader" />
                </div>
            )}
        </div>
    );
});

Camera.displayName = 'Camera';
