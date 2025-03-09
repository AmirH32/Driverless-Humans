import { useRef } from 'react';

export const useSpeech = () => {
  // Use a ref to persist the SpeechSynthesisUtterance across renders
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakText = (text: string) => {
    if (speechRef.current) {
      // If speech is already ongoing, cancel it
      window.speechSynthesis.cancel();
    }

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US'; // Set the language
    speech.rate = 1;       // Set the rate (1 is normal)
    speech.pitch = 1;      // Set the pitch (1 is normal)

    // Store the speech instance in the ref to persist it
    speechRef.current = speech;

    // Speak the text
    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    if (speechRef.current) {
      window.speechSynthesis.cancel(); // Stop the current speech
      speechRef.current = null; // Reset the speech reference
    }
  };

  return { speakText, stopSpeech };
};
