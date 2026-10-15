/* =============================================
   MUHFILLO EDU CENTER — AUTHENTICATION SERVICE
   ============================================= */

const AuthService = {
    /**
     * Get currently logged-in user
     */
    getCurrentUser() {
        const local = localStorage.getItem('muhfillo_current_user');
        if (local) {
            try {
                const user = JSON.parse(local);
                // Admin login is always guaranteed admin role
                if (user && user.login && user.login.toLowerCase().includes('admin')) {
                    user.role = 'admin';
                }
                return user;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * Save session to storage
     */
    saveSession(user) {
        if (user && user.login && user.login.toLowerCase().includes('admin')) {
            user.role = 'admin';
        }
        localStorage.setItem('muhfillo_current_user', JSON.stringify(user));
    },

    /**
     * Clear session
     */
    clearSession() {
        localStorage.removeItem('muhfillo_current_user');
    },

    /**
     * Login with username and password
     */
    async login(username, password) {
        const cleanLogin = username.trim().toLowerCase();

        // 1. If Firebase is active and configured
        if (isFirebaseConfigured() && typeof auth !== 'undefined' && auth !== null) {
            const email = loginToEmail(cleanLogin);
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const fbUser = userCredential.user;

            // Determine role: if username contains 'admin', default to 'admin'
            let role = cleanLogin.includes('admin') ? 'admin' : 'teacher';
            let fullName = cleanLogin.includes('admin') ? 'Bosh Administrator' : cleanLogin;

            if (db) {
                try {
                    const userDoc = await db.collection('users').doc(fbUser.uid).get();
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        role = data.role || role;
                        fullName = data.fullName || fullName;
                    } else {
                        // User doc doesn't exist yet in Firestore, create it automatically
                        await db.collection('users').doc(fbUser.uid).set({
                            uid: fbUser.uid,
                            login: cleanLogin,
                            email: email,
                            fullName: fullName,
                            role: role,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                } catch (err) {
                    console.warn('Firestore user doc sync error:', err);
                }
            }

            const sessionUser = {
                uid: fbUser.uid,
                login: cleanLogin,
                email: email,
                fullName: fullName,
                role: role
            };
            this.saveSession(sessionUser);
            return sessionUser;
        }

        // 2. Demo / Fallback Mode
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        const users = data ? JSON.parse(data) : DEMO_DATA.users;

        let matched = users.find(u => u.login.toLowerCase() === cleanLogin);

        // Predefined fallback for admin/teacher quick testing
        if (!matched) {
            if (cleanLogin.includes('admin')) {
                matched = { uid: 'admin_1', login: cleanLogin, role: 'admin', fullName: 'Bosh Administrator' };
            } else if (cleanLogin.includes('teacher') || cleanLogin.includes('muallim')) {
                matched = { uid: 'teacher_1', login: cleanLogin, role: 'teacher', fullName: 'O\'qituvchi' };
            }
        }

        if (matched) {
            this.saveSession(matched);
            return matched;
        }

        throw new Error('Login yoki parol noto\'g\'ri');
    },

    /**
     * Logout
     */
    async logout() {
        if (isFirebaseConfigured() && typeof auth !== 'undefined') {
            try {
                await auth.signOut();
            } catch (e) {
                console.warn('Firebase signout error:', e);
            }
        }
        this.clearSession();
        
        // Determine redirect URL
        const isSubdir = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/teacher/');
        window.location.href = isSubdir ? '../login.html' : 'login.html';
    },

    /**
     * Enforce Route Authorization
     */
    checkAuth(requiredRole = null) {
        const user = this.getCurrentUser();
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.endsWith('login.html');
        const isAdminPage = currentPath.includes('/admin/');
        const isTeacherPage = currentPath.includes('/teacher/');

        // If on login page and already logged in, redirect to respective dashboard
        if (isLoginPage) {
            if (user) {
                if (user.role === 'admin') {
                    window.location.href = 'admin/dashboard.html';
                } else {
                    window.location.href = 'teacher/dashboard.html';
                }
            }
            return;
        }

        // If on protected page and not logged in, redirect to login
        if ((isAdminPage || isTeacherPage) && !user) {
            const redirectPath = isAdminPage || isTeacherPage ? '../login.html' : 'login.html';
            window.location.href = redirectPath;
            return;
        }

        // Role verification
        if (isAdminPage && user && user.role !== 'admin') {
            // Teacher trying to access admin
            window.location.href = '../teacher/dashboard.html';
            return;
        }

        // If admin is currently browsing teacher pages, give quick switch back to admin
        if (isTeacherPage && user && user.role === 'admin') {
            const sidebarNav = document.querySelector('.sidebar-nav');
            if (sidebarNav && !document.getElementById('adminSwitchLink')) {
                const switchLink = document.createElement('a');
                switchLink.id = 'adminSwitchLink';
                switchLink.href = '../admin/dashboard.html';
                switchLink.className = 'sidebar-link';
                switchLink.style.cssText = 'color: #F59E0B; font-weight: 700; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 8px; margin: 8px 12px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; gap: 8px; padding: 10px 14px;';
                switchLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> 👑 Admin Panelga o'tish`;
                sidebarNav.prepend(switchLink);
            }
        }

        // Update sidebar UI with user's name & role
        if (user) {
            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');
            const userAvatarEl = document.querySelector('.user-avatar');

            if (userNameEl) userNameEl.textContent = user.fullName || user.login;
            if (userRoleEl) userRoleEl.textContent = user.role === 'admin' ? 'Administrator' : 'O\'qituvchi';
            if (userAvatarEl && (user.fullName || user.login)) {
                userAvatarEl.textContent = (user.fullName || user.login).charAt(0).toUpperCase();
            }
        }
    }
};

// ---------------------------------------------
// EVENT LISTENERS & PAGE SETUP
// ---------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Check page authorization
    AuthService.checkAuth();

    // 1. Password visibility toggle (Login Page)
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('loginPassword');
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            const eyeIcon = passwordToggle.querySelector('.eye-icon');
            const eyeOffIcon = passwordToggle.querySelector('.eye-off-icon');
            if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : 'block';
            if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? 'block' : 'none';
        });
    }

    // 2. Login Form Submission (Login Page)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            const errorBox = document.getElementById('loginError');
            const errorText = document.getElementById('loginErrorText');
            const submitBtn = document.getElementById('loginBtn');
            const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
            const btnLoader = submitBtn ? submitBtn.querySelector('.btn-loader') : null;

            if (!usernameInput || !passwordInput) return;

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            if (errorBox) errorBox.style.display = 'none';

            // Loading state
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-flex';

            try {
                const user = await AuthService.login(username, password);
                showToast(`Xush kelibsiz, ${user.fullName || user.login}!`, 'success');

                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'teacher/dashboard.html';
                    }
                }, 400);
            } catch (err) {
                console.error('Login error:', err);
                if (errorBox) {
                    errorBox.style.display = 'flex';
                    if (errorText) errorText.textContent = err.message || 'Login yoki parol noto\'g\'ri';
                }
                showToast(err.message || 'Kirishda xatolik yuz berdi', 'error');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        });
    }

    // 3. Logout Button in Sidebars
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Tizimdan chiqishni tasdiqlaysizmi?')) {
                AuthService.logout();
            }
        });
    }
});
