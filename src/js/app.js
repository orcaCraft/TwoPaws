
/* =====================================
   TwoPaws - Application Logic
===================================== */

// -------------------------------------
// 1. Application Data
// -------------------------------------

const activities = [
    {
        id: 1,
        title: "Visit a cat cafe",
        icon: "🐱"
    },
    {
        id: 2,
        title: "Watch the sunset together",
        icon: "🌅"
    },
    {
        id: 3,
        title: "Try a new restaurant",
        icon: "🍽️"
    }
];

const datePlans = [
    {
        id: 1,
        title: "Dinner & Movie Night",
        date: "2026-12-20",
        time: "19:00",
        location: "Kuala Lumpur",
        notes: "Choose a movie together"
    }
];

// -------------------------------------
// 2. Application State
// -------------------------------------

let currentPage = "home";

let editingDatePlanId = null;
let viewingDatePlanId = null;

let showDateForm = false;

let calendarDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
);

// -------------------------------------
// 3. Utility Functions
// -------------------------------------

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-MY", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function formatMonth(date) {
    return date.toLocaleDateString("en-MY", {
        month: "long",
        year: "numeric"
    });
}

// -------------------------------------
// 4. Screen Navigation
// -------------------------------------

function navigateTo(page) {
    currentPage = page;

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    renderApp();
}

function renderApp() {
    const appContent = document.getElementById("app-content");

    switch (currentPage) {
        case "home":
            appContent.innerHTML = renderHome();
            break;

        case "calendar":
            appContent.innerHTML = renderCalendar();
            break;

        case "activities":
            appContent.innerHTML = renderActivities();
            break;

        case "settings":
            appContent.innerHTML = renderSettings();
            break;
        
        case "date-form":
        appContent.innerHTML = renderDateForm();
        break;

        case "date-details":
            appContent.innerHTML = renderDateDetails();
            break;       

        default:
            appContent.innerHTML = renderHome();
    }

    attachScreenEvents();
}

// -------------------------------------
// 5. Home Screen
// -------------------------------------

