export const VOICE_LANGUAGES = {
  en: { label: 'English', speech: 'en-IN' },
  hi: { label: 'हिन्दी (Hindi)', speech: 'hi-IN' },
  as: { label: 'অসমীয়া (Assamese)', speech: 'as-IN' },
  bn: { label: 'বাংলা (Bengali)', speech: 'bn-IN' },
  mni: { label: 'Manipuri', speech: 'mni-IN' },
  kh: { label: 'Khasi', speech: 'kh-IN' },
  lus: { label: 'Mizo', speech: 'lus-IN' },
  brx: { label: 'Bodo', speech: 'brx-IN' },
};

export function getVoiceLanguage(language) {
  return (
    VOICE_LANGUAGES[language] ||
    Object.values(VOICE_LANGUAGES).find((entry) => entry.speech === language) ||
    VOICE_LANGUAGES.en
  );
}