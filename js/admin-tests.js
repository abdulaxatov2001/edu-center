/* =============================================
   MUHFILLO EDU CENTER — ADMIN TESTS & SUBJECTS MANAGEMENT
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    let tests = [];
    let subjects = [];
    let currentUploadedFile = null; // { name, size, type, data }
    let selectedAnswerKey = {}; // { 0: 'A', 1: 'B', ... }

    // DOM Elements - Main & Header
    const testListEl = document.getElementById('testList');
    const testsEmptyEl = document.getElementById('testsEmpty');
    const createTestBtn = document.getElementById('createTestBtn');
    const manageSubjectsBtn = document.getElementById('manageSubjectsBtn');

    // DOM Elements - Test Modal
    const testModal = document.getElementById('testModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const testForm = document.getElementById('testForm');
    const testTitleInput = document.getElementById('testTitle');
    const testSubjectSelect = document.getElementById('testSubject');
    const testQuestionCountInput = document.getElementById('testQuestionCount');
    const quickAnswersInput = document.getElementById('quickAnswersInput');
    const answersKeyGrid = document.getElementById('answersKeyGrid');
    const answeredCountBadge = document.getElementById('answeredCountBadge');
    const saveTestBtn = document.getElementById('saveTestBtn');

    // DOM Elements - File Upload Zone
    const fileUploadZone = document.getElementById('fileUploadZone');
    const testFileInput = document.getElementById('testFileInput');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const filePreviewBox = document.getElementById('filePreviewBox');
    const fileIcon = document.getElementById('fileIcon');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const fileSizeDisplay = document.getElementById('fileSizeDisplay');
    const removeFileBtn = document.getElementById('removeFileBtn');

    // DOM Elements - Subjects Modal
    const subjectsModal = document.getElementById('subjectsModal');
    const subjectsModalClose = document.getElementById('subjectsModalClose');
    const subjectsModalOk = document.getElementById('subjectsModalOk');
    const newSubjectForm = document.getElementById('newSubjectForm');
    const newSubjectNameInput = document.getElementById('newSubjectName');
    const subjectsListEl = document.getElementById('subjectsList');

    // 1. Initial Load
    async function loadData() {
        try {
            [tests, subjects] = await Promise.all([
                DataService.getTests(),
                DataService.getSubjects()
            ]);

            populateSubjectsSelect();
            renderTests();
        } catch (err) {
            console.error('Error loading tests or subjects:', err);
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        }
    }

    // 2. Subjects Management
    function populateSubjectsSelect() {
        if (!testSubjectSelect) return;
        const currentVal = testSubjectSelect.value;
        testSubjectSelect.innerHTML = '<option value="">Fanni tanlang...</option>';

        subjects.forEach(subj => {
            const name = typeof subj === 'string' ? subj : subj.name;
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            if (name === currentVal) opt.selected = true;
            testSubjectSelect.appendChild(opt);
        });
    }

    function renderSubjectsList() {
        if (!subjectsListEl) return;
        subjectsListEl.innerHTML = '';

        if (subjects.length === 0) {
            subjectsListEl.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:8px 0;">Fanlar mavjud emas</div>';
            return;
        }

        subjects.forEach(subj => {
            const id = typeof subj === 'object' ? subj.id : subj;
            const name = typeof subj === 'object' ? subj.name : subj;

            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
            `;

            item.innerHTML = `
                <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(name)}</span>
                <button type="button" class="btn btn-sm btn-ghost btn-del-subj" data-id="${id}" data-name="${escapeHtml(name)}" style="color: var(--accent-red); padding: 2px 6px;">
                    &times;
                </button>
            `;
            subjectsListEl.appendChild(item);
        });

        // Delete handlers
        subjectsListEl.querySelectorAll('.btn-del-subj').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`"${name}" fanini o'chirmoqchimisiz?`)) {
                    await DataService.deleteSubject(id);
                    subjects = await DataService.getSubjects();
                    renderSubjectsList();
                    populateSubjectsSelect();
                    showToast('Fan o\'chirildi', 'info');
                }
            });
        });
    }

    // Open/Close Subjects Modal
    if (manageSubjectsBtn) {
        manageSubjectsBtn.addEventListener('click', () => {
            renderSubjectsList();
            if (subjectsModal) subjectsModal.style.display = 'flex';
        });
    }
    if (subjectsModalClose) subjectsModalClose.addEventListener('click', () => subjectsModal.style.display = 'none');
    if (subjectsModalOk) subjectsModalOk.addEventListener('click', () => subjectsModal.style.display = 'none');

    // Add New Subject
    if (newSubjectForm) {
        newSubjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = newSubjectNameInput.value.trim();
            if (!name) return;

            await DataService.addSubject(name);
            newSubjectNameInput.value = '';
            subjects = await DataService.getSubjects();
            renderSubjectsList();
            populateSubjectsSelect();
            showToast(`Yangi fan qo'shildi: ${name}`, 'success');
        });
    }

    // 3. File Upload (PDF, Word, Images)
    if (fileUploadZone && testFileInput) {
        fileUploadZone.addEventListener('click', () => testFileInput.click());

        // Drag & drop
        fileUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadZone.style.borderColor = 'var(--accent-blue)';
            fileUploadZone.style.background = 'rgba(59, 130, 246, 0.05)';
        });

        fileUploadZone.addEventListener('dragleave', () => {
            fileUploadZone.style.borderColor = 'var(--border-color)';
            fileUploadZone.style.background = 'var(--bg-glass)';
        });

        fileUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadZone.style.borderColor = 'var(--border-color)';
            fileUploadZone.style.background = 'var(--bg-glass)';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        testFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        if (!file) return;

        // Determine icon based on file type
        let icon = '📄';
        if (file.name.endsWith('.pdf')) icon = '📕';
        else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) icon = '📘';
        else if (file.type.startsWith('image/')) icon = '🖼️';

        const sizeKb = (file.size / 1024).toFixed(1);
        const sizeText = file.size > 1024 * 1024 
            ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' 
            : sizeKb + ' KB';

        const reader = new FileReader();
        reader.onload = (e) => {
            currentUploadedFile = {
                name: file.name,
                size: sizeText,
                type: file.type || 'application/octet-stream',
                data: e.target.result // Base64 dataURL
            };

            // Update UI
            if (uploadPrompt) uploadPrompt.style.display = 'none';
            if (filePreviewBox) {
                filePreviewBox.style.display = 'flex';
                if (fileIcon) fileIcon.textContent = icon;
                if (fileNameDisplay) fileNameDisplay.textContent = file.name;
                if (fileSizeDisplay) fileSizeDisplay.textContent = `${sizeText} • Yuklandi`;
            }
        };
        reader.readAsDataURL(file);
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentUploadedFile = null;
            if (testFileInput) testFileInput.value = '';
            if (uploadPrompt) uploadPrompt.style.display = 'block';
            if (filePreviewBox) filePreviewBox.style.display = 'none';
        });
    }

    // 4. Questions & Answer Key Grid Generator
    function renderAnswerKeyGrid(count) {
        if (!answersKeyGrid) return;
        answersKeyGrid.innerHTML = '';
        selectedAnswerKey = {};

        for (let i = 0; i < count; i++) {
            const row = document.createElement('div');
            row.className = 'answer-item';
            row.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                margin-bottom: 6px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
            `;

            row.innerHTML = `
                <span style="font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; color: var(--text-muted); min-width: 48px;">
                    ${i + 1}-savol:
                </span>
                <div class="answer-options" data-qindex="${i}" style="display:flex; gap: 6px; flex: 1; max-width: 220px;">
                    <button type="button" class="answer-btn" data-opt="A">A</button>
                    <button type="button" class="answer-btn" data-opt="B">B</button>
                    <button type="button" class="answer-btn" data-opt="C">C</button>
                    <button type="button" class="answer-btn" data-opt="D">D</button>
                </div>
            `;

            // Button click listener
            const btns = row.querySelectorAll('.answer-btn');
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const opt = btn.getAttribute('data-opt');
                    selectedAnswerKey[i] = opt;

                    btns.forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    updateAnsweredCount();
                    syncQuickAnswersInput();
                });
            });

            answersKeyGrid.appendChild(row);
        }

        updateAnsweredCount();
    }

    function updateAnsweredCount() {
        const total = parseInt(testQuestionCountInput.value) || 0;
        const answered = Object.keys(selectedAnswerKey).length;
        if (answeredCountBadge) {
            answeredCountBadge.textContent = `${answered} / ${total} ta belgilandi`;
            answeredCountBadge.style.color = answered === total ? 'var(--accent-green)' : 'var(--text-muted)';
        }
    }

    function syncQuickAnswersInput() {
        if (!quickAnswersInput) return;
        const total = parseInt(testQuestionCountInput.value) || 0;
        let str = '';
        for (let i = 0; i < total; i++) {
            str += selectedAnswerKey[i] || '_';
        }
        quickAnswersInput.value = str.replace(/_+$/, ''); // strip trailing underscores
    }

    // Dynamic question count change
    if (testQuestionCountInput) {
        testQuestionCountInput.addEventListener('input', () => {
            const count = Math.min(100, Math.max(1, parseInt(testQuestionCountInput.value) || 1));
            renderAnswerKeyGrid(count);
        });
    }

    // Quick text answers input parser (e.g. "ABCDABCD" or "1-A 2-B")
    if (quickAnswersInput) {
        quickAnswersInput.addEventListener('input', () => {
            const val = quickAnswersInput.value.toUpperCase();
            // Extract only A, B, C, D letters
            const letters = val.replace(/[^ABCD]/g, '').split('');

            const total = parseInt(testQuestionCountInput.value) || 0;
            letters.forEach((let, idx) => {
                if (idx < total) {
                    selectedAnswerKey[idx] = let;
                    const row = answersKeyGrid.children[idx];
                    if (row) {
                        const btns = row.querySelectorAll('.answer-btn');
                        btns.forEach(b => {
                            if (b.getAttribute('data-opt') === let) {
                                b.classList.add('selected');
                            } else {
                                b.classList.remove('selected');
                            }
                        });
                    }
                }
            });
            updateAnsweredCount();
        });
    }

    // 5. Open & Close Test Modal
    function openTestModal() {
        if (testForm) testForm.reset();
        currentUploadedFile = null;
        selectedAnswerKey = {};

        if (uploadPrompt) uploadPrompt.style.display = 'block';
        if (filePreviewBox) filePreviewBox.style.display = 'none';
        if (quickAnswersInput) quickAnswersInput.value = '';

        populateSubjectsSelect();
        const initialCount = parseInt(testQuestionCountInput.value) || 10;
        renderAnswerKeyGrid(initialCount);

        if (testModal) testModal.style.display = 'flex';
    }

    function closeTestModal() {
        if (testModal) testModal.style.display = 'none';
    }

    if (createTestBtn) createTestBtn.addEventListener('click', openTestModal);
    if (modalClose) modalClose.addEventListener('click', closeTestModal);
    if (modalCancel) modalCancel.addEventListener('click', closeTestModal);

    // 6. Save Test
    if (saveTestBtn) {
        saveTestBtn.addEventListener('click', async () => {
            const title = testTitleInput.value.trim();
            const subject = testSubjectSelect.value;
            const questionCount = parseInt(testQuestionCountInput.value) || 0;

            if (!title) {
                showToast('Iltimos, test nomini kiriting', 'warning');
                testTitleInput.focus();
                return;
            }
            if (!subject) {
                showToast('Iltimos, fanni tanlang', 'warning');
                testSubjectSelect.focus();
                return;
            }
            if (questionCount <= 0) {
                showToast('Savollar sonini to\'g\'ri kiriting', 'warning');
                testQuestionCountInput.focus();
                return;
            }

            const answeredKeysCount = Object.keys(selectedAnswerKey).length;
            if (answeredKeysCount === 0) {
                showToast('Kamida bitta to\'g\'ri javob kalitini belgilang', 'warning');
                return;
            }

            // Build test questions object with answer key
            const questions = [];
            for (let i = 0; i < questionCount; i++) {
                questions.push({
                    id: 'q_' + (i + 1),
                    orderNum: i + 1,
                    text: `${i + 1}-savol`,
                    correct: selectedAnswerKey[i] || 'A',
                    options: ['A', 'B', 'C', 'D']
                });
            }

            const testId = 'TEST-' + Math.floor(100 + Math.random() * 900);
            const currentUser = AuthService.getCurrentUser();

            const testData = {
                id: testId,
                title: title,
                subject: subject,
                questionCount: questionCount,
                questions: questions,
                answerKey: selectedAnswerKey,
                file: currentUploadedFile ? {
                    name: currentUploadedFile.name,
                    size: currentUploadedFile.size,
                    type: currentUploadedFile.type,
                    data: currentUploadedFile.data
                } : null,
                createdBy: currentUser ? (currentUser.fullName || currentUser.login) : 'admin'
            };

            saveTestBtn.disabled = true;
            try {
                await DataService.addTest(testData);
                showToast(`Test yaratildi! ID: ${testId}`, 'success');
                closeTestModal();
                await loadData();
            } catch (err) {
                console.error('Save test error:', err);
                showToast('Testni saqlashda xatolik yuz berdi', 'error');
            } finally {
                saveTestBtn.disabled = false;
            }
        });
    }

    // 7. Render Tests Cards
    function renderTests() {
        if (!testListEl) return;
        testListEl.innerHTML = '';

        if (!tests || tests.length === 0) {
            if (testsEmptyEl) {
                testListEl.appendChild(testsEmptyEl);
                testsEmptyEl.style.display = 'flex';
            }
            return;
        }

        if (testsEmptyEl) testsEmptyEl.style.display = 'none';

        tests.forEach(test => {
            const card = document.createElement('div');
            card.className = 'test-card';

            // Attached file badge & button
            let fileBadgeHtml = '';
            let fileActionHtml = '';

            if (test.file && test.file.name) {
                fileBadgeHtml = `
                    <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(59, 130, 246, 0.1); color:var(--accent-blue); padding:2px 8px; border-radius:4px; font-size:0.75rem;">
                        📄 ${escapeHtml(test.file.name)}
                    </span>
                `;

                fileActionHtml = `
                    <button class="btn btn-sm btn-outline btn-download-file" data-id="${test.id}" title="Faylni yuklab olish / ochish">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Fayl
                    </button>
                `;
            }

            card.innerHTML = `
                <div class="test-card-info">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <h3 class="test-card-title">${escapeHtml(test.title)}</h3>
                        <span class="test-card-id" title="O'qituvchilar uchun test ID">${test.id}</span>
                        ${fileBadgeHtml}
                    </div>
                    <div class="test-card-meta">
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            ${escapeHtml(test.subject || 'Umumiy')}
                        </span>
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            ${test.questionCount || (test.questions ? test.questions.length : 0)} ta savol
                        </span>
                        <span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${formatDate(test.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="test-card-actions">
                    ${fileActionHtml}
                    <button class="btn btn-sm btn-outline btn-copy-id" data-id="${test.id}" title="Test ID nusxa olish">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        ID nusxa
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete-test" data-id="${test.id}" title="O'chirish">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            `;
            testListEl.appendChild(card);
        });

        // Event listeners
        document.querySelectorAll('.btn-download-file').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const targetTest = tests.find(t => t.id === id);
                if (targetTest && targetTest.file && targetTest.file.data) {
                    const downloadWindow = window.open();
                    if (downloadWindow) {
                        downloadWindow.document.write(`<iframe src="${targetTest.file.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                    } else {
                        // Fallback download link
                        const a = document.createElement('a');
                        a.href = targetTest.file.data;
                        a.download = targetTest.file.name;
                        a.click();
                    }
                }
            });
        });

        document.querySelectorAll('.btn-copy-id').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                navigator.clipboard.writeText(id).then(() => {
                    showToast(`Test ID nusxalandi: ${id}`, 'success');
                }).catch(() => {
                    showToast(`Test ID: ${id}`, 'info');
                });
            });
        });

        document.querySelectorAll('.btn-delete-test').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm(`Rostdan ham bu testni o'chirmoqchimisiz (ID: ${id})?`)) {
                    await DataService.deleteTest(id);
                    showToast('Test muvaffaqiyatli o\'chirildi', 'success');
                    await loadData();
                }
            });
        });
    }

    await loadData();
});
