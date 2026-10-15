/* =============================================
   MUHFILLO EDU CENTER — TEACHER RESULTS HISTORY
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    let allResults = [];
    let allTests = [];

    const resultsTableBody = document.getElementById('resultsTableBody');
    const resultsEmpty = document.getElementById('resultsEmpty');
    const filterTest = document.getElementById('filterTest');
    const searchResult = document.getElementById('searchResult');

    async function loadResults() {
        try {
            [allResults, allTests] = await Promise.all([
                DataService.getResults(),
                DataService.getTests()
            ]);

            populateFilterTest();
            renderResults();
        } catch (err) {
            console.error('Error loading results history:', err);
            showToast('Natijalarni yuklashda xatolik', 'error');
        }
    }

    function populateFilterTest() {
        if (!filterTest) return;
        filterTest.innerHTML = '<option value="all">Barcha testlar</option>';
        allTests.forEach(test => {
            const opt = document.createElement('option');
            opt.value = test.id;
            opt.textContent = `${test.title} (${test.subject || 'Umumiy'})`;
            filterTest.appendChild(opt);
        });
    }

    function renderResults() {
        if (!resultsTableBody) return;
        resultsTableBody.innerHTML = '';

        const selectedTestId = filterTest ? filterTest.value : 'all';
        const query = searchResult ? searchResult.value.trim().toLowerCase() : '';

        const filtered = allResults.filter(r => {
            if (selectedTestId !== 'all' && r.testId !== selectedTestId) return false;
            if (query && !(r.studentName || '').toLowerCase().includes(query)) return false;
            return true;
        });

        if (filtered.length === 0) {
            if (resultsEmpty) resultsEmpty.style.display = 'flex';
            return;
        }

        if (resultsEmpty) resultsEmpty.style.display = 'none';

        filtered.forEach((res, idx) => {
            const tr = document.createElement('tr');

            let scoreColor = 'var(--accent-green)';
            if (res.percentage < 50) scoreColor = 'var(--accent-red)';
            else if (res.percentage < 75) scoreColor = 'var(--accent-amber)';

            tr.innerHTML = `
                <td><span class="font-mono text-muted">${idx + 1}</span></td>
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(res.studentName || 'O\'quvchi')}</div>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(res.studentGroup || '—')}</span>
                </td>
                <td>
                    <div>${escapeHtml(res.testTitle || res.testId)}</div>
                    <span class="test-card-id" style="font-size: 0.72rem;">${res.testId}</span>
                </td>
                <td>
                    <span class="font-mono" style="font-weight: 700; color: var(--accent-green);">
                        ${res.correctCount || 0}
                    </span>
                </td>
                <td><span class="font-mono">${res.totalQuestions || 0}</span></td>
                <td>
                    <span class="font-mono" style="font-weight: 800; font-size: 1.05rem; color: ${scoreColor};">
                        ${res.percentage || 0}%
                    </span>
                </td>
                <td><span style="font-size: 0.82rem; color: var(--text-muted);">${formatDate(res.submittedAt)}</span></td>
            `;

            resultsTableBody.appendChild(tr);
        });
    }

    if (filterTest) filterTest.addEventListener('change', renderResults);
    if (searchResult) searchResult.addEventListener('input', renderResults);

    await loadResults();
});
