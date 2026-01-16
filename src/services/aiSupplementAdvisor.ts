import OpenAI from 'openai';
import { supplementQAs } from '../data/supplementsData';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are a knowledgeable and friendly supplement advisor for a fitness app. Your role is to:

1. Answer questions about supplements (whey protein, creatine, BCAA, multivitamins, pre-workout, L-arginine, L-carnitine, omega-3)
2. Provide safe, evidence-based advice
3. Correct spelling mistakes and understand typos (e.g., "cratine" → "creatine", "protien" → "protein")
4. Always prioritize user safety
5. Recommend consulting doctors for medical conditions
6. Warn against steroid use
7. Explain dosages, timing, and interactions
8. Be conversational and supportive

IMPORTANT SAFETY RULES:
- Always emphasize that supplements are ADD-ONS, not meal replacements
- Warn about checking creatinine levels before creatine use
- Mention hydration importance
- Advise consulting doctors for pre-existing conditions
- NEVER recommend steroids or illegal substances
- Correct dangerous misconceptions immediately

Keep responses concise (2-4 sentences) unless detailed explanation is requested.
Use emojis occasionally to be friendly: 💪 🥛 ⚠️ ✅ 💊

If user asks about steroids, firmly explain the dangers and redirect to safe supplements.`;

export async function getSupplementAdvice(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 300,
      presence_penalty: 0.6,
      frequency_penalty: 0.3
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';
  } catch (error: any) {
    console.log('Chatbot service unavailable, using knowledge base...', error?.status);
    
    // ALWAYS try fallback response first - this is the main feature!
    const fallback = getFallbackResponse(userMessage);
    if (fallback) {
      console.log('✅ Found answer in knowledge base for:', userMessage);
      return fallback;
    }
    
    // Only throw error if no fallback found
    console.log('❌ No fallback found for:', userMessage);
    throw new Error('💡 Try asking about specific supplements like:\n• "what is whey protein"\n• "when to take creatine"\n• "do i need bcaa"\n• "pre workout side effects"\n• "best supplement for muscle"');
  }
}

// Common typo corrections
export function correctSupplementTypos(text: string): string {
  const corrections: Record<string, string> = {
    'protien': 'protein',
    'protine': 'protein',
    'cratine': 'creatine',
    'creatien': 'creatine',
    'cratien': 'creatine',
    'bcaa': 'BCAA',
    'bcaas': 'BCAAs',
    'preworkout': 'pre-workout',
    'pre workout': 'pre-workout',
    'multivitamin': 'multivitamin',
    'multi vitamin': 'multivitamin',
    'omega3': 'omega-3',
    'omega 3': 'omega-3',
    'l arginine': 'L-arginine',
    'larginine': 'L-arginine',
    'l carnitine': 'L-carnitine',
    'lcarnitine': 'L-carnitine',
    'steriod': 'steroid',
    'steriods': 'steroids',
    'suppliment': 'supplement',
    'suppliments': 'supplements',
    'dosege': 'dosage',
    'doasge': 'dosage'
  };

  let correctedText = text;
  Object.entries(corrections).forEach(([typo, correct]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    correctedText = correctedText.replace(regex, correct);
  });

  return correctedText;
}

// Comprehensive fallback knowledge base (50+ Q&As)
const supplementKnowledge: Record<string, string[]> = {
  // WHEY PROTEIN (Questions 1-10)
  'what is whey': ['🥛 Whey protein is a fast-digesting protein made from milk during cheese production. It contains all essential amino acids needed for muscle growth and recovery.'],
  'why whey': ['💪 Whey protein is used for muscle growth, recovery after workouts, and meeting daily protein requirements. It helps repair muscle tissue damaged during exercise.'],
  'when whey|when to take whey|whey timing': ['⏰ Best time: 30-60 minutes post-workout for optimal recovery. Can also be taken in the morning, between meals, or before bed. 1-2 scoops (20-30g) per serving.'],
  'whey safe|is whey safe': ['✅ Yes, whey protein is safe when used within recommended limits (1-2 scoops daily). It\'s one of the most researched supplements with decades of safety data.'],
  'whey daily|whey everyday': ['✅ Yes, whey protein can be taken daily depending on your protein needs. Calculate: 1.6-2.2g protein per kg bodyweight, then fill gaps with whey.'],
  'whey fat|whey weight gain': ['❌ No, whey protein doesn\'t cause fat gain unless you consume excess calories. It actually helps with fat loss by increasing satiety and preserving muscle.'],
  'lactose whey|lactose intolerant whey': ['🥛 Lactose intolerant people should use whey isolate (90%+ protein, minimal lactose) instead of whey concentrate. Isolate is easier to digest.'],
  'how much whey|whey dosage': ['💊 Take 1-2 scoops (20-40g) daily based on your protein requirement. Don\'t exceed 3 scoops per day. Whole food protein should be your primary source.'],
  'whey kidney|whey damage kidney': ['⚠️ No, whey protein doesn\'t damage kidneys in healthy individuals. However, if you have pre-existing kidney issues, consult a doctor before use.'],
  'isolate concentrate|isolate vs concentrate|difference isolate': ['🥛 Whey Isolate: 90%+ protein, low lactose/fat, faster absorption, more expensive. Whey Concentrate: 70-80% protein, some lactose/fat, cheaper. Choose isolate if lactose intolerant!'],
  
  // CREATINE (Questions 11-20)
  'what is creatine': ['⚡ Creatine is a natural compound found in muscles that increases strength, power, and muscle mass by boosting ATP (energy) production during high-intensity exercise.'],
  'how creatine work|creatine work': ['🔋 Creatine works by increasing phosphocreatine stores in muscles, which helps regenerate ATP (cellular energy) faster during intense workouts, improving strength and power output.'],
  'how much creatine|creatine dosage': ['💊 Take 3-5 grams daily. No loading phase needed (though 20g for 5-7 days can saturate muscles faster). Consistent daily use is key.'],
  'when creatine|when to take creatine|creatine timing': ['⏰ Anytime works! Post-workout with carbs is common for better absorption. Consistency matters more than timing. Take it daily, even on rest days.'],
  'creatine safe|is creatine safe': ['✅ Yes, creatine is one of the most researched and safest supplements. Decades of studies show it\'s safe for healthy individuals when used properly.'],
  'creatine water|water retention creatine': ['💧 Yes, creatine causes water retention INSIDE muscle cells (not under skin), making muscles look fuller. This is beneficial, not bloating. Drink 3-4L water daily.'],
  'creatine kidney|creatine damage kidney': ['⚠️ No, creatine doesn\'t damage kidneys in healthy people. However, get creatinine levels checked before starting if you have kidney concerns. Stay hydrated!'],
  'creatine loading|loading phase': ['🔄 Loading phase (20g for 5-7 days) is optional. You can skip it and take 3-5g daily - muscles will saturate in 3-4 weeks instead of 1 week.'],
  'how long creatine work|creatine results': ['📅 Creatine takes 1-3 weeks to show results (faster with loading). You\'ll notice increased strength, power, and muscle fullness. Effects are cumulative.'],
  'mix creatine whey|creatine with whey': ['✅ Yes, completely safe to mix creatine with whey protein! Many people add 5g creatine to their post-workout shake. No negative interactions.'],
  
  // BCAA (Questions 21-25)
  'what is bcaa|what are bcaa': ['🔤 BCAAs are Branched-Chain Amino Acids: Leucine, Isoleucine, and Valine. They\'re essential amino acids that help reduce muscle soreness and improve recovery.'],
  'why bcaa|bcaa use': ['💪 BCAAs are used to reduce muscle soreness (DOMS), improve recovery, prevent muscle breakdown during fasted training, and enhance endurance during long workouts.'],
  'need bcaa|bcaa necessary|bcaa with whey': ['🤔 Usually NO if you take whey protein! Whey already contains BCAAs. Only useful if training fasted or doing very long workouts. Save your money for whole protein.'],
  'when bcaa|when to take bcaa|bcaa timing': ['⏰ Take BCAAs (5-10g) during or before workouts, especially if training fasted. If you eat protein regularly, BCAAs aren\'t necessary.'],
  'bcaa safe|are bcaa safe': ['✅ Yes, BCAAs are safe for most people. They\'re just amino acids found in protein foods. No major side effects reported in research.'],
  
  // PRE-WORKOUT (Questions 26-30)
  'what is pre workout|what is preworkout': ['⚡ Pre-workout is a supplement blend that boosts energy, focus, and performance. Contains caffeine, beta-alanine, citrulline, and other ingredients for better workouts.'],
  'tingling pre workout|why tingling|beta alanine': ['🔥 Tingling (paresthesia) is caused by beta-alanine, a harmless ingredient that improves endurance. It\'s completely safe and fades after 30-60 minutes.'],
  'pre workout safe|preworkout daily': ['⚠️ Pre-workout is safe but better to limit use due to caffeine (150-300mg per serving). Don\'t take daily to avoid tolerance. Cycle it: 5 days on, 2 days off.'],
  'beginner pre workout|should beginners': ['🆕 Beginners don\'t need pre-workout initially. Focus on proper form, consistency, and nutrition first. If needed, start with half dose to assess tolerance.'],
  'pre workout empty stomach|preworkout fasted': ['🤔 Yes, you can take pre-workout on empty stomach, but it may cause jitteriness or nausea. Try with a light snack (banana) if sensitive.'],
  
  // L-ARGININE (Questions 31-35)
  'what is arginine|what is l-arginine': ['💪 L-arginine is an amino acid that increases nitric oxide production, improving blood flow to muscles for better pumps, nutrient delivery, and endurance.'],
  'arginine help|what does arginine': ['🔥 L-arginine helps with better muscle pumps, improved blood flow, enhanced nutrient delivery to muscles, and potentially better endurance during workouts.'],
  'when arginine|when to take arginine|arginine timing': ['⏰ Take L-arginine 30-45 minutes before workout on empty stomach for best absorption. Typical dose: 3-6 grams. Can also take before bed for growth hormone support.'],
  'arginine safe|is arginine safe': ['✅ Yes, L-arginine is safe in normal doses (3-6g). May cause mild stomach upset in some people. Avoid if you have herpes (can trigger outbreaks).'],
  'arginine pre workout|combine arginine': ['✅ Yes, L-arginine can be combined with pre-workout, but many pre-workouts already contain citrulline (converts to arginine). Check labels to avoid excessive stimulants.'],
  
  // L-CARNITINE (Questions 36-40)
  'what is carnitine|l-carnitine use': ['🔥 L-carnitine is used for fat metabolism and energy production. It helps transport fatty acids into cells to be burned for energy during exercise.'],
  'carnitine burn fat|does carnitine work': ['💪 L-carnitine helps with fat metabolism but only works with proper diet and exercise. It\'s not a magic fat burner - you still need calorie deficit and training!'],
  'when carnitine|when to take carnitine|carnitine timing': ['⏰ Take L-carnitine before cardio sessions or with meals. Typical dose: 500-2000mg. Works best when combined with exercise and proper nutrition.'],
  'carnitine safe|is carnitine safe': ['✅ Yes, L-carnitine is generally safe. May cause mild nausea or fishy body odor in some people. Start with lower dose to assess tolerance.'],
  'carnitine energy|does carnitine give energy': ['⚡ L-carnitine provides mild energy boost by improving fat utilization for fuel. Not a stimulant like caffeine, but helps with sustained energy during longer workouts.'],
  
  // MULTIVITAMINS (Questions 41-45)
  'what are multivitamins|multivitamin for': ['💊 Multivitamins fill nutritional gaps in your diet, providing essential vitamins and minerals needed for energy, metabolism, immune function, and overall health.'],
  'gym multivitamin|should gym goers': ['✅ Yes, gym-goers benefit from multivitamins as intense training increases nutrient needs. Helps with energy production, muscle recovery, and immune system support.'],
  'when multivitamin|when to take multivitamin': ['⏰ Take multivitamins after breakfast with food for better absorption. Fat-soluble vitamins (A, D, E, K) need dietary fat to absorb properly.'],
  'multivitamin safe|multivitamin daily': ['✅ Yes, multivitamins are safe for daily use. Stick to recommended dose - more isn\'t better! Choose reputable brands with third-party testing.'],
  'multivitamin muscle|multivitamin growth': ['💪 Multivitamins don\'t directly build muscle but support growth indirectly by ensuring optimal metabolism, energy production, and recovery. They\'re foundational support.'],
  
  // GENERAL SUPPLEMENT Q&A (Questions 46-50)
  'beginner supplement|supplements necessary': ['🆕 Beginners don\'t need many supplements initially. Focus on: proper diet, consistent training, and sleep first. Start with whey protein if needed, then add creatine.'],
  'supplement replace food|supplements instead': ['❌ NO! Supplements are ADD-ONS, not meal replacements. Whole foods provide fiber, micronutrients, and compounds supplements can\'t replicate. Food first, always!'],
  'supplement side effect|supplements dangerous': ['⚠️ Supplements have side effects only if overdosed or misused. Follow recommended doses, buy from reputable brands, and consult doctor if you have health conditions.'],
  'teenager supplement|supplements safe teenager': ['🆕 Basic supplements like whey protein can be safe for teenagers (16+) with proper diet. AVOID stimulants (pre-workout) until 18+. Focus on food and training first!'],
  'best supplement muscle|best for growth': ['🏆 Best supplements for muscle growth: 1) Whey Protein (1-2 scoops daily), 2) Creatine (3-5g daily), 3) Proper diet with calorie surplus. These two + training = results!'],
  
  // ADDITIONAL COMMON QUESTIONS
  'steroids': ['🚫 NEVER use steroids! They cause permanent damage to liver, kidneys, heart, and hormones. Illegal and banned in sports. Natural supplements + proper training + diet = great results safely. Stay natural! 💪'],
  'rest days supplement|supplements rest day': ['✅ Yes! Take creatine, omega-3, and multivitamins daily (even rest days) for consistent benefits. Skip pre-workout on rest days. Protein as needed to hit daily targets.'],
  'mix supplement|combine supplement': ['✅ Generally safe to mix: whey + creatine, pre-workout + BCAAs. ⚠️ AVOID: Multiple stimulant sources, excessive protein (max 3 scoops/day). Check labels for overlaps!'],
  'supplement hydration|water with supplement': ['💧 Stay well-hydrated with supplements! Especially with creatine (3-4L daily), pre-workout, and protein. Water helps absorption, prevents side effects, and supports performance.'],
  
  // ===== GYM & WORKOUT KNOWLEDGE =====
  
  // WORKOUT BASICS
  'how many days gym|gym frequency': ['🏋️ Beginners: 3-4 days/week. Intermediate: 4-5 days/week. Advanced: 5-6 days/week. Always include 1-2 rest days for recovery. Quality over quantity!'],
  'how long workout|workout duration': ['⏱️ Ideal workout: 45-90 minutes. Warm-up (5-10 min) + Main workout (30-60 min) + Cool-down (5-10 min). Longer isn\'t always better - focus on intensity!'],
  'best time workout|when to workout': ['🌅 Best time is when YOU can be most consistent! Morning: Higher testosterone, empty stomach. Evening: Stronger performance, warmed up. Choose what fits your schedule.'],
  'rest between sets|rest time': ['⏸️ Strength (heavy): 3-5 minutes. Hypertrophy (muscle): 60-90 seconds. Endurance (light): 30-60 seconds. Listen to your body and adjust as needed.'],
  'warm up important|why warm up': ['🔥 Warm-up prevents injury, increases blood flow, improves performance, and prepares nervous system. Do 5-10 min cardio + dynamic stretches before lifting!'],
  
  // MUSCLE BUILDING
  'how build muscle|muscle growth': ['💪 Muscle growth needs: 1) Progressive overload (increase weight/reps), 2) Protein (1.6-2.2g per kg), 3) Calorie surplus (200-500 cal), 4) Rest (7-9h sleep), 5) Consistency!'],
  'how much protein|protein requirement': ['🥩 For muscle building: 1.6-2.2g protein per kg bodyweight daily. Example: 70kg person needs 112-154g protein. Spread across 4-5 meals for best results.'],
  'progressive overload|increase weight': ['📈 Progressive overload means gradually increasing: weight lifted, reps performed, sets completed, or workout frequency. Aim to progress every 1-2 weeks for continuous gains!'],
  'muscle soreness|doms': ['😫 DOMS (Delayed Onset Muscle Soreness) is normal 24-72h after workout. Caused by micro-tears in muscles. Reduce with: proper warm-up, gradual progression, stretching, and adequate protein.'],
  'how long build muscle|muscle gain time': ['📅 Beginners: 1-2 lbs muscle/month. Intermediate: 0.5-1 lb/month. Advanced: 0.25-0.5 lb/month. Takes 6-12 months to see significant changes. Be patient and consistent!'],
  
  // FAT LOSS
  'how lose fat|fat loss': ['🔥 Fat loss formula: Calorie deficit (eat 300-500 cal below maintenance) + Strength training (preserve muscle) + Cardio (burn calories) + High protein (1.8-2.2g/kg) + Sleep (7-9h).'],
  'cardio or weights|cardio vs weights': ['⚖️ BOTH! Weights build/preserve muscle and boost metabolism. Cardio burns calories and improves heart health. Best approach: 3-4 days weights + 2-3 days cardio for fat loss.'],
  'how much cardio|cardio duration': ['🏃 For fat loss: 20-40 min, 3-5 times/week. For heart health: 150 min moderate or 75 min vigorous weekly. Don\'t overdo - excessive cardio can burn muscle!'],
  'fasted cardio|cardio empty stomach': ['🌅 Fasted cardio can work but isn\'t magic. Slightly more fat burned but total daily calories matter most. If you prefer it and have energy, go for it. Otherwise, eat first!'],
  'calorie deficit|how many calories': ['📊 Calculate maintenance calories (TDEE), then subtract 300-500 for fat loss. Lose 0.5-1% bodyweight per week. Too aggressive = muscle loss. Track and adjust weekly!'],
  
  // EXERCISE FORM & TECHNIQUE
  'proper form|exercise form': ['✅ Proper form prevents injury and maximizes gains! Key points: Control the weight, full range of motion, engage target muscle, breathe properly, no momentum/swinging. Quality > ego lifting!'],
  'mind muscle connection|feel muscle': ['🧠 Mind-muscle connection means focusing on the muscle working. Slow down reps, squeeze at peak contraction, reduce weight if needed. Better muscle activation = better growth!'],
  'full range motion|rom': ['📏 Full ROM (Range of Motion) = better muscle development and flexibility. Go from full stretch to full contraction. Partial reps have their place but shouldn\'t be your default.'],
  'breathing technique|how to breathe': ['💨 Exhale during exertion (lifting/pushing), inhale during easier phase (lowering). Example: Bench press - exhale pushing up, inhale lowering down. Never hold breath too long!'],
  'tempo training|rep speed': ['⏱️ Tempo matters! Typical: 2-3 sec lowering (eccentric), 1 sec pause, 1-2 sec lifting (concentric). Slower eccentric = more muscle damage = more growth. Control the weight!'],
  
  // WORKOUT SPLITS
  'best workout split|training split': ['📋 Popular splits: PPL (Push/Pull/Legs), Upper/Lower, Bro Split, Full Body. Beginners: Full body 3x/week. Intermediate: Upper/Lower or PPL. Advanced: PPL or Bro split. Choose what you enjoy!'],
  'push pull legs|ppl': ['💪 PPL Split: Push (chest/shoulders/triceps), Pull (back/biceps), Legs (quads/hamstrings/calves). Do 2x/week = 6 days training. Great for intermediate/advanced lifters!'],
  'full body workout|full body': ['🏋️ Full Body: Train all major muscles each session, 3x/week. Perfect for beginners! Allows more recovery, builds strength foundation, and teaches proper form. Progress to splits later.'],
  'upper lower split': ['⚖️ Upper/Lower: Upper body (chest/back/shoulders/arms) and Lower body (legs/glutes) alternating. Do 4x/week. Great balance of frequency and recovery for intermediate lifters!'],
  
  // SPECIFIC EXERCISES
  'how to squat|squat form': ['🦵 Squat form: Feet shoulder-width, toes slightly out, chest up, core tight. Sit back like a chair, knees track over toes, go to parallel or below. Drive through heels to stand. King of exercises!'],
  'how to deadlift|deadlift form': ['💪 Deadlift form: Feet hip-width, bar over mid-foot, grip outside legs, chest up, back flat. Push floor away with legs, hinge at hips, stand tall. Best full-body exercise!'],
  'how to bench press|bench form': ['🏋️ Bench press form: Lie flat, feet on floor, arch lower back slightly, grip slightly wider than shoulders. Lower to chest, press up explosively. Retract shoulder blades throughout!'],
  'pull ups|how to do pull ups': ['💪 Pull-ups: Hang from bar, hands shoulder-width, pull until chin over bar, lower with control. Can\'t do one? Start with: negatives, assisted pull-ups, or lat pulldowns. Build up gradually!'],
  'push ups|how to do push ups': ['👊 Push-ups: Hands shoulder-width, body straight line, lower chest to ground, push back up. Keep core tight, don\'t sag hips. Can\'t do regular? Start with: knee push-ups or incline push-ups!'],
  
  // RECOVERY & REST
  'importance rest|why rest days': ['😴 Rest days are when muscles GROW! Training breaks down muscle, rest rebuilds it stronger. Take 1-2 rest days/week. Active recovery (walking, stretching) is great too!'],
  'how much sleep|sleep for muscle': ['💤 Sleep 7-9 hours for optimal muscle growth and recovery. During sleep: Growth hormone released, muscles repair, energy restored. Poor sleep = poor gains. Make it a priority!'],
  'overtraining|too much gym': ['⚠️ Overtraining signs: Constant fatigue, decreased performance, mood changes, frequent illness, insomnia, loss of appetite. Solution: Take a deload week, reduce volume, prioritize sleep!'],
  'deload week|what is deload': ['📉 Deload week: Reduce training volume/intensity by 40-50% every 4-8 weeks. Allows full recovery, prevents overtraining, and prepares body for next training block. Don\'t skip it!'],
  'stretching|when to stretch': ['🧘 Dynamic stretching BEFORE workout (leg swings, arm circles). Static stretching AFTER workout (hold 30 sec). Improves flexibility, reduces injury risk, aids recovery. Do it daily!'],
  
  // NUTRITION BASICS
  'macros|what are macros': ['🍽️ Macros = Macronutrients: Protein (4 cal/g) - builds muscle. Carbs (4 cal/g) - provides energy. Fats (9 cal/g) - hormones & health. Balance all three for best results!'],
  'meal timing|when to eat': ['⏰ Meal timing matters less than total daily intake. Eat protein every 3-4 hours (4-5 meals). Pre-workout: Carbs + protein 1-2h before. Post-workout: Protein + carbs within 2h.'],
  'cheat meal|refeed': ['🍕 Cheat meal once/week is fine for sanity! Or do refeed day (higher carbs, same protein). Helps leptin levels, boosts metabolism, and makes diet sustainable. Don\'t binge - enjoy mindfully!'],
  'water intake|how much water': ['💧 Drink 3-4 liters daily, more if training hard or taking creatine. Signs of good hydration: Clear/pale urine, good energy, no headaches. Water is crucial for performance!'],
  'meal prep|food prep': ['🥘 Meal prep saves time and ensures you hit macros! Prep 2-3 days worth: Cook protein (chicken, fish), carbs (rice, potatoes), veggies. Store in containers. Consistency made easy!'],
  
  // BEGINNER ADVICE
  'beginner workout|start gym': ['🆕 Beginner tips: 1) Learn proper form first, 2) Start with full-body 3x/week, 3) Focus on compound exercises, 4) Progressive overload gradually, 5) Be consistent for 3 months minimum!'],
  'compound exercises|what are compounds': ['🏋️ Compound exercises work multiple muscles: Squat, Deadlift, Bench Press, Overhead Press, Pull-ups, Rows. Build these first! More efficient than isolation exercises for beginners.'],
  'gym intimidation|scared of gym': ['😊 Everyone starts somewhere! Tips: Go during off-peak hours, bring a friend, hire a trainer for 1-2 sessions, watch form videos, remember everyone is focused on themselves. You got this!'],
  'how start|where to start': ['🎯 Start here: 1) Set clear goal (muscle/fat loss), 2) Choose 3-4 day program, 3) Learn basic exercises, 4) Track workouts, 5) Fix diet (protein + calories), 6) Be consistent 12 weeks!'],
  
  // MOTIVATION & MINDSET
  'stay motivated|motivation': ['🔥 Motivation fades, discipline stays! Tips: Set specific goals, track progress (photos, measurements), find workout buddy, join community, remember your "why", celebrate small wins!'],
  'no progress|plateau': ['📊 Plateau solutions: 1) Increase training volume, 2) Change exercise selection, 3) Check diet (enough protein/calories?), 4) Improve sleep, 5) Take deload week, 6) Be patient - progress isn\'t linear!'],
  'consistency|how to be consistent': ['⚡ Consistency tips: 1) Schedule workouts like appointments, 2) Prepare gym bag night before, 3) Start small (3 days/week), 4) Find enjoyable exercises, 5) Track progress, 6) Don\'t aim for perfection!'],
};

export function getFallbackResponse(question: string): string | null {
  const lowerQuestion = question.toLowerCase();
  
  // FIRST: Try to match with the 100 supplement Q&As
  let bestMatch: { qa: typeof supplementQAs[0], score: number } | null = null;
  
  for (const qa of supplementQAs) {
    let score = 0;
    
    // Check if question matches exactly or very closely
    if (lowerQuestion.includes(qa.question.toLowerCase())) {
      score += 100;
    }
    
    // Check keywords
    for (const keyword of qa.keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }
    
    // Update best match if this score is higher
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { qa, score };
    }
  }
  
  // If we found a good match (score > 15), return it
  if (bestMatch && bestMatch.score > 15) {
    const { qa } = bestMatch;
    return `**${qa.answer}**\n\n${qa.explanation}\n\n💡 From supplement knowledge base`;
  }
  
  // SECOND: Try to match question with general knowledge base
  for (const [keywords, responses] of Object.entries(supplementKnowledge)) {
    const keywordList = keywords.split('|');
    
    // Check if any keyword matches the question
    for (const keyword of keywordList) {
      if (lowerQuestion.includes(keyword.trim())) {
        const response = responses[0];
        return response + '\n\n💡 Instant answer from knowledge base.';
      }
    }
  }
  
  return null;
}

// Suggested questions (covering supplements AND gym topics)
export const suggestedQuestions = [
  // Protein Supplements
  "What does whey protein do?",
  "Is whey protein safe daily?",
  "Best time to take whey?",
  "Can vegetarians take whey?",
  "Does protein powder damage kidneys?",
  "Is plant protein effective?",
  "Can protein help fat loss?",
  
  // Creatine
  "What does creatine do?",
  "Is creatine safe?",
  "Does creatine cause hair loss?",
  "Best time to take creatine?",
  "Is creatine a steroid?",
  "Can women take creatine?",
  
  // Pre-Workouts
  "What does pre-workout do?",
  "Why does pre-workout cause tingles?",
  "Does pre-workout affect sleep?",
  "Can beginners use pre-workout?",
  "Is coffee same as pre-workout?",
  
  // Vitamins & Health
  "What does fish oil do?",
  "Benefits of multivitamins?",
  "Does magnesium help sleep?",
  "Does vitamin D boost testosterone?",
  "Should athletes take omega-3?",
  
  // Fat Burners & Other
  "Do fat burners work?",
  "Are BCAAs effective?",
  "Are mass gainers healthy?",
  "What does L-carnitine do?",
  "Is collagen good for joints?",
  "Best supplement stack for beginners?",
  
  // Workout Basics
  "How many days should I go to gym?",
  "How long should a workout be?",
  "What is progressive overload?",
  "How to build muscle?",
  
  // Fat Loss
  "How to lose fat?",
  "Cardio or weights for fat loss?",
  
  // Recovery
  "Why are rest days important?",
  "How much sleep for muscle growth?"
];
