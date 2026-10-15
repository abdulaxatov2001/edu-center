/* =============================================
   MUHFILLO EDU CENTER — PUBLIC RATING LOGIC
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    let allStudents = [];
    let allTests = [];
    let allResults = [];
    let currentSort = 'total'; // 'total', 'latest', 'name'

    // DOM Elements
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalTestsEl = document.getElementById('totalTests');
    const avgScoreEl = document.getElementById('avgScore');
    const topScoreEl = document.getElementById('topScore');

    const filterTestEl = document.getElementById('filterTest');
    const filterGroupEl = document.getElementById('filterGroup');
    const searchInputEl = document.getElementById('searchInput');

    const podiumEl = document.getElementById('podium');
    const podium1 = document.getElementById('podium1');
    const podium2 = document.getElementById('podium2');
    const podium3 = document.getElementById('podium3');

    const tableBody = document.getElementById('ratingTableBody');
    const tableEmpty = document.getElementById('tableEmpty');
    const sortBtns = document.querySelectorAll('.sort-btn');

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 1. Load Data
    async function loadData() {
        try {
            [allStudents, allTests, allResults] = await Promise.all([
                DataService.getStudents(),
                DataService.getTests(),
                DataService.getResults()
            ]);

            populateFilterDropdowns();
            renderRating();
        } catch (err) {
            console.error('Error loading rating data:', err);
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        }
    }

    // 2. Populate Filters
    function populateFilterDropdowns() {
        if (filterTestEl) {
            filterTestEl.innerHTML = '<option value="all">Barcha testlar</option>';
            allTests.forEach(test => {
                const opt = document.createElement('option');
                opt.value = test.id;
                opt.textContent = `${test.title} (${test.subject || ''})`;
                filterTestEl.appendChild(opt);
            });
        }

        if (filterGroupEl) {
            filterGroupEl.innerHTML = '<option value="all">Barcha guruhlar</option>';
            const groups = new Set();
            allStudents.forEach(s => {
                if (s.group) groups.add(s.group);
            });
            Array.from(groups).sort().forEach(grp => {
                const opt = document.createElement('option');
                opt.value = grp;
                opt.textContent = grp;
                filterGroupEl.appendChild(opt);
            });
        }
    }

    // 3. Process & Compute Student Statistics
    function computeRankings() {
        const selectedTestId = filterTestEl ? filterTestEl.value : 'all';
        const selectedGroup = filterGroupEl ? filterGroupEl.value : 'all';
        const searchQuery = searchInputEl ? searchInputEl.value.trim().toLowerCase() : '';

        // Filter results by selected test
        let filteredResults = allResults;
        if (selectedTestId !== 'all') {
            filteredResults = filteredResults.filter(r => r.testId === selectedTestId);
        }

        // Map students
        let studentMap = new Map();

        allStudents.forEach(st => {
            // Apply group filter
            if (selectedGroup !== 'all' && st.group !== selectedGroup) return;

            // Apply search query
            if (searchQuery && !st.fullName.toLowerCase().includes(searchQuery)) return;

            studentMap.set(st.id, {
                id: st.id,
                fullName: st.fullName,
                group: st.group || '—',
                testsCount: 0,
                totalCorrect: 0,
                totalQuestions: 0,
                scores: [],
                avgScore: 0,
                latestScore: 0,
                trend: 'neutral' // 'up', 'down', 'neutral'
            });
        });

        // Tally results
        filteredResults.forEach(res => {
            if (studentMap.has(res.studentId)) {
                const s = studentMap.get(res.studentId);
                s.testsCount += 1;
                s.totalCorrect += (res.correctCount || 0);
                s.totalQuestions += (res.totalQuestions || 0);
                s.scores.push({
                    percentage: res.percentage || 0,
                    date: res.submittedAt || ''
                });
            }
        });

        // Compute averages and trend
        const studentList = Array.from(studentMap.values()).map(s => {
            if (s.testsCount > 0) {
                s.avgScore = Math.round(s.scores.reduce((acc, curr) => acc + curr.percentage, 0) / s.testsCount);
                // Latest test score
                s.latestScore = s.scores[0] ? Math.round(s.scores[0].percentage) : s.avgScore;
                
                // Trend calculation
                if (s.scores.length >= 2) {
                    const first = s.scores[0].percentage;
                    const second = s.scores[1].percentage;
                    if (first > second) s.trend = 'up';
                    else if (first < second) s.trend = 'down';
                }
            }
            return s;
        });

        // Sort
        studentList.sort((a, b) => {
            if (currentSort === 'total') {
                if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
                return b.totalCorrect - a.totalCorrect;
            } else if (currentSort === 'latest') {
                return b.latestScore - a.latestScore;
            } else if (currentSort === 'name') {
                return a.fullName.localeCompare(b.fullName);
            }
            return 0;
        });

        return studentList;
    }

    // 4. Render Everything
    function renderRating() {
        const rankedStudents = computeRankings();

        // 4.1 Update Hero Stats
        const totalActiveStudents = allStudents.length;
        const totalTestsCount = allTests.length;

        let totalScoreSum = 0;
        let testedCount = 0;
        let maxScore = 0;

        rankedStudents.forEach(s => {
            if (s.testsCount > 0) {
                totalScoreSum += s.avgScore;
                testedCount++;
                if (s.avgScore > maxScore) maxScore = s.avgScore;
            }
        });

        const overallAvg = testedCount > 0 ? Math.round(totalScoreSum / testedCount) : 0;

        if (totalStudentsEl) totalStudentsEl.textContent = totalActiveStudents;
        if (totalTestsEl) totalTestsEl.textContent = totalTestsCount;
        if (avgScoreEl) avgScoreEl.textContent = `${overallAvg}%`;
        if (topScoreEl) topScoreEl.textContent = `${maxScore}%`;

        // 4.2 Update Podium
        const top3 = rankedStudents.slice(0, 3);
        updatePodium(top3);

        // 4.3 Update Rating Table
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (rankedStudents.length === 0) {
            if (tableEmpty) tableEmpty.style.display = 'flex';
            return;
        }

        if (tableEmpty) tableEmpty.style.display = 'none';

        rankedStudents.forEach((student, index) => {
            const rank = index + 1;
            const tr = document.createElement('tr');
            tr.className = 'table-row-animate';

            // Rank Badge Class
            let rankClass = 'rank-badge';
            if (rank === 1) rankClass += ' rank-badge--1';
            else if (rank === 2) rankClass += ' rank-badge--2';
            else if (rank === 3) rankClass += ' rank-badge--3';

            // Trend indicator
            let trendBadge = `<span class="trend-badge trend-badge--neutral">● Barqaror</span>`;
            if (student.trend === 'up') {
                trendBadge = `<span class="trend-badge trend-badge--up">▲ O'sish</span>`;
            } else if (student.trend === 'down') {
                trendBadge = `<span class="trend-badge trend-badge--down">▼ Pasayish</span>`;
            }

            // Score color
            let scoreColorClass = 'score-high';
            if (student.avgScore < 50) scoreColorClass = 'score-low';
            else if (student.avgScore < 75) scoreColorClass = 'score-mid';

            tr.innerHTML = `
                <td class="td-rank">
                    <span class="${rankClass}">${rank}</span>
                </td>
                <td class="td-name">
                    <div class="student-name-box">
                        <span class="student-avatar-sm">${student.fullName.charAt(0).toUpperCase()}</span>
                        <div class="student-meta-box">
                            <span class="student-fullname">${escapeHtml(student.fullName)}</span>
                            <span class="student-group-mobile">${escapeHtml(student.group)}</span>
                        </div>
                    </div>
                </td>
                <td class="td-group">
                    <span class="badge-group">${escapeHtml(student.group)}</span>
                </td>
                <td class="td-tests">
                    <span class="tests-count">${student.testsCount} ta test</span>
                </td>
                <td class="td-correct">
                    <span class="correct-badge">${student.totalCorrect} / ${student.totalQuestions}</span>
                </td>
                <td class="td-score">
                    <div class="score-progress-wrap">
                        <span class="score-number ${scoreColorClass}">${student.avgScore}%</span>
                        <div class="score-bar-bg">
                            <div class="score-bar-fill" style="width: ${student.avgScore}%;"></div>
                        </div>
                    </div>
                </td>
                <td class="td-trend">${trendBadge}</td>
            `;

            tableBody.appendChild(tr);
        });
    }

    // 5. Update Podium Element
    function updatePodium(top3) {
        if (!podiumEl) return;

        const p1 = top3[0];
        const p2 = top3[1];
        const p3 = top3[2];

        // 1st Place
        if (podium1) {
            const nameEl = podium1.querySelector('.podium-name');
            const scoreEl = podium1.querySelector('.podium-score');
            if (p1 && p1.avgScore > 0) {
                if (nameEl) nameEl.textContent = p1.fullName;
                if (scoreEl) scoreEl.textContent = `${p1.avgScore}%`;
            } else {
                if (nameEl) nameEl.textContent = '—';
                if (scoreEl) scoreEl.textContent = '0%';
            }
        }

        // 2nd Place
        if (podium2) {
            const nameEl = podium2.querySelector('.podium-name');
            const scoreEl = podium2.querySelector('.podium-score');
            if (p2 && p2.avgScore > 0) {
                if (nameEl) nameEl.textContent = p2.fullName;
                if (scoreEl) scoreEl.textContent = `${p2.avgScore}%`;
            } else {
                if (nameEl) nameEl.textContent = '—';
                if (scoreEl) scoreEl.textContent = '0%';
            }
        }

        // 3rd Place
        if (podium3) {
            const nameEl = podium3.querySelector('.podium-name');
            const scoreEl = podium3.querySelector('.podium-score');
            if (p3 && p3.avgScore > 0) {
                if (nameEl) nameEl.textContent = p3.fullName;
                if (scoreEl) scoreEl.textContent = `${p3.avgScore}%`;
            } else {
                if (nameEl) nameEl.textContent = '—';
                if (scoreEl) scoreEl.textContent = '0%';
            }
        }
    }

    // 6. Listeners for Filters & Sorting
    if (filterTestEl) filterTestEl.addEventListener('change', renderRating);
    if (filterGroupEl) filterGroupEl.addEventListener('change', renderRating);
    if (searchInputEl) searchInputEl.addEventListener('input', renderRating);

    sortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sortBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSort = btn.getAttribute('data-sort') || 'total';
            renderRating();
        });
    });

    // Initial load
    await loadData();
});
