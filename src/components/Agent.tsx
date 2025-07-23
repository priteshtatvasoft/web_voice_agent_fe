import React, { useState, useRef } from 'react';

const SimpleTTS = () => {
  const [text, setText] = useState('Hello, this is a test of the text-to-speech system.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSpeak = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    
    try {
      // Call Bland.ai TTS API
      const response = await fetch('https://api.bland.ai/v1/speak', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_BLAND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voice: 'Maeve', // Try other voices like 'Dustin', 'Emily', etc.
          text: text,
          output_format: 'mp3_44100' // More browser-friendly than PCM
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Create audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.error('TTS Error:', error);
      alert('Failed to generate speech');
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="tts-container">
      <h2>Text-to-Speech Demo</h2>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak..."
        rows={5}
        className='bg-red-200 text-black'
      />
      
      <div className="controls">
        <button
          onClick={isPlaying ? handleStop : handleSpeak}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : isPlaying ? '⏹ Stop' : '▶ Speak'}
        </button>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      <div className="info">
        <p>Using voice: <strong>Maeve</strong></p>
        <p>Change the text above and click Speak</p>
      </div>
    </div>
  );
};

export default SimpleTTS;