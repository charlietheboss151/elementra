import { ELEMENT_PRONUNCIATIONS } from "./pronunciations";

export function spokenForm(name: string): string {
  return ELEMENT_PRONUNCIATIONS[name]?.say ?? name;
}

export function spokenIpa(name: string): string | undefined {
  return ELEMENT_PRONUNCIATIONS[name]?.ipa;
}

function synthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = synthesis()?.getVoices() ?? [];
  const en = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const score = (voice: SpeechSynthesisVoice) => {
    const blob = `${voice.name} ${voice.voiceURI}`.toLowerCase();
    let n = 0;
    if (/en-us/.test(voice.lang.toLowerCase())) n += 4;
    if (/microsoft|online \(natural\)|neural|aria|jenny|guy|davis|andrew/.test(blob)) n += 6;
    if (/google/.test(blob)) n += 2;
    if (voice.localService) n += 1;
    return n;
  };
  return [...en].sort((a, b) => score(b) - score(a))[0] ?? voices[0];
}

function voiceHonorsIpa(voice: SpeechSynthesisVoice | undefined): boolean {
  if (!voice) return false;
  return /microsoft|natural|neural|online/i.test(`${voice.name} ${voice.voiceURI}`);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function speakPlain(synth: SpeechSynthesis, text: string, voice: SpeechSynthesisVoice | undefined) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
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
  const entry = ELEMENT_PRONUNCIATIONS[name];
  const voice = pickEnglishVoice();
  const fallback = entry?.say ?? name;

  if (entry && voiceHonorsIpa(voice)) {
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;
    utterance.text = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><phoneme alphabet="ipa" ph="${escapeXml(entry.ipa)}">${escapeXml(name)}</phoneme></speak>`;
    utterance.onerror = () => {
      speakPlain(synth, fallback, voice);
    };
    synth.speak(utterance);
    return;
  }

  speakPlain(synth, fallback, voice);
}
