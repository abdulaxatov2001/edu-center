/* =============================================
   MUHFILLO EDU CENTER — UTILS & DATA LAYER
   ============================================= */

// Check if Firebase is properly configured
function isFirebaseConfigured() {
    try {
        return typeof firebaseConfig !== 'undefined' && 
               firebaseConfig.apiKey && 
               firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
               !firebaseConfig.apiKey.includes('YOUR_');
    } catch (e) {
        return false;
    }
}

// ---------------------------------------------
// LOCAL DEMO / FALLBACK STORE
// Used when Firebase keys are not yet configured
// ---------------------------------------------
const STORAGE_KEYS = {
    STUDENTS: 'muhfillo_students',
    TESTS: 'muhfillo_tests',
    RESULTS: 'muhfillo_results',
    USERS: 'muhfillo_users',
    SUBJECTS: 'muhfillo_subjects',
    GROUPS: 'muhfillo_groups',
    CURRENT_USER: 'muhfillo_current_user'
};

// Initial Demo Data
const DEMO_DATA = {
    subjects: [
        'Matematika', 'Fizika', 'Ingliz tili', 'Ona tili va adabiyot', 
        'Kimyo', 'Biologiya', 'Tarix', 'Informatika'
    ],
    groups: [
        'Guruh-A1', 'Guruh-B2', 'Guruh-C1'
    ],
    users: [
        { uid: 'admin_1', login: 'admin', role: 'admin', fullName: 'Bosh Administrator', createdAt: new Date().toISOString() },
        { uid: 'teacher_1', login: 'teacher', role: 'teacher', fullName: 'Aziz Rahimov (O\'qituvchi)', createdAt: new Date().toISOString() },
        { uid: 'teacher_2', login: 'matematik', role: 'teacher', fullName: 'Dilnoza Karimova', createdAt: new Date().toISOString() }
    ],
    students: [
        { id: 'st_1', fullName: 'Jasur Aliyev', group: 'Guruh-A1', phone: '+998 90 123 45 67', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
        { id: 'st_2', fullName: 'Madina Usmonova', group: 'Guruh-A1', phone: '+998 91 234 56 78', createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
        { id: 'st_3', fullName: 'Bekzod Toshmatov', group: 'Guruh-B2', phone: '+998 93 345 67 89', createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
        { id: 'st_4', fullName: 'Shahzoda Olimova', group: 'Guruh-B2', phone: '+998 94 456 78 90', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
        { id: 'st_5', fullName: 'Sardor Qodirov', group: 'Guruh-A1', phone: '+998 97 567 89 01', createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
        { id: 'st_6', fullName: 'Nilufar Ergasheva', group: 'Guruh-C1', phone: '+998 99 678 90 12', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: 'st_7', fullName: 'Farrux Zokirov', group: 'Guruh-C1', phone: '+998 90 789 01 23', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
        { id: 'st_8', fullName: 'Kamola Rustamova', group: 'Guruh-B2', phone: '+998 93 890 12 34', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() }
    ],
    tests: [
        {
            id: 'TEST-101',
            title: 'Matematika — 1-Nazorat testi',
            subject: 'Matematika',
            questionCount: 5,
            createdBy: 'admin',
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            questions: [
                { id: 'q1', text: '5 * 5 + 10 nechaga teng?', options: ['25', '35', '40', '50'], correct: 'B', image: '' },
                { id: 'q2', text: 'Uchburchakning ichki burchaklari yig\'indisi?', options: ['90°', '180°', '270°', '360°'], correct: 'B', image: '' },
                { id: 'q3', text: 'Qaysi son tub son hisoblanadi?', options: ['4', '9', '11', '15'], correct: 'C', image: '' },
                { id: 'q4', text: '2 ning 5-darajasi nechaga teng?', options: ['16', '32', '64', '128'], correct: 'B', image: '' },
                { id: 'q5', text: 'Kvadratning yuzi 64 bo\'lsa, tomoni necha?', options: ['6', '7', '8', '9'], correct: 'C', image: '' }
            ]
        },
        {
            id: 'TEST-102',
            title: 'Fizika — Mexanika asoslari',
            subject: 'Fizika',
            questionCount: 4,
            createdBy: 'admin',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            questions: [
                { id: 'q1', text: 'Tezlik birligi nima?', options: ['m/s', 'kg', 'N', 'J'], correct: 'A', image: '' },
                { id: 'q2', text: 'Nyutonning 2-qonuni formulasi?', options: ['F = m*a', 'E = mc²', 'v = s/t', 'P = m*g'], correct: 'A', image: '' },
                { id: 'q3', text: 'Og\'irlik kuchi qanday harf bilan belgilanadi?', options: ['F', 'P', 'm', 'a'], correct: 'A', image: '' },
                { id: 'q4', text: 'Erkin tushish tezlanishi g qiymati qancha?', options: ['8.8 m/s²', '9.8 m/s²', '10.8 m/s²', '12 m/s²'], correct: 'B', image: '' }
            ]
        }
    ],
    results: [
        {
            id: 'res_1',
            testId: 'TEST-101',
            testTitle: 'Matematika — 1-Nazorat testi',
            studentId: 'st_1',
            studentName: 'Jasur Aliyev',
            studentGroup: 'Guruh-A1',
            teacherId: 'teacher_1',
            teacherName: 'Aziz Rahimov',
            answers: { 0: 'B', 1: 'B', 2: 'C', 3: 'B', 4: 'C' },
            correctCount: 5,
            totalQuestions: 5,
            percentage: 100,
            submittedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
            id: 'res_2',
            testId: 'TEST-101',
            testTitle: 'Matematika — 1-Nazorat testi',
            studentId: 'st_2',
            studentName: 'Madina Usmonova',
            studentGroup: 'Guruh-A1',
            teacherId: 'teacher_1',
            teacherName: 'Aziz Rahimov',
            answers: { 0: 'B', 1: 'B', 2: 'C', 3: 'A', 4: 'C' },
            correctCount: 4,
            totalQuestions: 5,
            percentage: 80,
            submittedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
            id: 'res_3',
            testId: 'TEST-101',
            testTitle: 'Matematika — 1-Nazorat testi',
            studentId: 'st_3',
            studentName: 'Bekzod Toshmatov',
            studentGroup: 'Guruh-B2',
            teacherId: 'teacher_1',
            teacherName: 'Aziz Rahimov',
            answers: { 0: 'B', 1: 'C', 2: 'C', 3: 'B', 4: 'B' },
            correctCount: 3,
            totalQuestions: 5,
            percentage: 60,
            submittedAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 'res_4',
            testId: 'TEST-102',
            testTitle: 'Fizika — Mexanika asoslari',
            studentId: 'st_1',
            studentName: 'Jasur Aliyev',
            studentGroup: 'Guruh-A1',
            teacherId: 'teacher_1',
            teacherName: 'Aziz Rahimov',
            answers: { 0: 'A', 1: 'A', 2: 'A', 3: 'B' },
            correctCount: 4,
            totalQuestions: 4,
            percentage: 100,
            submittedAt: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
            id: 'res_5',
            testId: 'TEST-102',
            testTitle: 'Fizika — Mexanika asoslari',
            studentId: 'st_4',
            studentName: 'Shahzoda Olimova',
            studentGroup: 'Guruh-B2',
            teacherId: 'teacher_1',
            teacherName: 'Aziz Rahimov',
            answers: { 0: 'A', 1: 'A', 2: 'B', 3: 'B' },
            correctCount: 3,
            totalQuestions: 4,
            percentage: 75,
            submittedAt: new Date(Date.now() - 86400000 * 1).toISOString()
        }
    ]
};

// Initialize Demo Data in localStorage if empty
function initLocalData() {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEMO_DATA.students));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TESTS)) {
        localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(DEMO_DATA.tests));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
        localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(DEMO_DATA.results));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_DATA.users));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(DEMO_DATA.subjects));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GROUPS)) {
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(DEMO_DATA.groups));
    }
}
initLocalData();

