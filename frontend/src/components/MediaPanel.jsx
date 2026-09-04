import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, AlertCircle, X } from 'lucide-react';

/**
 * Optional camera + microphone panel for the interview. The camera gives a
 * floating self-view (like a real video interview), and the mic transcribes
 * spoken answers into the answer box via onTranscript, with a live interim
 * caption. Both are user-initiated and clean up their streams on unmount.
 */
const SpeechRecognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function MediaPanel({ onTranscript }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const wantListening = useRef(false);

  const speechSupported = !!SpeechRecognition;

  // Attach the live stream whenever the floating cam mounts.
  useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

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

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const toggleCamera = async () => {
    setError('');
    if (cameraOn) return stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
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
      setInterim('');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true; // live transcription
      rec.lang = 'en-US';
      rec.onresult = (e) => {
        let finalText = '';
        let interimText = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalText += t;
          else interimText += t;
        }
        if (finalText.trim()) onTranscript(finalText.trim());
        setInterim(interimText);
      };
      rec.onerror = (ev) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          setError('Microphone access was blocked. Allow it in your browser to answer by voice.');
          wantListening.current = false;
          setListening(false);
          setInterim('');
        }
      };
      rec.onend = () => {
        if (wantListening.current) {
          try { rec.start(); } catch { /* ignore */ }
        } else {
          setListening(false);
          setInterim('');
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
    <>
      {/* Control bar */}
      <div className="glass-card p-4 mb-6 border-dark-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-300 mb-0.5">Interview Studio</p>
            <p className="text-[11px] text-slate-500">
              Turn on your camera to practise on-screen presence
              {speechSupported ? ', or answer out loud with the mic.' : '.'}
            </p>
          </div>
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
        </div>

        {/* Live interim caption */}
        {listening && (
          <div className="mt-3 rounded-lg border border-brand-rose/20 bg-brand-rose/[0.04] px-3 py-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-rose mb-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-rose animate-pulse" /> Listening — live transcript
            </span>
            <p className="text-xs text-slate-300 italic min-h-[1rem]">
              {interim || 'Speak your answer…'}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-brand-rose">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
      </div>

      {/* Floating self-view */}
      {cameraOn && (
        <div className="fixed bottom-4 right-4 z-40 w-56 sm:w-64 rounded-2xl overflow-hidden border border-dark-border/70 bg-slate-950 shadow-2xl shadow-black/50 animate-fade-in">
          <div className="relative aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover -scale-x-100" />
            {listening && (
              <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-brand-rose/85 px-2 py-0.5 text-[9px] font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> REC
              </span>
            )}
            <button
              onClick={stopCamera}
              title="Turn off camera"
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-brand-rose/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="px-3 py-1.5 text-[10px] text-slate-400 bg-dark-card/80 flex items-center gap-1.5">
            <Video className="h-3 w-3 text-brand-cyan" /> Your camera
          </div>
        </div>
      )}
    </>
  );
}
