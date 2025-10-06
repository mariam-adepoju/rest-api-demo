const loginForm = document.getElementById("loginForm");
const responseMsg = document.getElementById("responseMsg");
const dashboard = document.getElementById("dashboard");
const authSection = document.getElementById("authSection");
const fetchUsersBtn = document.getElementById("fetchUsersBtn");
const usersList = document.getElementById("usersList");
const createUserForm = document.getElementById("createUserForm");

// Test credentials for Reqres.in
// Email: eve.holt@reqres.in
// Password: cityslicka

// Common headers for all requests
const headers = {
    "Content-Type": "application/json",
    "x-api-key": "reqres-free-v1",
};
if (localStorage.getItem("loggedIn") === "true") {
    authSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
}
// LOGIN (POST)
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
        const res = await fetch("https://reqres.in/api/login", {
            method: "POST",
            headers,
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            responseMsg.textContent = "Login successful!";
            responseMsg.classList.add("text-green-600");
            // Show dashboard and hide login
            localStorage.setItem("loggedIn", "true");
            authSection.classList.add("hidden");
            dashboard.classList.remove("hidden");
        } else {
            responseMsg.textContent = `Login failed: ${data.error}`;
            responseMsg.classList.add("text-red-600");
        }
    } catch (error) {
        responseMsg.textContent = "Network error!";
    }
});
// GET USERS
fetchUsersBtn.addEventListener("click", async () => {
    try {
        const res = await fetch("https://reqres.in/api/users?page=1", {
            method: "GET",
            headers,
        });
        const data = await res.json();
        usersList.innerHTML = "";
        const users = data.data || data;
        users.forEach((user) => {
            renderUserCard(
                user.id,
                user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.name || "No name",
                user.email || user.job || "No email"
            );
        });
        attachButtonEvents();
    } catch (error) {
        usersList.innerHTML = "<p class='text-red-500'>Failed to load users.</p>";
    }
});
// CREATE USER (POST)
createUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("newUserName").value;
    const job = document.getElementById("newUserJob").value;
    try {
        const res = await fetch("https://reqres.in/api/users", {
            method: "POST",
            headers,
            body: JSON.stringify({ name, job }),
        });
        const data = await res.json();
        if (res.ok) {
            alert(`User Created: ${data.name} (${data.job})`);
            renderUserCard(data.id || Date.now(), data.name, `${data.job}@reqres.fake`);
            createUserForm.reset();
        } else {
            alert("Failed to create user");
        }
    } catch (error) {
        alert("Network error!");
    }
});
// RENDER USER CARD
function renderUserCard(id, name, email) {
    const userCard = document.createElement("div");
    userCard.className = "border p-4 rounded-lg flex items-center justify-between";

    userCard.innerHTML = `
    <div>
      <p class="font-semibold">${name}</p>
      <p class="text-sm text-gray-600">${email}</p>
    </div>
    <div class="space-x-2">
      <button class="bg-yellow-500 text-white px-3 py-1 rounded editBtn" data-id="${id}">
        Edit
      </button>
      <button class="bg-red-600 text-white px-3 py-1 rounded deleteBtn" data-id="${id}">
        Delete
      </button>
    </div>
  `;
    usersList.prepend(userCard);
    attachButtonEvents();
}
// ATTACH EDIT/DELETE BUTTON EVENTS
function attachButtonEvents() {
    document.querySelectorAll(".editBtn").forEach((btn) => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            if (!id) {
                alert("No user ID found for this button.");
                return;
            }
            const newName = prompt("Enter new first name:");
            if (!newName) return;
            try {
                const res = await fetch(`https://reqres.in/api/users/${id}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ first_name: newName }),
                });
                const data = await res.json();
                if (res.ok) {
                    // Update UI instantly
                    const nameField = btn.closest("div.border").querySelector(".font-semibold");
                    if (nameField) nameField.textContent = newName;
                    alert(`Updated User ${id}: ${newName}`);
                } else {
                    alert("Update failed.");
                }
            } catch (error) {
                alert("Network error.");
            }
        };
    });

    document.querySelectorAll(".deleteBtn").forEach((btn) => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            const confirmDel = confirm("Are you sure you want to delete this user?");
            if (!confirmDel) return;
            await fetch(`https://reqres.in/api/users/${id}`, {
                method: "DELETE",
                headers,
            });
            alert(`Deleted user ${id}`);
            btn.closest("div.border").remove();
        };
    });
}