// ---------------------------------------------
// UNIFIED DATA SERVICE (Firestore + Local fallback)
// ---------------------------------------------
const DataService = {
    // ---- STUDENTS ----
    async getStudents() {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const snapshot = await db.collection('students').orderBy('fullName').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.warn('Firestore getStudents error, falling back to local:', err);
            }
        }
        const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
        return data ? JSON.parse(data) : [];
    },

    async addStudent(student) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const docRef = await db.collection('students').add({
                    ...student,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { id: docRef.id, ...student };
            } catch (err) {
                console.warn('Firestore addStudent error, fallback to local:', err);
            }
        }
        const students = await this.getStudents();
        const newStudent = { id: 'st_' + Date.now(), ...student, createdAt: new Date().toISOString() };
        students.push(newStudent);
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        return newStudent;
    },

    async updateStudent(id, studentData) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                await db.collection('students').doc(id).update(studentData);
                return true;
            } catch (err) {
                console.warn('Firestore updateStudent error, fallback to local:', err);
            }
        }
        const students = await this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...studentData };
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
            return true;
        }
        return false;
    },

    async deleteStudent(id) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                await db.collection('students').doc(id).delete();
                return true;
            } catch (err) {
                console.warn('Firestore deleteStudent error, fallback to local:', err);
            }
        }
        let students = await this.getStudents();
        students = students.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        return true;
    },

    // ---- TESTS ----
    async getTests() {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const snapshot = await db.collection('tests').orderBy('createdAt', 'desc').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.warn('Firestore getTests error, fallback to local:', err);
            }
        }
        const data = localStorage.getItem(STORAGE_KEYS.TESTS);
        return data ? JSON.parse(data) : [];
    },

    async getTestById(id) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const doc = await db.collection('tests').doc(id).get();
                if (doc.exists) {
                    return { id: doc.id, ...doc.data() };
                }
            } catch (err) {
                console.warn('Firestore getTestById error, fallback to local:', err);
            }
        }
        const tests = await this.getTests();
        return tests.find(t => t.id === id) || null;
    },

    async addTest(test) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const customId = test.id || ('TEST-' + Math.floor(100 + Math.random() * 900));
                await db.collection('tests').doc(customId).set({
                    ...test,
                    id: customId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { ...test, id: customId };
            } catch (err) {
                console.warn('Firestore addTest error, fallback to local:', err);
            }
        }
        const tests = await this.getTests();
        const customId = test.id || ('TEST-' + Math.floor(100 + Math.random() * 900));
        const newTest = { ...test, id: customId, createdAt: new Date().toISOString() };
        tests.unshift(newTest);
        localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
        return newTest;
    },

    async deleteTest(id) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                await db.collection('tests').doc(id).delete();
                return true;
            } catch (err) {
                console.warn('Firestore deleteTest error, fallback to local:', err);
            }
        }
        let tests = await this.getTests();
        tests = tests.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
        return true;
    },

    // ---- RESULTS ----
    async getResults() {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const snapshot = await db.collection('results').orderBy('submittedAt', 'desc').get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.warn('Firestore getResults error, fallback to local:', err);
            }
        }
        const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
        return data ? JSON.parse(data) : [];
    },

    async addResult(result) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const docRef = await db.collection('results').add({
                    ...result,
                    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { id: docRef.id, ...result };
            } catch (err) {
                console.warn('Firestore addResult error, fallback to local:', err);
            }
        }
        const results = await this.getResults();
        const newResult = { id: 'res_' + Date.now(), ...result, submittedAt: new Date().toISOString() };
        results.unshift(newResult);
        localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
        return newResult;
    },

    // ---- TEACHERS / USERS ----
    async getTeachers() {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const snapshot = await db.collection('users').where('role', '==', 'teacher').get();
                return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
            } catch (err) {
                console.warn('Firestore getTeachers error, fallback to local:', err);
            }
        }
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        const users = data ? JSON.parse(data) : [];
        return users.filter(u => u.role === 'teacher');
    },

    async addTeacher(teacher) {
        if (isFirebaseConfigured() && typeof db !== 'undefined') {
            try {
                const email = loginToEmail(teacher.login);
                // Create user doc in users collection
                const docRef = db.collection('users').doc();
                await docRef.set({
                    uid: docRef.id,
                    login: teacher.login,
                    email: email,
                    fullName: teacher.fullName,
                    role: 'teacher',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { uid: docRef.id, ...teacher };
            } catch (err) {
                console.warn('Firestore addTeacher error, fallback to local:', err);
            }
        }
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        const users = data ? JSON.parse(data) : [];
        const newTeacher = {
            uid: 'teacher_' + Date.now(),
            login: teacher.login,
            fullName: teacher.fullName,
            role: 'teacher',
            createdAt: new Date().toISOString()
        };
        users.push(newTeacher);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return newTeacher;
    },

    // ---- SUBJECTS (FANLAR) ----
    async getSubjects() {
        if (isFirebaseConfigured() && typeof db !== 'undefined' && db !== null) {
            try {
                const snapshot = await db.collection('subjects').orderBy('name').get();
                if (!snapshot.empty) {
                    return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
                }
            } catch (err) {
                console.warn('Firestore getSubjects error, fallback to local:', err);
            }
        }
        const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
        const list = data ? JSON.parse(data) : DEMO_DATA.subjects;
        return list.map((item, idx) => typeof item === 'string' ? { id: 'subj_' + idx, name: item } : item);
    },

    async addSubject(name) {
        const cleanName = name.trim();
        if (isFirebaseConfigured() && typeof db !== 'undefined' && db !== null) {
            try {
                const docRef = await db.collection('subjects').add({
                    name: cleanName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { id: docRef.id, name: cleanName };
            } catch (err) {
                console.warn('Firestore addSubject error, fallback to local:', err);
            }
        }
        const subjects = await this.getSubjects();
        const exists = subjects.some(s => s.name.toLowerCase() === cleanName.toLowerCase());
        if (!exists) {
            const newSubj = { id: 'subj_' + Date.now(), name: cleanName };
            subjects.push(newSubj);
            localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
            return newSubj;
        }
        return { name: cleanName };
    },

    async deleteSubject(idOrName) {
        if (isFirebaseConfigured() && typeof db !== 'undefined' && db !== null) {
            try {
                await db.collection('subjects').doc(idOrName).delete();
            } catch (err) {
                console.warn('Firestore deleteSubject error:', err);
            }
        }
        let subjects = await this.getSubjects();
        subjects = subjects.filter(s => s.id !== idOrName && s.name !== idOrName);
        localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
        return true;
    },

    // ---- GROUPS (GURUHLAR) ----
    async getGroups() {
        if (isFirebaseConfigured() && typeof db !== 'undefined' && db !== null) {
            try {
                const snapshot = await db.collection('groups').orderBy('name').get();
                if (!snapshot.empty) {
                    return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
                }
            } catch (err) {
                console.warn('Firestore getGroups error, fallback to local:', err);
            }
        }
        const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
        const list = data ? JSON.parse(data) : DEMO_DATA.groups;
        return list.map((item, idx) => typeof item === 'string' ? { id: 'grp_' + idx, name: item } : item);
    },

    async addGroup(name) {
        const cleanName = name.trim();
        if (isFirebaseConfigured() && typeof db !== 'undefined' && db !== null) {
            try {
                const docRef = await db.collection('groups').add({
                    name: cleanName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return { id: docRef.id, name: cleanName };
            } catch (err) {
                console.warn('Firestore addGroup error, fallback to local:', err);
            }
        }
        const groups = await this.getGroups();
        const exists = groups.some(g => g.name.toLowerCase() === cleanName.toLowerCase());
        if (!exists) {
            const newGroup = { id: 'grp_' + Date.now(), name: cleanName };
            groups.push(newGroup);
            localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
            return newGroup;
        }
        return { name: cleanName };
    },

    async deleteGroup(idOrName) {
        if (isFirebaseConfigured() && typeof db !== 'undefined' && db !== null) {
            try {
                await db.collection('groups').doc(idOrName).delete();
            } catch (err) {
                console.warn('Firestore deleteGroup error:', err);
            }
        }
        let groups = await this.getGroups();
        groups = groups.filter(g => g.id !== idOrName && g.name !== idOrName);
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
        return true;
    }
};

// ---------------------------------------------
// UI NOTIFICATIONS (TOASTS)
// ---------------------------------------------
function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    // Icon based on type
    let iconSvg = '';
    let borderColor = 'var(--border-color)';
    let glowColor = 'rgba(255,255,255,0.05)';
    let textColor = 'var(--text-primary)';

    if (type === 'success') {
        borderColor = 'rgba(16, 185, 129, 0.4)';
        glowColor = 'rgba(16, 185, 129, 0.15)';
        textColor = '#10B981';
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
        borderColor = 'rgba(239, 68, 68, 0.4)';
        glowColor = 'rgba(239, 68, 68, 0.15)';
        textColor = '#EF4444';
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
        borderColor = 'rgba(245, 158, 11, 0.4)';
        glowColor = 'rgba(245, 158, 11, 0.15)';
        textColor = '#F59E0B';
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
        borderColor = 'rgba(59, 130, 246, 0.4)';
        glowColor = 'rgba(59, 130, 246, 0.15)';
        textColor = '#3B82F6';
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        background: rgba(17, 24, 39, 0.95);
        border: 1px solid ${borderColor};
        border-radius: 12px;
        color: #F9FAFB;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${glowColor};
        backdrop-filter: blur(12px);
        transform: translateY(20px) scale(0.95);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        max-width: 380px;
    `;

    toast.innerHTML = `
        <div style="flex-shrink: 0; display:flex;">${iconSvg}</div>
        <div style="flex: 1; line-height: 1.4;">${escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0) scale(1)';
        toast.style.opacity = '1';
    });

    // Remove
    setTimeout(() => {
        toast.style.transform = 'translateY(10px) scale(0.95)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ---------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateInput) {
    if (!dateInput) return '—';
    try {
        let d;
        if (dateInput.toDate && typeof dateInput.toDate === 'function') {
            d = dateInput.toDate();
        } else if (dateInput.seconds) {
            d = new Date(dateInput.seconds * 1000);
        } else {
            d = new Date(dateInput);
        }
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return '—';
    }
}

// Sidebar Mobile Toggle Init
function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggle && sidebar) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// Public Navbar Mobile Menu Toggle
function initNavMenu() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (!navToggle || !navLinks) return;

    function toggleMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const isOpen = navLinks.classList.toggle('open');
        navLinks.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function closeMenu() {
        navLinks.classList.remove('open', 'active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    // Toggle on click
    navToggle.addEventListener('click', toggleMenu);

    // Close on any link click inside menu
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

// Check configuration status & show gentle hint if using demo mode
document.addEventListener('DOMContentLoaded', () => {
    initNavMenu();
    initSidebar();

    // If using demo mode, show once in console or subtle banner
    if (!isFirebaseConfigured()) {
        console.info('ℹ️ Firebase sozlanmagan. Tizim to\'liq Demo/Offline rejimida ishlamoqda.');
    }
});

// Also run immediately if DOM is already parsed
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initNavMenu();
    initSidebar();
}
