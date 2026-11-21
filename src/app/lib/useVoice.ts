import { useCallback, useEffect, useRef, useState } from 'react';

/* Minimal typings for the browser Speech API (Chrome, Edge, Safari). */
type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};
type SRCtor = new () => SR;

export function useVoice(onFinal: (text: string) => void) {
  const Ctor = (window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SRCtor }).webkitSpeechRecognition;
  const supported = !!Ctor;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'en-US' | 'ar-JO'>(() => (localStorage.getItem('lifeos.voiceLang') as 'en-US' | 'ar-JO') || 'en-US');
  const rec = useRef<SR | null>(null);
  const cb = useRef(onFinal);
  cb.current = onFinal;

  useEffect(() => {
    try { localStorage.setItem('lifeos.voiceLang', lang); } catch { /* ignore */ }
  }, [lang]);

  const stop = useCallback(() => rec.current?.stop(), []);

  const start = useCallback(() => {
    if (!Ctor) return;
    setError('');
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    let finalText = '';
    r.onresult = (e) => {
      let live = '';
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else live += t;
      }
      setInterim(finalText + live);
    };
    r.onerror = (e) => setError(e.error === 'not-allowed' ? 'Microphone permission was denied.' : `Voice error: ${e.error}`);
    r.onend = () => {
      setListening(false);
      setInterim('');
      if (finalText.trim()) cb.current(finalText.trim());
    };
    rec.current = r;
    setListening(true);
    r.start();
  }, [Ctor, lang]);

  return { supported, listening, interim, error, lang, setLang, start, stop };
}
