export const speechService = {
  speak: (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and set to a natural sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.localService
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Configure speech parameters
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Start speaking
    window.speechSynthesis.speak(utterance);
  },

  stop: () => {
    window.speechSynthesis.cancel();
  }
};
