import mongoose from "mongoose";
import { DietPlan } from "./server/models";

const templates = [
  {
    name: "Monday Fit Plan",
    description: "Monday High-Protein Recovery Day",
    targetCalories: 1600,
    protein: 120,
    carbs: 180,
    fats: 50,
    meals: {
      breakfast: {
        name: "Scrambled eggs with spinach & toast",
        calories: 350,
        protein: 25,
        carbs: 35,
        fats: 12,
        dishes: [
          { name: "Scrambled eggs (3)", quantity: "3 eggs" },
          { name: "Fresh spinach", quantity: "1 cup" },
          { name: "Whole-grain toast", quantity: "1 slice" },
          { name: "Black coffee", quantity: "1 cup" }
        ]
      },
      lunch: {
        name: "Grilled chicken with quinoa",
        calories: 550,
        protein: 45,
        carbs: 55,
        fats: 8,
        dishes: [
          { name: "Grilled chicken breast", quantity: "200g" },
          { name: "Quinoa", quantity: "1 cup cooked" },
          { name: "Steamed broccoli", quantity: "2 cups" }
        ]
      },
      snack: {
        name: "Banana & almonds",
        calories: 200,
        protein: 8,
        carbs: 28,
        fats: 8,
        dishes: [
          { name: "Banana", quantity: "1 medium" },
          { name: "Almonds", quantity: "10 pcs" }
        ]
      },
      dinner: {
        name: "Baked salmon with roasted vegetables",
        calories: 480,
        protein: 42,
        carbs: 30,
        fats: 18,
        dishes: [
          { name: "Baked salmon", quantity: "200g" },
          { name: "Roasted zucchini & peppers", quantity: "2 cups" },
          { name: "Mixed green salad with olive oil", quantity: "2 cups" }
        ]
      }
    }
  },
  {
    name: "Tuesday Fit Plan",
    description: "Tuesday Lean & Light",
    targetCalories: 1500,
    protein: 110,
    carbs: 170,
    fats: 45,
    meals: {
      breakfast: {
        name: "Greek yogurt with berries",
        calories: 280,
        protein: 20,
        carbs: 32,
        fats: 6,
        dishes: [
          { name: "Greek yogurt", quantity: "200g" },
          { name: "Mixed berries", quantity: "1 cup" },
          { name: "Chia seeds", quantity: "1 tbsp" }
        ]
      },
      lunch: {
        name: "Turkey wrap with fresh vegetables",
        calories: 420,
        protein: 35,
        carbs: 45,
        fats: 8,
        dishes: [
          { name: "Turkey breast", quantity: "150g" },
          { name: "Whole-grain tortilla", quantity: "1" },
          { name: "Lettuce, tomato, mustard", quantity: "1 wrap" }
        ]
      },
      snack: {
        name: "Apple & walnuts",
        calories: 220,
        protein: 6,
        carbs: 25,
        fats: 11,
        dishes: [
          { name: "Apple", quantity: "1 medium" },
          { name: "Walnuts", quantity: "handful" }
        ]
      },
      dinner: {
        name: "Stir-fried tofu with brown rice",
        calories: 450,
        protein: 22,
        carbs: 58,
        fats: 12,
        dishes: [
          { name: "Tofu or chicken", quantity: "200g" },
          { name: "Brown rice", quantity: "1 cup cooked" },
          { name: "Green beans", quantity: "1.5 cups" }
        ]
      }
    }
  },
  {
    name: "Wednesday Fit Plan",
    description: "Wednesday Power Day",
    targetCalories: 1700,
    protein: 130,
    carbs: 195,
    fats: 52,
    meals: {
      breakfast: {
        name: "Oatmeal with protein & blueberries",
        calories: 380,
        protein: 30,
        carbs: 48,
        fats: 7,
        dishes: [
          { name: "Oatmeal", quantity: "1 cup cooked" },
          { name: "Whey protein powder", quantity: "1 scoop" },
          { name: "Blueberries", quantity: "1 cup" }
        ]
      },
      lunch: {
        name: "Grilled shrimp with sweet potato",
        calories: 520,
        protein: 40,
        carbs: 62,
        fats: 6,
        dishes: [
          { name: "Grilled shrimp", quantity: "250g" },
          { name: "Sweet potato", quantity: "1 medium" },
          { name: "Side salad", quantity: "2 cups" }
        ]
      },
      snack: {
        name: "Rice cake with peanut butter",
        calories: 240,
        protein: 9,
        carbs: 26,
        fats: 10,
        dishes: [
          { name: "Rice cake", quantity: "1" },
          { name: "Peanut butter", quantity: "2 tbsp" }
        ]
      },
      dinner: {
        name: "Lean beef chili with vegetables",
        calories: 480,
        protein: 38,
        carbs: 45,
        fats: 12,
        dishes: [
          { name: "Lean beef", quantity: "200g" },
          { name: "Chili preparation", quantity: "2 cups" },
          { name: "Steamed vegetables", quantity: "2 cups" }
        ]
      }
    }
  },
  {
    name: "Thursday Fit Plan",
    description: "Thursday Balance Day",
    targetCalories: 1600,
    protein: 125,
    carbs: 180,
    fats: 48,
    meals: {
      breakfast: {
        name: "Protein smoothie bowl",
        calories: 340,
        protein: 28,
        carbs: 40,
        fats: 8,
        dishes: [
          { name: "Whey protein", quantity: "1 scoop" },
          { name: "Banana", quantity: "1" },
          { name: "Spinach", quantity: "1 cup" },
          { name: "Almond milk", quantity: "1 cup" }
        ]
      },
      lunch: {
        name: "Baked chicken with couscous",
        calories: 550,
        protein: 44,
        carbs: 58,
        fats: 10,
        dishes: [
          { name: "Baked chicken thigh", quantity: "200g" },
          { name: "Couscous", quantity: "1 cup cooked" },
          { name: "Roasted carrots", quantity: "2 cups" }
        ]
      },
      snack: {
        name: "Orange & nuts",
        calories: 210,
        protein: 7,
        carbs: 28,
        fats: 8,
        dishes: [
          { name: "Orange", quantity: "1 large" },
          { name: "Mixed nuts", quantity: "30g" }
        ]
      },
      dinner: {
        name: "Grilled white fish with vegetables",
        calories: 420,
        protein: 45,
        carbs: 25,
        fats: 14,
        dishes: [
          { name: "Grilled tilapia or cod", quantity: "250g" },
          { name: "Mixed vegetables", quantity: "2 cups" },
          { name: "Avocado slices", quantity: "1/2 avocado" }
        ]
      }
    }
  },
  {
    name: "Friday Fit Plan",
    description: "Friday Fuel Up",
    targetCalories: 1650,
    protein: 115,
    carbs: 190,
    fats: 50,
    meals: {
      breakfast: {
        name: "Veggie omelet & toast",
        calories: 360,
        protein: 24,
        carbs: 38,
        fats: 12,
        dishes: [
          { name: "Eggs", quantity: "3" },
          { name: "Onions & peppers", quantity: "1 cup" },
          { name: "Whole-grain toast", quantity: "1 slice" }
        ]
      },
      lunch: {
        name: "Tuna salad with brown rice",
        calories: 480,
        protein: 38,
        carbs: 52,
        fats: 10,
        dishes: [
          { name: "Canned tuna in olive oil", quantity: "200g" },
          { name: "Lemon juice", quantity: "1 tbsp" },
          { name: "Brown rice", quantity: "1 cup cooked" }
        ]
      },
      snack: {
        name: "Apple & cashews",
        calories: 230,
        protein: 8,
        carbs: 26,
        fats: 10,
        dishes: [
          { name: "Apple", quantity: "1 medium" },
          { name: "Cashews", quantity: "10 pcs" }
        ]
      },
      dinner: {
        name: "Chicken stir-fry with cauliflower rice",
        calories: 420,
        protein: 40,
        carbs: 28,
        fats: 14,
        dishes: [
          { name: "Chicken breast", quantity: "200g" },
          { name: "Cauliflower rice", quantity: "2 cups" },
          { name: "Green salad", quantity: "2 cups" }
        ]
      }
    }
  },
  {
    name: "Saturday Fit Plan",
    description: "Saturday Bulk Day",
    targetCalories: 1800,
    protein: 140,
    carbs: 210,
    fats: 55,
    meals: {
      breakfast: {
        name: "Cottage cheese with pineapple",
        calories: 320,
        protein: 28,
        carbs: 35,
        fats: 8,
        dishes: [
          { name: "Cottage cheese", quantity: "200g" },
          { name: "Pineapple chunks", quantity: "1 cup" },
          { name: "Almonds", quantity: "1 oz" }
        ]
      },
      lunch: {
        name: "Turkey meatballs with zoodles",
        calories: 520,
        protein: 42,
        carbs: 48,
        fats: 14,
        dishes: [
          { name: "Turkey meatballs", quantity: "250g" },
          { name: "Zucchini noodles", quantity: "3 cups" },
          { name: "Marinara sauce", quantity: "1 cup" }
        ]
      },
      snack: {
        name: "Protein bar & banana",
        calories: 250,
        protein: 12,
        carbs: 32,
        fats: 8,
        dishes: [
          { name: "Protein bar (half)", quantity: "1/2" },
          { name: "Banana", quantity: "1 small" }
        ]
      },
      dinner: {
        name: "Baked salmon with sweet potato",
        calories: 580,
        protein: 42,
        carbs: 65,
        fats: 16,
        dishes: [
          { name: "Baked salmon or tuna steak", quantity: "200g" },
          { name: "Mashed sweet potato", quantity: "1 medium" },
          { name: "Asparagus", quantity: "1.5 cups" }
        ]
      }
    }
  },
  {
    name: "Sunday Fit Plan",
    description: "Sunday Recovery",
    targetCalories: 1550,
    protein: 120,
    carbs: 175,
    fats: 48,
    meals: {
      breakfast: {
        name: "Protein pancakes with berries",
        calories: 390,
        protein: 32,
        carbs: 42,
        fats: 10,
        dishes: [
          { name: "Oats", quantity: "1 cup" },
          { name: "Egg whites", quantity: "4" },
          { name: "Whey protein", quantity: "1 scoop" },
          { name: "Strawberries", quantity: "1 cup" }
        ]
      },
      lunch: {
        name: "Chicken Caesar salad",
        calories: 480,
        protein: 44,
        carbs: 35,
        fats: 16,
        dishes: [
          { name: "Grilled chicken breast", quantity: "250g" },
          { name: "Romaine lettuce", quantity: "3 cups" },
          { name: "Caesar dressing (light)", quantity: "2 tbsp" }
        ]
      },
      snack: {
        name: "Banana & dates",
        calories: 210,
        protein: 3,
        carbs: 52,
        fats: 2,
        dishes: [
          { name: "Banana", quantity: "1 medium" },
          { name: "Dates", quantity: "3" }
        ]
      },
      dinner: {
        name: "Lean beef steak with quinoa",
        calories: 550,
        protein: 46,
        carbs: 52,
        fats: 14,
        dishes: [
          { name: "Lean beef steak or tofu", quantity: "200g" },
          { name: "Quinoa", quantity: "1 cup cooked" },
          { name: "Mixed vegetables", quantity: "2 cups" }
        ]
      }
    }
  }
];

async function insertTemplates() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://fitpro:fitpro123@localhost:27017/fitpro?authSource=admin";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    for (let i = 0; i < templates.length; i++) {
      const dietPlan = new DietPlan({
        ...templates[i],
        isTemplate: true
      });
      await dietPlan.save();
      console.log(`✅ Template ${i + 1} (${templates[i].name}) inserted: ${dietPlan._id}`);
    }

    console.log("\n✅ All 7 diet templates created successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

insertTemplates();
