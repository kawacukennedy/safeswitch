import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Camera as CameraIcon, VideoOff } from 'lucide-react';

export const Camera = forwardRef(({
    onStreamReady,
    onError,
    onCapture,
    maxDuration = 7, // seconds
    autoStart = false,
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
            // First attempt: Ideal mobile constraints
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
                audio: true
            });
            handleStream(stream);
        } catch (err) {
            console.warn("Mobile constraints failed, retrying with generic...", err);
            try {
                // Second attempt: Generic fallback (Laptops/Desktops)
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                handleStream(stream);
            } catch (fallbackErr) {
                console.error("Camera error:", fallbackErr);
                setHasPermission(false);
                setErrorMsg(fallbackErr.message || "Camera access failed");
                if (onError) onError(fallbackErr);
            }
        }
    };

    const handleStream = (stream) => {
        console.log("Stream acquired:", stream.id);
        streamRef.current = stream;
        setHasPermission(true); // Stop loading regardless

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.warn("Auto-play failed:", e));
        } else {
            console.error("Camera error: videoRef is null during handleStream");
        }

        if (onStreamReady) onStreamReady(stream);
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
        chunksRef.current = [];
        const mimeType = [
            'video/webm;codecs=vp9',
            'video/webm',
            'video/mp4'
        ].find(type => MediaRecorder.isTypeSupported(type)) || '';

        const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);

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

    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        let timeout;
        if (autoStart) {
            startCamera();
            timeout = setTimeout(() => {
                setHasPermission(prev => {
                    if (prev === null) {
                        setErrorMsg("Camera initialization timed out");
                        return false;
                    }
                    return prev;
                });
            }, 10000);
        }
        return () => {
            stopCamera();
            if (timeout) clearTimeout(timeout);
        };
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
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', padding: '20px', textAlign: 'center' }}>
                    <VideoOff size={48} style={{ marginBottom: '8px', color: 'rgba(255,255,255,0.5)' }} />
                    <span style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Camera unavailable</span>
                    {errorMsg && <span style={{ color: 'var(--color-aura-negative)', fontSize: '12px', marginBottom: '16px', display: 'block' }}>{errorMsg}</span>}
                    <button
                        onClick={() => { setHasPermission(null); setErrorMsg(null); startCamera(); }}
                        style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Retry
                    </button>
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
