import { ELEMENT_PRONUNCIATIONS } from "./pronunciations";

/** Spellings the engine says wrong (Lead as “leed”). Everything else uses the real name. */
const TTS_WORD: Record<string, string> = {
  Lead: "led",
};

export function spokenForm(name: string): string {
  return ELEMENT_PRONUNCIATIONS[name]?.say ?? name;
}

export function spokenIpa(name: string): string | undefined {
  return ELEMENT_PRONUNCIATIONS[name]?.ipa;
}

export function speechText(name: string): string {
  return TTS_WORD[name] ?? name;
}

function synthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function voiceBlob(voice: SpeechSynthesisVoice): string {
  return `${voice.name} ${voice.voiceURI} ${voice.lang}`.toLowerCase();
}

export function scoreEnglishVoice(voice: SpeechSynthesisVoice): number {
  const blob = voiceBlob(voice);
  let n = 0;
  if (!blob.includes("en")) n -= 8;
  if (voice.lang.toLowerCase().startsWith("en-us")) n += 5;
  else if (voice.lang.toLowerCase().startsWith("en")) n += 2;

  if (/espeak|compact|dummy|robot|festival/.test(blob)) n -= 30;
  if (/desktop|sapi/.test(blob)) n -= 12;
  if (/zira|david desktop|mark desktop|hazel desktop/.test(blob)) n -= 10;

  if (/online \(natural\)|neural|natural/.test(blob)) n += 16;
  if (/google/.test(blob)) n += 14;
  if (/samantha|siri|karen|moira|daniel|premium|enhanced/.test(blob)) n += 10;
  if (/aria|jenny|guy|davis|andrew|emma|ava|michelle|ryan/.test(blob)) n += 8;
  if (voice.localService && /google|natural|neural|samantha/.test(blob)) n += 2;
  return n;
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = synthesis()?.getVoices() ?? [];
  const en = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const pool = en.length > 0 ? en : voices;
  return [...pool].sort((a, b) => scoreEnglishVoice(b) - scoreEnglishVoice(a))[0];
}

let voicesHooked = false;

function hookVoiceList(synth: SpeechSynthesis) {
  if (voicesHooked) return;
  voicesHooked = true;
  synth.getVoices();
  synth.addEventListener("voiceschanged", () => {
    synth.getVoices();
  });
}

function speakPlain(synth: SpeechSynthesis, text: string, voice: SpeechSynthesisVoice | undefined) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.98;
  utterance.pitch = 1.04;
  utterance.volume = 1;
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function cancelSpeech() {
  synthesis()?.cancel();
}

export function unlockSpeech() {
  const synth = synthesis();
  if (!synth) return;
  hookVoiceList(synth);
}

export function speakElementName(name: string) {
  const synth = synthesis();
  if (!synth) return;
  hookVoiceList(synth);
  synth.cancel();
  speakPlain(synth, speechText(name), pickEnglishVoice());
}
