// Constants for Azure Blob Storage
const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

// Debugging Tip: Verify DOM Elements Exist
console.log("Running script.js...");

// DOM Elements
const addContributorButton = document.querySelector(".btn[href='#']");
const viewSummaryButton = document.querySelector(".btn[href='#']:nth-of-type(2)");

// Verify if buttons are found
if (!addContributorButton || !viewSummaryButton) {
    console.error("Add Contributor or View Summary button not found. Check your HTML structure and update query selectors.");
}

// Functions to handle storage
async function fetchData() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch data from Azure Blob Storage.", error);
        return [];
    }
}

async function saveData(data) {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Failed to save data to Azure Blob Storage.", error);
    }
}

// Sample event handlers
if (addContributorButton) {
    addContributorButton.addEventListener("click", async () => {
        const name = prompt("Enter contributor's name:");
        const amount = parseFloat(prompt("Enter contribution amount:"));

        if (name && !isNaN(amount)) {
            let data = await fetchData();
            data.push({ name, amount });
            await saveData(data);
            alert("Contributor added successfully!");
        } else {
            alert("Invalid input. Please try again.");
        }
    });
}

if (viewSummaryButton) {
    viewSummaryButton.addEventListener("click", async () => {
        const data = await fetchData();
        if (data.length === 0) {
            alert("No contributions found.");
            return;
        }

        const summary = data.map(contributor => `${contributor.name}: ₹${contributor.amount}`).join("\n");
        const total = data.reduce((sum, contributor) => sum + contributor.amount, 0);
        alert(`Contributions:\n\n${summary}\n\nTotal: ₹${total}`);
    });
}

// Load data on startup (Optional, for debugging or initialization)
window.onload = async () => {
    console.log("Fetching initial data...");
    const data = await fetchData();
    console.log("Initial data:", data);
};
