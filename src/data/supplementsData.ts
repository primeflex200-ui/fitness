export interface Supplement {
  name: string;
  description: string;
  benefits: string[];
  dosage: string;
  warning?: string;
  advantages: string[];
  precautions: string[];
  emoji: string;
}

export const supplementsVsSteroids = {
  headers: ["Aspect", "Supplements", "Steroids"],
  rows: [
    ["Legal Status", "✅ Legal & Safe", "❌ Illegal (without prescription)"],
    ["Purpose", "Fill nutritional gaps, support fitness", "Artificially boost hormones"],
    ["Source", "Natural ingredients (whey, creatine, vitamins)", "Synthetic hormones"],
    ["Side Effects", "Minimal (if used correctly)", "Severe (liver damage, heart issues, hormonal imbalance)"],
    ["Dependency", "No physical dependency", "High risk of dependency"],
    ["Results", "Gradual, sustainable", "Fast but temporary & harmful"],
    ["Health Impact", "Supports overall health", "Damages organs, hormones, mental health"],
    ["Approval", "FDA/FSSAI approved", "Banned in sports, illegal use"],
    ["Reversibility", "Can stop anytime safely", "Long-term damage, hard to reverse"],
    ["Cost", "Affordable", "Expensive + medical costs later"],
  ]
};

