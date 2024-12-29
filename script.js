// Constants for Azure Blob Storage
const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

// DOM Elements
const addContributorButton = document.querySelector(".btn.btn-add");
const viewSummaryButton = document.querySelector(".btn.btn-summary");
const totalAmountElement = document.querySelector("#total-amount");

// Fetch data from Azure Blob Storage
async function fetchData() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch data from Azure Blob Storage.", error);
        return [];
    }
}

// Save data to Azure Blob Storage
async function saveData(data) {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`, {
            method: "PUT",
            headers: { "x-ms-blob-type": "BlockBlob", "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Failed to save data to Azure Blob Storage.", error);
    }
}

// Update Total Amount Collected
async function updateTotalAmount() {
    try {
        const data = await fetchData();
        const totalAmount = data.reduce((sum, contributor) => sum + contributor.amount, 0);
        if (totalAmountElement) {
            totalAmountElement.textContent = `Total Amount Collected: ₹${totalAmount}`;
        }
    } catch (error) {
        console.error("Error updating total amount:", error);
    }
}

// Add Contributor
if (addContributorButton) {
    addContributorButton.addEventListener("click", async () => {
        const name = prompt("Enter contributor's name:");
        const amount = parseFloat(prompt("Enter contribution amount:"));

        if (name && !isNaN(amount)) {
            let data = await fetchData();
            const existingContributor = data.find((contributor) => contributor.name === name);
            if (existingContributor) {
                existingContributor.amount += amount;
            } else {
                data.push({ name, amount });
            }
            await saveData(data);
            await updateTotalAmount();
            alert("Contributor added successfully!");
        } else {
            alert("Invalid input. Please try again.");
        }
    });
}

// View Summary
if (viewSummaryButton) {
    viewSummaryButton.addEventListener("click", async () => {
        const data = await fetchData();
        const summary = data.map((contributor, index) => {
            return `
                <div>
                    <p>${contributor.name}: ₹${contributor.amount}</p>
                    <button onclick="deleteContributor(${index})">Delete</button>
                </div>`;
        }).join("\n");

        const summaryPage = `
            <html>
                <body>
                    <h1>Contributions Summary</h1>
                    ${summary}
                    <button onclick="window.location.href='/'">Go Back</button>
                </body>
            </html>`;
        const newWindow = window.open("", "_blank");
        newWindow.document.write(summaryPage);
        newWindow.document.close();
    });
}

// Delete Contributor (To be used in Summary Page)
window.deleteContributor = async function (index) {
    let data = await fetchData();
    data.splice(index, 1);
    await saveData(data);
    alert("Contributor deleted successfully!");
    window.location.reload();
};

// Initialize
window.onload = async () => {
    await updateTotalAmount();
};
