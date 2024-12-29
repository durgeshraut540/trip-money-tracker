// Constants for Azure Blob Storage
const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

// DOM Elements
const addContributorButton = document.getElementById("add-contributor");
const viewSummaryButton = document.getElementById("view-summary");
const totalAmountElement = document.getElementById("total-amount");

// Fetch Data from Azure Blob
async function fetchData() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : { contributors: [], expenses: [] }; // Ensure default structure
    } catch (error) {
        console.error("Error fetching data:", error);
        return { contributors: [], expenses: [] }; // Fallback to empty structure
    }
}

// Save Data to Azure Blob
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

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

// Update Total Amount
async function updateTotalAmount() {
    try {
        const data = await fetchData();
        const total = data.contributors.reduce((sum, contributor) => sum + (contributor.amount || 0), 0);
        totalAmountElement.textContent = `Total Amount Collected: ₹${total}`;
    } catch (error) {
        console.error("Error updating total amount:", error);
        totalAmountElement.textContent = "Error calculating total amount.";
    }
}

// Add Contributor
addContributorButton?.addEventListener("click", async () => {
    const name = prompt("Enter contributor's name:");
    const amount = parseFloat(prompt("Enter contribution amount:"));

    if (!name || isNaN(amount)) {
        alert("Invalid input. Please try again.");
        return;
    }

    const data = await fetchData();
    const existingContributor = data.contributors.find((c) => c.name === name);

    if (existingContributor) {
        existingContributor.amount += amount;
    } else {
        data.contributors.push({ name, amount });
    }

    await saveData(data);
    await updateTotalAmount();
    alert("Contributor added successfully!");
});

// View Summary
viewSummaryButton?.addEventListener("click", () => {
    window.location.href = "summary.html";
});

// Initialize
window.onload = updateTotalAmount;
