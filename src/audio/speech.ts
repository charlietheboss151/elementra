import { ELEMENT_PRONUNCIATIONS } from "./pronunciations";

export function spokenForm(name: string): string {
  return ELEMENT_PRONUNCIATIONS[name] ?? name;
}

function synthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = synthesis()?.getVoices() ?? [];
  const en = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  return (
    en.find((voice) => /en-US/i.test(voice.lang) && /natural|neural|google|microsoft/i.test(voice.name)) ??
    en.find((voice) => /en-US/i.test(voice.lang)) ??
    en[0] ??
    voices[0]
  );
}

export function cancelSpeech() {
  synthesis()?.cancel();
}

export function unlockSpeech() {
  synthesis()?.getVoices();
}

export function speakElementName(name: string) {
  const synth = synthesis();
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(spokenForm(name));
  utterance.lang = "en-US";
  utterance.rate = 0.78;
  utterance.pitch = 1;
  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}
