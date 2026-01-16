// Centralized App Features Configuration
// Update this file to automatically update the About page

export interface AppFeature {
  id: string;
  title: string;
  icon: string;
  description: string;
  howToUse: string[];
  tips?: string;
  newFeature?: boolean;
  warning?: string;
}

export interface VersionHistory {
  version: string;
  description: string;
  highlight?: boolean;
}

// App Version
export const APP_VERSION = "3.1.0";
export const BUILD_DATE = "2025.01.16";

// All App Features
export const appFeatures: AppFeature[] = [
  {
    id: "ai-diet-plan",
    title: "🤖 AI Diet Plan Generator",
    icon: "🤖",
    description: "Intelligent meal planning powered by AI",
    newFeature: true,
    howToUse: [
      "Go to Dashboard → AI Diet Plan",
      "Enter your details: Age, Weight, Height, Activity Level",
      "Select goal: Fat Loss / Muscle Gain / Maintenance / Athletic",
      "Choose diet type: Vegetarian / Non-Vegetarian",
      "Add any food allergies (e.g., dairy, nuts, gluten)",
      "Click 'Generate AI Diet Plan' - AI creates personalized meals!",
      "View 6 meals: Breakfast, Mid-Morning, Lunch, Evening, Dinner, Bedtime",
      "Each meal shows: Food items, portions, calories, protein, carbs, fats",
      "Don't like a meal? Click 'Refresh Meal' to get alternatives",
      "Save your plan and track daily progress with checkboxes"
    ],
    tips: "AI automatically calculates your calorie needs and macros based on your goals! Meal refresh feature lets you swap any meal you don't like!"
  },
  {
    id: "smart-food-search",
    title: "🔍 Smart Food Search",
    icon: "🔍",
    description: "Instant nutrition information for any food",
    newFeature: true,
    howToUse: [
      "Go to Nutrition Guide",
      "Use the Smart Food Search bar",
      "Start typing any food name (e.g., 'Paneer', 'Chicken', 'Apple')",
      "Get autocomplete suggestions from 1000+ foods database",
      "View complete nutrition: Calories, Protein, Carbs, Fats, Fiber, Vitamins, Minerals",
      "See health benefits for each food"
    ],
    tips: "Works with Indian and international foods!"
  },
  {
    id: "supplement-chatbot",
    title: "💬 Supplement Chatbot (100 Q&As)",
    icon: "💬",
    description: "Ask anything about supplements and fitness - get instant answers from 100+ expert Q&As!",
    newFeature: true,
    howToUse: [
      "Go to Nutrition Guide and scroll to Supplement Chatbot",
      "Ask questions like: 'What is whey protein?', 'When to take creatine?', 'How to build muscle?'",
      "Get instant answers from 100 comprehensive Q&As covering:",
      "  • Protein Supplements (Whey, Casein, Plant protein)",
      "  • Creatine (Safety, dosage, myths debunked)",
      "  • Pre-Workouts (Caffeine, tingles, timing)",
      "  • Vitamins & Minerals (Fish oil, multivitamins, zinc)",
      "  • Fat Burners, BCAAs, Mass Gainers",
      "  • Workout routines & training",
      "  • Muscle building strategies",
      "  • Fat loss techniques",
      "  • Exercise form & recovery",
      "Click suggested questions for quick answers",
      "Chatbot corrects typos automatically!",
      "Smart keyword matching finds relevant answers instantly"
    ],
    tips: "Works like having a personal trainer available 24/7! 100+ fitness & supplement questions answered instantly!"
  },
  {
    id: "supplements-guide",
    title: "🧃 Supplements Guide",
    icon: "🧃",
    description: "Comprehensive supplement information with safety guidelines",
    howToUse: [
      "Go to Nutrition Guide",
      "Browse detailed supplement cards with advantages & precautions",
      "Learn about: Whey Protein, Creatine, BCAAs, Pre-workout, L-Arginine, L-Carnitine, Multivitamins, Omega-3",
      "View dosage recommendations and timing",
      "See supplements vs steroids comparison",
      "Click the 💊 icon to learn why nutrition is important"
    ],
    warning: "Consult a certified nutritionist before using any supplement."
  },
  {
    id: "workout-planner",
    title: "💪 Workout Planner",
    icon: "💪",
    description: "Manage and track your daily gym workouts",
    howToUse: [
      "Open Workout Plan",
      "Pick a day (Monday–Sunday)",
      "Perform exercises listed for that day",
      "Tick ✔ after each workout",
      "View real-time completion % and strength graph updates",
      "Get motivational popups when all workouts are done"
    ],
    tips: "Tap ▶️ beside an exercise to see the proper form via Workout Videos."
  },
  {
    id: "home-workout",
    title: "🏠 Home Workout",
    icon: "🏠",
    description: "Train without equipment, anytime",
    howToUse: [
      "Open Home Workout",
      "Browse bodyweight exercises (Push-ups, Planks, Squats, etc.)",
      "Read instructions, reps, and form guides",
      "Tap ▶️ to watch a demonstration from a certified trainer"
    ],
    tips: "Perfect for home or travel workouts — progress still tracks normally."
  },
  {
    id: "calisthenics",
    title: "🤸 Calisthenics",
    icon: "🤸",
    description: "Build strength using your body weight",
    howToUse: [
      "Go to Calisthenics",
      "Select any movement (Pull-ups, Dips, Muscle-ups, etc.)",
      "Follow the step-by-step form guide",
      "Tap ▶️ beside it to watch the related trainer tutorial",
      "Move through difficulty levels over time (Beginner → Advanced)"
    ],
    tips: "Improves mobility, flexibility, and muscle control."
  },
  {
    id: "strength-tracker",
    title: "📊 Strength Tracker",
    icon: "📊",
    description: "Visualize your progress over time",
    howToUse: [
      "Open Strength Tracker",
      "Enter sets, reps, and weight after each workout",
      "The graph updates automatically (X-axis = Days / Y-axis = Weight)",
      "Displays weekly performance insights (e.g., '+15% stronger this week')",
      "Stores all progress (data stays even if you restart the app)"
    ],
    tips: "Track every lift to see how your strength evolves."
  },
  {
    id: "workout-videos",
    title: "🎥 Workout Videos",
    icon: "🎥",
    description: "Professional exercise guidance organized by muscle group",
    howToUse: [
      "Open Workout Videos",
      "Browse videos organized by sections (Chest, Back, Shoulders, Arms, Legs, Core, Cardio)",
      "Search by exercise name, category, or difficulty",
      "Tap any video card to watch it directly in the app",
      "Videos play with screen capture protection - no downloads or screenshots allowed"
    ],
    tips: "All videos are categorized by muscle groups for easy navigation and feature in-app playback."
  },
  {
    id: "progress-tracking",
    title: "📈 Progress Tracking",
    icon: "📈",
    description: "Monitor your fitness journey with detailed analytics",
    howToUse: [
      "Go to Progress page from Dashboard",
      "View your workout completion percentage",
      "Track weight changes over time with graphs",
      "See strength improvements across exercises",
      "Monitor diet adherence and calorie intake",
      "All data persists and syncs automatically"
    ],
    tips: "Take progress photos weekly to see visual changes!"
  },
  {
    id: "water-reminder",
    title: "💧 Water Reminder",
    icon: "💧",
    description: "Stay hydrated with smart recurring notifications",
    newFeature: true,
    howToUse: [
      "Go to Water Reminder page",
      "Set your daily water goal (default 2.5L)",
      "Adjust serving size per drink (default 250ml)",
      "Configure reminder interval (1-1440 minutes)",
      "Click 'Start Water Reminders' to begin notifications",
      "Get device notifications at your set intervals",
      "Track water intake with +/- buttons or custom amounts",
      "View progress bar and glass count",
      "Click 'Stop Water Reminders' to pause notifications"
    ],
    tips: "Drink 3-4 liters daily, more if training hard or taking creatine! Set reminders to 30-60 minutes for best results. Notifications work even when you navigate to other pages!"
  },
  {
    id: "cardio-training",
    title: "❤️ Cardio Training",
    icon: "❤️",
    description: "Heart health and endurance tracking",
    howToUse: [
      "Open Cardio page",
      "Choose cardio type: Running, Cycling, Swimming, HIIT",
      "Start the timer when you begin",
      "Track duration, distance, and calories burned",
      "View your cardio history and improvements",
      "Set weekly cardio goals"
    ],
    tips: "Aim for 150 min moderate or 75 min vigorous cardio weekly!"
  },
  {
    id: "mind-muscle",
    title: "🧠 Mind-Muscle Connection",
    icon: "🧠",
    description: "Focus training with music and meditation",
    howToUse: [
      "Go to Mind-Muscle page",
      "Choose focus music or guided meditation",
      "Practice visualization techniques",
      "Improve mind-muscle connection during workouts",
      "Enhance workout quality and muscle activation"
    ],
    tips: "Better mind-muscle connection = better muscle growth!"
  },
  {
    id: "age-personalization",
    title: "🧑‍⚕️ Age-Based Personalization",
    icon: "🧑‍⚕️",
    description: "Adjusts workouts and diets for users up to 65 years old",
    howToUse: [
      "Enter your age, height, and weight in your profile",
      "The app will automatically adjust calorie recommendations",
      "Modify training intensity based on age",
      "Suggest age-safe supplements"
    ],
    tips: "Updating your age or goal refreshes all recommendations instantly."
  },
  {
    id: "feedback-system",
    title: "💬 Feedback System",
    icon: "💬",
    description: "Communicate directly with developers",
    howToUse: [
      "Open Settings → Feedback or go to the Workout Videos bottom section",
      "Write your message or suggestions",
      "Submit — your feedback is securely saved for developer review"
    ],
    tips: "Use it to request new features or report issues."
  }
];

