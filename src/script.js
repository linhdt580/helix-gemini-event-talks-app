function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// fullSchedule will be injected by the build script and contain objects like:
// { type: 'talk', talkData: {...}, startTime: Date, endTime: Date }
// or
// { type: 'break', title: 'Lunch Break', startTime: Date, endTime: Date }

function renderSchedule(filterCategory = '') {
    const scheduleContainer = document.getElementById('schedule');
    scheduleContainer.innerHTML = ''; // Clear previous schedule

    if (typeof fullSchedule === 'undefined' || fullSchedule.length === 0) {
        scheduleContainer.innerHTML = '<p>No schedule available. Please ensure the build script generated the full schedule.</p>';
        console.error('fullSchedule is undefined or empty.');
        return;
    }

    fullSchedule.forEach(item => {
        const startTimeStr = formatTime(item.startTime);
        const endTimeStr = formatTime(item.endTime);

        if (item.type === 'break') {
            scheduleContainer.innerHTML += `
                <div class="break-card">
                    <span class="timing">${startTimeStr} - ${endTimeStr}</span>
                    <h2>${item.title}</h2>
                </div>
            `;
        } else if (item.type === 'talk') {
            const talk = item.talkData;
            // Check if the talk matches the filter
            const matchesFilter = filterCategory === '' ||
                talk.category.some(cat => cat.toLowerCase().includes(filterCategory.toLowerCase()));

            if (matchesFilter) {
                scheduleContainer.innerHTML += `
                    <div class="talk-card">
                        <span class="timing">${startTimeStr} - ${endTimeStr}</span>
                        <h2>${talk.title}</h2>
                        <h3>${talk.speakers.join(' & ')}</h3>
                        <p class="category">${talk.category.join(', ')}</p>
                        <p class="description">${talk.description}</p>
                    </div>
                `;
            } else {
                // If a talk doesn't match the filter, show an empty slot with fixed timing
                scheduleContainer.innerHTML += `
                    <div class="talk-card filtered-out">
                        <span class="timing">${startTimeStr} - ${endTimeStr}</span>
                        <h2>No Matching Talk</h2>
                        <p class="category">This slot is reserved for a talk not matching your search criteria.</p>
                    </div>
                `;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // talksData and fullSchedule are injected by the build script
    if (typeof fullSchedule !== 'undefined') {
        renderSchedule(); // Initial render with no filter

        const searchInput = document.getElementById('categorySearch');
        searchInput.addEventListener('keyup', (event) => {
            renderSchedule(event.target.value); // Re-render with filter
        });
    } else {
        console.error('Schedule data not found. Please ensure fullSchedule is injected by the build script.');
    }
});
