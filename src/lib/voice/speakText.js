const cleanText = (value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

export function speakText(text) {
  const safeText = cleanText(text);

  if (!safeText || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(safeText);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = document.documentElement.lang || 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => (
      /en|us|uk|india/i.test(voice.lang) &&
      /female|woman|girl|zira|samantha|susan|aria|jenny|hazel|victoria|sara|heera|veena|kalpana|neerja|asha|meera|sona|swara/i.test(voice.name)
    )) || voices.find((voice) => /en/i.test(voice.lang)) || null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.warn('Speech synthesis failed:', error);
    return false;
  }
}

export function getInteractiveLabel(element) {
  if (!(element instanceof Element)) {
    return '';
  }

  const explicitLabel = element.getAttribute('aria-label') || element.getAttribute('title');
  if (explicitLabel) {
    return cleanText(explicitLabel);
  }

  const clonedNode = element.cloneNode(true);
  clonedNode.querySelectorAll('svg, img, [aria-hidden="true"], [data-speech-ignore="true"]').forEach((node) => node.remove());

  const text = cleanText(clonedNode.textContent || '');
  if (text) {
    return text;
  }

  const value = element.getAttribute('value');
  if (value) {
    return cleanText(value);
  }

  return '';
}

export function withClickSpeech(handler) {
  return (event) => {
    if (typeof handler === 'function') {
      handler(event);
    }

    if (event && event.defaultPrevented) {
      return;
    }

    const target = event?.currentTarget || event?.target;
    const label = target ? getInteractiveLabel(target) : '';

    if (label) {
      speakText(label);
    }
  };
}
