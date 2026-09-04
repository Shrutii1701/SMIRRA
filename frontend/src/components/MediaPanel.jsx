import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, AlertCircle } from 'lucide-react';

/**
 * Optional camera + microphone panel for the interview. The camera gives a
 * self-view (like a real interview), and the mic transcribes spoken answers
 * into the answer box via onTranscript. Both are user-initiated and clean up
 * their streams on unmount.
 */
const SpeechRecognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function MediaPanel({ onTranscript }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const wantListening = useRef(false);

  const speechSupported = !!SpeechRecognition;

  // Stop everything on unmount.
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      wantListening.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  const toggleCamera = async () => {
    setError('');
    if (cameraOn) {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      // Attach after render so the video element exists.
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError('Camera access was blocked. Allow it in your browser to enable the self-view.');
    }
  };

  const toggleMic = () => {
    setError('');
    if (!speechSupported) return;

    if (listening) {
      wantListening.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      setListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onresult = (e) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) text += e.results[i][0].transcript;
        }
        if (text.trim()) onTranscript(text.trim());
      };
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setError('Microphone access was blocked. Allow it in your browser to answer by voice.');
          wantListening.current = false;
          setListening(false);
        }
      };
      rec.onend = () => {
        // Chrome ends recognition periodically; restart while the user wants it.
        if (wantListening.current) {
          try { rec.start(); } catch { /* ignore */ }
        } else {
          setListening(false);
        }
      };
      recognitionRef.current = rec;
      wantListening.current = true;
      rec.start();
      setListening(true);
    } catch {
      setError('Could not start voice input.');
    }
  };

  return (
    <div className="glass-card p-4 mb-6 border-dark-border/40">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Self-view */}
        <div className="relative h-24 w-40 shrink-0 rounded-xl overflow-hidden border border-dark-border/60 bg-slate-950/60 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover -scale-x-100 ${cameraOn ? '' : 'hidden'}`}
          />
          {!cameraOn && <VideoOff className="h-6 w-6 text-slate-600" />}
          {listening && (
            <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full bg-brand-rose/80 px-2 py-0.5 text-[9px] font-bold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> REC
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 w-full">
          <p className="text-xs font-semibold text-slate-300 mb-0.5">Interview Studio</p>
          <p className="text-[11px] text-slate-500 mb-3">
            Turn on your camera to practise on-screen presence
            {speechSupported ? ', or answer out loud with the mic.' : '.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleCamera}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                cameraOn
                  ? 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan'
                  : 'border-dark-border/60 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              {cameraOn ? 'Camera On' : 'Turn On Camera'}
            </button>

            {speechSupported && (
              <button
                onClick={toggleMic}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  listening
                    ? 'border-brand-rose/40 bg-brand-rose/10 text-brand-rose'
                    : 'border-dark-border/60 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {listening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {listening ? 'Listening… tap to stop' : 'Answer by Voice'}
              </button>
            )}
          </div>

          {error && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-brand-rose">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
