/** Spoken forms for names English TTS often misreads (US classroom pronunciation). */
const SPEAK_AS: Record<string, string> = {
  Lead: "led",
  Iron: "eye urn",
  Iodine: "eye oh dine",
  Xenon: "zee non",
  Yttrium: "it tree um",
  Ytterbium: "ih ter bee um",
  Niobium: "nye oh bee um",
  Molybdenum: "muh lib den um",
  Strontium: "stron shee um",
  Cesium: "see zee um",
  Praseodymium: "pray zee oh dim ee um",
  Neodymium: "nee oh dim ee um",
  Dysprosium: "dis pro zee um",
  Lutetium: "loo tee shee um",
  Meitnerium: "mite near ee um",
  Roentgenium: "rent gen ee um",
  Oganesson: "oh guh ness on",
  Tennessine: "ten uh seen",
  Nihonium: "nee ho nee um",
  Flerovium: "fluh roh vee um",
  Moscovium: "moss koh vee um",
  Livermorium: "liv er mor ee um",
  Darmstadtium: "darm stat ee um",
  Copernicium: "koh per nee see um",
  Seaborgium: "see borg ee um",
  Rutherfordium: "ruth er for dee um",
  Lawrencium: "luh ren see um",
  Mendelevium: "men duh lee vee um",
  Einsteinium: "ine stine ee um",
  Americium: "am uh rish ee um",
  Protactinium: "pro tack tin ee um",
  Astatine: "ass tuh teen",
  Technetium: "teck nee shee um",
  Gadolinium: "gad uh lin ee um",
};

export function spokenForm(name: string): string {
  return SPEAK_AS[name] ?? name;
}

function synthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = synthesis()?.getVoices() ?? [];
  const en = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  return (
    en.find((voice) => voice.lang.toLowerCase().startsWith("en-us")) ??
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
  utterance.rate = 0.85;
  utterance.pitch = 1;
  const voice = pickEnglishVoice();
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}