export const detailedSupplements: Supplement[] = [
  {
    name: "Whey Protein",
    emoji: "🥛",
    description: "Fast-absorbing protein for muscle recovery and growth",
    dosage: "20-30g per serving (1-2 times daily)",
    advantages: [
      "Supports muscle growth and repair",
      "Easy and quick digestion",
      "Helps meet daily protein target",
      "Improves recovery after workouts",
      "Supports fat loss by increasing satiety"
    ],
    precautions: [
      "Avoid if lactose intolerant (choose isolate)",
      "Do not overconsume (max 1.6–2g protein/kg/day total)",
      "Drink enough water",
      "Check for added sugars",
      "Avoid using as meal replacement always"
    ],
    benefits: ["Muscle building", "Quick absorption", "Post-workout recovery"]
  },
  {
    name: "Creatine (Monohydrate)",
    emoji: "💪",
    description: "Improves strength, power, and muscle mass",
    dosage: "3-5g daily (maintenance dose)",
    warning: "Check creatinine level before using creatine",
    advantages: [
      "Increases strength and power",
      "Improves muscle endurance",
      "Helps with faster recovery",
      "Enhances muscle fullness",
      "Safest, well-researched supplement"
    ],
    precautions: [
      "Drink 3–4L water daily",
      "Avoid high doses (stick to 3–5g/day)",
      "People with kidney issues should avoid",
      "Don't mix with too much caffeine",
      "Take consistently for best results"
    ],
    benefits: ["Increased strength", "Better performance", "Muscle growth"]
  },
  {
    name: "BCAA",
    emoji: "⚡",
    description: "Branched-chain amino acids for muscle recovery",
    dosage: "5-10g before/during workout",
    advantages: [
      "Reduces muscle soreness",
      "Helps prevent muscle breakdown",
      "Supports endurance training",
      "Useful during fasted workouts",
      "Provides quick energy"
    ],
    precautions: [
      "Not needed if protein intake is high",
      "Avoid high doses",
      "Check for artificial flavors",
      "Avoid taking with empty stomach if nausea",
      "Prefer EAA over BCAA for better results"
    ],
    benefits: ["Reduced muscle fatigue", "Enhanced recovery", "Muscle preservation"]
  },
  {
    name: "Multivitamin",
    emoji: "💊",
    description: "Essential vitamins and minerals for overall health",
    dosage: "1 tablet daily with food",
    advantages: [
      "Supports immune function",
      "Fills nutritional gaps",
      "Improves energy levels",
      "Supports metabolism",
      "Helps hair, skin, nail health"
    ],
    precautions: [
      "Avoid double-dosing with other vitamins",
      "Take with food to avoid nausea",
      "Choose trusted brands",
      "People with medical issues consult doctor",
      "Check for excess iron (if not needed)"
    ],
    benefits: ["Immune support", "Energy boost", "Overall wellness"]
  },
  {
    name: "Pre-Workout",
    emoji: "🔥",
    description: "Energy and focus booster for intense training",
    dosage: "1 scoop 20-30 min before workout",
    advantages: [
      "Boosts energy",
      "Increases focus",
      "Improves workout performance",
      "Helps push heavier weights",
      "Reduces fatigue"
    ],
    precautions: [
      "Avoid late evening (may disturb sleep)",
      "Check caffeine content",
      "Start with half scoop",
      "Avoid if sensitive to stimulants",
      "Keep hydrated"
    ],
    benefits: ["Energy boost", "Enhanced focus", "Better performance"]
  },
  {
    name: "L-Arginine",
    emoji: "🚀",
    description: "Amino acid that improves blood flow and muscle pump",
    dosage: "3-6g before workout",
    advantages: [
      "Improves blood flow",
      "Enhances muscle pump",
      "Supports heart health",
      "Improves nutrient delivery",
      "Boosts nitric oxide levels"
    ],
    precautions: [
      "Avoid mixing with stimulant-heavy preworkouts",
      "Do not exceed recommended dose",
      "May cause stomach upset",
      "Avoid if you have low BP",
      "Take on empty stomach for best results"
    ],
    benefits: ["Better pump", "Improved circulation", "Enhanced performance"]
  },
  {
    name: "L-Carnitine",
    emoji: "🔋",
    description: "Supports fat burning and energy production",
    dosage: "1-2g daily with meals",
    advantages: [
      "Supports fat burning",
      "Enhances energy levels",
      "Helps recovery",
      "Supports heart function",
      "Good for vegetarians (usually low in diet)"
    ],
    precautions: [
      "Works best with cardio",
      "Avoid overdosing",
      "Take with meals",
      "Not a magic weight-loss pill",
      "Check for digestion issues"
    ],
    benefits: ["Fat metabolism", "Energy support", "Recovery aid"]
  },
  {
    name: "Omega-3",
    emoji: "🐟",
    description: "Essential fatty acids for heart and brain health",
    dosage: "1-3g daily with meals",
    advantages: [
      "Supports heart health",
      "Reduces inflammation",
      "Improves brain function",
      "Supports joint health",
      "Helps with recovery"
    ],
    precautions: [
      "Take with food for better absorption",
      "Check for fish allergies",
      "Choose quality brands (mercury-free)",
      "May thin blood (consult if on medication)",
      "Store in cool place"
    ],
    benefits: ["Heart health", "Reduced inflammation", "Brain function"]
  }
];

export const generalSupplementInfo = {
  advantages: [
    "Improves strength & performance",
    "Supports muscle growth",
    "Helps faster recovery",
    "Fills nutritional gaps",
    "Helps reach fitness goals faster"
  ],
  precautions: [
    "Supplements are ADD-ONS, not replacements",
    "Always check ingredient list",
    "Avoid mixing too many products",
    "Stay hydrated",
    "Choose trusted, certified brands"
  ]
};

// 100 Fitness Supplement Q&As
export interface SupplementQA {
  question: string;
  answer: string;
  explanation: string;
  category: string;
  keywords: string[];
}

