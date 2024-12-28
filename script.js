const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

let contributors = []; // To hold the list of contributors

// Fetch existing data from Azure Blob Storage
async function fetchContributors() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
        if (!response.ok) {
            throw new Error("Error fetching data from Azure Blob Storage");
        }
        const data = await response.json();
        contributors = data || [];
        renderContributors();
    } catch (error) {
        console.error("Failed to fetch contributors:", error);
    }
}

// Save data to Azure Blob Storage
async function saveContributors() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(contributors),
        });
        if (!response.ok) {
            throw new Error("Error saving data to Azure Blob Storage");
        }
    } catch (error) {
        console.error("Failed to save contributors:", error);
    }
}

// Render contributors on the page
function renderContributors() {
    const container = document.querySelector(".container");
    container.innerHTML = ""; // Clear the container
    contributors.forEach((contributor, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <h2>${contributor.name}</h2>
            <p>Amount: ₹${contributor.amount}</p>
            <button class="btn" onclick="removeContributor(${index})">Remove</button>
        `;
        container.appendChild(card);
    });
}

// Add a new contributor
function addContributor(name, amount) {
    contributors.push({ name, amount });
    saveContributors();
    renderContributors();
}

// Remove a contributor
function removeContributor(index) {
    contributors.splice(index, 1);
    saveContributors();
    renderContributors();
}

// Handle form submission
document.querySelector(".btn-add").addEventListener("click", () => {
    const name = prompt("Enter contributor's name:");
    const amount = parseFloat(prompt("Enter amount contributed:"));
    if (name && !isNaN(amount)) {
        addContributor(name, amount);
    } else {
        alert("Please enter valid details.");
    }
});

// Initialize the app
fetchContributors();
