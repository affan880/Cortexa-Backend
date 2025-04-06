// firebaseConfig.js
const admin = require("firebase-admin");
const path = require("path");

// Use path.join to create the correct absolute path to the firebase.json file
const serviceAccountPath = path.join(process.cwd(), process.env.FIREBASE_CONFIG_PATH);
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
