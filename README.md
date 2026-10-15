# 🎓 Muhfillo Edu Center — Test Natijalari va Real-Time Reyting Tizimi

Ushbu loyiha o'quv markazlari uchun test savollarini yuklash, o'quvchilar ro'yxatini shakllantirish, o'qituvchilar tomonidan test ID bo'yicha talabalar javoblarini tezkor kiritish va ommaviy real-time reytingni hisoblab borish uchun yaratilgan zamonaviy web-platformadir.

---

## 🌟 Asosiy Afzalliklari

- **Backend va Server talab qilinmaydi**: 100% statik frontend (HTML, CSS, Vanilla JS) — GitHub Pages'da bepul ishlaydi.
- **Cheksiz tejamkorlik (0$ xarajat)**: Firebase Firestore Spark (bepul) rejasi yoki lokal demo rejimi.
- **Faqat Login tizimi**: Foydalanuvchilar email eslab qolishi shart emas — faqat `admin`, `teacher1` kabi login kiritiladi (tizim orqa fonda Firebase Auth bilan xavfsiz bog'laydi).
- **Glassmorphism Dark UI**: Premium zamonaviy dizayn, neon graduslar, podium (Top 3), trendlar, to'liq mobil moslashuvchanlik.
- **Tezkor Javob Kiritish (Teacher UX)**: Test tanlangach, o'quvchi javoblari bir tugmani bosish bilan [A] [B] [C] [D] shaklida kiritiladi, to'g'ri/noto'g'ri ball avtomatik hisoblanadi.

---

## 📁 Loyiha Strukturasi

```text
├── index.html              # Bosh sahifa — Ommaviy real-time reyting, statistika va Podium
├── login.html              # Login sahifasi (Admin va O'qituvchi uchun yagona kirish)
├── admin/                  # 👑 Bosh Administrator paneli
│   ├── dashboard.html      # Umumiy statistika va so'nggi natijalar
│   ├── tests.html          # Testlar yaratish (savol, rasm, A/B/C/D variantlar)
│   ├── students.html       # O'quvchilar va o'qituvchilarni boshqarish
│   └── analytics.html      # Batafsil Chart.js grafiklari va fanlar tahlili
├── teacher/                # 👨‍🏫 O'qituvchi paneli
│   ├── dashboard.html      # O'qituvchi boshqaruvi
│   ├── enter-results.html  # Test ID va talaba bo'yicha javoblarni tezkor kiritish
│   └── results.html        # Kiritilgan natijalar tarixi
├── css/
│   ├── main.css            # Asosiy dizayn tizimi, o'zgaruvchilar va shriftlar
│   ├── components.css      # Kartalar, formalar, podium, tugmalar, toastlar
│   ├── dashboard.css       # Sidebar va boshqaruv paneli stillari
│   └── responsive.css      # Mobil va planshet uchun moslashuvchanlik
└── js/
    ├── firebase-config.js  # Firebase sozlamalari va login conversion
    ├── utils.js            # Toast xabarlar, demo ma'lumotlar bazasi va yordamchilar
    ├── auth.js             # Autentifikatsiya, rollar va xavfsizlik nazorati
    ├── rating.js           # Bosh sahifa reytingi, podium va qidiruv filtrlari
    ├── admin.js            # Admin dashboard hisoblagichlari
    ├── admin-tests.js      # Testlar yaratish, rasm yuklash va Test ID generatsiyasi
    ├── admin-students.js   # O'quvchilar va o'qituvchilar CRUD amallari
    ├── analytics.js        # Chart.js interaktiv grafiklari
    ├── teacher.js          # O'qituvchi dashboard ma'lumotlari
    ├── teacher-enter.js    # 3-bosqichli javob kiritish va ball hisoblash
    └── teacher-results.js  # Natijalar tarixi filtrlari
```

---

## 🚀 Qanday Ishlatish Kerak?

### 1. Lokal Sinab Ko'rish (Demo Rejimi)
Loyiha Firebase sozlanmagan taqdirda ham avtomatik ravishda **Demo/Offline** rejimida ishlaydi. Hech qanday qo'shimcha o'rnatish shart emas:
1. `index.html` yoki `login.html` faylini istalgan brauzerda oching (yoki `python3 -m http.server 8080`).
2. Test hisoblari:
   - **Admin login**: `admin` | **Parol**: `admin123` (yoki ixtiyoriy 6+ belgili parol)
   - **O'qituvchi login**: `teacher` | **Parol**: `teacher123`
3. Tizim avtomatik ravishda o'zining namunaviy o'quvchilari va testlari bilan to'liq ishlaydi.

### 2. Real Firebase Bazaga Ulash
Saytni haqiqiy Firebase loyihangizga ulash uchun:
1. [Firebase Console](https://console.firebase.google.com/) ga kiring va yangi bepul loyiha oching.
2. **Authentication** bo'limida `Email/Password` provayderini yoqing.
3. **Firestore Database** bo'limida yangi ma'lumotlar bazasi yarating.
4. **Project Settings -> General -> Your apps -> Web (</>)** dan config obyektini oling.
5. [`js/firebase-config.js`](file:///Users/macbook_uz/Documents/muhfillo%20edu%20center/js/firebase-config.js) faylini ochib, kalitlarni joylashtiring:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "loyihangiz.firebaseapp.com",
    projectId: "loyihangiz",
    storageBucket: "loyihangiz.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};
```

---

## 🔒 Firebase Firestore Security Rules (Xavfsizlik)

Firebase Console -> **Firestore Database** -> **Rules** tabiga quyidagi qoidalarni qo'ying:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    function isTeacher() {
      return isAuthenticated() && (getUserRole() == 'teacher' || getUserRole() == 'admin');
    }

    // Foydalanuvchilar (users)
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Testlar — hamma o'qiy oladi, faqat admin yaratadi/o'chiradi
    match /tests/{testId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // O'quvchilar ro'yxati — o'qish ochiq, yozish faqat admin
    match /students/{studentId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Natijalar — reyting uchun ochiq, o'qituvchi kiritadi, admin tahrirlay oladi
    match /results/{resultId} {
      allow read: if true;
      allow create: if isTeacher();
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## 🌐 GitHub Pages va Custom Domenga Ulash

1. Ushbu loyihani GitHub omboringizga (repository) yuklang (`git push`).
2. GitHub omboringizning **Settings -> Pages** bo'limiga kiring.
3. **Branch** qismida `main` (yoki `master`) tanlab, `/root` papkasini saqlang.
4. Agar o'zingizning domeningiz bo'lsa (masalan `rating.muhfillo.uz`):
   - **Custom domain** maydoniga domen nomingizni yozing.
   - DNS provayderingizda GitHub Pages IP yoki CNAME yozuvini yo'naltiring.
5. Sayt HTTPS sertifikati bilan bepul ishga tushadi!
