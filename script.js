// ==================================
// NEUROFORGE - ROLE BASED ACCESS
// (localStorage acts as the database for now)
// ==================================

const USERS_KEY = "neuroforgeUsers";
const SESSION_KEY = "currentUser";

const ROLE_PAGES = {
    "Admin": "admin.html",
    "Project Manager": "manager.html",
    "Developer": "developer.html",
    "Tester": "tester.html",
    "DevOps Engineer": "devops.html"
};

const MENUS = {
    "Admin": ["Dashboard", "Users", "Roles", "System", "Registered Users Info", "Suspend / Activate Users"],
    "Project Manager": ["Dashboard", "Projects", "Teams", "Tasks", "Sprints"],
    "Developer": ["Dashboard", "My Tasks", "Code Repository", "Pull Requests", "Issues"],
    "Tester": ["Dashboard", "Test Cases", "Test Execution", "Bug Reports", "Test Results"],
    "DevOps Engineer": ["Dashboard", "Pipelines", "Deployments", "Monitoring", "Infrastructure"]
};

const ROLE_INFO = {
    "Project Manager": "Create projects, manage teams, tasks and sprints",
    "Developer": "Work on tasks, repositories, pull requests and issues",
    "Tester": "Run test cases, report bugs and view results",
    "DevOps Engineer": "Manage pipelines, deployments, monitoring and infrastructure"
};

// Sample data shown in non-admin dashboards: "Name|Tag|colour"
const DATA = {
    "Project Manager": {
        stats: [["Active Projects", "4"], ["Team Members", "12"], ["Open Tasks", "18"]],
        items: {
            "Projects": ["NeuroForge Web App|On Track|green", "Mobile App|At Risk|yellow", "API Gateway|Delayed|red"],
            "Teams": ["Frontend Team|5 members|", "Backend Team|4 members|", "QA Team|3 members|"],
            "Tasks": ["Design login page|Done|green", "Build REST API|In Progress|yellow", "Write test plan|To Do|"],
            "Sprints": ["Sprint 11|Completed|green", "Sprint 12|Active|yellow", "Sprint 13|Planned|"]
        }
    },
    "Developer": {
        stats: [["Open Tasks", "6"], ["Pull Requests", "3"], ["Open Issues", "5"]],
        items: {
            "My Tasks": ["Build login API|In Progress|yellow", "Fix navbar bug|To Do|", "Write unit tests|Done|green"],
            "Code Repository": ["neuroforge-web|main|green", "neuroforge-api|develop|yellow", "shared-utils|main|green"],
            "Pull Requests": ["#142 Auth module|Review|yellow", "#139 UI updates|Merged|green", "#137 DB schema|Changes requested|red"],
            "Issues": ["#58 Login timeout|Open|red", "#61 Slow dashboard|In Progress|yellow", "#44 Typo on home|Closed|green"]
        }
    },
    "Tester": {
        stats: [["Test Cases", "120"], ["Pass Rate", "91%"], ["Open Bugs", "7"]],
        items: {
            "Test Cases": ["Login module|Ready|green", "Payment flow|Ready|green", "Profile page|Draft|"],
            "Test Execution": ["Regression suite|Running|yellow", "Smoke tests|Completed|green", "API tests|Queued|"],
            "Bug Reports": ["Payment fails on retry|Critical|red", "Slow search|Medium|yellow", "Logo misaligned|Low|"],
            "Test Results": ["Login module|Passed|green", "Payment flow|Failed|red", "Profile page|Pending|yellow"]
        }
    },
    "DevOps Engineer": {
        stats: [["Pipelines", "8"], ["Uptime", "99.9%"], ["Deployments Today", "3"]],
        items: {
            "Pipelines": ["web-ci|Passing|green", "api-ci|Running|yellow", "mobile-ci|Failed|red"],
            "Deployments": ["Production v1.8|Live|green", "Staging v1.9|Deploying|yellow", "Dev build|Failed|red"],
            "Monitoring": ["CPU usage|42%|green", "Memory usage|71%|yellow", "Error rate|0.2%|green"],
            "Infrastructure": ["Web server|Online|green", "Database|Online|green", "Cache server|Degraded|yellow"]
        }
    }
};

const ROLE_SPECS = {
    "Admin": ["Manage all registered users", "Review roles and permissions", "Suspend or activate accounts", "Monitor system status"],
    "Project Manager": ["Create and manage projects", "Organize teams and assign tasks", "Plan and track sprints", "Monitor project progress"],
    "Developer": ["Work on assigned tasks", "Access code repositories", "Create and review pull requests", "Report and fix issues"],
    "Tester": ["Write and run test cases", "Execute test cycles", "Report bugs", "Review test results"],
    "DevOps Engineer": ["Build and manage pipelines", "Deploy to environments", "Monitor system health", "Maintain infrastructure"]
};

let selectedRole = "";
let currentRole = "";

// ==================================
// STORAGE HELPERS
// ==================================

