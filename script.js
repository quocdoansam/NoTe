const modal = document.querySelector('.modal');
const cancelModalBtns = document.querySelectorAll('.cancel-modal-btn');

const joinButton = document.querySelector('.join-button');
const userButton = document.querySelector('.user-button');

const loginModal = document.querySelector('.login-modal');
const createModal = document.querySelector('.create-modal');

const loginForm = document.querySelector('.login-form');
const createForm = document.querySelector('.create-form');

const loginButton = document.querySelector('.login-button');
const loginUsernameInput = loginModal.querySelector('.username-or-email-input');
const loginPasswordInput = loginModal.querySelector('.password-input');

const createButton = document.querySelector('.create-button');
const createBtn = createForm.querySelector('.create-btn');
const createUsernameInput = createForm.querySelector('.email-input');
const createPasswordInput = createForm.querySelector('.password-input');
const createPasswordConfirmInput = createForm.querySelector('.confirm-password-input');

const addInput = document.querySelector('.add-input');
const addbtn = document.querySelector('.add-btn');
const noteContainer = document.querySelector('.note-container');
const noteCountElement = document.querySelector('.note-count');
const sortNoteElement = document.querySelector('.sort');

let noteList = [];
const greetings = ["Hello, are you OK?", "What do u want.", "Hmmmmm ... huhh?", "How are u today?"];
let countGreeting = 0;
let noteCount = 0;

// Cookie
function saveToCookie(time = 3600, key, data) {
    document.cookie = `${key}=${data}; path=/; max-age=${time}`;
}

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        let [key, value] = cookie.split("=");
        if (key === name) return JSON.parse(value);
    }
    return null;
}

// Modal
document.addEventListener("click", (e) => {
    if (loginModal.classList.contains("open") && !loginModal.contains(e.target) && e.target !== joinButton) {
        loginModal.classList.remove("open");
    }

    if (createModal.classList.contains("open") && !createModal.contains(e.target) && e.target !== createButton) {
        createModal.classList.remove("open");
    }
});

cancelModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const modal = btn.closest(".modal");
        if (modal && modal.classList.contains("open")) {
            modal.classList.remove("open");
        }
    });
});

// Join
joinButton.addEventListener('click', () => {
    loginModal.classList.toggle('open');
});

// Create account
createButton.addEventListener('click', () => {
    createModal.classList.add('open');
    loginModal.classList.remove('open'); // Hidden login modal
});

// Login
loginButton.addEventListener('click', () => {
    loginModal.classList.add('open');
    createModal.classList.remove('open');
    console.log("clicked");
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (username === "" || password === "") {
        return;
    }

    await login(username, password)
        .then(user => {
            if (user) {
                saveToCookie(3600, "userId", user.id);

                // Close login modal
                modal.classList.remove('open');

                // Reload the website
                location.reload();
            } else {
                console.log("Invalid credentials.");
            }
        });
});

