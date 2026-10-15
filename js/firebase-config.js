/* =============================================
   FIREBASE CONFIG
   ============================================= 
   
   ⚠️ MUHIM: Bu faylda Firebase loyiha sozlamalarini kiriting.
   Firebase Console → Project Settings → Your apps → Config dan oling.
   
   Bu kalitlar ochiq bo'lsa ham xavfsiz — 
   xavfsizlik Firestore Security Rules orqali ta'minlanadi.
*/

const firebaseConfig = {
    apiKey: "AIzaSyDYTMayIGsvDKli_abldEsNnbSSWiXYQPE",
    authDomain: "edu-center-5f0a3.firebaseapp.com",
    projectId: "edu-center-5f0a3",
    storageBucket: "edu-center-5f0a3.firebasestorage.app",
    messagingSenderId: "318289672587",
    appId: "1:318289672587:web:b61c4d9849f0fc7689578e",
    measurementId: "G-LLX3SF5BN7"
};

// Xizmatlar o'zgaruvchilari
let auth = null;
let db = null;
let storage = null;

// Firebase-ni xavfsiz ishga tushirish (agar kalitlar kiritilgan bo'lsa)
if (typeof firebase !== 'undefined') {
    try {
        if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_API_KEY' && !firebaseConfig.apiKey.includes('YOUR_')) {
            firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            if (firebase.storage) {
                storage = firebase.storage();
            }
            auth.languageCode = 'uz';
            console.log('🔥 Firebase muvaffaqiyatli ishga tushdi');
        } else {
            console.info('ℹ️ Firebase sozlamalari kiritilmagan. Sayt to\'liq lokal demo ma\'lumotlar bilan ishlamoqda.');
        }
    } catch (e) {
        console.warn('Firebase init xatosi:', e);
    }
}

// Login uchun email domain (foydalanuvchi faqat login kiritadi, tizim esa login@muhfillo.edu formatida ishlaydi)
const EMAIL_DOMAIN = '@muhfillo.edu';

/**
 * Login nomini email formatiga o'tkazish
 * Masalan: admin1 -> admin1@muhfillo.edu
 */
function loginToEmail(login) {
    return login.trim().toLowerCase() + EMAIL_DOMAIN;
}

/**
 * Emaildan login nomini ajratish
 * Masalan: admin1@muhfillo.edu -> admin1
 */
function emailToLogin(email) {
    return email.replace(EMAIL_DOMAIN, '');
}
