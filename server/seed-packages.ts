import { storage } from './storage';

async function seedPackages() {
  try {
    const existingPackages = await storage.getAllPackages();
    
    if (existingPackages.length > 0) {
      console.log('Packages already exist, skipping seed');
      return;
    }

    const packages = [
      {
        name: "Fit Basic",
        description: "Live Group Training + Personalized Diet + Weekly 1 Check-in + WhatsApp Support",
        price: 2500,
        features: ["Live group training", "Personalized diet", "Weekly 1 check-in", "WhatsApp support"],
        dietPlanAccess: true,
        workoutPlanAccess: true,
        recordedSessionsAccess: true,
        videoAccess: true,
        liveSessionsPerMonth: 4,
        personalizedDietAccess: true,
        weeklyCheckInAccess: true,
        liveGroupTrainingAccess: true,
        oneOnOneCallAccess: false,
        habitCoachingAccess: false,
        performanceTrackingAccess: false,
        prioritySupportAccess: false,
      },
      {
        name: "Pro Transformation",
        description: "Live Group Training + Personalized Diet + Weekly 2 Check-ins + WhatsApp Support + WhatsApp Community",
        price: 5000,
        features: ["Live group training", "Personalized diet", "Weekly 2 check-ins", "WhatsApp support", "WhatsApp community"],
        dietPlanAccess: true,
        workoutPlanAccess: true,
        recordedSessionsAccess: true,
        videoAccess: true,
        liveSessionsPerMonth: 4,
        personalizedDietAccess: true,
        weeklyCheckInAccess: true,
        liveGroupTrainingAccess: true,
        oneOnOneCallAccess: false,
        habitCoachingAccess: true,
        performanceTrackingAccess: false,
        prioritySupportAccess: false,
      },
      {
        name: "Elite Athlete",
        description: "1:1 Personal Training + Personalized Diet + Weekly 2 Check-ins + WhatsApp Support + WhatsApp Community",
        price: 10000,
        features: ["1:1 Personal training", "Personalized diet", "Weekly 2 check-ins", "WhatsApp support", "WhatsApp community"],
        dietPlanAccess: true,
        workoutPlanAccess: true,
        recordedSessionsAccess: true,
        videoAccess: true,
        liveSessionsPerMonth: 8,
        personalizedDietAccess: true,
        weeklyCheckInAccess: true,
        liveGroupTrainingAccess: true,
        oneOnOneCallAccess: true,
        habitCoachingAccess: true,
        performanceTrackingAccess: true,
        prioritySupportAccess: true,
      },
    ];

    for (const pkg of packages) {
      await storage.createPackage(pkg);
      console.log(`Created package: ${pkg.name}`);
    }

    console.log('All packages seeded successfully!');
  } catch (error) {
    console.error('Error seeding packages:', error);
    process.exit(1);
  }
}

export { seedPackages };
