/**
 * MindWell - student-dashboard.js
 * -------------------------------
 * This file contains all the JavaScript logic specific to the student dashboard,
 * its sub-pages, and interactive elements.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Run initializers based on the current page ---
    
    if (document.getElementById('dynamic-greeting')) { // Dashboard page
        setDynamicGreeting();
        setCurrentDate();
        renderDashboardAppointmentList();
        renderMoodChart();
    }

    if (document.getElementById('mood-tracker-card')) { // Mood Tracker page
        setupMoodTracker();
    }

    if (document.getElementById('upcoming-appointments-list')) { // Appointments page
        renderFullAppointmentLists();
    }

    if (document.getElementById('counselor-list')) { // Booking page
        setupBookingPage();
    }

    if (document.getElementById('faq-container')) { // Contact Us page
        setupFaqAccordion();
    }

    if (document.getElementById('feedback-form')) { // Feedback page
        setupFeedbackForm();
    }

     if (document.getElementById('report-problem-form')) { // Report Problem page
        setupReportProblemForm();
    }

    if (document.getElementById('profile-form')) { // Profile page
        setupProfilePage();
    }
    
    // --- Functions that run on all dashboard pages ---
    setupDropdowns();
    setupMobileMenu();
    setupChatWidget();
});

// --- RESOURCES PAGE FUNCTIONS ---

function setupResourcesPage() {
    // The breathing exercise is now a static, featured element in the HTML.
    // This array now only contains the filterable resources.
    const allResources = [
        { id: 2, title: 'Understanding Anxiety', type: 'article', topic: 'anxiety', link: '#', img: 'https://placehold.co/600x400/ffc09f/FFFFFF?text=Article' },
        { id: 3, title: 'Tips for Better Sleep', type: 'video', topic: 'sleep', link: '#', img: 'https://placehold.co/600x400/fcf5c7/FFFFFF?text=Video' },
        { id: 4, title: 'Mindful Focus Techniques', type: 'article', topic: 'focus', link: '#', img: 'https://placehold.co/600x400/a0c4ff/FFFFFF?text=Article' },
        { id: 5, title: 'Calming Music for Studying', type: 'music', topic: 'focus', link: '#', img: 'https://placehold.co/600x400/9bf6ff/FFFFFF?text=Music' },
        { id: 6, title: 'Managing Exam Stress', type: 'video', topic: 'stress', link: '#', img: 'https://placehold.co/600x400/bdb2ff/FFFFFF?text=Video' },
    ];

    const resourceGrid = document.getElementById('resource-grid');
    const searchInput = document.getElementById('resource-search');
    const topicFilters = document.getElementById('topic-filters');
    const noResults = document.getElementById('no-results');

    let activeTopic = 'all';

    const renderResources = () => {
        const searchTerm = searchInput.value.toLowerCase();
        resourceGrid.innerHTML = '';

        const filteredResources = allResources.filter(resource => {
            const matchesSearch = resource.title.toLowerCase().includes(searchTerm);
            const matchesTopic = activeTopic === 'all' || resource.topic === activeTopic;
            return matchesSearch && matchesTopic;
        });

        if (filteredResources.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }

        filteredResources.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
            card.innerHTML = `
                <a href="${resource.link}" class="block hover:opacity-90">
                    <img src="${resource.img}" alt="${resource.title}" class="w-full h-48 object-cover">
                </a>
                <div class="p-6">
                    <h4 class="font-bold text-xl mb-2">${resource.title}</h4>
                    <span class="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-amber-100 text-amber-700">${resource.topic}</span>
                </div>
            `;
            resourceGrid.appendChild(card);
        });
    };

    topicFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            activeTopic = e.target.dataset.topic;
            topicFilters.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('bg-amber-500', 'text-white');
                btn.classList.add('bg-white', 'text-stone-700');
            });
            e.target.classList.add('bg-amber-500', 'text-white');
            e.target.classList.remove('bg-white', 'text-stone-700');
            renderResources();
        }
    });
    
    searchInput.addEventListener('input', renderResources);

    // Initial render
    renderResources();
}


// --- PAGE-SPECIFIC SETUP FUNCTIONS ---

function setupProfilePage() {
    const editBtn = document.getElementById('edit-profile-btn');
    const formActions = document.getElementById('form-actions');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const profileFields = document.querySelectorAll('.profile-field');
    const universitySelect = document.getElementById('profile-university');
    const regNumberContainer = document.getElementById('reg-number-container');
    const uploadButton = document.getElementById('upload-button');
    const imageUploadInput = document.getElementById('profile-image-upload');
    const profilePreviewImg = document.getElementById('profile-preview-img');
    const deleteBtn = document.getElementById('delete-account-btn');

    if (!editBtn) return;

    const originalValues = {};
    profileFields.forEach(field => {
        originalValues[field.id] = field.value;
    });

    const enterEditMode = () => {
        editBtn.classList.add('hidden');
        formActions.classList.remove('hidden');
        uploadButton.classList.remove('hidden');
        profileFields.forEach(field => {
            field.readOnly = false;
            field.disabled = false;
            field.classList.remove('bg-stone-100');
        });
    };

    const exitEditMode = () => {
        editBtn.classList.remove('hidden');
        formActions.classList.add('hidden');
        uploadButton.classList.add('hidden');
        profileFields.forEach(field => {
            field.readOnly = true;
            field.disabled = true;
            field.classList.add('bg-stone-100');
            field.value = originalValues[field.id]; // Revert changes
        });
        universitySelect.value = originalValues['profile-university'];
        handleUniversityChange();
    };

    const handleUniversityChange = () => {
        if (universitySelect.value === 'srm-ap') {
            regNumberContainer.classList.remove('hidden');
        } else {
            regNumberContainer.classList.add('hidden');
        }
    };

    editBtn.addEventListener('click', enterEditMode);
    cancelBtn.addEventListener('click', exitEditMode);
    universitySelect.addEventListener('change', handleUniversityChange);
    
    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePreviewImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            alert('Account deleted.');
            // In a real app, this would trigger a backend request and then redirect.
            window.location.href = '../index.html';
        }
    });

    document.getElementById('profile-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword && newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        
        alert('Profile saved successfully!');
        profileFields.forEach(field => {
            originalValues[field.id] = field.value;
        });
        exitEditMode();
    });
}

function setupMoodTracker() {
    const moodOptions = document.querySelectorAll('.mood-option');
    const logMoodBtn = document.getElementById('log-mood-btn');
    const moodDetailsSection = document.getElementById('mood-details-section');
    const moodTrackerCard = document.getElementById('mood-tracker-card');
    const moodNotes = document.getElementById('mood-notes');
    const moodTagsContainer = document.getElementById('mood-tags');
    const customTagForm = document.getElementById('custom-tag-form');
    const customTagInput = document.getElementById('custom-tag-input');

    let selectedMood = null;

    const moodPrompts = {
        1: "It's okay to feel this way. What's on your mind?",
        2: "Sorry to hear that. What seems to be the trouble?",
        3: "Just okay? Feel free to write down what's happening.",
        4: "That's great to hear! What's contributing to this feeling?",
        5: "Wonderful! What's making today so great?"
    };

    const moodColors = {
        1: 'bg-red-50',
        2: 'bg-orange-50',
        3: 'bg-stone-50',
        4: 'bg-cyan-50',
        5: 'bg-green-50'
    };
    
    moodOptions.forEach(button => {
        button.addEventListener('click', () => {
            selectedMood = button.dataset.mood;
            moodOptions.forEach(btn => btn.classList.remove('bg-gray-200', 'scale-110'));
            button.classList.add('bg-gray-200', 'scale-110');
            Object.values(moodColors).forEach(color => moodTrackerCard.classList.remove(color));
            moodTrackerCard.classList.add(moodColors[selectedMood]);
            moodDetailsSection.classList.remove('hidden');
            moodNotes.placeholder = moodPrompts[selectedMood];
            logMoodBtn.disabled = false;
        });
    });

    moodTagsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('mood-tag')) {
            event.target.classList.toggle('bg-amber-500');
            event.target.classList.toggle('text-white');
            event.target.classList.toggle('bg-stone-200');
            event.target.classList.toggle('text-stone-700');
        }
    });

    if(customTagForm) {
        customTagForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newTagText = customTagInput.value.trim();
            if (newTagText) {
                const newTag = document.createElement('button');
                newTag.className = 'mood-tag bg-amber-500 text-white px-3 py-1 rounded-full text-sm';
                newTag.textContent = newTagText;
                moodTagsContainer.appendChild(newTag);
                customTagInput.value = '';
            }
        });
    }

    if(logMoodBtn) {
        logMoodBtn.addEventListener('click', () => {
            const moodLog = JSON.parse(localStorage.getItem('mindwellMoodLog')) || [];
            const today = new Date().toISOString().split('T')[0];
            
            const newEntry = {
                date: today,
                mood: parseInt(selectedMood),
                notes: moodNotes.value,
                tags: Array.from(document.querySelectorAll('.mood-tag.bg-amber-500')).map(tag => tag.textContent)
            };

            const updatedLog = moodLog.filter(entry => entry.date !== today);
            updatedLog.push(newEntry);
            
            localStorage.setItem('mindwellMoodLog', JSON.stringify(updatedLog));

            document.getElementById('mood-form').classList.add('hidden');
            document.getElementById('confirmation-message').classList.remove('hidden');
        });
    }
}

function setupFaqAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('svg');
            answer.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    });
}

function setupFeedbackForm() {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('feedback-form-content').classList.add('hidden');
        document.getElementById('feedback-confirmation').classList.remove('hidden');
    });
}

function setupReportProblemForm() {
    const form = document.getElementById('report-problem-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('report-form-content').classList.add('hidden');
        document.getElementById('report-confirmation').classList.remove('hidden');
    });
}

function setupBookingPage() {
    const counselorOptions = document.querySelectorAll('.counselor-option');
    const bookingFlow = document.getElementById('booking-flow');
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotsContainer = document.getElementById('time-slots');
    const sessionTypeSection = document.getElementById('session-type-section');
    const sessionTypeOptions = document.querySelectorAll('.session-type-option');
    const confirmationSection = document.getElementById('confirmation-section');
    const selectedAppointmentDetails = document.getElementById('selected-appointment-details');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');

    let currentDate = new Date();
    let selectedCounselor = null;
    let selectedDate = null;
    let selectedTime = null;
    let selectedSessionType = null;

    const urlParams = new URLSearchParams(window.location.search);
    const counselorFromUrl = urlParams.get('counselor');
    if (counselorFromUrl) {
        counselorOptions.forEach(btn => {
            if (btn.dataset.counselor === counselorFromUrl) {
                btn.click();
            }
        });
    }

    counselorOptions.forEach(button => {
        button.addEventListener('click', () => {
            selectedCounselor = button.dataset.counselor;
            counselorOptions.forEach(btn => btn.classList.remove('bg-amber-500', 'text-white', 'border-amber-500'));
            button.classList.add('bg-amber-500', 'text-white', 'border-amber-500');
            bookingFlow.classList.remove('hidden');
            renderCalendar();
        });
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    sessionTypeOptions.forEach(button => {
        button.addEventListener('click', () => {
            selectedSessionType = button.dataset.type;
            sessionTypeOptions.forEach(btn => btn.classList.remove('bg-amber-500', 'text-white'));
            button.classList.add('bg-amber-500', 'text-white');
            showConfirmation();
        });
    });
    
    confirmBookingBtn.addEventListener('click', () => {
        const appointments = JSON.parse(localStorage.getItem('mindwellAppointments')) || [];
        const newAppointment = {
            id: Date.now(),
            counselor: selectedCounselor,
            date: selectedDate.toISOString(),
            time: selectedTime,
            type: selectedSessionType,
            status: 'Upcoming'
        };
        appointments.push(newAppointment);
        localStorage.setItem('mindwellAppointments', JSON.stringify(appointments));
        
        alert(`Appointment with ${selectedCounselor} confirmed!`);
        window.location.href = 'appointments.html';
    });
    
    function renderCalendar() {
        calendarDays.innerHTML = '';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'font-semibold text-sm text-stone-500';
            dayEl.textContent = day;
            calendarDays.appendChild(dayEl);
        });
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.appendChild(document.createElement('div'));
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('button');
            dayEl.textContent = day;
            dayEl.className = 'p-2 rounded-full hover:bg-stone-200 transition-colors';
            const dayDate = new Date(year, month, day);
            if (dayDate < new Date().setHours(0,0,0,0)) {
                dayEl.disabled = true;
                dayEl.classList.add('text-stone-300', 'cursor-not-allowed');
            } else {
                 dayEl.addEventListener('click', () => {
                    selectedDate = dayDate;
                    document.querySelectorAll('#calendar-days button').forEach(btn => btn.classList.remove('bg-amber-500', 'text-white'));
                    dayEl.classList.add('bg-amber-500', 'text-white');
                    renderTimeSlots(dayDate);
                });
            }
            calendarDays.appendChild(dayEl);
        }
    }

    function renderTimeSlots(date) {
        timeSlotsContainer.innerHTML = '';
        sessionTypeSection.classList.add('hidden');
        confirmationSection.classList.add('hidden');
        selectedTime = null;
        const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
        availableTimes.forEach(time => {
            const timeBtn = document.createElement('button');
            timeBtn.textContent = time;
            timeBtn.className = 'w-full text-center p-3 border rounded-lg hover:bg-stone-100 transition-colors';
            timeBtn.addEventListener('click', () => {
                selectedTime = time;
                document.querySelectorAll('#time-slots button').forEach(btn => btn.classList.remove('bg-amber-500', 'text-white'));
                timeBtn.classList.add('bg-amber-500', 'text-white');
                sessionTypeSection.classList.remove('hidden');
            });
            timeSlotsContainer.appendChild(timeBtn);
        });
    }
    
    function showConfirmation() {
        if (selectedCounselor && selectedDate && selectedTime && selectedSessionType) {
            selectedAppointmentDetails.innerHTML = `
                <p><span class="font-semibold">Counselor:</span> ${selectedCounselor}</p>
                <p><span class="font-semibold">Date:</span> ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p><span class="font-semibold">Time:</span> ${selectedTime}</p>
                <p><span class="font-semibold">Type:</span> ${selectedSessionType}</p>
            `;
            confirmationSection.classList.remove('hidden');
        }
    }
}

function renderFullAppointmentLists() {
    const upcomingList = document.getElementById('upcoming-appointments-list');
    const pastList = document.getElementById('past-appointments-list');
    if (!upcomingList || !pastList) return;

    const allAppointments = JSON.parse(localStorage.getItem('mindwellAppointments')) || [];
    const now = new Date();

    const upcomingAppointments = allAppointments.filter(appt => new Date(appt.date) >= now);
    const pastAppointments = allAppointments.filter(appt => new Date(appt.date) < now);

    upcomingList.innerHTML = '';
    if (upcomingAppointments.length === 0) {
        upcomingList.innerHTML = `<p class="text-stone-500">You have no upcoming appointments.</p>`;
    } else {
        upcomingAppointments.forEach(appt => {
            const el = document.createElement('div');
            el.className = 'p-4 border rounded-lg bg-stone-50 flex justify-between items-center';
            const apptDate = new Date(appt.date);
            el.innerHTML = `
                <div>
                    <p class="font-bold text-stone-800">${appt.counselor}</p>
                    <p class="text-sm text-stone-600">${apptDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${appt.time} (${appt.type})</p>
                </div>
                <div class="flex gap-2">
                    <button class="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600">Join Call</button>
                    <a href="book-appointment.html?counselor=${encodeURIComponent(appt.counselor)}" class="reschedule-btn text-xs bg-stone-200 text-stone-700 px-3 py-1 rounded-full hover:bg-stone-300">Reschedule</a>
                </div>
            `;
            upcomingList.appendChild(el);
        });
    }

    pastList.innerHTML = '';
    if (pastAppointments.length === 0) {
        pastList.innerHTML = `<p class="text-stone-500">You have no past appointments.</p>`;
    } else {
        pastAppointments.forEach(appt => {
            const el = document.createElement('div');
            el.className = 'p-4 border rounded-lg bg-stone-50 flex justify-between items-center';
            const apptDate = new Date(appt.date);
            el.innerHTML = `
                <div>
                    <p class="font-semibold text-stone-700">${appt.counselor}</p>
                    <p class="text-sm text-stone-500">${apptDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - Completed</p>
                </div>
                <button class="text-xs bg-stone-200 text-stone-700 px-3 py-1 rounded-full hover:bg-stone-300">View Notes</button>
            `;
            pastList.appendChild(el);
        });
    }
}


// --- DASHBOARD PAGE FUNCTIONS ---

function setDynamicGreeting() {
    const greetingElement = document.getElementById('dynamic-greeting');
    if (!greetingElement) return;
    const currentHour = new Date().getHours();
    let greeting = "Welcome back!";
    if (currentHour < 12) greeting = "Good morning!";
    else if (currentHour < 18) greeting = "Good afternoon!";
    else greeting = "Good evening!";
    greetingElement.textContent = greeting;
}

function setCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (!dateElement) return;
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

function renderDashboardAppointmentList() {
    const appointmentList = document.getElementById('appointment-list');
    if (!appointmentList) return;
    const allAppointments = JSON.parse(localStorage.getItem('mindwellAppointments')) || [];
    const now = new Date();
    const upcomingAppointments = allAppointments.filter(appt => new Date(appt.date) >= now);

    appointmentList.innerHTML = '';
    if (upcomingAppointments.length === 0) {
        appointmentList.innerHTML = `<p class="text-stone-500 text-sm">You have no upcoming appointments.</p>`;
    } else {
        upcomingAppointments.slice(0, 2).forEach(appt => {
            const el = document.createElement('div');
            el.innerHTML = `<p class="font-semibold text-stone-700">${appt.counselor}</p><p class="text-sm text-stone-500">${new Date(appt.date).toLocaleDateString()} at ${appt.time}</p>`;
            appointmentList.appendChild(el);
        });
    }
}

function renderMoodChart() {
    const canvas = document.getElementById('moodHistoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const moodLog = JSON.parse(localStorage.getItem('mindwellMoodLog')) || [];
    
    const labels = [];
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        labels.push(dayStr);
        const entryForDay = moodLog.find(entry => new Date(entry.date).setHours(0,0,0,0) === date.getTime());
        data.push(entryForDay ? entryForDay.mood : null);
    }
    
    if (moodLog.length === 0 && ctx) {
        ctx.font = "16px Lato";
        ctx.fillStyle = "#a8a29e";
        ctx.textAlign = "center";
        ctx.fillText("Log your mood to see your history here!", canvas.width / 2, canvas.height / 2);
        return;
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Your Mood',
                data: data,
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                pointRadius: 5,
                spanGaps: true
            }]
        },
        options: {
            scales: { y: { min: 1, max: 5, ticks: { stepSize: 1, callback: (value) => ({1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great'}[value] || '') } } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// --- GLOBAL WIDGETS AND MENUS ---

function setupDropdowns() {
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const helpButton = document.getElementById('help-button');
    const helpDropdown = document.getElementById('help-dropdown');

    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('hidden');
            if (helpDropdown) helpDropdown.classList.add('hidden');
        });
    }

    if (helpButton && helpDropdown) {
        helpButton.addEventListener('click', (event) => {
            event.stopPropagation();
            helpDropdown.classList.toggle('hidden');
            if (profileDropdown) profileDropdown.classList.add('hidden');
        });
    }

    window.addEventListener('click', () => {
        if (profileDropdown) profileDropdown.classList.add('hidden');
        if (helpDropdown) helpDropdown.classList.add('hidden');
    });
}

function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

function setupChatWidget() {
    const chatBubble = document.getElementById('chat-bubble');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatBtn = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');

    if (!chatBubble || !chatPopup || !closeChatBtn || !chatForm) return;

    chatBubble.addEventListener('click', () => chatPopup.classList.toggle('hidden'));
    closeChatBtn.addEventListener('click', () => chatPopup.classList.add('hidden'));

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            appendUserMessage(userMessage);
            chatInput.value = '';
            await getAiResponse(userMessage);
        }
    });

    function appendUserMessage(message) {
        const el = document.createElement('div');
        el.className = 'flex justify-end';
        el.innerHTML = `<div class="bg-orange-500 text-white p-3 rounded-lg max-w-xs text-sm"><p>${message}</p></div>`;
        chatWindow.appendChild(el);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function appendAiMessage(message) {
        const el = document.createElement('div');
        el.className = 'flex';
        el.innerHTML = `<div class="bg-stone-200 text-stone-800 p-3 rounded-lg max-w-xs text-sm"><p>${message}</p></div>`;
        chatWindow.appendChild(el);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    
    function showTypingIndicator() {
        const el = document.createElement('div');
        el.id = 'typing-indicator';
        el.className = 'flex';
        el.innerHTML = `<div class="bg-stone-200 text-stone-500 p-3 rounded-lg max-w-xs text-sm"><p><i>Typing...</i></p></div>`;
        chatWindow.appendChild(el);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }

    async function getAiResponse(userMessage) {
        showTypingIndicator();
        const systemPrompt = "You are a supportive, empathetic AI assistant for students on a mental health platform. Your name is MindWell. Your primary goal is to be a good listener and provide a safe, non-judgmental space. Do NOT give medical advice or diagnoses. Instead, ask gentle, open-ended questions to help users explore their feelings. If a user mentions anything related to self-harm, crisis, or severe distress, your ONLY priority is to provide a crisis hotline number and strongly encourage them to seek professional help immediately. Keep your responses concise and warm.";
        
        let chatHistory = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I am ready to help." }] },
            { role: "user", parts: [{ text: userMessage }] }
        ];

        const payload = { contents: chatHistory };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            removeTypingIndicator();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                appendAiMessage(result.candidates[0].content.parts[0].text);
            } else {
                appendAiMessage("I'm sorry, I'm having a little trouble thinking right now. Please try again in a moment.");
            }
        } catch (error) {
            removeTypingIndicator();
            console.error("Error fetching AI response:", error);
            appendAiMessage("I'm sorry, something went wrong. Please check your connection and try again.");
        }
    }
}

// Global function for onclick attribute in profile.html
function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(`eye-icon-${inputId}`);
    if (!passwordInput || !eyeIcon) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.052 10.052 0 013.453-5.118m7.536 7.536A5.005 5.005 0 0017 12c0-1.38-.56-2.63-1.464-3.536m-7.072 7.072A5.005 5.005 0 017 12c0-1.38.56-2.63 1.464-3.536M2 2l20 20" />`;
    } else {
        passwordInput.type = "password";
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    }
}
