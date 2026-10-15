/* =============================================
   MUHFILLO EDU CENTER — TEACHER DASHBOARD
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    const dashTestsEl = document.getElementById('dashTests');
    const dashMyResultsEl = document.getElementById('dashMyResults');

    async function loadTeacherDashboard() {
        try {
            const user = AuthService.getCurrentUser();
            const [tests, results] = await Promise.all([
                DataService.getTests(),
                DataService.getResults()
            ]);

            if (dashTestsEl) dashTestsEl.textContent = tests.length;

            if (dashMyResultsEl) {
                // Filter results submitted by this teacher if teacherId exists, else total results
                const myResults = user ? results.filter(r => r.teacherId === user.uid || r.teacherName === user.fullName) : results;
                dashMyResultsEl.textContent = myResults.length > 0 ? myResults.length : results.length;
            }
        } catch (err) {
            console.error('Error loading teacher dashboard:', err);
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        }
    }

    await loadTeacherDashboard();
});
