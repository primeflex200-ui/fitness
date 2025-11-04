// Personalization logic for Prime Flex
// This file contains utilities to automatically personalize workouts, diet, and supplements
// based on user's age, fitness goal, and diet type

export type AgeBasedSplit = {
  name: string;
  description: string;
  daysPerWeek: number;
  intensity: string;
  focus: string[];
  schedule: {
    day: string;
    focus: string;
  }[];
};

export type SupplementRecommendation = {
  name: string;
  description: string;
  benefits: string[];
  dosage: string;
  priority: "high" | "medium" | "low";
  warning?: string;
};

// Age-based workout split determination
export const getAgeBasedWorkoutSplit = (age: number): AgeBasedSplit => {
  if (age >= 15 && age <= 25) {
    return {
      name: "Muscle Building Intensive",
      description: "High-intensity 6-day split optimized for muscle growth and strength",
      daysPerWeek: 6,
      intensity: "High",
      focus: ["Muscle building", "Strength gains", "High intensity"],
      schedule: [
        { day: "Monday", focus: "Push (Chest, Shoulders, Triceps)" },
        { day: "Tuesday", focus: "Pull (Back, Biceps, Rear Delts)" },
        { day: "Wednesday", focus: "Legs (Quads, Hamstrings, Glutes)" },
        { day: "Thursday", focus: "Push (Chest, Shoulders, Triceps)" },
        { day: "Friday", focus: "Pull (Back, Biceps, Traps)" },
        { day: "Saturday", focus: "Legs & Core" },
        { day: "Sunday", focus: "Active Recovery / Rest" }
      ]
    };
  } else if (age >= 26 && age <= 35) {
    return {
      name: "Strength & Shape",
      description: "Balanced 5-day split for strength, aesthetics, and performance",
      daysPerWeek: 5,
      intensity: "Medium-High",
      focus: ["Strength building", "Muscle definition", "Performance"],
      schedule: [
        { day: "Monday", focus: "Chest & Triceps" },
        { day: "Tuesday", focus: "Back & Biceps" },
        { day: "Wednesday", focus: "Legs (Full)" },
        { day: "Thursday", focus: "Shoulders & Core" },
        { day: "Friday", focus: "Full Body Power" },
        { day: "Saturday", focus: "Rest or Light Cardio" },
        { day: "Sunday", focus: "Active Recovery" }
      ]
    };
  } else if (age >= 36 && age <= 45) {
    return {
      name: "Lean Muscle & Endurance",
      description: "Moderate 4-day split focusing on lean muscle and cardiovascular health",
      daysPerWeek: 4,
      intensity: "Medium",
      focus: ["Lean muscle", "Endurance", "Joint health"],
      schedule: [
        { day: "Monday", focus: "Upper Body Push" },
        { day: "Tuesday", focus: "Lower Body" },
        { day: "Wednesday", focus: "Rest or Light Cardio" },
        { day: "Thursday", focus: "Upper Body Pull" },
        { day: "Friday", focus: "Core & Conditioning" },
        { day: "Saturday", focus: "Active Recovery" },
        { day: "Sunday", focus: "Rest" }
      ]
    };
  } else if (age >= 46 && age <= 55) {
    return {
      name: "Mobility & Toning",
      description: "Gentle 3-day split emphasizing mobility, toning, and injury prevention",
      daysPerWeek: 3,
      intensity: "Low-Medium",
      focus: ["Mobility", "Muscle tone", "Joint care"],
      schedule: [
        { day: "Monday", focus: "Full Body Circuit" },
        { day: "Tuesday", focus: "Rest or Walking" },
        { day: "Wednesday", focus: "Cardio & Core" },
        { day: "Thursday", focus: "Rest or Stretching" },
        { day: "Friday", focus: "Light Resistance Training" },
        { day: "Saturday", focus: "Yoga or Pilates" },
        { day: "Sunday", focus: "Rest" }
      ]
    };
  } else {
    // 56-65+ years
    return {
      name: "Flexibility & Joint Care",
      description: "Light 3-day routine for flexibility, balance, and joint health",
      daysPerWeek: 3,
      intensity: "Low",
      focus: ["Flexibility", "Balance", "Joint health", "Injury prevention"],
      schedule: [
        { day: "Monday", focus: "Gentle Mobility & Stretching" },
        { day: "Tuesday", focus: "Rest or Light Walking" },
        { day: "Wednesday", focus: "Core Stability" },
        { day: "Thursday", focus: "Rest" },
        { day: "Friday", focus: "Yoga & Balance Work" },
        { day: "Saturday", focus: "Light Activity" },
        { day: "Sunday", focus: "Rest" }
      ]
    };
  }
};

// Diet plan mapping based on fitness goal
export const getDietPlanType = (fitnessGoal: string): string => {
  const goalMap: Record<string, string> = {
    'fat_loss': 'fatloss',
    'muscle_gain': 'bulk',
    'maintain': 'lean',
    'athletic': 'athletic'
  };
  return goalMap[fitnessGoal] || 'lean';
};