function getUsers() { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem(SESSION_KEY)); }

function esc(t) {
    let d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
}

function createAdmin() {
    let users = getUsers();
    if (!users.find(u => u.email === "admin@neuroforge.com")) {
        users.push({ name: "Admin", email: "admin@neuroforge.com", password: "Admin@123", role: "Admin", status: "Active", date: "-" });
        saveUsers(users);
    }
}

createAdmin();

// ==================================
// ROLE SELECTION + LOGIN / REGISTER TABS
// ==================================

function setTab(isLogin) {
    document.getElementById("tabLogin").className = isLogin ? "active" : "";
    document.getElementById("tabRegister").className = isLogin ? "" : "active";
}

function selectRole(role) {
    selectedRole = role;
    document.getElementById("roleSelection").style.display = "none";
    document.getElementById("authWrap").style.display = "flex";
    document.getElementById("selectedRoleTitle").innerText = role + " Login";
    document.getElementById("registerLink").style.display = role === "Admin" ? "none" : "block";
    document.querySelector(".auth-tabs").style.display = role === "Admin" ? "none" : "flex";
    document.getElementById("regRole").value = role === "Admin" ? "" : role;
    showLogin();
}

function backToRoles() {
    selectedRole = "";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("authWrap").style.display = "none";
    document.getElementById("roleSelection").style.display = "block";
    document.getElementById("message").innerText = "";
}

function togglePw(id, btn) {
    let input = document.getElementById(id);
    let show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.innerText = show ? "🙈" : "👁️";
}

function goRegister() {
    let email = document.getElementById("loginEmail").value;
    showRegister();
    document.getElementById("regEmail").value = email;
}

function goLogin() {
    let email = document.getElementById("regEmail").value;
    showLogin();
    document.getElementById("loginEmail").value = email;
}

function showRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("message").innerText = "";
    setTab(false);
}

function showLogin() {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("message").innerText = "";
    setTab(true);
}

// ==================================
// REGISTER
// ==================================

function register() {
    let name = document.getElementById("regName").value.trim();
    let email = document.getElementById("regEmail").value.trim().toLowerCase();
    let password = document.getElementById("regPassword").value;
    let role = document.getElementById("regRole").value;
    let message = document.getElementById("message");

    if (!name || !email || !password || !role) {
        message.innerText = "Please fill all fields!";
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.innerText = "Enter a valid email address!";
        return;
    }
    if (password.length < 6) {
        message.innerText = "Password must have at least 6 characters!";
        return;
    }

    let users = getUsers();
    if (users.find(u => u.email === email)) {
        message.innerHTML = 'Email already registered! <a href="#" onclick="goLogin(); return false;">Login here</a>';
        return;
    }

    users.push({ name, email, password, role, status: "Active", date: new Date().toLocaleDateString() });
    saveUsers(users);

    // Registered -> log in directly and open the user's own dashboard
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email, role }));
    window.location.href = ROLE_PAGES[role];
}

// ==================================
// LOGIN
// ==================================

function login() {
    let email = document.getElementById("loginEmail").value.trim().toLowerCase();
    let password = document.getElementById("loginPassword").value;
    let message = document.getElementById("message");

    if (!email || !password) {
        message.innerText = "Please enter email and password!";
        return;
    }

    let user = getUsers().find(u => u.email === email);

    if (!user) {
        if (selectedRole === "Admin") {
            message.innerText = "Invalid admin credentials! Admin login is only for the admin account. Other users: go back and choose your own role.";
        } else message.innerHTML = 'You are not registered yet. <a href="#" onclick="goRegister(); return false;">Register now</a>';
        return;
    }
    if (user.password !== password) {
        message.innerText = "Incorrect password!";
        return;
    }
    if (selectedRole && user.role !== selectedRole) {
        message.innerText = "This email is registered as " + user.role + ". Please select that role.";
        return;
    }
    if ((user.status || "Active") === "Suspended") {
        message.innerText = "Your account is suspended. Please contact the admin.";
        return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, role: user.role }));
    window.location.href = ROLE_PAGES[user.role];
}

// ==================================
// DASHBOARD (sidebar + sections)
// ==================================

function loadDashboard(role) {
    let session = getCurrentUser();
    let user = session && getUsers().find(u => u.email === session.email);

    if (!user || user.role !== role || (user.status || "Active") === "Suspended") {
        logout();
        return;
    }

    currentRole = role;
    document.getElementById("navUserName").innerHTML = `<span class="avatar">${esc(user.name.charAt(0).toUpperCase())}</span>${esc(user.name)}`;

    document.getElementById("sidebar").innerHTML = MENUS[role].map((m, i) =>
        `<button onclick="showSection(${i})">${m}</button>`).join("") +
        `<button class="side-logout" onclick="logout()">⏻ Logout</button>`;

    showSection(0);
}

