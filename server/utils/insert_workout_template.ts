import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017/fitpro';

const workoutData = {
  name: "Full Body Split – Beginner",
  description: "A beginner-friendly 7-day full body split designed to build strength, improve form, and develop consistent training habits. Includes 6 training days and 1 active rest day.",
  category: "general",
  difficulty: "beginner",
  durationWeeks: 4,
  isTemplate: true,
  createdBy: "admin",
  exercises: {
    "Monday": [
      { "name": "Push-Ups", "sets": 3, "reps": "10-12", "rest": "60s" },
      { "name": "Dumbbell Bench Press", "sets": 3, "reps": "10-12", "rest": "90s" },
      { "name": "Chest Fly (Dumbbells or Machine)", "sets": 3, "reps": "12-15", "rest": "60s" },
      { "name": "Tricep Dips (Bench)", "sets": 3, "reps": "10-12", "rest": "60s" },
      { "name": "Tricep Rope Pushdown", "sets": 3, "reps": "12-15", "rest": "60s" }
    ],
    "Tuesday": [
      { "name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest": "90s" },
      { "name": "Seated Row Machine", "sets": 3, "reps": "10-12", "rest": "90s" },
      { "name": "Dumbbell Bent-Over Row", "sets": 3, "reps": "12-15", "rest": "60s" },
      { "name": "Dumbbell Bicep Curl", "sets": 3, "reps": "10-12", "rest": "60s" },
      { "name": "Hammer Curl", "sets": 3, "reps": "12", "rest": "60s" }
    ],
    "Wednesday": [
      { "name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": "90s" },
      { "name": "Lateral Raises", "sets": 3, "reps": "12-15", "rest": "60s" },
      { "name": "Front Raises", "sets": 3, "reps": "12-15", "rest": "60s" },
      { "name": "Plank", "sets": 3, "reps": "30-45 sec", "rest": "60s" },
      { "name": "Bicycle Crunch", "sets": 3, "reps": "20 reps", "rest": "60s" }
    ],
    "Thursday": [
      { "name": "Bodyweight Squats", "sets": 3, "reps": "12-15", "rest": "90s" },
      { "name": "Leg Press", "sets": 3, "reps": "10-12", "rest": "90s" },
      { "name": "Leg Extension", "sets": 3, "reps": "12-15", "rest": "60s" },
      { "name": "Hamstring Curl Machine", "sets": 3, "reps": "12-15", "rest": "60s" },
      { "name": "Calf Raise Machine", "sets": 3, "reps": "15", "rest": "60s" }
    ],
    "Friday": [
      { "name": "Kettlebell Deadlift", "sets": 3, "reps": "12-15", "rest": "60s" },
      { "name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest": "60s" },
      { "name": "Push-Ups", "sets": 3, "reps": "10-12", "rest": "60s" },
      { "name": "Seated Row", "sets": 3, "reps": "10-12", "rest": "60s" },
      { "name": "Plank", "sets": 3, "reps": "30-45 sec", "rest": "60s" }
    ],
    "Saturday": [
      { "name": "Glute Bridges", "sets": 3, "reps": "15", "rest": "60s" },
      { "name": "Hip Thrusts", "sets": 3, "reps": "12", "rest": "90s" },
      { "name": "Goblet Squat", "sets": 3, "reps": "12", "rest": "60s" },
      { "name": "Side Planks", "sets": 3, "reps": "30 sec each side", "rest": "60s" },
      { "name": "Treadmill Walk", "sets": 1, "reps": "10 minutes", "rest": "0s" }
    ],
    "Sunday": [
      { "name": "Light Walking", "sets": 1, "reps": "10-20 minutes", "rest": "0s" },
      { "name": "Stretching", "sets": 1, "reps": "5-10 minutes", "rest": "0s" }
    ]
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const result = await mongoose.connection.db.collection('workoutplans').insertOne(workoutData);
    console.log('✅ Workout template inserted:', result.insertedId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', (error as any).message);
    process.exit(1);
  }
})();