// Supplement recommendations based on age and goal
export const getSupplementRecommendations = (
  age: number, 
  fitnessGoal: string,
  isVegetarian: boolean = false
): SupplementRecommendation[] => {
  const recommendations: SupplementRecommendation[] = [];

  // Base supplements for everyone
  recommendations.push({
    name: "Multivitamin",
    description: "Daily essential vitamins and minerals",
    benefits: ["Overall health", "Immune support", "Energy levels"],
    dosage: "1 tablet daily with meal",
    priority: "high"
  });

  // Goal-specific supplements
  if (fitnessGoal === 'muscle_gain' || fitnessGoal === 'athletic') {
    recommendations.push({
      name: "Whey Protein",
      description: "Fast-absorbing protein for muscle recovery",
      benefits: ["Muscle building", "Quick absorption", "Post-workout recovery"],
      dosage: "25-30g post-workout or as meal replacement",
      priority: "high"
    });

    if (age < 40) {
      recommendations.push({
        name: "Creatine Monohydrate",
        description: "Enhances strength and power output",
        benefits: ["Strength gains", "Power output", "Muscle size"],
        dosage: "5g daily (loading phase: 20g/day for 5-7 days)",
        priority: "high",
        warning: "Check creatinine levels before use. Stay hydrated."
      });
    }

    recommendations.push({
      name: "BCAA",
      description: "Branched-chain amino acids for muscle recovery",
      benefits: ["Muscle recovery", "Reduces fatigue", "Prevents breakdown"],
      dosage: "5-10g before or during workout",
      priority: "medium"
    });
  }

  if (fitnessGoal === 'fat_loss') {
    recommendations.push({
      name: "Whey Protein (Low Carb)",
      description: "Low-calorie protein for muscle preservation during fat loss",
      benefits: ["Muscle preservation", "Satiety", "Low calories"],
      dosage: "25g as meal replacement or post-workout",
      priority: "high"
    });

    recommendations.push({
      name: "L-Carnitine",
      description: "Supports fat metabolism and energy",
      benefits: ["Fat metabolism", "Energy boost", "Endurance"],
      dosage: "1-2g before cardio",
      priority: "medium"
    });

    recommendations.push({
      name: "Green Tea Extract",
      description: "Natural metabolism booster",
      benefits: ["Metabolism support", "Antioxidants", "Energy"],
      dosage: "400-500mg daily",
      priority: "medium"
    });

    recommendations.push({
      name: "CLA (Conjugated Linoleic Acid)",
      description: "Supports body composition improvement",
      benefits: ["Fat loss support", "Lean muscle retention"],
      dosage: "3-6g daily with meals",
      priority: "low"
    });
  }

  // Age-specific supplements
  if (age >= 40) {
    recommendations.push({
      name: "Omega-3 Fish Oil",
      description: "Essential fatty acids for joint and heart health",
      benefits: ["Joint health", "Heart health", "Anti-inflammatory"],
      dosage: "1-2g EPA+DHA daily with meals",
      priority: "high"
    });

    recommendations.push({
      name: "Vitamin D3",
      description: "Crucial for bone health and immunity",
      benefits: ["Bone strength", "Immune function", "Mood support"],
      dosage: "2000-4000 IU daily",
      priority: "high"
    });

    recommendations.push({
      name: "Calcium",
      description: "Essential for bone density",
      benefits: ["Bone health", "Muscle function"],
      dosage: "1000mg daily with meals",
      priority: "medium"
    });
  }

  if (age >= 50) {
    recommendations.push({
      name: "Collagen Peptides",
      description: "Supports joint, skin, and bone health",
      benefits: ["Joint support", "Skin elasticity", "Bone health"],
      dosage: "10-15g daily",
      priority: "high"
    });

    recommendations.push({
      name: "Glucosamine & Chondroitin",
      description: "Joint support and cartilage health",
      benefits: ["Joint comfort", "Cartilage support", "Mobility"],
      dosage: "1500mg glucosamine + 1200mg chondroitin daily",
      priority: "medium"
    });

    recommendations.push({
      name: "Vitamin B12",
      description: "Energy and nerve health support",
      benefits: ["Energy levels", "Nerve function", "Mental clarity"],
      dosage: "1000mcg daily",
      priority: "medium"
    });

    recommendations.push({
      name: "Probiotics",
      description: "Digestive and immune health support",
      benefits: ["Digestive health", "Immune support", "Gut health"],
      dosage: "10-20 billion CFU daily",
      priority: "low"
    });
  }

  // For vegetarians, ensure protein alternatives
  if (isVegetarian) {
    const wheyIndex = recommendations.findIndex(s => s.name.includes("Whey"));
    if (wheyIndex !== -1) {
      recommendations[wheyIndex] = {
        ...recommendations[wheyIndex],
        name: "Plant-Based Protein (Pea/Rice/Hemp)",
        description: "Complete plant protein for muscle recovery"
      };
    }
  }

  return recommendations;
};

// Get workout level based on age
export const getWorkoutLevel = (age: number): "beginner" | "intermediate" | "pro" => {
  if (age >= 15 && age <= 25) return "pro";
  if (age >= 26 && age <= 45) return "intermediate";
  return "beginner";
};
