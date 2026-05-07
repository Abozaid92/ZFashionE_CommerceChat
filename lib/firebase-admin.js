const admin = require("firebase-admin");

// تجميع الأجزاء الـ 4
// قسمنا الكود عشان الاتضاه تشتغل صح
const p1 = process.env.FIRE_PART_1 || "";
const p2 = process.env.FIRE_PART_2 || "";
const p3 = process.env.FIRE_PART_3 || "";
const p4 = process.env.FIRE_PART_4 || "";

const fullKey = p1 + p2 + p3 + p4;

if (!admin.apps.length) {
  if (!fullKey) {
    console.error("❌ Error: Firebase key parts are missing!");
  } else {
    try {
      // تنظيف الـ key من أي مسافات زائدة والتعامل مع السطور الجديدة
      const formattedKey = fullKey.trim().replace(/\\n/g, "\n");

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: formattedKey,
        }),
      });
      console.log("✅ Firebase Admin Initialized with 4 parts!");
    } catch (err) {
      console.error("❌ Firebase Init Error:", err.message);
    }
  }
}

const adminMessaging = admin.messaging();
module.exports = { adminMessaging };
