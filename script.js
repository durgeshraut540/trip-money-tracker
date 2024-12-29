// Constants for Azure Blob Storage
const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

// Functions to handle storage
async function fetchData() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Failed to save data to Azure Blob Storage.", error);
    }
}

// Add Contributor
document.querySelector(".btn-add")?.addEventListener("click", async () => {
    const name = prompt("Enter contributor's name:");
    const amount = parseFloat(prompt("Enter contribution amount:"));

    if (name && !isNaN(amount)) {
        let data = await fetchData();
        const existingContributor = data.find(contributor => contributor.name === name);

        if (existingContributor) {
            existingContributor.amount += amount;
            alert(`${name}'s contribution updated!`);
        } else {
            data.push({ name, amount });
            alert(`New contributor ${name} added!`);
        }
        await saveData(data);
    } else {
        alert("Invalid input. Please try again.");
    }
});

// Load Summary Page Data
if (window.location.pathname.includes("summary.html")) {
    window.onload = async () => {
        const data = await fetchData();
        const tableBody = document.getElementById("contributors-table");

        tableBody.innerHTML = data.map((contributor, index) => `
            <tr>
                <td>${contributor.name}</td>
                <td>₹${contributor.amount}</td>
                <td>
                    <button class="btn-delete" data-index="${index}">Delete</button>
                </td>
            </tr>
        `).join("");

        // Attach delete event listeners
        document.querySelectorAll(".btn-delete").forEach(button => {
            button.addEventListener("click", async (e) => {
                const index = e.target.getAttribute("data-index");
                data.splice(index, 1);
                await saveData(data);
                window.location.reload(); // Reload page to refresh table
            });
        });
    };
}
