const fs = require('fs');
const path = require('path');

const talksData = [
    {
        title: "Introduction to Quantum Computing",
        speakers: ["Dr. Alice Smith"],
        category: ["Quantum Physics", "Computer Science"],
        duration: 60,
        description: "An overview of the principles of quantum computing and its potential applications."
    },
    {
        title: "Advanced AI Ethics",
        speakers: ["Prof. Bob Johnson", "Dr. Carol White"],
        category: ["Artificial Intelligence", "Ethics", "Philosophy"],
        duration: 60,
        description: "Exploring the complex ethical dilemmas in advanced AI systems and autonomous agents."
    },
    {
        title: "Modern Web Development with WebAssembly",
        speakers: ["David Green"],
        category: ["Web Development", "Performance", "Frontend"],
        duration: 60,
        description: "How WebAssembly is changing the landscape of web applications and enabling high-performance experiences."
    },
    {
        title: "The Future of Space Exploration",
        speakers: ["Dr. Eve Black"],
        category: ["Aerospace", "Future Technologies", "Engineering"],
        duration: 60,
        description: "A look at upcoming missions, propulsion technologies, and the next frontiers in space exploration."
    },
    {
        title: "Cybersecurity in the Age of IoT",
        speakers: ["Frank Blue", "Grace Red"],
        category: ["Cybersecurity", "IoT", "Networking"],
        duration: 60,
        description: "Addressing the unique security challenges posed by the proliferation of Internet of Things devices."
    },
    {
        title: "Sustainable Software Engineering",
        speakers: ["Harry Brown"],
        category: ["Sustainability", "Software Engineering", "Green IT"],
        duration: 60,
        description: "Strategies and practices for building software that minimizes environmental impact."
    }
];

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Function to generate the full schedule structure with timings
function generateFullSchedule(allTalks) {
    const schedule = [];
    let currentTime = new Date();
    currentTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

    const talkDuration = 60; // 1 hour in minutes
    const transitionDuration = 10; // 10 minutes
    const lunchDuration = 60; // 1 hour lunch

    let talkIndex = 0;
    const totalTalkSlots = 6;
    const lunchSlotAfterTalkIndex = 3; // Lunch after the 3rd talk (0-indexed, so after allTalks[2])

    for (let i = 0; i < totalTalkSlots; i++) {
        // Check if it's time for the lunch break
        if (i === lunchSlotAfterTalkIndex) {
            const lunchStartTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + lunchDuration);
            const lunchEndTime = new Date(currentTime);
            schedule.push({
                type: 'break',
                title: 'Lunch Break',
                startTime: lunchStartTime,
                endTime: lunchEndTime
            });
            // Add transition after lunch, before the next talk
            if (i < totalTalkSlots - 1) { // If there are talks after lunch
                currentTime.setMinutes(currentTime.getMinutes() + transitionDuration);
            }
        }

        // Add a talk slot
        const talkStartTime = new Date(currentTime);
        currentTime.setMinutes(currentTime.getMinutes() + talkDuration);
        const talkEndTime = new Date(currentTime);

        const talkDataForSlot = allTalks[talkIndex]; // Get talk from pre-defined talksData
        schedule.push({
            type: 'talk',
            talkData: talkDataForSlot,
            startTime: talkStartTime,
            endTime: talkEndTime
        });
        talkIndex++;

        // Add transition after each talk, except the very last slot
        if (i < totalTalkSlots -1 ) {
            currentTime.setMinutes(currentTime.getMinutes() + transitionDuration);
        }
    }
    return schedule;
}


const build = () => {
    const htmlTemplate = fs.readFileSync(path.join(__dirname, 'src', 'index.html'), 'utf8');
    const cssContent = fs.readFileSync(path.join(__dirname, 'src', 'style.css'), 'utf8');
    let jsContent = fs.readFileSync(path.join(__dirname, 'src', 'script.js'), 'utf8');

    // Inject talksData into the script
    const injectedTalksData = `const talksData = ${JSON.stringify(talksData, null, 2)};`;
    jsContent = `${injectedTalksData}\n${jsContent}`;

    // Inject generateFullSchedule function and call it to store the fullSchedule
    const fullScheduleData = generateFullSchedule(talksData);
    const injectedFullSchedule = `
        let fullSchedule = ${JSON.stringify(fullScheduleData.map(item => ({
            ...item,
            startTime: item.startTime.toISOString(), // Convert Date objects to ISO strings
            endTime: item.endTime.toISOString()
        })), null, 2)};

        // Re-parse dates in the client-side script
        fullSchedule.forEach(item => {
            item.startTime = new Date(item.startTime);
            item.endTime = new Date(item.endTime);
        });
    `;
    jsContent = `${injectedFullSchedule}\n${jsContent}`;

    // Replace placeholders in HTML template
    let finalHtml = htmlTemplate.replace(
        '<style id="injected-styles"></style>',
        `<style id="injected-styles">${cssContent}</style>`
    );
    finalHtml = finalHtml.replace(
        '<script id="injected-script"></script>',
        `<script id="injected-script">${jsContent}</script>`
    );

    fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), finalHtml, 'utf8');
    console.log('Successfully built dist/index.html');
};

build();
