/* =============================================
   MUHFILLO EDU CENTER — ADMIN STUDENTS & GROUPS MANAGEMENT
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
    let allStudents = [];
    let allGroups = [];
    let currentEditStudentId = null;

    // DOM Elements - Students
    const studentsTableBody = document.getElementById('studentsTableBody');
    const studentsEmpty = document.getElementById('studentsEmpty');
    const filterGroup = document.getElementById('filterGroup');
    const searchStudent = document.getElementById('searchStudent');
    const addStudentBtn = document.getElementById('addStudentBtn');

    // Modal - Student
    const studentModal = document.getElementById('studentModal');
    const studentModalTitle = document.getElementById('studentModalTitle');
    const studentModalClose = document.getElementById('studentModalClose');
    const studentModalCancel = document.getElementById('studentModalCancel');
    const studentForm = document.getElementById('studentForm');
    const studentNameInput = document.getElementById('studentName');
    const studentGroupSelect = document.getElementById('studentGroup');
    const studentPhoneInput = document.getElementById('studentPhone');
    const saveStudentBtn = document.getElementById('saveStudentBtn');

    // Modal - Groups Management
    const manageGroupsBtn = document.getElementById('manageGroupsBtn');
    const groupsModal = document.getElementById('groupsModal');
    const groupsModalClose = document.getElementById('groupsModalClose');
    const groupsModalOk = document.getElementById('groupsModalOk');
    const newGroupForm = document.getElementById('newGroupForm');
    const newGroupNameInput = document.getElementById('newGroupName');
    const groupsListEl = document.getElementById('groupsList');

    // Modal - Teacher
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    const teacherModal = document.getElementById('teacherModal');
    const teacherModalClose = document.getElementById('teacherModalClose');
    const teacherModalCancel = document.getElementById('teacherModalCancel');
    const teacherForm = document.getElementById('teacherForm');
    const teacherNameInput = document.getElementById('teacherName');
    const teacherLoginInput = document.getElementById('teacherLogin');
    const teacherPasswordInput = document.getElementById('teacherPassword');
    const saveTeacherBtn = document.getElementById('saveTeacherBtn');

    // 1. Load Data
    async function loadData() {
        try {
            [allStudents, allGroups] = await Promise.all([
                DataService.getStudents(),
                DataService.getGroups()
            ]);

            populateGroupDropdowns();
            renderStudents();
        } catch (err) {
            console.error('Error loading students or groups:', err);
            showToast('Ma\'lumotlarni yuklashda xatolik', 'error');
        }
    }

    // 2. Populate Group Dropdowns (Table filter and Student modal select)
    function populateGroupDropdowns() {
        // Table filter select
        if (filterGroup) {
            const currentFilter = filterGroup.value;
            filterGroup.innerHTML = '<option value="all">Barcha guruhlar</option>';
            allGroups.forEach(grp => {
                const name = typeof grp === 'string' ? grp : grp.name;
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                if (name === currentFilter) opt.selected = true;
                filterGroup.appendChild(opt);
            });
        }

        // Student form select
        if (studentGroupSelect) {
            const currentSelected = studentGroupSelect.value;
            studentGroupSelect.innerHTML = '<option value="">Guruhni tanlang...</option>';
            allGroups.forEach(grp => {
                const name = typeof grp === 'string' ? grp : grp.name;
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                if (name === currentSelected) opt.selected = true;
                studentGroupSelect.appendChild(opt);
            });
        }
    }

    // 3. Groups Management Modal
    function renderGroupsList() {
        if (!groupsListEl) return;
        groupsListEl.innerHTML = '';

        if (allGroups.length === 0) {
            groupsListEl.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:8px 0;">Guruhlar mavjud emas</div>';
            return;
        }

        allGroups.forEach(grp => {
            const id = typeof grp === 'object' ? grp.id : grp;
            const name = typeof grp === 'object' ? grp.name : grp;

            const div = document.createElement('div');
            div.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
            `;

            div.innerHTML = `
                <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(name)}</span>
                <button type="button" class="btn btn-sm btn-ghost btn-del-group" data-id="${id}" data-name="${escapeHtml(name)}" style="color: var(--accent-red); padding: 2px 6px;">
                    &times;
                </button>
            `;
            groupsListEl.appendChild(div);
        });

        // Delete group handler
        groupsListEl.querySelectorAll('.btn-del-group').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`"${name}" guruhini o'chirmoqchimisiz?`)) {
                    await DataService.deleteGroup(id);
                    allGroups = await DataService.getGroups();
                    renderGroupsList();
                    populateGroupDropdowns();
                    showToast('Guruh o\'chirildi', 'info');
                }
            });
        });
    }

    if (manageGroupsBtn) {
        manageGroupsBtn.addEventListener('click', () => {
            renderGroupsList();
            if (groupsModal) groupsModal.style.display = 'flex';
        });
    }
    if (groupsModalClose) groupsModalClose.addEventListener('click', () => groupsModal.style.display = 'none');
    if (groupsModalOk) groupsModalOk.addEventListener('click', () => groupsModal.style.display = 'none');

    // Add New Group
    if (newGroupForm) {
        newGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = newGroupNameInput.value.trim();
            if (!name) return;

            await DataService.addGroup(name);
            newGroupNameInput.value = '';
            allGroups = await DataService.getGroups();
            renderGroupsList();
            populateGroupDropdowns();
            showToast(`Yangi guruh qo'shildi: ${name}`, 'success');
        });
    }

    // 4. Render Students Table
    function renderStudents() {
        if (!studentsTableBody) return;
        studentsTableBody.innerHTML = '';

        const selectedGroup = filterGroup ? filterGroup.value : 'all';
        const query = searchStudent ? searchStudent.value.trim().toLowerCase() : '';

        const filtered = allStudents.filter(s => {
            if (selectedGroup !== 'all' && s.group !== selectedGroup) return false;
            if (query && !s.fullName.toLowerCase().includes(query) && !(s.phone || '').includes(query)) return false;
            return true;
        });

        if (filtered.length === 0) {
            if (studentsEmpty) studentsEmpty.style.display = 'flex';
            return;
        }

        if (studentsEmpty) studentsEmpty.style.display = 'none';

        filtered.forEach((st, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="font-mono text-muted">${idx + 1}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--gradient-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
                            ${(st.fullName || 'O').charAt(0).toUpperCase()}
                        </div>
                        <span style="font-weight: 600; color: var(--text-primary);">${escapeHtml(st.fullName)}</span>
                    </div>
                </td>
                <td><span class="badge-group">${escapeHtml(st.group || '—')}</span></td>
                <td><span style="color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.88rem;">${escapeHtml(st.phone || '—')}</span></td>
                <td><span style="color: var(--text-muted); font-size: 0.82rem;">${formatDate(st.createdAt)}</span></td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-ghost btn-edit-student" data-id="${st.id}" title="Tahrirlash">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn btn-sm btn-danger btn-del-student" data-id="${st.id}" title="O'chirish">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </td>
            `;
            studentsTableBody.appendChild(tr);
        });

        // Edit handlers
        document.querySelectorAll('.btn-edit-student').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const target = allStudents.find(s => s.id === id);
                if (target) {
                    currentEditStudentId = id;
                    studentModalTitle.textContent = 'O\'quvchini tahrirlash';
                    studentNameInput.value = target.fullName || '';
                    populateGroupDropdowns();
                    studentGroupSelect.value = target.group || '';
                    studentPhoneInput.value = target.phone || '';
                    openStudentModal();
                }
            });
        });

        // Delete handlers
        document.querySelectorAll('.btn-del-student').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const target = allStudents.find(s => s.id === id);
                if (confirm(`Haqiqatan ham "${target ? target.fullName : 'o\'quvchi'}"ni o'chirmoqchimisiz?`)) {
                    await DataService.deleteStudent(id);
                    showToast('O\'quvchi muvaffaqiyatli o\'chirildi', 'success');
                    await loadData();
                }
            });
        });
    }

    // 5. Student Modal Open / Close
    function openStudentModal() {
        populateGroupDropdowns();
        if (!currentEditStudentId) {
            studentModalTitle.textContent = 'O\'quvchi qo\'shish';
            if (studentForm) studentForm.reset();
        }
        if (studentModal) studentModal.style.display = 'flex';
    }

    function closeStudentModal() {
        currentEditStudentId = null;
        if (studentModal) studentModal.style.display = 'none';
    }

    if (addStudentBtn) addStudentBtn.addEventListener('click', () => {
        currentEditStudentId = null;
        openStudentModal();
    });
    if (studentModalClose) studentModalClose.addEventListener('click', closeStudentModal);
    if (studentModalCancel) studentModalCancel.addEventListener('click', closeStudentModal);

    // Save Student
    if (saveStudentBtn) {
        saveStudentBtn.addEventListener('click', async () => {
            const name = studentNameInput.value.trim();
            const group = studentGroupSelect.value;
            const phone = studentPhoneInput.value.trim();

            if (!name) {
                showToast('Iltimos, o\'quvchi ismini kiriting', 'warning');
                studentNameInput.focus();
                return;
            }
            if (!group) {
                showToast('Iltimos, guruhni tanlang', 'warning');
                studentGroupSelect.focus();
                return;
            }

            saveStudentBtn.disabled = true;
            try {
                if (currentEditStudentId) {
                    await DataService.updateStudent(currentEditStudentId, {
                        fullName: name,
                        group: group,
                        phone: phone
                    });
                    showToast('O\'quvchi ma\'lumotlari yangilandi', 'success');
                } else {
                    await DataService.addStudent({
                        fullName: name,
                        group: group,
                        phone: phone
                    });
                    showToast('Yangi o\'quvchi qo\'shildi', 'success');
                }

                closeStudentModal();
                await loadData();
            } catch (err) {
                console.error('Error saving student:', err);
                showToast('O\'quvchini saqlashda xatolik yuz berdi', 'error');
            } finally {
                saveStudentBtn.disabled = false;
            }
        });
    }

    // 6. Teacher Modal Open / Close
    function openTeacherModal() {
        if (teacherForm) teacherForm.reset();
        if (teacherModal) teacherModal.style.display = 'flex';
    }

    function closeTeacherModal() {
        if (teacherModal) teacherModal.style.display = 'none';
    }

    if (addTeacherBtn) addTeacherBtn.addEventListener('click', openTeacherModal);
    if (teacherModalClose) teacherModalClose.addEventListener('click', closeTeacherModal);
    if (teacherModalCancel) teacherModalCancel.addEventListener('click', closeTeacherModal);

    // Save Teacher
    if (saveTeacherBtn) {
        saveTeacherBtn.addEventListener('click', async () => {
            const name = teacherNameInput.value.trim();
            const login = teacherLoginInput.value.trim();
            const password = teacherPasswordInput.value.trim();

            if (!name || !login || !password) {
                showToast('Barcha maydonlarni to\'ldiring', 'warning');
                return;
            }

            if (password.length < 6) {
                showToast('Parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'warning');
                return;
            }

            saveTeacherBtn.disabled = true;
            try {
                await DataService.addTeacher({
                    fullName: name,
                    login: login,
                    password: password
                });

                showToast(`O'qituvchi qo'shildi! Login: ${login}`, 'success');
                closeTeacherModal();
            } catch (err) {
                console.error('Error saving teacher:', err);
                showToast('O\'qituvchini saqlashda xatolik', 'error');
            } finally {
                saveTeacherBtn.disabled = false;
            }
        });
    }

    // Filters event listeners
    if (filterGroup) filterGroup.addEventListener('change', renderStudents);
    if (searchStudent) searchStudent.addEventListener('input', renderStudents);

    // Initial load
    await loadData();
});
