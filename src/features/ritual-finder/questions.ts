export type TimeTag    = "morning" | "evening" | "anytime" | "special";
export type ConcernTag = "fragrance" | "skin" | "hair" | "body" | "universal";
export type MoodTag    = "fresh-green" | "warm-resinous" | "floral-powdery" | "smoky-deep" | "neutral";
export type IntentTag  = "everyday" | "statement" | "giftable" | "curious";

export type RitualAnswers = {
  time:    TimeTag;
  concern: ConcernTag;
  mood:    MoodTag;
  intent:  IntentTag;
};

export type RitualQuestion = {
  id: keyof RitualAnswers;
  eyebrow: string;
  prompt: string;
  options: { label: string; value: string }[];
};

export const RITUAL_QUESTIONS: RitualQuestion[] = [
  {
    id: "time",
    eyebrow: "ONE OF FOUR",
    prompt: "When do you reach for your ritual?",
    options: [
      { label: "Morning",              value: "morning" },
      { label: "Evening",              value: "evening" },
      { label: "Both",                 value: "anytime" },
      { label: "Only on special days", value: "special" },
    ],
  },
  {
    id: "concern",
    eyebrow: "TWO OF FOUR",
    prompt: "What are you tending to right now?",
    options: [
      { label: "Fragrance", value: "fragrance" },
      { label: "Skin",      value: "skin"      },
      { label: "Hair",      value: "hair"      },
      { label: "Body",      value: "body"      },
      { label: "All of it", value: "universal" },
    ],
  },
  {
    id: "mood",
    eyebrow: "THREE OF FOUR",
    prompt: "Your mood is:",
    options: [
      { label: "Fresh & green",    value: "fresh-green"    },
      { label: "Warm & resinous",  value: "warm-resinous"  },
      { label: "Floral & powdery", value: "floral-powdery" },
      { label: "Smoky & deep",     value: "smoky-deep"     },
    ],
  },
  {
    id: "intent",
    eyebrow: "FOUR OF FOUR",
    prompt: "You want:",
    options: [
      { label: "Everyday pieces",    value: "everyday"  },
      { label: "One statement piece", value: "statement" },
      { label: "A gift",             value: "giftable"  },
      { label: "Pure curiosity",     value: "curious"   },
    ],
  },
];