async function login(username, password) {
    try {
        const response = await fetch(`https://67bea22db2320ee05010c471.mockapi.io/api/v1/users?username=${username}&password=${password}`, {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Error fetching data");
        }

        const users = await response.json();

        if (users.length > 0) {
            return users[0];
        } else {
            console.log("Invalid username or password.");
            return null;
        }
    } catch (error) {
        console.error("Login failed:", error);
        return null;
    }
}

async function loadUserData() {
    const userId = getCookie("userId");
    try {
        const response = await fetch(`https://67bea22db2320ee05010c471.mockapi.io/api/v1/users?id=${userId}`, {
            method: 'GET',
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const data = await response.json();

        mappingUserData(data[0]);

        joinButton.style.display = 'none'; // Hidden join button
        userButton.style.display = 'block'; // Display account button
    } catch (error) {
        joinButton.style.display = 'block'; // Display join button
        console.error(error);
        return null;
    }
}

function mappingUserData(userData) {
    userButton.textContent = userData.name;
}

function addNote() {
    const noteContent = addInput.value;
    if (noteContent === "") {
        addInput.placeholder = "Don't leave blank.";
        return;
    }

    note = {
        id: randomNoteId(),
        content: noteContent,
        time: getCurrentDate()
    }

    noteList.push(note);
    showNoteCount(++noteCount);
    saveToLocalStorage();
    sortNote('newest');
    renderNote();
    addInput.value = '';
    addInput.placeholder = "1 note added.";
}

function randomNoteId(length = 10) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function parseCustomDate(dateString) {
    const [datePart, timePart] = dateString.split(" ");
    if (!datePart || !timePart) return 0;

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}


function saveToLocalStorage() {
    localStorage.setItem("noteList", JSON.stringify(noteList));
}

function renderNote() {
    if (noteList.length < 1) {
        noteContainer.innerHTML = `<span class="notice">No note yet ...</span>`;
        return;
    }

    const notesByMonth = noteList.reduce((acc, note) => {
        const [day, month, yearTime] = note.time.split("/");
        const [year, time] = yearTime.split(" ");

        const date = new Date(`${year}-${month}-${day} ${time}`);

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(note);
        console.log(monthKey)
        return acc;
    }, {});

    noteContainer.innerHTML = Object.keys(notesByMonth).map(month => {
        return `
            <div class="month-group">
                <h3 class="month-title">${new Date(month + "-01").toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>
                <div class="notes">
                    ${notesByMonth[month].map(note => `
                        <div class="note" data-id="${note.id}">
                            <div class="edit-section">
                                <input class="edit-input" type="text" placeholder="Edit note">
                                <div class="button-group">
                                    <button class="save-edit-btn btn">Save</button>
                                    <button class="cancel-edit-btn btn">Cancel</button>
                                </div>
                            </div>
                            <div class="content-group">
                                <span class="note-content">${note.content}</span>
                                <time datetime="${note.time}" class="note-time">at ${note.time}</time>
                            </div>
                            <div class="note-action">
                                <button class="remove-action">Remove</button>
                                <button class="edit-action">Edit</button>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    }).join("");
}


function sortNote(sort = 'newest') {
    noteList.sort((a, b) => {
        return sort === "newest"
            ? new Date(parseCustomDate(b.time)) - new Date(parseCustomDate(a.time))
            : new Date(parseCustomDate(a.time)) - new Date(parseCustomDate(b.time));
    });
    renderNote();
}

function showNoteCount(count) {
    noteCountElement.textContent = count > 1 ? `${count} notes` : `${count} note`;
}

function loadNote() {
    noteList = JSON.parse(localStorage.getItem("noteList")) ?? [];
    noteCount = noteList.length;
    showNoteCount(noteCount);
}

document.addEventListener('DOMContentLoaded', () => {
    loadNote();
    renderNote();
    sortNote('newest');
    loadUserData();
    addbtn.addEventListener('click', addNote);
    sortNoteElement.addEventListener('change', function (e) {
        sortNote(e.target.value);
    });

    noteContainer.addEventListener('click', function (e) {
        let noteElement = e.target.closest('.note');
        if (!noteElement) return;

        let noteAction = noteElement.querySelector('.note-action');
        let editInput = noteElement.querySelector('.edit-input');
        let editSection = noteElement.querySelector('.edit-section');
        let contentGroup = noteElement.querySelector('.content-group');

        let noteId = noteElement.dataset.id;
        let noteIndex = noteList.findIndex((note) => note.id == noteId);
        if (noteIndex === -1) return;

        if (e.target.classList.contains('remove-action')) {
            noteList = noteList.filter((note) => note.id != noteId);
            saveToLocalStorage(noteList);
            showNoteCount(--noteCount)
            renderNote();
        }

        if (e.target.classList.contains('edit-action')) {
            editSection.style.display = "flex";
            noteAction.style.display = "none";
            contentGroup.style.display = "none";
            editInput.value = noteList[noteIndex].content;
            editInput.focus();
        }

        if (e.target.classList.contains('cancel-edit-btn')) {
            editSection.style.display = "none";
            noteAction.style.display = "flex";
            contentGroup.style.display = "flex";
        }

        if (e.target.classList.contains('save-edit-btn')) {
            const newContent = editInput.value.trim();
            if (newContent === "") {
                editInput.classList.add('shadow-error');
                setTimeout(() => {
                    editInput.classList.remove('shadow-error');
                }, 2000);
                return;
            }

            if (newContent === noteList[noteIndex].content) {
                editInput.classList.add('shadow-error');
                setTimeout(() => {
                    editInput.classList.remove('shadow-error');
                }, 2000);
                return;
            }
            noteList[noteIndex].content = newContent;
            noteList[noteIndex].time = getCurrentDate();
            saveToLocalStorage(noteList);
            renderNote();
            editSection.style.display = "none";
            noteAction.style.display = "flex";
            contentGroup.style.display = "flex";
        }
    });
});

setInterval(() => {
    countGreeting++;
    if (countGreeting > greetings.length - 1) {
        countGreeting = 0;
    }
    addInput.placeholder = greetings[countGreeting];
}, 3000);