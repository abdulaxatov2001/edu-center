/* =============================================
   MUHFILLO EDU CENTER — ADMIN DASHBOARD
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    const dashStudentsEl = document.getElementById('dashStudents');
    const dashTestsEl = document.getElementById('dashTests');
    const dashResultsEl = document.getElementById('dashResults');
    const dashTeachersEl = document.getElementById('dashTeachers');
    const recentResultsEl = document.getElementById('recentResults');

    async function loadDashboardStats() {
        try {
            const [students, tests, results, teachers] = await Promise.all([
                DataService.getStudents(),
                DataService.getTests(),
                DataService.getResults(),
                DataService.getTeachers()
            ]);

            // Set counters
            if (dashStudentsEl) dashStudentsEl.textContent = students.length;
            if (dashTestsEl) dashTestsEl.textContent = tests.length;
            if (dashResultsEl) dashResultsEl.textContent = results.length;
            if (dashTeachersEl) dashTeachersEl.textContent = teachers.length;

            // Render Recent Results
            renderRecentResults(results);
        } catch (err) {
            console.error('Error loading dashboard stats:', err);
            showToast('Dashboard ma\'lumotlarini yuklashda xatolik', 'error');
        }
    }

    function renderRecentResults(results) {
        if (!recentResultsEl) return;
        recentResultsEl.innerHTML = '';

        if (!results || results.length === 0) {
            recentResultsEl.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    <p>Hozircha natijalar kiritilmagan</p>
                    <span>O'qituvchi natijalarni kiritishi bilan bu yerda ko'rinadi</span>
                </div>
            `;
            return;
        }

        const recent = results.slice(0, 8);
        recent.forEach(item => {
            const row = document.createElement('div');
            row.className = 'recent-item';
            row.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-md);
                margin-bottom: 8px;
                transition: all 0.2s ease;
            `;

            let badgeColor = 'var(--accent-green)';
            if (item.percentage < 50) badgeColor = 'var(--accent-red)';
            else if (item.percentage < 75) badgeColor = 'var(--accent-amber)';

            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">
                        ${(item.studentName || 'O').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">
                            ${escapeHtml(item.studentName)}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); display:flex; gap: 8px;">
                            <span>${escapeHtml(item.testTitle || item.testId)}</span>
                            <span>•</span>
                            <span>${escapeHtml(item.studentGroup || '')}</span>
                            <span>•</span>
                            <span>${formatDate(item.submittedAt)}</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-family: var(--font-mono); font-weight: 800; font-size: 1.1rem; color: ${badgeColor};">
                        ${item.percentage}%
                    </span>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                        ${item.correctCount} / ${item.totalQuestions} to'g'ri
                    </div>
                </div>
            `;
            recentResultsEl.appendChild(row);
        });
    }

    await loadDashboardStats();
});