export const supplementQAs: SupplementQA[] = [
  // PROTEIN SUPPLEMENTS (1-20)
  {
    question: "What does whey protein do?",
    answer: "Helps muscle repair and growth.",
    explanation: "Whey provides fast-digesting amino acids that rebuild muscle after training.",
    category: "Protein",
    keywords: ["whey", "protein", "muscle", "repair", "growth", "recovery"]
  },
  {
    question: "Is whey protein safe daily?",
    answer: "Yes.",
    explanation: "It's just concentrated milk protein; safe if taken in normal dietary amounts.",
    category: "Protein",
    keywords: ["whey", "safe", "daily", "protein"]
  },
  {
    question: "Best time to take whey?",
    answer: "After workout.",
    explanation: "Muscles absorb nutrients better post-training (anabolic window).",
    category: "Protein",
    keywords: ["whey", "timing", "post-workout", "after", "when"]
  },
  {
    question: "Can vegetarians take whey?",
    answer: "Yes.",
    explanation: "It comes from milk, not meat.",
    category: "Protein",
    keywords: ["whey", "vegetarian", "veg", "milk"]
  },
  {
    question: "What if lactose intolerant?",
    answer: "Use whey isolate or plant protein.",
    explanation: "Isolate has minimal lactose and digests easier.",
    category: "Protein",
    keywords: ["lactose", "intolerant", "isolate", "plant", "protein", "digestion"]
  },
  {
    question: "Does protein powder damage kidneys?",
    answer: "Not for healthy people.",
    explanation: "Kidneys stress only with very high protein + pre-existing disease.",
    category: "Protein",
    keywords: ["protein", "kidney", "damage", "safe", "health"]
  },
  {
    question: "How much protein per day?",
    answer: "1.6–2.2 g/kg.",
    explanation: "This range is scientifically optimal for muscle growth.",
    category: "Protein",
    keywords: ["protein", "amount", "dosage", "daily", "how much"]
  },
  {
    question: "Is plant protein effective?",
    answer: "Yes.",
    explanation: "Contains essential amino acids but may digest slower.",
    category: "Protein",
    keywords: ["plant", "protein", "vegan", "effective", "vegetarian"]
  },
  {
    question: "Can protein help fat loss?",
    answer: "Yes.",
    explanation: "Protein keeps you full and preserves muscle while cutting calories.",
    category: "Protein",
    keywords: ["protein", "fat loss", "weight loss", "cutting", "diet"]
  },
  {
    question: "Can I take protein without gym?",
    answer: "Yes.",
    explanation: "It simply fills dietary protein gaps.",
    category: "Protein",
    keywords: ["protein", "without gym", "no workout", "diet"]
  },
  {
    question: "Whey or Casein?",
    answer: "Whey = fast, Casein = slow.",
    explanation: "Use whey post-workout and casein before sleep.",
    category: "Protein",
    keywords: ["whey", "casein", "difference", "which", "better"]
  },
  {
    question: "Is protein addictive?",
    answer: "No.",
    explanation: "It's food, not a stimulant.",
    category: "Protein",
    keywords: ["protein", "addictive", "addiction", "safe"]
  },
  {
    question: "Can teenagers use whey?",
    answer: "Yes.",
    explanation: "Safe for growing bodies as long as total protein is monitored.",
    category: "Protein",
    keywords: ["teenager", "teen", "whey", "young", "age"]
  },
  {
    question: "Is isolate better than concentrate?",
    answer: "Yes for digestion.",
    explanation: "Isolate has 90% protein & less lactose.",
    category: "Protein",
    keywords: ["isolate", "concentrate", "difference", "better", "whey"]
  },
  {
    question: "Does whey cause acne?",
    answer: "Rarely.",
    explanation: "Some people react to dairy hormones.",
    category: "Protein",
    keywords: ["whey", "acne", "skin", "pimples", "side effect"]
  },
  {
    question: "Does protein cause hair fall?",
    answer: "No.",
    explanation: "Hair loss is genetic, not protein-related.",
    category: "Protein",
    keywords: ["protein", "hair", "hair fall", "baldness", "loss"]
  },
  {
    question: "Is 2 scoops a day safe?",
    answer: "Yes.",
    explanation: "As long as total protein stays in recommended limits.",
    category: "Protein",
    keywords: ["scoops", "dosage", "amount", "safe", "protein"]
  },
  {
    question: "Can protein replace meals?",
    answer: "No.",
    explanation: "It lacks vitamins, fiber, and fats.",
    category: "Protein",
    keywords: ["protein", "meal replacement", "food", "substitute"]
  },
  {
    question: "Should beginners take whey?",
    answer: "Yes if diet lacks protein.",
    explanation: "Helps meet muscle recovery needs.",
    category: "Protein",
    keywords: ["beginner", "whey", "start", "new", "protein"]
  },
  {
    question: "Does protein make you bulky?",
    answer: "No.",
    explanation: "Calories create bulk, not protein alone.",
    category: "Protein",
    keywords: ["protein", "bulky", "bulk", "fat", "weight gain"]
  },

  // CREATINE (21-40)
  {
    question: "What does creatine do?",
    answer: "Boosts strength & muscle power.",
    explanation: "Increases ATP energy availability for heavy lifts.",
    category: "Creatine",
    keywords: ["creatine", "strength", "power", "energy", "atp"]
  },
  {
    question: "Is creatine safe?",
    answer: "Yes.",
    explanation: "Most researched supplement with proven safety.",
    category: "Creatine",
    keywords: ["creatine", "safe", "safety", "side effects"]
  },
  {
    question: "Best daily dose of creatine?",
    answer: "3–5g.",
    explanation: "Enough to saturate muscles without loading.",
    category: "Creatine",
    keywords: ["creatine", "dose", "dosage", "amount", "how much"]
  },
  {
    question: "Does creatine cause hair loss?",
    answer: "No evidence.",
    explanation: "Myths came from one small unproven study.",
    category: "Creatine",
    keywords: ["creatine", "hair loss", "baldness", "hair fall"]
  },
  {
    question: "Why does creatine cause water retention?",
    answer: "Pulls water into muscle cells.",
    explanation: "This improves strength and performance.",
    category: "Creatine",
    keywords: ["creatine", "water", "retention", "bloating", "weight"]
  },
  {
    question: "Best time to take creatine?",
    answer: "After workout.",
    explanation: "Muscles absorb nutrients better post-exercise.",
    category: "Creatine",
    keywords: ["creatine", "timing", "when", "post-workout"]
  },
  {
    question: "Is creatine good for vegetarians?",
    answer: "Yes.",
    explanation: "They naturally have lower creatine stores.",
    category: "Creatine",
    keywords: ["creatine", "vegetarian", "veg", "plant-based"]
  },
  {
    question: "Is loading required for creatine?",
    answer: "No.",
    explanation: "Loading only speeds up saturation; not necessary.",
    category: "Creatine",
    keywords: ["creatine", "loading", "phase", "required"]
  },
  {
    question: "Monohydrate or HCL?",
    answer: "Monohydrate.",
    explanation: "Cheapest, safest, and most researched.",
    category: "Creatine",
    keywords: ["creatine", "monohydrate", "hcl", "type", "which"]
  },
  {
    question: "Does creatine harm kidneys?",
    answer: "No for healthy users.",
    explanation: "Only risky if someone already has kidney disease.",
    category: "Creatine",
    keywords: ["creatine", "kidney", "damage", "safe"]
  },
  {
    question: "Can teenagers take creatine?",
    answer: "Yes with supervision.",
    explanation: "Safe but should be monitored.",
    category: "Creatine",
    keywords: ["creatine", "teenager", "teen", "young", "age"]
  },
  {
    question: "Does creatine increase testosterone?",
    answer: "No.",
    explanation: "Effects are on ATP, not hormones.",
    category: "Creatine",
    keywords: ["creatine", "testosterone", "hormones", "boost"]
  },
  {
    question: "Is creatine a steroid?",
    answer: "No.",
    explanation: "It's an amino acid compound found in food.",
    category: "Creatine",
    keywords: ["creatine", "steroid", "illegal", "drug"]
  },
  {
    question: "Can women take creatine?",
    answer: "Yes.",
    explanation: "Same benefits as men.",
    category: "Creatine",
    keywords: ["creatine", "women", "female", "girls"]
  },
  {
    question: "Can creatine and protein be taken together?",
    answer: "Yes.",
    explanation: "No interactions.",
    category: "Creatine",
    keywords: ["creatine", "protein", "together", "mix", "combine"]
  },
  {
    question: "Do you lose muscle after stopping creatine?",
    answer: "No.",
    explanation: "Only water weight reduces.",
    category: "Creatine",
    keywords: ["creatine", "stop", "quit", "muscle loss", "after"]
  },
  {
    question: "Is creatine good for fat loss?",
    answer: "Indirectly.",
    explanation: "Maintains strength during caloric deficit.",
    category: "Creatine",
    keywords: ["creatine", "fat loss", "cutting", "weight loss"]
  },
  {
    question: "Should creatine be cycled?",
    answer: "No.",
    explanation: "Safe to use year-round.",
    category: "Creatine",
    keywords: ["creatine", "cycle", "cycling", "break"]
  },
  {
    question: "Does creatine help endurance?",
    answer: "Slightly.",
    explanation: "Mostly affects short high-intensity efforts.",
    category: "Creatine",
    keywords: ["creatine", "endurance", "cardio", "stamina"]
  },
  {
    question: "Is micronized creatine better?",
    answer: "Mixes better, same effect.",
    explanation: "Only improves solubility.",
    category: "Creatine",
    keywords: ["creatine", "micronized", "type", "better"]
  },

  // PRE-WORKOUTS (41-60)
  {
    question: "What does pre-workout do?",
    answer: "Boosts energy and focus.",
    explanation: "Mainly from caffeine and nitric oxide boosters.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "preworkout", "energy", "focus"]
  },
  {
    question: "Is caffeine safe?",
    answer: "Yes (200–400mg/day).",
    explanation: "Beyond that can cause jitters.",
    category: "Pre-Workout",
    keywords: ["caffeine", "safe", "amount", "dosage"]
  },
  {
    question: "Why do pre-workouts cause crashes?",
    answer: "High caffeine.",
    explanation: "Sudden drop after stimulation wears off.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "crash", "tired", "energy drop"]
  },
  {
    question: "Can beginners use pre-workout?",
    answer: "Yes, start with half scoop.",
    explanation: "To avoid overstimulation.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "beginner", "start", "new"]
  },
  {
    question: "Does pre-workout affect sleep?",
    answer: "Yes.",
    explanation: "Caffeine stays in body for 6 hours.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "sleep", "insomnia", "night"]
  },
  {
    question: "Why do I get tingles from pre-workout?",
    answer: "Beta-alanine.",
    explanation: "A harmless nerve response.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "tingles", "tingling", "beta-alanine", "itchy"]
  },
  {
    question: "Purpose of pump pre-workouts?",
    answer: "Increase blood flow.",
    explanation: "Nitric oxide improves vascularity.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "pump", "blood flow", "vascularity"]
  },
  {
    question: "Can you use pre-workout daily?",
    answer: "Yes but avoid dependence.",
    explanation: "Cycling caffeine helps tolerance.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "daily", "everyday", "frequency"]
  },
  {
    question: "Does pre-workout burn fat?",
    answer: "Slightly.",
    explanation: "Caffeine boosts calorie burn.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "fat burn", "weight loss", "thermogenic"]
  },
  {
    question: "Can pre-workout affect heart rate?",
    answer: "Yes.",
    explanation: "Stimulants elevate heart rate.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "heart", "heart rate", "pulse"]
  },
  {
    question: "Are non-stim pre-workouts effective?",
    answer: "Yes.",
    explanation: "Pumps and endurance improve without caffeine.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "non-stim", "stimulant-free", "caffeine-free"]
  },
  {
    question: "Should teens use pre-workout?",
    answer: "Not recommended.",
    explanation: "Nervous system still developing.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "teenager", "teen", "young"]
  },
  {
    question: "Does pre-workout dehydrate?",
    answer: "Slightly.",
    explanation: "Caffeine increases fluid loss.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "dehydration", "water", "thirsty"]
  },
  {
    question: "Can tingles be reduced?",
    answer: "Use half scoop.",
    explanation: "Less beta-alanine = fewer tingles.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "tingles", "reduce", "less"]
  },
  {
    question: "Is coffee same as pre-workout?",
    answer: "Similar but weaker.",
    explanation: "Coffee lacks pump ingredients.",
    category: "Pre-Workout",
    keywords: ["coffee", "pre-workout", "caffeine", "difference"]
  },
  {
    question: "Take pre-workout on empty stomach?",
    answer: "Yes, stronger effect.",
    explanation: "Faster absorption.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "empty stomach", "fasted", "timing"]
  },
  {
    question: "Why do some feel nauseous from pre-workout?",
    answer: "Too strong or taken with food.",
    explanation: "Caffeine overload can upset stomach.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "nauseous", "nausea", "sick", "stomach"]
  },
  {
    question: "How long does pre-workout last?",
    answer: "1.5–3 hours.",
    explanation: "Based on caffeine metabolism.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "duration", "how long", "last"]
  },
  {
    question: "Is pre-workout addictive?",
    answer: "Not chemically.",
    explanation: "But caffeine habit can form.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "addictive", "addiction", "dependent"]
  },
  {
    question: "Is pre-workout necessary?",
    answer: "No.",
    explanation: "It's only a performance booster.",
    category: "Pre-Workout",
    keywords: ["pre-workout", "necessary", "need", "required"]
  },

  // VITAMINS, MINERALS, HEALTH (61-80)
  {
    question: "What does fish oil do?",
    answer: "Reduces inflammation.",
    explanation: "Omega-3 improves joint and heart health.",
    category: "Vitamins & Health",
    keywords: ["fish oil", "omega-3", "inflammation", "joints"]
  },
  {
    question: "Benefits of multivitamins?",
    answer: "Cover nutrient gaps.",
    explanation: "Helps people with poor diets.",
    category: "Vitamins & Health",
    keywords: ["multivitamin", "vitamins", "nutrients", "health"]
  },
  {
    question: "Does vitamin D boost testosterone?",
    answer: "Only if deficient.",
    explanation: "Normal levels don't increase further.",
    category: "Vitamins & Health",
    keywords: ["vitamin d", "testosterone", "boost", "hormones"]
  },
  {
    question: "Are supplements needed if diet is perfect?",
    answer: "No.",
    explanation: "Supplements only support deficiencies.",
    category: "Vitamins & Health",
    keywords: ["supplements", "diet", "necessary", "need"]
  },
  {
    question: "Does magnesium help sleep?",
    answer: "Yes.",
    explanation: "It relaxes the nervous system.",
    category: "Vitamins & Health",
    keywords: ["magnesium", "sleep", "insomnia", "rest"]
  },
  {
    question: "What does zinc do?",
    answer: "Supports immunity & hormones.",
    explanation: "Important for metabolism functions.",
    category: "Vitamins & Health",
    keywords: ["zinc", "immunity", "immune", "hormones"]
  },
  {
    question: "Should athletes take omega-3?",
    answer: "Yes.",
    explanation: "Reduces muscle soreness.",
    category: "Vitamins & Health",
    keywords: ["omega-3", "athletes", "recovery", "soreness"]
  },
  {
    question: "Can too many vitamins be harmful?",
    answer: "Yes.",
    explanation: "Fat-soluble vitamins accumulate in body.",
    category: "Vitamins & Health",
    keywords: ["vitamins", "overdose", "too much", "harmful"]
  },
  {
    question: "Best time for multivitamin?",
    answer: "Morning with food.",
    explanation: "Increases absorption.",
    category: "Vitamins & Health",
    keywords: ["multivitamin", "timing", "when", "take"]
  },
  {
    question: "Are gummy vitamins good?",
    answer: "Yes but sugary.",
    explanation: "Nutrients same, but adds calories.",
    category: "Vitamins & Health",
    keywords: ["gummy", "vitamins", "good", "effective"]
  },
  {
    question: "Does B12 give energy?",
    answer: "Only if deficient.",
    explanation: "Healthy people won't see boost.",
    category: "Vitamins & Health",
    keywords: ["b12", "vitamin b12", "energy", "boost"]
  },
  {
    question: "Does vitamin C help recovery?",
    answer: "Yes.",
    explanation: "Reduces oxidative stress.",
    category: "Vitamins & Health",
    keywords: ["vitamin c", "recovery", "immune", "antioxidant"]
  },
  {
    question: "Can supplements replace veggies?",
    answer: "No.",
    explanation: "Veggies provide fiber & phytonutrients.",
    category: "Vitamins & Health",
    keywords: ["supplements", "vegetables", "replace", "food"]
  },
  {
    question: "Who needs iron supplements?",
    answer: "Mostly women & anemic people.",
    explanation: "Men rarely deficient.",
    category: "Vitamins & Health",
    keywords: ["iron", "anemia", "women", "deficiency"]
  },
  {
    question: "Does calcium help muscle strength?",
    answer: "Yes.",
    explanation: "Helps muscle contraction.",
    category: "Vitamins & Health",
    keywords: ["calcium", "muscle", "strength", "bones"]
  },
  {
    question: "Are herbal supplements safe?",
    answer: "Yes if verified.",
    explanation: "Quality control matters.",
    category: "Vitamins & Health",
    keywords: ["herbal", "supplements", "safe", "natural"]
  },
  {
    question: "Does ashwagandha reduce stress?",
    answer: "Yes.",
    explanation: "Lowers cortisol levels.",
    category: "Vitamins & Health",
    keywords: ["ashwagandha", "stress", "cortisol", "anxiety"]
  },
  {
    question: "Can vitamin overdose harm liver?",
    answer: "Yes, especially vitamin A.",
    explanation: "Toxic when overconsumed.",
    category: "Vitamins & Health",
    keywords: ["vitamins", "overdose", "liver", "toxic"]
  },
  {
    question: "Do electrolytes help workouts?",
    answer: "Yes.",
    explanation: "Replace sodium and potassium lost in sweat.",
    category: "Vitamins & Health",
    keywords: ["electrolytes", "workout", "hydration", "sodium"]
  },
  {
    question: "Are health supplements mandatory?",
    answer: "No.",
    explanation: "Nutrition-first approach is best.",
    category: "Vitamins & Health",
    keywords: ["supplements", "mandatory", "necessary", "required"]
  },

  // FAT BURNERS, BCAAs, OTHER (81-100)
  {
    question: "Do fat burners work?",
    answer: "Slightly.",
    explanation: "They increase calorie burn but diet is key.",
    category: "Fat Burners & Other",
    keywords: ["fat burner", "weight loss", "thermogenic", "work"]
  },
  {
    question: "Is caffeine main fat-burner ingredient?",
    answer: "Yes.",
    explanation: "It boosts thermogenesis.",
    category: "Fat Burners & Other",
    keywords: ["caffeine", "fat burner", "ingredient", "thermogenic"]
  },
  {
    question: "Do fat burners cause side effects?",
    answer: "Yes.",
    explanation: "High stimulants can cause jitters and anxiety.",
    category: "Fat Burners & Other",
    keywords: ["fat burner", "side effects", "jitters", "anxiety"]
  },
  {
    question: "Should beginners use fat burners?",
    answer: "No.",
    explanation: "Build habits first.",
    category: "Fat Burners & Other",
    keywords: ["fat burner", "beginner", "start", "new"]
  },
  {
    question: "Are BCAAs effective?",
    answer: "Only if protein intake is low.",
    explanation: "Whey already contains BCAAs.",
    category: "Fat Burners & Other",
    keywords: ["bcaa", "effective", "work", "amino acids"]
  },
  {
    question: "Best time for BCAAs?",
    answer: "During workouts.",
    explanation: "Helps reduce muscle breakdown slightly.",
    category: "Fat Burners & Other",
    keywords: ["bcaa", "timing", "when", "workout"]
  },
  {
    question: "Are EAAs better than BCAAs?",
    answer: "Yes.",
    explanation: "EAAs contain all essential amino acids.",
    category: "Fat Burners & Other",
    keywords: ["eaa", "bcaa", "better", "amino acids"]
  },
  {
    question: "Are mass gainers healthy?",
    answer: "Yes for hard gainers.",
    explanation: "Provides high calories in shake form.",
    category: "Fat Burners & Other",
    keywords: ["mass gainer", "weight gain", "bulk", "calories"]
  },
  {
    question: "Do mass gainers cause fat gain?",
    answer: "Yes if calorie surplus is high.",
    explanation: "Excess calories = stored fat.",
    category: "Fat Burners & Other",
    keywords: ["mass gainer", "fat gain", "weight", "calories"]
  },
  {
    question: "Does glutamine work?",
    answer: "Not for muscle.",
    explanation: "More effective for gut health.",
    category: "Fat Burners & Other",
    keywords: ["glutamine", "work", "effective", "muscle"]
  },
  {
    question: "What does L-carnitine do?",
    answer: "Small fat metabolism support.",
    explanation: "Works better in deficient individuals.",
    category: "Fat Burners & Other",
    keywords: ["l-carnitine", "carnitine", "fat", "metabolism"]
  },
  {
    question: "Is collagen good for joints?",
    answer: "Yes.",
    explanation: "Supports cartilage repair.",
    category: "Fat Burners & Other",
    keywords: ["collagen", "joints", "cartilage", "recovery"]
  },
  {
    question: "Does HMB help build muscle?",
    answer: "Slightly for beginners.",
    explanation: "Helps prevent muscle breakdown.",
    category: "Fat Burners & Other",
    keywords: ["hmb", "muscle", "build", "growth"]
  },
  {
    question: "Are supplements necessary for beginners?",
    answer: "Not mandatory.",
    explanation: "Food can cover basics.",
    category: "Fat Burners & Other",
    keywords: ["supplements", "beginner", "necessary", "start"]
  },
  {
    question: "Should supplements be taken on rest days?",
    answer: "Protein/creatine yes.",
    explanation: "Recovery still happens on rest days.",
    category: "Fat Burners & Other",
    keywords: ["supplements", "rest day", "off day", "recovery"]
  },
  {
    question: "Can supplements replace diet?",
    answer: "No.",
    explanation: "They only add missing nutrients.",
    category: "Fat Burners & Other",
    keywords: ["supplements", "diet", "replace", "food"]
  },
  {
    question: "Can you mix supplements?",
    answer: "Yes.",
    explanation: "Most combine safely (protein + creatine + pre).",
    category: "Fat Burners & Other",
    keywords: ["mix", "combine", "stack", "together"]
  },
  {
    question: "Are cheap brands safe?",
    answer: "Only if third-party tested.",
    explanation: "Testing prevents contamination.",
    category: "Fat Burners & Other",
    keywords: ["cheap", "brands", "safe", "quality"]
  },
  {
    question: "How long until supplements show results?",
    answer: "2–8 weeks.",
    explanation: "Depends on supplement type.",
    category: "Fat Burners & Other",
    keywords: ["results", "how long", "time", "work"]
  },
  {
    question: "Best supplement stack for beginners?",
    answer: "Whey + Creatine + Multivitamin (optional).",
    explanation: "Covers recovery, strength and nutrition basics efficiently.",
    category: "Fat Burners & Other",
    keywords: ["stack", "beginner", "best", "start", "combination"]
  }
];
