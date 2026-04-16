const mongoose = require('mongoose');

async function testDB() {
    console.log('Testing connection to MongoDB Atlas with new password...');
    try {
        await mongoose.connect('mongodb+srv://Shruti:smirra11@void.yuids9h.mongodb.net/interview-arena?appName=VOID', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('DB_SUCCESS');
        process.exit(0);
    } catch (err) {
        console.log('DB_ERROR:', err.message);
        process.exit(1);
    }
}

testDB();
