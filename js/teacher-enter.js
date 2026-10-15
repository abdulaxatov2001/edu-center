/* =============================================
   MUHFILLO EDU CENTER — TEACHER RESULTS ENTRY
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    let allTests = [];
    let allStudents = [];
    let currentTest = null;
    let currentStudent = null;
    let studentAnswers = {}; // { 0: 'A', 1: 'C', ... }

    // DOM Elements
    const step1 = document.getElementById('step1');
    const selectTest = document.getElementById('selectTest');
    const testInfo = document.getElementById('testInfo');
    const testSubject = document.getElementById('testSubject');
    const testQuestionCount = document.getElementById('testQuestionCount');

    const step2 = document.getElementById('step2');
    const selectStudent = document.getElementById('selectStudent');

    const step3 = document.getElementById('step3');
    const answersGrid = document.getElementById('answersGrid');
    const answerSummary = document.getElementById('answerSummary');
    const correctCountEl = document.getElementById('correctCount');
    const wrongCountEl = document.getElementById('wrongCount');
    const scorePercentEl = document.getElementById('scorePercent');
    const resetAnswersBtn = document.getElementById('resetAnswers');
    const submitResultsBtn = document.getElementById('submitResults');

    const successMessage = document.getElementById('successMessage');
    const successDetail = document.getElementById('successDetail');
    const enterNextBtn = document.getElementById('enterNext');

    // 1. Initial Data Loading
    async function init() {
        try {
            [allTests, allStudents] = await Promise.all([
                DataService.getTests(),
                DataService.getStudents()
            ]);

            populateTestsDropdown();
            populateStudentsDropdown();
        } catch (err) {
            console.error('Error loading tests/students:', err);
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        }
    }

    // Populate Tests Dropdown
    function populateTestsDropdown() {
        if (!selectTest) return;
        selectTest.innerHTML = '<option value="">Test tanlang...</option>';
        allTests.forEach(test => {
            const opt = document.createElement('option');
            opt.value = test.id;
            opt.textContent = `${test.title} (${test.subject || 'Umumiy'}) — ID: ${test.id}`;
            selectTest.appendChild(opt);
        });
    }

    // Populate Students Dropdown
    function populateStudentsDropdown() {
        if (!selectStudent) return;
        selectStudent.innerHTML = '<option value="">O\'quvchi tanlang...</option>';
        allStudents.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st.id;
            opt.textContent = `${st.fullName} (${st.group || 'Guruhsiz'})`;
            selectStudent.appendChild(opt);
        });
    }

    // 2. Step 1: Handle Test Selection
    if (selectTest) {
        selectTest.addEventListener('change', () => {
            const testId = selectTest.value;
            if (!testId) {
                if (testInfo) testInfo.style.display = 'none';
                if (step2) step2.style.display = 'none';
                if (step3) step3.style.display = 'none';
                currentTest = null;
                return;
            }

            currentTest = allTests.find(t => t.id === testId);
            if (!currentTest) return;

            // Show test info
            if (testInfo) {
                testInfo.style.display = 'flex';
                if (testSubject) testSubject.textContent = currentTest.subject || 'Umumiy';
                const count = currentTest.questionCount || (currentTest.questions ? currentTest.questions.length : 0);
                if (testQuestionCount) testQuestionCount.textContent = `${count} ta`;

                // Show test file button if attached
                const fileWrapper = document.getElementById('testFileWrapper');
                const viewFileBtn = document.getElementById('viewTestFileBtn');
                if (fileWrapper && viewFileBtn) {
                    if (currentTest.file && currentTest.file.data) {
                        fileWrapper.style.display = 'block';
                        viewFileBtn.onclick = () => {
                            const win = window.open();
                            if (win) {
                                win.document.write(`<iframe src="${currentTest.file.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                            } else {
                                const a = document.createElement('a');
                                a.href = currentTest.file.data;
                                a.download = currentTest.file.name;
                                a.click();
                            }
                        };
                    } else {
                        fileWrapper.style.display = 'none';
                    }
                }
            }

            // Show Step 2
            if (step2) {
                step2.style.display = 'block';
                step2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Reset student and answers
            if (selectStudent) selectStudent.value = '';
            if (step3) step3.style.display = 'none';
            studentAnswers = {};
        });
    }

    // 3. Step 2: Handle Student Selection
    if (selectStudent) {
        selectStudent.addEventListener('change', () => {
            const studentId = selectStudent.value;
            if (!studentId) {
                if (step3) step3.style.display = 'none';
                currentStudent = null;
                return;
            }

            currentStudent = allStudents.find(s => s.id === studentId);
            if (!currentStudent || !currentTest) return;

            // Build Answers Grid
            renderAnswersGrid();

            if (step3) {
                step3.style.display = 'block';
                step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    // 4. Step 3: Render Answers Grid
    function renderAnswersGrid() {
        if (!answersGrid || !currentTest) return;
        answersGrid.innerHTML = '';
        studentAnswers = {};

        const totalQ = currentTest.questionCount || (currentTest.questions ? currentTest.questions.length : 0);

        for (let i = 0; i < totalQ; i++) {
            const qData = currentTest.questions && currentTest.questions[i] ? currentTest.questions[i] : null;
            const qItem = document.createElement('div');
            qItem.className = 'answer-item';
            qItem.id = `answerItem_${i}`;

            let qContentHtml = '';
            if (qData) {
                if (qData.image) {
                    qContentHtml += `<img src="${qData.image}" style="max-width:100%; max-height:140px; border-radius:6px; margin-bottom:8px; object-fit:contain;">`;
                }
                if (qData.text) {
                    qContentHtml += `<div style="font-size:0.85rem; margin-bottom:8px; color:var(--text-primary); font-weight:500;">${escapeHtml(qData.text)}</div>`;
                }
            }

            qItem.innerHTML = `
                <div class="answer-num">${i + 1}-Savol</div>
                ${qContentHtml}
                <div class="answer-options" data-qindex="${i}">
                    <button type="button" class="answer-btn" data-opt="A">A</button>
                    <button type="button" class="answer-btn" data-opt="B">B</button>
                    <button type="button" class="answer-btn" data-opt="C">C</button>
                    <button type="button" class="answer-btn" data-opt="D">D</button>
                </div>
            `;

            // Attach listeners to buttons
            const buttons = qItem.querySelectorAll('.answer-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const opt = btn.getAttribute('data-opt');
                    studentAnswers[i] = opt;

                    // Update UI state
                    buttons.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    qItem.classList.add('answered');

                    updateLiveCalculations();
                });
            });

            answersGrid.appendChild(qItem);
        }

        updateLiveCalculations();
    }

    // 5. Calculate live score
    function updateLiveCalculations() {
        if (!currentTest) return;

        const totalQ = currentTest.questionCount || (currentTest.questions ? currentTest.questions.length : 0);
        const answeredCount = Object.keys(studentAnswers).length;

        if (answeredCount === 0) {
            if (answerSummary) answerSummary.style.display = 'none';
            return;
        }

        if (answerSummary) answerSummary.style.display = 'flex';

        let correct = 0;
        let wrong = 0;

        for (let i = 0; i < totalQ; i++) {
            const chosen = studentAnswers[i];
            if (!chosen) continue;

            let correctLetter = null;
            if (currentTest.answerKey && currentTest.answerKey[i]) {
                correctLetter = currentTest.answerKey[i];
            } else if (currentTest.questions && currentTest.questions[i] && currentTest.questions[i].correct) {
                correctLetter = currentTest.questions[i].correct;
            }

            if (correctLetter) {
                if (chosen.toUpperCase() === correctLetter.toUpperCase()) {
                    correct++;
                } else {
                    wrong++;
                }
            } else {
                correct++;
            }
        }

        const percentage = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

        if (correctCountEl) correctCountEl.textContent = correct;
        if (wrongCountEl) wrongCountEl.textContent = wrong;
        if (scorePercentEl) scorePercentEl.textContent = `${percentage}%`;
    }

    // 6. Reset Answers
    if (resetAnswersBtn) {
        resetAnswersBtn.addEventListener('click', () => {
            studentAnswers = {};
            document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
            document.querySelectorAll('.answer-item').forEach(it => it.classList.remove('answered'));
            if (answerSummary) answerSummary.style.display = 'none';
            showToast('Javoblar tozalandi', 'info');
        });
    }

    // 7. Submit Results
    if (submitResultsBtn) {
        submitResultsBtn.addEventListener('click', async () => {
            if (!currentTest) {
                showToast('Iltimos, testni tanlang', 'warning');
                return;
            }
            if (!currentStudent) {
                showToast('Iltimos, o\'quvchini tanlang', 'warning');
                return;
            }

            const totalQ = currentTest.questionCount || (currentTest.questions ? currentTest.questions.length : 0);
            const answeredCount = Object.keys(studentAnswers).length;

            if (answeredCount === 0) {
                showToast('Kamida bitta javob kiriting', 'warning');
                return;
            }

            // Calculate final scores
            let correct = 0;
            for (let i = 0; i < totalQ; i++) {
                const chosen = studentAnswers[i];
                if (!chosen) continue;

                let correctLetter = null;
                if (currentTest.answerKey && currentTest.answerKey[i]) {
                    correctLetter = currentTest.answerKey[i];
                } else if (currentTest.questions && currentTest.questions[i] && currentTest.questions[i].correct) {
                    correctLetter = currentTest.questions[i].correct;
                }

                if (correctLetter) {
                    if (chosen.toUpperCase() === correctLetter.toUpperCase()) {
                        correct++;
                    }
                } else {
                    correct++;
                }
            }

            const percentage = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
            const currentUser = AuthService.getCurrentUser();

            const resultData = {
                testId: currentTest.id,
                testTitle: currentTest.title,
                studentId: currentStudent.id,
                studentName: currentStudent.fullName,
                studentGroup: currentStudent.group || 'Guruhsiz',
                teacherId: currentUser ? currentUser.uid : 'teacher_1',
                teacherName: currentUser ? (currentUser.fullName || currentUser.login) : 'O\'qituvchi',
                answers: studentAnswers,
                correctCount: correct,
                totalQuestions: totalQ,
                percentage: percentage
            };

            submitResultsBtn.disabled = true;
            try {
                await DataService.addResult(resultData);
                showToast(`Natija muvaffaqiyatli saqlandi: ${percentage}%`, 'success');

                // Show Success View
                if (step1) step1.style.display = 'none';
                if (step2) step2.style.display = 'none';
                if (step3) step3.style.display = 'none';

                if (successMessage) {
                    successMessage.style.display = 'flex';
                    if (successDetail) {
                        successDetail.textContent = `${currentStudent.fullName} — ${currentTest.title}: ${correct}/${totalQ} to'g'ri (${percentage}%)`;
                    }
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (err) {
                console.error('Error saving result:', err);
                showToast('Natijani saqlashda xatolik yuz berdi', 'error');
            } finally {
                submitResultsBtn.disabled = false;
            }
        });
    }

    // 8. Next Student Flow
    if (enterNextBtn) {
        enterNextBtn.addEventListener('click', () => {
            if (successMessage) successMessage.style.display = 'none';
            if (step1) step1.style.display = 'block';
            if (step2) step2.style.display = 'block';
            if (step3) step3.style.display = 'none';

            // Reset student and answers
            if (selectStudent) selectStudent.value = '';
            currentStudent = null;
            studentAnswers = {};

            step2.scrollIntoView({ behavior: 'smooth' });
        });
    }

    await init();
});