function profileCard() {
    let s = getCurrentUser();
    let me = getUsers().find(u => u.email === s.email) || s;
    return `<div class="panel profile-row">
        <div class="big-avatar">${esc(me.name.charAt(0).toUpperCase())}</div>
        <div class="profile-info"><h2>Welcome, ${esc(me.name)}!</h2>
            <p class="muted">${esc(me.email)} &middot; ${esc(me.role)}</p>
            <p class="muted">Registered on: ${esc(me.date || "-")}</p></div>
        <span class="tag green">${esc(me.status || "Active")}</span></div>`;
}

function specsCard() {
    return `<div class="panel"><h2>Your Role Specifications</h2><ul class="plist">` +
        ROLE_SPECS[currentRole].map(t => `<li><span>✔ ${t}</span></li>`).join("") + `</ul></div>`;
}

function statCards(list) {
    return `<div class="stats-grid">` + list.map(s =>
        `<div class="stat-card"><h3>${s[0]}</h3><h1>${s[1]}</h1></div>`).join("") + `</div>`;
}

function listCard(title, rows) {
    return `<div class="panel"><h2>${title}</h2><ul class="plist">` + rows.map(r => {
        let p = r.split("|");
        return `<li><span>${p[0]}</span><span class="tag ${p[2]}">${p[1]}</span></li>`;
    }).join("") + `</ul></div>`;
}

function usersTable(mode) {
    let users = getUsers().filter(u => u.role !== "Admin");
    if (!users.length) return `<div class="panel"><p class="empty">No registered users yet.</p></div>`;

    let heads = {
        basic: ["S.No", "Name", "Email", "Role", "Status"],
        info: ["Name", "Email", "Role", "Status", "Registered On"],
        manage: ["Name", "Email", "Role", "Status", "Action"]
    }[mode];

    let rows = users.map((u, i) => {
        let st = u.status || "Active";
        let tag = `<span class="tag ${st === "Active" ? "green" : "red"}">${st}</span>`;
        let cells = {
            basic: [i + 1, esc(u.name), esc(u.email), esc(u.role), tag],
            info: [esc(u.name), esc(u.email), esc(u.role), tag, esc(u.date || "-")],
            manage: [esc(u.name), esc(u.email), esc(u.role), tag,
                `<button class="act-btn ${st === "Active" ? "danger" : ""}" onclick="toggleStatus('${esc(u.email)}')">${st === "Active" ? "Suspend" : "Activate"}</button>`]
        }[mode];
        return "<tr>" + cells.map(c => `<td>${c}</td>`).join("") + "</tr>";
    }).join("");

    return `<div class="panel"><div class="table-wrapper"><table><thead><tr>` +
        heads.map(h => `<th>${h}</th>`).join("") + `</tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function toggleStatus(email) {
    let users = getUsers();
    let u = users.find(x => x.email === email);
    if (u) {
        u.status = (u.status || "Active") === "Active" ? "Suspended" : "Active";
        saveUsers(users);
    }
    showSection(MENUS.Admin.length - 1);
}

function showSection(i) {
    let name = MENUS[currentRole][i];
    let user = getCurrentUser();
    let html = "";

    document.querySelectorAll("#sidebar button:not(.side-logout)").forEach((b, n) => b.className = n === i ? "active" : "");

    if (currentRole === "Admin") {
        let users = getUsers().filter(u => u.role !== "Admin");
        let count = r => users.filter(u => u.role === r).length;
        let active = users.filter(u => (u.status || "Active") === "Active").length;

        if (i === 0) {
            html = profileCard() + statCards([["Total Users", users.length], ["Active", active], ["Suspended", users.length - active]]) +
                statCards(Object.keys(ROLE_INFO).map(r => [r + "s", count(r)])) + specsCard();
        } else if (i === 1) html = usersTable("basic");
        else if (i === 2) html = listCard("Roles & Permissions",
            Object.keys(ROLE_INFO).map(r => `${r} (${count(r)} users)|${ROLE_INFO[r]}|`));
        else if (i === 3) html = listCard("System Information", [
            "System status|Online|green", "Database|Browser storage (demo)|yellow",
            "Total accounts|" + (users.length + 1) + "|", "Version|1.0|"]);
        else if (i === 4) html = usersTable("info");
        else html = usersTable("manage");
    } else if (i === 0) {
        html = profileCard() + statCards(DATA[currentRole].stats) + specsCard();
    } else {
        html = listCard(name, DATA[currentRole].items[name]);
    }

    document.getElementById("content").innerHTML = `<h1 class="sec-title">${name}</h1>` + html;
}

// ==================================
// LOGOUT
// ==================================

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
}

// ==================================
// PAGE INITIALIZATION
// ==================================

document.addEventListener("DOMContentLoaded", function () {
    let page = window.location.pathname.split("/").pop();
    let user = getCurrentUser();

    if (page === "index.html" || page === "") {
        if (user && ROLE_PAGES[user.role]) window.location.href = ROLE_PAGES[user.role];
    } else {
        for (let r in ROLE_PAGES) if (ROLE_PAGES[r] === page) loadDashboard(r);
    }
});
