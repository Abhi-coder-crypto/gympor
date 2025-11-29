import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { WorkoutPlan } from '../models';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const workoutTemplates = [
  {
    name: "Full Body Split – Beginner",
    description: "A beginner-friendly 7-day full body split designed to build strength, improve form, and develop consistent training habits. Includes 6 training days and 1 active rest day.",
    category: "general",
    difficulty: "beginner",
    durationWeeks: 4,
    isTemplate: true,
    exercises: {
      "Monday": [
        { name: "Push-Ups", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Dumbbell Bench Press", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Chest Fly (Dumbbells or Machine)", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Tricep Dips (Bench)", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Tricep Rope Pushdown", sets: 3, reps: "12-15", rest: "60s" }
      ],
      "Tuesday": [
        { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Seated Row Machine", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Dumbbell Bent-Over Row", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Dumbbell Bicep Curl", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Hammer Curl", sets: 3, reps: "12", rest: "60s" }
      ],
      "Wednesday": [
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Lateral Raises", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Front Raises", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Plank", sets: 3, reps: "30-45 sec", rest: "60s" },
        { name: "Bicycle Crunch", sets: 3, reps: "20 reps", rest: "60s" }
      ],
      "Thursday": [
        { name: "Bodyweight Squats", sets: 3, reps: "12-15", rest: "90s" },
        { name: "Leg Press", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Leg Extension", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Hamstring Curl Machine", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Calf Raise Machine", sets: 3, reps: "15", rest: "60s" }
      ],
      "Friday": [
        { name: "Kettlebell Deadlift", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Push-Ups", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Seated Row", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Plank", sets: 3, reps: "30-45 sec", rest: "60s" }
      ],
      "Saturday": [
        { name: "Glute Bridges", sets: 3, reps: "15", rest: "60s" },
        { name: "Hip Thrusts", sets: 3, reps: "12", rest: "90s" },
        { name: "Goblet Squat", sets: 3, reps: "12", rest: "60s" },
        { name: "Side Planks", sets: 3, reps: "30 sec each side", rest: "60s" },
        { name: "Treadmill Walk", sets: 1, reps: "10 minutes", rest: "0s" }
      ],
      "Sunday": [
        { name: "Light Walking", sets: 1, reps: "10-20 minutes", rest: "0s" },
        { name: "Stretching", sets: 1, reps: "5-10 minutes", rest: "0s" }
      ]
    }
  }
];

async function populateWorkoutTemplates() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if templates already exist
    const existingCount = await WorkoutPlan.countDocuments({ isTemplate: true });
    console.log(`📊 Found ${existingCount} existing workout templates`);

    // Clear existing templates
    if (existingCount > 0) {
      console.log('🗑️  Removing existing templates...');
      await WorkoutPlan.deleteMany({ isTemplate: true });
      console.log('✅ Existing templates removed');
    }

    console.log('📝 Creating new workout plan templates...');
    
    for (const template of workoutTemplates) {
      const created = await WorkoutPlan.create(template);
      console.log(`✅ Created: ${created.name} (${created.difficulty})`);
    }

    console.log('\n🎉 Successfully created all workout plan templates!');
    console.log('\n📋 Summary:');
    workoutTemplates.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name} - ${t.difficulty}`);
      console.log(`   Duration: ${t.durationWeeks} weeks | Category: ${t.category}`);
    });

    console.log('\n✅ Templates are now ready to be assigned to clients from the trainer dashboard!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

populateWorkoutTemplates();
