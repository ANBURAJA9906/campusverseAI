import React, { useRef, useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useCampus } from '../context/CampusContext';

// AI Campus Voice Assistant — submitted-feature #1. Captures speech in the
// browser via the Web Speech API, then routes the transcript through
// POST /api/agent/voice (same orchestrateQuery pipeline as typed chat).
// The reply is spoken back via SpeechSynthesis — see sendChatMessage in
// CampusContext.jsx. No audio ever leaves the browser except as text.
const SpeechRecognitionAPI =
  typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function VoiceInputButton() {
  const { sendChatMessage, isListening, setIsListening } = useCampus();
  const recognitionRef = useRef(null);
  const [unsupported] = useState(!SpeechRecognitionAPI);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        sendChatMessage(transcript, 'voice');
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        // start() throws if already started — ignore, onend will reset state
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={unsupported}
      title={unsupported ? 'Voice input is not supported in this browser' : (isListening ? 'Stop listening' : 'Ask by voice')}
      className={`voice-mic-btn ${isListening ? 'listening' : ''}`}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}
