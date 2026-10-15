/* =============================================
   MUHFILLO EDU CENTER — ADMIN ANALYTICS & CHARTS
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    const barChartCanvas = document.getElementById('barChart');
    const pieChartCanvas = document.getElementById('pieChart');
    const topStudentsList = document.getElementById('topStudentsList');
    const analyticsTableBody = document.getElementById('analyticsTableBody');

    let barChartInstance = null;
    let pieChartInstance = null;

    async function loadAnalytics() {
        try {
            const [students, tests, results] = await Promise.all([
                DataService.getStudents(),
                DataService.getTests(),
                DataService.getResults()
            ]);

            renderCharts(tests, results);
            renderTopStudents(students, results);
            renderDetailedTable(tests, results);
        } catch (err) {
            console.error('Error loading analytics:', err);
            showToast('Analitika ma\'lumotlarini yuklashda xatolik', 'error');
        }
    }

    // 1. Render Chart.js Visualizations
    function renderCharts(tests, results) {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js kutubxonasi topilmadi');
            return;
        }

        // Set Chart.js dark mode defaults
        Chart.defaults.color = '#9CA3AF';
        Chart.defaults.font.family = 'Inter, -apple-system, sans-serif';

        // 1.1 Bar Chart: Score across tests
        if (barChartCanvas) {
            const testLabels = tests.map(t => t.title.length > 20 ? t.title.substring(0, 18) + '...' : t.title);
            const testAvgScores = tests.map(t => {
                const tResults = results.filter(r => r.testId === t.id);
                if (tResults.length === 0) return 0;
                const sum = tResults.reduce((a, b) => a + (b.percentage || 0), 0);
                return Math.round(sum / tResults.length);
            });

            if (barChartInstance) barChartInstance.destroy();

            const ctx = barChartCanvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');

            barChartInstance = new Chart(barChartCanvas, {
                type: 'bar',
                data: {
                    labels: testLabels.length > 0 ? testLabels : ['Testlar yo\'q'],
                    datasets: [{
                        label: 'O\'rtacha ball (%)',
                        data: testAvgScores.length > 0 ? testAvgScores : [0],
                        backgroundColor: gradient,
                        borderColor: '#10B981',
                        borderWidth: 1.5,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => ` ${context.parsed.y}%`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { callback: v => v + '%' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 1.2 Pie/Doughnut Chart: Average score per group
        if (pieChartCanvas) {
            const groupStats = {};
            results.forEach(r => {
                const grp = r.studentGroup || 'Boshqa';
                if (!groupStats[grp]) {
                    groupStats[grp] = { sum: 0, count: 0 };
                }
                groupStats[grp].sum += (r.percentage || 0);
                groupStats[grp].count += 1;
            });

            const groupLabels = Object.keys(groupStats);
            const groupAverages = groupLabels.map(g => Math.round(groupStats[g].sum / groupStats[g].count));

            const colors = [
                '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'
            ];

            if (pieChartInstance) pieChartInstance.destroy();

            pieChartInstance = new Chart(pieChartCanvas, {
                type: 'doughnut',
                data: {
                    labels: groupLabels.length > 0 ? groupLabels : ['Guruhlar yo\'q'],
                    datasets: [{
                        data: groupAverages.length > 0 ? groupAverages : [100],
                        backgroundColor: colors.slice(0, Math.max(1, groupLabels.length)),
                        borderColor: '#111827',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: 12, padding: 14 }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => ` ${context.label}: ${context.raw}%`
                            }
                        }
                    },
                    cutout: '65%'
                }
            });
        }
    }

    // 2. Render Top 10 Students
    function renderTopStudents(students, results) {
        if (!topStudentsList) return;
        topStudentsList.innerHTML = '';

        const studentScores = {};
        students.forEach(s => {
            studentScores[s.id] = {
                name: s.fullName,
                group: s.group || '—',
                total: 0,
                count: 0
            };
        });

        results.forEach(r => {
            if (studentScores[r.studentId]) {
                studentScores[r.studentId].total += (r.percentage || 0);
                studentScores[r.studentId].count += 1;
            }
        });

        const sorted = Object.values(studentScores)
            .filter(s => s.count > 0)
            .map(s => ({
                name: s.name,
                group: s.group,
                avg: Math.round(s.total / s.count)
            }))
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 10);

        if (sorted.length === 0) {
            topStudentsList.innerHTML = `
                <div class="empty-state">
                    <p style="font-size: 0.85rem; color: var(--text-muted);">Hozircha natijalar kiritilmagan</p>
                </div>
            `;
            return;
        }

        sorted.forEach((item, idx) => {
            const div = document.createElement('div');
            div.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                border-bottom: 1px solid var(--border-color);
                font-size: 0.88rem;
            `;

            let rankColor = 'var(--text-muted)';
            if (idx === 0) rankColor = '#F59E0B';
            else if (idx === 1) rankColor = '#94A3B8';
            else if (idx === 2) rankColor = '#CD7F32';

            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-family: var(--font-mono); font-weight: 800; color: ${rankColor}; width: 18px;">
                        #${idx + 1}
                    </span>
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(item.name)}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(item.group)}</div>
                    </div>
                </div>
                <div style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-green); font-size: 0.95rem;">
                    ${item.avg}%
                </div>
            `;
            topStudentsList.appendChild(div);
        });
    }

    // 3. Render Detailed Test Table
    function renderDetailedTable(tests, results) {
        if (!analyticsTableBody) return;
        analyticsTableBody.innerHTML = '';

        if (!tests || tests.length === 0) {
            analyticsTableBody.innerHTML = `
                <tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 2rem;">Testlar topilmadi</td></tr>
            `;
            return;
        }

        tests.forEach(test => {
            const tResults = results.filter(r => r.testId === test.id);
            const participantsCount = tResults.length;

            let avgScore = 0;
            let maxScore = 0;
            let minScore = 0;

            if (participantsCount > 0) {
                const scores = tResults.map(r => r.percentage || 0);
                avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / participantsCount);
                maxScore = Math.max(...scores);
                minScore = Math.min(...scores);
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(test.title)}</div>
                    <span class="test-card-id" style="font-size: 0.72rem;">${test.id}</span>
                </td>
                <td><span class="badge-group">${escapeHtml(test.subject || '—')}</span></td>
                <td><span class="font-mono">${test.questionCount || (test.questions ? test.questions.length : 0)} ta</span></td>
                <td><span class="font-mono">${participantsCount} ta o'quvchi</span></td>
                <td>
                    <span class="font-mono" style="font-weight: 700; color: ${avgScore >= 70 ? 'var(--accent-green)' : (avgScore >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)')};">
                        ${participantsCount > 0 ? avgScore + '%' : '—'}
                    </span>
                </td>
                <td><span class="font-mono" style="color: var(--accent-green);">${participantsCount > 0 ? maxScore + '%' : '—'}</span></td>
                <td><span class="font-mono" style="color: var(--accent-red);">${participantsCount > 0 ? minScore + '%' : '—'}</span></td>
            `;
            analyticsTableBody.appendChild(tr);
        });
    }

    await loadAnalytics();
});
