/**
 * MindWell - booking.js
 * ---------------------
 * This file handles all the client-side logic for the appointment booking page.
 * It includes:
 * - Handling counselor selection.
 * - A dynamic calendar for date selection.
 * - Displaying available time slots for a selected date.
 * - Handling the booking confirmation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const counselorOptions = document.querySelectorAll('.counselor-option');
    const bookingFlow = document.getElementById('booking-flow');
    const calendarDays = document.getElementById('calendar-days');
    const monthYear = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const timeSlotsContainer = document.getElementById('time-slots');
    const confirmationSection = document.getElementById('confirmation-section');
    const selectedAppointmentDetails = document.getElementById('selected-appointment-details');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');

    // --- State Management ---
    let currentDate = new Date();
    let selectedCounselor = null;
    let selectedDate = null;
    let selectedTime = null;

    // --- Event Listeners ---
    counselorOptions.forEach(button => {
        button.addEventListener('click', () => {
            selectedCounselor = button.querySelector('p').textContent;
            
            // Highlight selected counselor
            counselorOptions.forEach(btn => {
                btn.classList.remove('bg-amber-500', 'text-white', 'border-amber-500');
                btn.classList.add('hover:border-amber-500', 'hover:bg-amber-50');
            });
            button.classList.add('bg-amber-500', 'text-white', 'border-amber-500');
            button.classList.remove('hover:bg-amber-50');

            // Show the rest of the booking flow
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
    
    confirmBookingBtn.addEventListener('click', () => {
        alert(`Appointment with ${selectedCounselor} confirmed for ${selectedDate.toLocaleDateString()} at ${selectedTime}!`);
        // In a real app, you would send this data to the server before redirecting.
        window.location.href = 'appointments.html';
    });
    
    // --- Rendering Functions ---

    function renderCalendar() {
        calendarDays.innerHTML = '';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        monthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add day headers (Sun, Mon, etc.)
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'font-semibold text-sm text-stone-500';
            dayEl.textContent = day;
            calendarDays.appendChild(dayEl);
        });

        // Add empty divs for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.appendChild(document.createElement('div'));
        }

        // Add day buttons for the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('button');
            dayEl.textContent = day;
            dayEl.className = 'p-2 rounded-full hover:bg-stone-200 transition-colors';
            const dayDate = new Date(year, month, day);

            // Disable past dates
            if (dayDate < new Date().setHours(0,0,0,0)) {
                dayEl.disabled = true;
                dayEl.classList.add('text-stone-300', 'cursor-not-allowed');
            } else {
                 dayEl.addEventListener('click', () => {
                    selectedDate = dayDate;
                    // Highlight the selected date
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
        confirmationSection.classList.add('hidden');
        selectedTime = null;

        // Simulate available slots. In a real app, you'd fetch this from a server based on the selected counselor and date.
        const availableTimes = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
        
        availableTimes.forEach(time => {
            const timeBtn = document.createElement('button');
            timeBtn.textContent = time;
            timeBtn.className = 'w-full text-center p-3 border rounded-lg hover:bg-stone-100 transition-colors';
            timeBtn.addEventListener('click', () => {
                selectedTime = time;
                // Highlight the selected time
                document.querySelectorAll('#time-slots button').forEach(btn => btn.classList.remove('bg-amber-500', 'text-white'));
                timeBtn.classList.add('bg-amber-500', 'text-white');
                showConfirmation();
            });
            timeSlotsContainer.appendChild(timeBtn);
        });
    }
    
    function showConfirmation() {
        if (selectedCounselor && selectedDate && selectedTime) {
            selectedAppointmentDetails.innerHTML = `
                <p><span class="font-semibold">Counselor:</span> ${selectedCounselor}</p>
                <p><span class="font-semibold">Date:</span> ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p><span class="font-semibold">Time:</span> ${selectedTime}</p>
                <p><span class="font-semibold">Type:</span> ${selectedSessionType}</p>
            `;
            confirmationSection.classList.remove('hidden');
        }
    }
});