// Version History
export const versionHistory: VersionHistory[] = [
  {
    version: "v3.1.0",
    description: "💧 Smart Water Reminders + 📚 100 Supplement Q&As + 🧮 Body Fat Calculator",
    highlight: true
  },
  {
    version: "v3.0.0",
    description: "🤖 AI Diet Plan Generator + Supplement Chatbot + Smart Food Search"
  },
  {
    version: "v2.5.0",
    description: "Added Meal Refresh Feature + Allergy Management + Nutrition Benefits Dialog"
  },
  {
    version: "v2.0.0",
    description: "Added About Page + Full User Guide + Age-Based Personalization"
  },
  {
    version: "v1.5.0",
    description: "Added Fat Loss Mode with visual progress tracking"
  },
  {
    version: "v1.4.0",
    description: "Linked exercises with video tutorials"
  },
  {
    version: "v1.3.0",
    description: "Added Workout Videos integration with categories"
  },
  {
    version: "v1.2.0",
    description: "Introduced Strength Tracker with real-time graph"
  },
  {
    version: "v1.1.0",
    description: "Added Home Workout section"
  },
  {
    version: "v1.0.0",
    description: "Initial release with Diet & Workout Plans"
  }
];

// App Description
export const appDescription = `PRIME FLEX is a modern all-in-one fitness app that combines AI-powered nutrition planning, 
science-backed training, and visual progress tracking — helping you achieve your fitness goals at the gym or home. 
It adapts to your age, goals, and preferences, offering a smarter way to train, eat, and grow stronger with intelligent 
meal generation, supplement guidance, and personalized workout plans.`;

// Technology Stack
export const techStack = {
  "Frontend": "React + TypeScript",
  "Framework": "Vite",
  "Backend": "Supabase",
  "AI": "OpenAI GPT-3.5",
  "Storage": "Supabase Storage",
  "Charts": "Recharts",
  "UI": "Shadcn/UI",
  "Styling": "TailwindCSS",
  "Navigation": "React Router"
};

// Developer Credits
export const developers = [
  "Ruthvik Reddy",
  "Anurag Yadav"
];

export const vision = `To create a smart and adaptive fitness ecosystem powered by AI that helps users train smarter, 
eat better, and track real results — anywhere, anytime. Making professional fitness coaching accessible to everyone.`;

// Disclaimer
export const disclaimer = `PRIME FLEX provides general fitness education and AI-powered planning tools. 
Always consult certified trainers or doctors before following new routines or diets. 
Individual results vary depending on consistency, effort, and health conditions.`;
