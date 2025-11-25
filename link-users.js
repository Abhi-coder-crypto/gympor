const mongoose = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://fitpro:fitpro123@fitpro.txl5u.mongodb.net/fitpro?retryWrites=true&w=majority';

async function linkUsersToClients() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('✓ Connected to MongoDB');
    
    const db = mongoose.connection;
    const usersCollection = db.collection('users');
    const clientsCollection = db.collection('clients');
    
    // Get all client users without clientId
    const clientUsers = await usersCollection.find({ role: 'client', clientId: { $exists: false } }).toArray();
    console.log(`\n📋 Found ${clientUsers.length} client users without clientId\n`);
    
    let linkedCount = 0;
    
    for (const user of clientUsers) {
      // Find matching Client by email
      const clientDoc = await clientsCollection.findOne({ email: user.email });
      
      if (clientDoc) {
        // Update user with clientId
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { clientId: clientDoc._id } }
        );
        console.log(`✓ Linked ${user.email} → ${clientDoc.name} (${clientDoc._id})`);
        linkedCount++;
      } else {
        console.log(`✗ No Client found for ${user.email}`);
      }
    }
    
    console.log(`\n✅ Successfully linked ${linkedCount} users!\n`);
    
    // Show aniket's updated record
    const aniketUser = await usersCollection.findOne({ email: /aniket/i });
    if (aniketUser) {
      console.log(`📌 Aniket user now has clientId: ${aniketUser.clientId}`);
    }
    
    await mongoose.connection.close();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

linkUsersToClients();
