/**
 * MindWell - admin-dashboard.js
 * -----------------------------
 * This file contains all the JavaScript logic specific to the admin dashboard
 * and its sub-pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Run initializers based on the current page ---

    if (document.getElementById('signupsChart')) { // Main Dashboard
        updateStatCards();
        updateTimestamp();
        renderSignupsChart(document.getElementById('signupsChart'));
        renderMoodTrendsChart(document.getElementById('moodTrendsChart'));
    }

    if (document.getElementById('user-table-body')) { // Manage Users page
        setupManageUsersPage();
    }

    if (document.getElementById('counselor-table-body')) { // Manage Counselors page
        setupManageCounselorsPage();
    }

    if (document.getElementById('resource-table-body')) { // Manage Resources page
        setupManageResourcesPage();
    }
    
    if (document.getElementById('admin-profile-form')) { // Admin Profile page
        setupAdminProfilePage();
    }
});

// --- NOTIFICATION FUNCTION ---

/**
 * Displays a custom notification message.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success' or 'error').
 */
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = ''; // Clear existing classes
    notification.classList.add(type, 'show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}

// --- ADMIN PROFILE PAGE FUNCTIONS ---

function setupAdminProfilePage() {
    const editBtn = document.getElementById('edit-admin-profile-btn');
    const formActions = document.getElementById('admin-form-actions');
    const cancelBtn = document.getElementById('cancel-admin-edit-btn');
    const profileFields = document.querySelectorAll('.admin-profile-field');

    if (!editBtn) return;

    const originalValues = {};
    profileFields.forEach(field => {
        originalValues[field.id] = field.value;
    });

    const enterEditMode = () => {
        editBtn.classList.add('hidden');
        formActions.classList.remove('hidden');
        profileFields.forEach(field => {
            field.readOnly = false;
            field.classList.remove('bg-stone-100');
        });
    };

    const exitEditMode = () => {
        editBtn.classList.remove('hidden');
        formActions.classList.add('hidden');
        profileFields.forEach(field => {
            field.readOnly = true;
            field.classList.add('bg-stone-100');
            field.value = originalValues[field.id]; // Revert changes
        });
    };

    editBtn.addEventListener('click', enterEditMode);
    cancelBtn.addEventListener('click', exitEditMode);

    document.getElementById('admin-profile-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const newPassword = document.getElementById('admin-new-password').value;
        const confirmPassword = document.getElementById('admin-confirm-password').value;

        if (newPassword && newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        
        alert('Admin profile has been updated successfully!');
        profileFields.forEach(field => {
            originalValues[field.id] = field.value;
        });
        exitEditMode();
    });
}

// --- MANAGE COUNSELORS PAGE FUNCTIONS ---

function setupManageCounselorsPage() {
    const manageBtn = document.getElementById('manage-counselors-btn');
    const accessCodeOverlay = document.getElementById('access-code-overlay');
    const accessCodeModal = document.getElementById('access-code-modal');
    const accessCodeForm = document.getElementById('access-code-form');
    const accessCodeInput = document.getElementById('access-code-input');
    const accessError = document.getElementById('access-error');
    const searchInput = document.getElementById('counselor-search');

    // In a real app, this would be fetched from a database. We use localStorage to persist changes.
    let counselors = JSON.parse(localStorage.getItem('mindwellCounselors')) || [
        { id: 1, name: 'Dr. Jane Doe', specialty: 'Anxiety & Stress', bio: 'Specializes in anxiety, stress management, and academic pressure.', isDefault: true },
        { id: 2, name: 'Dr. Richard Roe', specialty: 'Depression & Resilience', bio: 'Focuses on depression, relationship challenges, and building resilience.', isDefault: true },
        { id: 3, name: 'Dr. Susan Smith', specialty: 'Mindfulness & Self-Esteem', bio: 'Expertise in mindfulness, self-esteem, and navigating life transitions.', isDefault: true }
    ];

    let managementEnabled = false;

    const renderCounselors = () => {
        const tableBody = document.getElementById('counselor-table-body');
        const searchTerm = searchInput.value.toLowerCase();
        tableBody.innerHTML = '';

        const filteredCounselors = counselors.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.specialty.toLowerCase().includes(searchTerm)
        );

        if (filteredCounselors.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center p-8 text-stone-500">No counselors found.</td></tr>`;
            return;
        }

        filteredCounselors.forEach(counselor => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-stone-50';
            
            const actionsHtml = counselor.isDefault 
                ? `<button class="text-gray-400 cursor-not-allowed mr-4" disabled>Edit</button>
                   <button class="text-gray-400 cursor-not-allowed" disabled>Delete</button>`
                : `<button class="edit-btn text-blue-500 hover:text-blue-700 font-semibold mr-4" data-id="${counselor.id}">Edit</button>
                   <button class="delete-btn text-red-500 hover:text-red-700 font-semibold" data-id="${counselor.id}">Delete</button>`;

            row.innerHTML = `
                <td class="p-4">${counselor.name}</td>
                <td class="p-4">${counselor.specialty}</td>
                <td class="p-4 text-right actions-cell ${managementEnabled ? '' : 'hidden'}">
                    ${actionsHtml}
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const toggleManagementFeatures = (enable) => {
        managementEnabled = enable;
        const actionsHeader = document.querySelector('.actions-header');
        const manageBtnContainer = document.getElementById('manage-counselors-btn');
        const manageBtnText = manageBtnContainer.querySelector('span');

        if (enable) {
            actionsHeader.classList.remove('hidden');
            manageBtnContainer.id = 'add-counselor-btn'; // Change ID for event handling
            manageBtnText.textContent = 'Add New Counselor';
            manageBtnContainer.classList.remove('bg-stone-600', 'hover:bg-stone-700');
            manageBtnContainer.classList.add('bg-orange-500', 'hover:bg-orange-600');
            
            // Re-bind the click event to the new ID
            document.getElementById('add-counselor-btn').addEventListener('click', () => openCounselorModal());
        }
        renderCounselors(); // Re-render to show/hide action buttons
    };

    manageBtn.addEventListener('click', () => {
        if (!managementEnabled) {
            accessCodeOverlay.classList.remove('hidden');
            accessCodeModal.classList.remove('hidden');
        }
    });

    accessCodeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (accessCodeInput.value === '1105') {
            accessCodeOverlay.classList.add('hidden');
            accessCodeModal.classList.add('hidden');
            accessError.classList.add('hidden');
            accessCodeInput.value = '';
            toggleManagementFeatures(true);
        } else {
            accessError.classList.remove('hidden');
        }
    });
    
    searchInput.addEventListener('input', renderCounselors);

    // Modal Logic
    const modalOverlay = document.getElementById('counselor-modal-overlay');
    const modal = document.getElementById('counselor-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const counselorForm = document.getElementById('counselor-form');
    const modalTitle = document.getElementById('modal-title');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const deleteConfirmOverlay = document.getElementById('delete-confirm-modal-overlay');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    let counselorToDeleteId = null;

    const openCounselorModal = (counselor = null) => {
        counselorForm.reset();
        if (counselor) {
            modalTitle.textContent = 'Edit Counselor';
            document.getElementById('counselor-id').value = counselor.id;
            document.getElementById('counselor-name').value = counselor.name;
            document.getElementById('counselor-specialty').value = counselor.specialty;
            document.getElementById('counselor-bio').value = counselor.bio;
        } else {
            modalTitle.textContent = 'Add New Counselor';
            document.getElementById('counselor-id').value = '';
        }
        modalOverlay.classList.remove('hidden');
        modal.classList.remove('hidden');
    };

    const closeCounselorModal = () => {
        modalOverlay.classList.add('hidden');
        modal.classList.add('hidden');
    };

    closeModalBtn.addEventListener('click', closeCounselorModal);
    modalOverlay.addEventListener('click', closeCounselorModal);

    counselorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('counselor-id').value;
        const newCounselor = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('counselor-name').value,
            specialty: document.getElementById('counselor-specialty').value,
            bio: document.getElementById('counselor-bio').value,
            isDefault: false // New counselors are never default
        };

        if (id) {
            counselors = counselors.map(c => c.id === newCounselor.id ? newCounselor : c);
        } else {
            counselors.push(newCounselor);
        }
        localStorage.setItem('mindwellCounselors', JSON.stringify(counselors));
        renderCounselors();
        closeCounselorModal();
    });

    document.getElementById('counselor-table-body').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = parseInt(e.target.dataset.id);
            const counselor = counselors.find(c => c.id === id);
            if (counselor && !counselor.isDefault) {
                openCounselorModal(counselor);
            }
        }
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.dataset.id);
            const counselor = counselors.find(c => c.id === id);
            if (counselor && !counselor.isDefault) {
                counselorToDeleteId = id;
                document.getElementById('delete-confirm-text').textContent = `This will permanently delete the profile for ${counselor.name}.`;
                deleteConfirmModal.classList.remove('hidden');
                deleteConfirmOverlay.classList.remove('hidden');
            }
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmModal.classList.add('hidden');
        deleteConfirmOverlay.classList.add('hidden');
    });

    confirmDeleteBtn.addEventListener('click', () => {
        counselors = counselors.filter(c => c.id !== counselorToDeleteId);
        localStorage.setItem('mindwellCounselors', JSON.stringify(counselors));
        renderCounselors();
        deleteConfirmModal.classList.add('hidden');
        deleteConfirmOverlay.classList.add('hidden');
    });

    renderCounselors(); // Initial render
}


// --- MANAGE RESOURCES PAGE FUNCTIONS ---

function setupManageResourcesPage() {
    const addResourceBtn = document.getElementById('add-resource-btn');
    const modalOverlay = document.getElementById('resource-modal-overlay');
    const modal = document.getElementById('resource-modal');
    const closeModalBtn = document.getElementById('close-resource-modal-btn');
    const resourceForm = document.getElementById('resource-form');
    const modalTitle = document.getElementById('resource-modal-title');
    const searchInput = document.getElementById('resource-search');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const deleteConfirmOverlay = document.getElementById('delete-confirm-modal-overlay');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    let resourceToDeleteId = null;

    let resources = JSON.parse(localStorage.getItem('mindwellResources')) || [
        { id: 1, title: '5-Minute Breathing Meditation', type: 'meditation', topic: 'breathe', link: 'meditation.html', img: 'https://placehold.co/600x400/a2d2ff/FFFFFF?text=Meditation' },
        { id: 2, title: 'Understanding Anxiety', type: 'article', topic: 'anxiety', link: '#', img: 'https://placehold.co/600x400/ffc09f/FFFFFF?text=Article' },
        { id: 3, title: 'Tips for Better Sleep', type: 'video', topic: 'sleep', link: '#', img: 'https://placehold.co/600x400/fcf5c7/FFFFFF?text=Video' },
    ];

    const renderResources = () => {
        const tableBody = document.getElementById('resource-table-body');
        const searchTerm = searchInput.value.toLowerCase();
        tableBody.innerHTML = '';

        const filteredResources = resources.filter(res => 
            res.title.toLowerCase().includes(searchTerm) || 
            res.topic.toLowerCase().includes(searchTerm)
        );

        if (filteredResources.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-8 text-stone-500">No resources found.</td></tr>`;
            return;
        }

        filteredResources.forEach(resource => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-stone-50';
            row.innerHTML = `
                <td class="p-4 font-semibold">${resource.title}</td>
                <td class="p-4 capitalize">${resource.type}</td>
                <td class="p-4 capitalize">${resource.topic}</td>
                <td class="p-4 text-right">
                    <button class="edit-btn text-blue-500 hover:text-blue-700 font-semibold mr-4" data-id="${resource.id}">Edit</button>
                    <button class="delete-btn text-red-500 hover:text-red-700 font-semibold" data-id="${resource.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const openModal = (resource = null) => {
        resourceForm.reset();
        if (resource) {
            modalTitle.textContent = 'Edit Resource';
            document.getElementById('resource-id').value = resource.id;
            document.getElementById('resource-title').value = resource.title;
            document.getElementById('resource-type').value = resource.type;
            document.getElementById('resource-topic').value = resource.topic;
            document.getElementById('resource-content').value = resource.link;
            document.getElementById('resource-img').value = resource.img;
        } else {
            modalTitle.textContent = 'Add New Resource';
            document.getElementById('resource-id').value = '';
        }
        modalOverlay.classList.remove('hidden');
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modalOverlay.classList.add('hidden');
        modal.classList.add('hidden');
    };

    addResourceBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    resourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('resource-id').value;
        const newResource = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('resource-title').value,
            type: document.getElementById('resource-type').value,
            topic: document.getElementById('resource-topic').value,
            link: document.getElementById('resource-content').value,
            img: document.getElementById('resource-img').value
        };

        if (id) {
            resources = resources.map(res => res.id === newResource.id ? newResource : res);
        } else {
            resources.push(newResource);
        }
        localStorage.setItem('mindwellResources', JSON.stringify(resources));
        renderResources();
        closeModal();
    });

    document.getElementById('resource-table-body').addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = parseInt(e.target.dataset.id);
            const resource = resources.find(res => res.id === id);
            openModal(resource);
        }
        if (e.target.classList.contains('delete-btn')) {
            resourceToDeleteId = parseInt(e.target.dataset.id);
            const resource = resources.find(res => res.id === resourceToDeleteId);
            document.getElementById('delete-confirm-text').textContent = `This will permanently delete the resource: "${resource.title}".`;
            deleteConfirmModal.classList.remove('hidden');
            deleteConfirmOverlay.classList.remove('hidden');
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmModal.classList.add('hidden');
        deleteConfirmOverlay.classList.add('hidden');
    });

    confirmDeleteBtn.addEventListener('click', () => {
        resources = resources.filter(res => res.id !== resourceToDeleteId);
        localStorage.setItem('mindwellResources', JSON.stringify(resources));
        renderResources();
        deleteConfirmModal.classList.add('hidden');
        deleteConfirmOverlay.classList.add('hidden');
    });
    
    searchInput.addEventListener('input', renderResources);

    renderResources();
}


// --- MANAGE USERS PAGE FUNCTIONS ---

function setupManageUsersPage() {
    const searchInput = document.getElementById('user-search');
    const universityFilter = document.getElementById('university-filter');
    
    const allUsers = [
        { name: 'Alex Doe', email: 'alex.doe@university.edu', university: 'SRM-AP', joined: '2025-07-15', regNumber: 'AP21110010101' },
        { name: 'Jamie Smith', email: 'jamie.s@university.edu', university: 'Other', joined: '2025-07-20', regNumber: null },
        { name: 'Casey Lee', email: 'casey.lee@srmap.edu.in', university: 'SRM-AP', joined: '2025-06-01', regNumber: 'AP21110010202' },
        { name: 'Jordan Miller', email: 'j.miller@university.edu', university: 'Other', joined: '2025-05-10', regNumber: null },
    ];

    const renderUsers = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedUniversity = universityFilter.value;
        const userTableBody = document.getElementById('user-table-body');
        userTableBody.innerHTML = '';

        const filteredUsers = allUsers.filter(user => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                (user.regNumber && user.regNumber.toLowerCase().includes(searchTerm));
            
            const matchesFilter = 
                selectedUniversity === 'all' || 
                user.university.toLowerCase().replace('-', '') === selectedUniversity;

            return matchesSearch && matchesFilter;
        });

        if (filteredUsers.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-stone-500">No users found.</td></tr>`;
            return;
        }

        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-stone-50';
            row.innerHTML = `
                <td class="p-4">${user.name}</td>
                <td class="p-4">${user.email}</td>
                <td class="p-4">${user.university}</td>
                <td class="p-4">${new Date(user.joined).toLocaleDateString()}</td>
                <td class="p-4">
                    <button class="text-red-500 hover:text-red-700 font-semibold">Suspend</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    };

    searchInput.addEventListener('input', renderUsers);
    universityFilter.addEventListener('change', renderUsers);

    renderUsers();
}


// --- MAIN DASHBOARD PAGE FUNCTIONS ---

function updateTimestamp() {
    const timestampEl = document.getElementById('last-updated');
    if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    }
}

function updateStatCards() {
    const mockData = {
        totalStudents: 1250,
        activeCounselors: 3,
        appointmentsThisWeek: 42,
        averageMood: 3.8
    };

    document.getElementById('total-students').textContent = mockData.totalStudents.toLocaleString();
    document.getElementById('active-counselors').textContent = mockData.activeCounselors;
    document.getElementById('appointments-week').textContent = mockData.appointmentsThisWeek;
    document.getElementById('avg-mood').textContent = `${mockData.averageMood} / 5`;
}

function renderSignupsChart(canvas) {
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
                label: 'New Student Signups',
                data: [65, 59, 80, 81, 56, 55],
                backgroundColor: 'rgba(234, 88, 12, 0.6)',
                borderColor: 'rgba(234, 88, 12, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderMoodTrendsChart(canvas) {
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Average Mood Rating',
                data: [3.5, 3.2, 2.9, 3.8, 4.1, 4.0],
                backgroundColor: 'rgba(13, 148, 136, 0.2)',
                borderColor: 'rgba(13, 148, 136, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            scales: { y: { beginAtZero: false, min: 1, max: 5 } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
