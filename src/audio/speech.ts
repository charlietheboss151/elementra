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

/**
 * Human-sounding voices browsers actually expose (Edge neural, Chrome Google, Apple).
 * Desktop SAPI (David/Zira) is omitted on purpose.
 */
export const HUMAN_VOICE_PREFERENCE = [
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Emma Online (Natural) - English (United States)",
  "Microsoft Ava Online (Natural) - English (United States)",
  "Microsoft Guy Online (Natural) - English (United States)",
  "Google US English",
  "Google UK English Female",
  "Google UK English Male",
  "Ava (Premium)",
  "Samantha (Enhanced)",
  "Samantha",
  "Karen",
  "Moira",
  "Daniel",
];

export function scoreEnglishVoice(voice: SpeechSynthesisVoice): number {
  const blob = voiceBlob(voice);
  let n = 0;
  if (!blob.includes("en")) n -= 8;
  if (voice.lang.toLowerCase().startsWith("en-us")) n += 5;
  else if (voice.lang.toLowerCase().startsWith("en")) n += 2;

  if (/espeak|compact|dummy|robot|festival/.test(blob)) n -= 30;
  if (/desktop|sapi/.test(blob)) n -= 12;
  if (/zira|david desktop|mark desktop|hazel desktop/.test(blob)) n -= 10;
  if (/\bdavid\b/.test(blob)) n -= 4;

  if (/online \(natural\)|neural|wavenet/.test(blob)) n += 20;
  if (/google/.test(blob)) n += 16;
  if (/samantha|siri|karen|moira|daniel|premium|enhanced/.test(blob)) n += 10;
  if (/aria|jenny|guy|davis|andrew|emma|ava|michelle|ryan/.test(blob)) n += 8;
  if (voice.localService && /google|natural|neural|samantha/.test(blob)) n += 2;
  return n;
}

export function pickEnglishVoiceFrom(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  const en = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const pool = en.length > 0 ? en : voices;
  for (const name of HUMAN_VOICE_PREFERENCE) {
    const match = pool.find((voice) => voice.name === name);
    if (match) return match;
  }
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
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

let speakGeneration = 0;

function speakWhenVoicesReady(synth: SpeechSynthesis, text: string) {
  const gen = ++speakGeneration;
  const go = () => {
    if (gen !== speakGeneration) return;
    speakPlain(synth, text, pickEnglishVoiceFrom(synth.getVoices()));
  };
  if (synth.getVoices().length > 0) {
    go();
    return;
  }
  const onReady = () => {
    synth.removeEventListener("voiceschanged", onReady);
    go();
  };
  synth.addEventListener("voiceschanged", onReady);
  window.setTimeout(() => {
    synth.removeEventListener("voiceschanged", onReady);
    go();
  }, 800);
}

export function cancelSpeech() {
  speakGeneration += 1;
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
  speakWhenVoicesReady(synth, speechText(name));
}
