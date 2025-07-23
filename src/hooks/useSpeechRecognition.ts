import { useEffect, useState } from "react";

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setTranscript(speech);
    };

    recognition.onend = () => {
      if (isListening) recognition.start(); // Restart automatically
    };

    if (isListening) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [isListening]);

  return { transcript, isListening, setIsListening };
};