function renderHome() {
    const upcomingDate = [...datePlans]
        .sort((a, b) => a.date.localeCompare(b.date))[0];

    let upcomingDateHTML = "";

    if (upcomingDate) {
        upcomingDateHTML = `
            <article class="date-card">
                <div class="date-card-content">

                    <span class="date-tag">
                        ✦ SOMETHING TO LOOK FORWARD TO
                    </span>

                    <h3>${escapeHTML(upcomingDate.title)}</h3>

                    <p>
                        ${formatDate(upcomingDate.date)}
                        · ${escapeHTML(upcomingDate.time)}
                    </p>

                    <div class="date-location">
                        📍 ${escapeHTML(upcomingDate.location)}
                    </div>

                    <button
                        class="primary-button"
                        data-action="view-date"
                        data-id="${upcomingDate.id}">
                        View our plans →
                    </button>

                </div>
            </article>
        `;
    } else {
        upcomingDateHTML = `
            <div class="empty-state">
                <p>No dates planned yet ♡</p>
                <p>Let's plan something together!</p>
            </div>
        `;
    }

    const previewActivities = activities
        .slice(0, 3)
        .map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    ${activity.icon}
                </div>

                <span>${escapeHTML(activity.title)}</span>
            </div>
        `)
        .join("");

    return `
        <section class="welcome-section">
            <p class="eyebrow">HELLO, YOU TWO</p>

            <h2>
                Another day, another adventure.
            </h2>

            <p class="muted-text">
                A little place to plan our next memories together.
            </p>
        </section>

        <section class="section">

            <div class="section-heading">
                <h2>Our next date</h2>
                <span class="small-label">UPCOMING</span>
            </div>

            ${upcomingDateHTML}

        </section>

        <section class="section">

            <div class="section-heading">
                <h2>Little adventures</h2>

                <button
                    class="text-button"
                    data-action="go-activities">
                    View all →
                </button>
            </div>

            <div class="activity-list">
                ${previewActivities || `
                    <p class="muted-text">
                        Your wishlist is waiting for its first adventure ♡
                    </p>
                `}
            </div>

        </section>
    `;
}

// ==========================================
// TwoPaws - Local Date Helper
// ==========================================

function getLocalDateString() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// -------------------------------------
// 6. Calendar Screen
// -------------------------------------
function renderDateForm() {
    const existingPlan = editingDatePlanId !== null
        ? datePlans.find(plan => plan.id === editingDatePlanId)
        : null;

    const isEditing = existingPlan !== null;

    return `
        <section class="page-heading">
            <p class="eyebrow">MAKE A LITTLE MEMORY</p>
            <h2>${isEditing ? "Edit our date ♡" : "Plan a date ♡"}</h2>
            <p class="muted-text">
                ${isEditing
                    ? "Update the details of your plans."
                    : "Every adventure starts with an idea."}
            </p>
        </section>

        <section class="section">
            <form id="date-plan-form" class="date-form">

                <label for="plan-title">Date title</label>
                <input
                    id="plan-title"
                    name="title"
                    type="text"
                    value="${isEditing ? escapeHTML(existingPlan.title) : ""}"
                    placeholder="e.g. Dinner & Movie Night"
                    maxlength="80"
                    required
                >

                <label for="plan-date">Date</label>
                <input
                    id="plan-date"
                    name="date"
                    type="date"
                    value="${isEditing ? escapeHTML(existingPlan.date) : ""}"
                    ${isEditing ? "" : `min="${getLocalDateString()}"`}
                    required
                >

                <label for="plan-time">Time</label>
                <input
                    id="plan-time"
                    name="time"
                    type="time"
                    value="${isEditing ? escapeHTML(existingPlan.time) : "19:00"}"
                    required
                >

                <label for="plan-location">Location</label>
                <input
                    id="plan-location"
                    name="location"
                    type="text"
                    value="${isEditing ? escapeHTML(existingPlan.location) : ""}"
                    placeholder="Where are we going?"
                    maxlength="120"
                    required
                >

                <label for="plan-notes">Notes</label>
                <textarea
                    id="plan-notes"
                    name="notes"
                    rows="4"
                    maxlength="1000"
                    placeholder="Anything else to remember?"
                >${isEditing ? escapeHTML(existingPlan.notes || "") : ""}</textarea>

                <div class="date-form-actions">
                    <button
                        type="button"
                        class="secondary-button"
                        data-action="cancel-date">
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-button">
                        ${isEditing ? "Save changes ♡" : "Save date plan ♡"}
                    </button>
                </div>

            </form>
        </section>
    `;
}

// -------------------------------------
// Date Plan Details Screen
// -------------------------------------

function renderDateDetails() {
    const plan = datePlans.find(
        item => item.id === viewingDatePlanId
    );

    if (!plan) {
        return `
            <div class="empty-state">
                <p>This date plan could not be found.</p>

                <button
                    class="primary-button"
                    data-action="go-home">
                    Back to Home
                </button>
            </div>
        `;
    }

    return `
        <section class="page-heading">
            <p class="eyebrow">ONE MORE MEMORY TO MAKE</p>
            <h2>${escapeHTML(plan.title)}</h2>
            <p class="muted-text">Our date details ♡</p>
        </section>

        <section class="section">
            <article class="settings-card date-details-card">

                <div class="date-detail-item">
                    <span>📅 Date</span>
                    <strong>${formatDate(plan.date)}</strong>
                </div>

                <div class="date-detail-item">
                    <span>🕒 Time</span>
                    <strong>${escapeHTML(plan.time)}</strong>
                </div>

                <div class="date-detail-item">
                    <span>📍 Location</span>
                    <strong>${escapeHTML(plan.location)}</strong>
                </div>

                <div class="date-detail-notes">
                    <h3>Our notes</h3>
                    <p>${escapeHTML(plan.notes || "No extra notes yet ♡")}</p>
                </div>

            </article>

            <div class="date-form-actions">
                <button
                    class="secondary-button"
                    data-action="edit-date">
                    Edit
                </button>

                <button
                    class="primary-button"
                    data-action="delete-date">
                    Delete
                </button>
            </div>

            <button
                class="text-button"
                data-action="go-home">
                ← Back to Home
            </button>
        </section>
    `;
}

function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarDays = "";

    // Empty spaces before the first day
    for (let i = 0; i < firstDay; i++) {
        calendarDays += `
            <div class="calendar-day empty"></div>
        `;
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const hasEvent = datePlans.some(
            plan => plan.date === dateString
        );

        const today = new Date();

        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

        calendarDays += `
            <div class="calendar-day
                ${hasEvent ? "has-event" : ""}
                ${isToday ? "today" : ""}">

                <span>${day}</span>

                ${hasEvent ? `<span class="event-dot"></span>` : ""}

            </div>
        `;
    }

    const monthPlans = datePlans
        .filter(plan => {
            const planDate = new Date(plan.date + "T00:00:00");

            return (
                planDate.getFullYear() === year &&
                planDate.getMonth() === month
            );
        })
        .sort((a, b) => a.date.localeCompare(b.date));

        const planHTML = monthPlans.length
            ? monthPlans.map(plan => `
                <article class="calendar-event">

                    <div>
                        <p class="small-label">
                            ${formatDate(plan.date)}
                        </p>

                        <h3>${escapeHTML(plan.title)}</h3>

                        <p class="muted-text">
                            ${escapeHTML(plan.time)}
                            · ${escapeHTML(plan.location)}
                        </p>
                    </div>

                    <button
                        class="text-button"
                        data-action="view-date"
                        data-id="${plan.id}">
                        View details →
                    </button>

                </article>
            `).join("")
            : `
                <div class="empty-state">
                    <p>No dates planned for this month ♡</p>
                </div>
            `;

        // Return the Calendar screen
        return `
            <section class="page-heading">
                <p class="eyebrow">MAKE TIME FOR EACH OTHER</p>
                <h2>Our calendar ♡</h2>
                <p class="muted-text">
                    All the little moments we're looking forward to.
                </p>
            </section>

            <section class="section calendar-container">

                <div class="calendar-header">

                    <button data-action="previous-month">
                        ←
                    </button>

                    <h3>${formatMonth(calendarDate)}</h3>

                    <button data-action="next-month">
                        →
                    </button>

                </div>

                <div class="calendar-grid">

                    <div class="weekday">S</div>
                    <div class="weekday">M</div>
                    <div class="weekday">T</div>
                    <div class="weekday">W</div>
                    <div class="weekday">T</div>
                    <div class="weekday">F</div>
                    <div class="weekday">S</div>

                    ${calendarDays}

                </div>

            </section>

            <section class="section">

                <div class="section-heading">
                    <h2>Planned dates</h2>

                    <button
                        class="text-button"
                        data-action="add-date">
                        + Add date
                    </button>
                </div>

                <div class="calendar-events">
                    ${planHTML}
                </div>

            </section>
        `;
}

// -------------------------------------
// 7. Activities Screen
// -------------------------------------

function renderActivities() {
    const activityHTML = activities.length
        ? activities.map(activity => `
            <div class="activity-item">

                <div class="activity-icon">
                    ${activity.icon}
                </div>

                <span>${escapeHTML(activity.title)}</span>

                <button
                    class="delete-button"
                    data-delete-activity="${activity.id}"
                    aria-label="Remove ${escapeHTML(activity.title)}">
                    ×
                </button>

            </div>
        `).join("")
        : `
            <div class="empty-state">
                <p>Your adventure list is empty ♡</p>
                <p>Add something you'd both like to experience.</p>
            </div>
        `;

    return `
        <section class="page-heading">

            <p class="eyebrow">OUR LITTLE BUCKET LIST</p>

            <h2>Little adventures ♡</h2>

            <p class="muted-text">
                All the things we want to do together.
            </p>

        </section>

        <section class="section">

            <div class="section-heading">
                <h2>Things to experience</h2>

                <button
                    class="text-button"
                    data-action="add-activity">
                    + Add
                </button>
            </div>

            <div class="activity-list">
                ${activityHTML}
            </div>

            <!-- Add Activity Modal -->
            <div id="activity-modal-container"></div>

        </section>
    `;
}

// -------------------------------------
// Activity Modal
// -------------------------------------

function renderActivityModal() {

    const activityIcons = [
        "🧺",
        "🎬",
        "☕",
        "🏖️",
        "📸",
        "💕",
        "🎮",
        "🍰",
        "🌸",
        "🎡"
    ];

    return `
        <div class="activity-modal-overlay">

            <div class="activity-modal">

                <div class="activity-modal-header">
                    <h2>New little adventure ♡</h2>

                    <button
                        class="activity-modal-close"
                        data-action="cancel-activity"
                        aria-label="Close">
                        ×
                    </button>
                </div>

                <div class="activity-modal-body">

                    <label for="activity-title-input">
                        What would you like to do?
                    </label>

                    <input
                        type="text"
                        id="activity-title-input"
                        placeholder="e.g. Cafe hopping, beach day..."
                        maxlength="60"
                    >

                    <label class="activity-icon-label">
                        Choose an icon
                    </label>

                    <div class="activity-icon-picker">
                    ${
                        activityIcons.map(icon => `
                            <button
                                type="button"
                                class="activity-icon-option ${icon === "🧺" ? "selected" : ""}"
                                data-select-icon="${icon}"
                                aria-label="Select ${icon}">
                                ${icon}
                            </button>
                        `).join("")
                    }
                    </div>

                </div>

                <div class="activity-modal-footer">

                    <button
                        class="activity-cancel-button"
                        data-action="cancel-activity">
                        Cancel
                    </button>

                    <button
                        class="activity-save-button"
                        data-action="save-activity">
                        Save Activity ♡
                    </button>

                </div>

            </div>

        </div>
    `;
}


function openActivityModal() {

    const modalContainer = document.getElementById(
        "activity-modal-container"
    );

    if (!modalContainer) {
        return;
    }

    // Display the modal
    modalContainer.innerHTML = renderActivityModal();

    let selectedIcon = "🧺";

    // Emoji selection
    modalContainer.querySelectorAll("[data-select-icon]").forEach(button => {

        button.addEventListener("click", () => {

            selectedIcon = button.dataset.selectIcon;

            // Remove previous selection
            modalContainer.querySelectorAll(".activity-icon-option")
                .forEach(option => {
                    option.classList.remove("selected");
                });

            // Highlight selected icon
            button.classList.add("selected");

        });
    });

    // Close modal buttons
    modalContainer.querySelectorAll('[data-action="cancel-activity"]')
        .forEach(button => {

            button.addEventListener("click", () => {
                modalContainer.innerHTML = "";
            });

        });

    // Save activity button
    const saveButton = modalContainer.querySelector(
        '[data-action="save-activity"]'
    );

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            saveNewActivity(selectedIcon);
        });
    }

    // Close when tapping the overlay outside the modal
    const overlay = modalContainer.querySelector(
        ".activity-modal-overlay"
    );

    if (overlay) {
        overlay.addEventListener("click", event => {

            if (event.target === overlay) {
                modalContainer.innerHTML = "";
            }

        });
    }

    // Focus the input
    const titleInput = modalContainer.querySelector(
        "#activity-title-input"
    );

    if (titleInput) {
        titleInput.focus();
    }
}


// -------------------------------------
// Save New Activity
// -------------------------------------

async function saveNewActivity(icon) {

    const titleInput = document.getElementById(
        "activity-title-input"
    );

    if (!titleInput) {
        return;
    }

    const title = titleInput.value.trim();

    if (!title) {
        alert("Please enter an activity name ♡");
        titleInput.focus();
        return;
    }

    const newActivity = {
        id: Date.now(),
        title: title,
        icon: icon
    };

    try {

        // Save to IndexedDB first
        await saveRecord("activities", newActivity);

        // Update in-memory array
        activities.push(newActivity);

        console.log("Activity added successfully!");

        // Refresh the screen
        renderApp();

    } catch (error) {

        console.error("Failed to add activity:", error);

        alert("Unable to add your activity. Please try again.");

    }
}


// -------------------------------------
// 8. Settings Screen
// -------------------------------------

function renderSettings() {
    return `
        <section class="page-heading">

            <p class="eyebrow">MAKE YOURSELF AT HOME</p>

            <h2>Settings ⚙</h2>

            <p class="muted-text">
                Manage your TwoPaws experience.
            </p>

        </section>

        <section class="section">

            <div class="settings-card">

                <h3>Application</h3>

                <div class="settings-item">
                    <span>App name</span>
                    <strong>TwoPaws</strong>
                </div>

                <div class="settings-item">
                    <span>Version</span>
                    <strong>0.1.0</strong>
                </div>

            </div>

            <div class="settings-card">

                <h3>Synchronisation</h3>

                <div class="settings-item">
                    <span>Sync status</span>
                    <strong class="local-status">
                        Local only
                    </strong>
                </div>

                <p class="muted-text">
                    Google Drive and Firebase have not been
                    connected yet.
                </p>

            </div>

            <div class="settings-card">

                <h3>About</h3>

                <p class="muted-text">
                    A little space for two people to plan
                    their next memories together.
                </p>

                <p class="about-text">
                    Made with ♡
                </p>

            </div>

        </section>
    `;
}

// -------------------------------------
// 9. Activity Management
// -------------------------------------



async function saveDatePlan(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const planData = {
        title: formData.get("title").trim(),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location").trim(),
        notes: formData.get("notes").trim()
    };

    try {

        // Editing an existing date plan
        if (editingDatePlanId !== null) {

            const existingPlan = datePlans.find(
                plan => plan.id === editingDatePlanId
            );

            if (!existingPlan) {
                alert("Unable to find the date plan.");
                return;
            }

            const updatedPlan = {
                ...existingPlan,
                ...planData
            };

            // Save changes to IndexedDB first
            await saveRecord("datePlans", updatedPlan);

            // Update the in-memory array
            Object.assign(existingPlan, updatedPlan);

            viewingDatePlanId = existingPlan.id;
            editingDatePlanId = null;

            navigateTo("date-details");

        }

        // Creating a new date plan
        else {

            const newPlan = {
                id: Date.now(),
                ...planData
            };

            // Save the new plan to IndexedDB first
            await saveRecord("datePlans", newPlan);

            // Add it to the in-memory array
            datePlans.push(newPlan);

            navigateTo("home");
        }

        console.log("Date plan saved successfully!");

    } catch (error) {

        console.error("Failed to save date plan:", error);

        alert("Unable to save your date plan. Please try again.");

    }
}

// ==========================================
// TwoPaws - Delete Date Plan
// ==========================================

async function deleteDatePlan() {

    const confirmed = confirm(
        "Are you sure you want to delete this date?"
    );

    if (!confirmed) {
        return;
    }

    try {

        // Delete from IndexedDB first
        await deleteRecord("datePlans", viewingDatePlanId);

        // Find and remove from the in-memory array
        const index = datePlans.findIndex(
            plan => plan.id === viewingDatePlanId
        );

        if (index !== -1) {
            datePlans.splice(index, 1);
        }

        // Clear the selected date
        viewingDatePlanId = null;

        // Return home
        navigateTo("home");

        console.log("Date plan deleted successfully!");

    } catch (error) {

        console.error("Failed to delete date plan:", error);

        alert("Unable to delete your date plan. Please try again.");

    }
}


async function addActivity() {

    const title = prompt("Enter an activity:");

    if (!title || !title.trim()) {
        return;
    }

    // Available icons for activities
    const activityIcons = [
        "🧺",
        "🎬",
        "☕",
        "🏖️",
        "📸",
        "💕",
        "🎮",
        "🍰",
        "🌸",
        "🎡"
    ];

    // Ask the user to select an icon
    const iconOptions = activityIcons
        .map((icon, index) => `${index + 1}. ${icon}`)
        .join("\n");

    const iconChoice = prompt(
        "Choose an icon for your activity:\n\n" +
        iconOptions +
        "\n\nEnter a number from 1 to " + activityIcons.length
    );

    // Cancel icon selection
    if (iconChoice === null) {
        return;
    }

    const iconIndex = Number(iconChoice) - 1;

    // Validate icon selection
    if (
        !Number.isInteger(Number(iconChoice)) ||
        iconIndex < 0 ||
        iconIndex >= activityIcons.length
    ) {
        alert("Invalid icon selection. Please try again.");
        return;
    }

    // Assign the selected icon
    const icon = activityIcons[iconIndex];

    const newActivity = {
        id: Date.now(),
        title: title.trim(),
        icon: icon
    };

    try {

        // Save to IndexedDB first
        await saveRecord("activities", newActivity);

        // Update the in-memory array
        activities.push(newActivity);

        renderApp();

        console.log("Activity added successfully!");

    } catch (error) {

        console.error("Failed to add activity:", error);

        alert("Unable to add your activity. Please try again.");

    }
}



async function deleteActivity(id) {

    try {

        // Delete from IndexedDB first
        await deleteRecord("activities", id);

        // Find and remove from the in-memory array
        const index = activities.findIndex(
            activity => activity.id === id
        );

        if (index !== -1) {
            activities.splice(index, 1);
        }

        renderApp();

        console.log("Activity deleted successfully!");

    } catch (error) {

        console.error("Failed to delete activity:", error);

        alert("Unable to delete your activity. Please try again.");

    }
}

// -------------------------------------
// 10. Screen Event Handling
// -------------------------------------


function attachScreenEvents() {

    // General action buttons
    document.querySelectorAll("[data-action]").forEach(button => {

        button.addEventListener("click", () => {

            const action = button.dataset.action;

            switch (action) {

                case "add-activity":
                    openActivityModal();
                    break;
                    
                case "add-date":
                    navigateTo("date-form");
                    break;

                case "cancel-date":
                    if (editingDatePlanId !== null) {
                        editingDatePlanId = null;
                        navigateTo("date-details");
                    } else {
                        navigateTo("home");
                    }
                    break;

                case "view-date":
                    viewingDatePlanId = Number(button.dataset.id);
                    navigateTo("date-details");
                    break;

                case "edit-date":
                    editingDatePlanId = viewingDatePlanId;
                    navigateTo("date-form");
                    break;

                case "delete-date": {

                    deleteDatePlan();

                    break;
                }

                case "previous-month":
                    calendarDate.setMonth(
                        calendarDate.getMonth() - 1
                    );
                    renderApp();
                    break;

                case "next-month":
                    calendarDate.setMonth(
                        calendarDate.getMonth() + 1
                    );
                    renderApp();
                    break;

                case "go-home":
                    editingDatePlanId = null;
                    viewingDatePlanId = null;
                    navigateTo("home");
                    break;
                
                case "go-activities":
                    navigateTo("activities");
                    break;
            }
        });
    });

    // Date plan form submission
    const datePlanForm = document.getElementById("date-plan-form");

    if (datePlanForm) {
        datePlanForm.addEventListener("submit", saveDatePlan);
    }

    // Activity deletion
    document.querySelectorAll("[data-delete-activity]").forEach(button => {

        button.addEventListener("click", () => {

            const id = Number(
                button.dataset.deleteActivity
            );

            deleteActivity(id);
        });
    });

    // Activity addition
    const addActivityButton = document.querySelector(
        '[data-action="add-activity"]'
    );
}


// -------------------------------------
// 11. Main Navigation Events
// -------------------------------------

document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {
        navigateTo(button.dataset.page);
    });
});


// ==========================================
// TwoPaws - Application Initialisation
// ==========================================

async function initializeApp() {

    try {

        // 1. Open the database
        await openDatabase();

        console.log("TwoPaws database connected!");

        // 2. Retrieve saved data
        const savedDatePlans = await getAllRecords("datePlans");
        const savedActivities = await getAllRecords("activities");

        // 3. Check whether this is the first initialisation
        const isFirstLaunch =
            localStorage.getItem("twopaws-db-initialized") !== "true";

        if (isFirstLaunch) {

            // Seed sample date plans if the database is empty
            if (savedDatePlans.length === 0) {

                for (const plan of datePlans) {
                    await saveRecord("datePlans", plan);
                }

            } else {

                datePlans.splice(
                    0,
                    datePlans.length,
                    ...savedDatePlans
                );

            }

            // Seed sample activities if the database is empty
            if (savedActivities.length === 0) {

                for (const activity of activities) {
                    await saveRecord("activities", activity);
                }

            } else {

                activities.splice(
                    0,
                    activities.length,
                    ...savedActivities
                );

            }

            // Remember that initialisation has completed
            localStorage.setItem("twopaws-db-initialized", "true");

        } else {

            // Load existing saved data
            datePlans.splice(
                0,
                datePlans.length,
                ...savedDatePlans
            );

            activities.splice(
                0,
                activities.length,
                ...savedActivities
            );

        }

        // 4. Render the application after loading data
        renderApp();

        console.log("TwoPaws initialised successfully!");

    } catch (error) {

        console.error("Failed to initialise TwoPaws:", error);

        document.getElementById("app-content").innerHTML = `
            <section class="empty-state">
                <h2>Unable to load TwoPaws</h2>
                <p>Please refresh the application and try again.</p>
            </section>
        `;

    }
}


// -------------------------------------
// 12. Initialise Application
// -------------------------------------

initializeApp();
