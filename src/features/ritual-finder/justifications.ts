import type { RitualAnswers } from "./questions";

const SPECIFIC: Record<string, string> = {
  "evening:fragrance:warm-resinous:statement":
    "An evening leaning warm and resinous — we led with one oud, then softened around it.",
  "evening:fragrance:smoky-deep:statement":
    "Deep, unhurried, made to linger. The kind of scent that enters a room before you do.",
  "morning:skin:fresh-green:everyday":
    "A morning shelf — light, active, effective. Nothing that doesn't earn its place.",
  "morning:fragrance:fresh-green:everyday":
    "Fresh and bright for every morning. Chosen to feel effortless, not thought about.",
  "anytime:fragrance:floral-powdery:giftable":
    "Universally beautiful. The kind of piece you give knowing it'll be loved.",
  "special:fragrance:warm-resinous:statement":
    "Reserved for the moments worth remembering. One scent, chosen with intention.",
  "anytime:body:neutral:everyday":
    "A body ritual that doesn't ask much — just ten minutes and consistency.",
  "morning:skin:neutral:everyday":
    "The unglamorous essentials. SPF, actives, done. The rest follows.",
};

export const GENERIC_JUSTIFICATION =
  "Chosen against your four answers — the mood led, the time and intent shaped the shelf.";

export function getJustification(answers: RitualAnswers): string {
  const key = `${answers.time}:${answers.concern}:${answers.mood}:${answers.intent}`;
  return SPECIFIC[key] ?? GENERIC_JUSTIFICATION;
}
