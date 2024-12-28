// Azure Blob Storage Integration for Storing Contributions
// This script integrates with Azure Blob Storage to store and retrieve data centrally.

// Replace with your Azure Storage details
const AZURE_STORAGE_ACCOUNT = "durgeshpoc";
const AZURE_CONTAINER_NAME = "trip-tracker";
const SAS_TOKEN = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-02-08T09:21:45Z&st=2024-12-28T01:21:45Z&spr=https,http&sig=0TxCN0%2BEDnGam8xPSW13mnfK1H8XczqkMwojKQ0JCvM%3D"; // Generated from Azure Portal
const BLOB_NAME = "contributions.json";

// URL for accessing the blob
const BLOB_URL = `https://durgeshpoc.blob.core.windows.net/trip-tracker`;

// Array to store friends' contributions
let friendsList = [];
let totalCollected = 0;

// Load data from Azure Blob Storage when the page loads
window.onload = async function () {
    try {
        const response = await fetch(BLOB_URL + "?" + SAS_TOKEN);
        if (response.ok) {
            const data = await response.json();
            friendsList = data.friendsList || [];
            totalCollected = data.totalCollected || 0;
            updateDashboard();
        } else {
            console.error("Failed to fetch data from Azure Blob Storage.", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching data from Azure Blob Storage:", error);
    }
};

// Add Friend functionality
document.getElementById('addFriendBtn').addEventListener('click', async function () {
    const name = prompt("Enter your friend's name:");
    const amount = parseFloat(prompt("Enter the amount they contributed (₹):"));

    if (name && !isNaN(amount) && amount > 0) {
        // Add the friend's name and amount to the list
        friendsList.push({ name: name, amount: amount });
        totalCollected += amount;

        // Save data to Azure Blob Storage
        await saveData();

        // Update the Total Collected display
        updateDashboard();

        alert(`${name} has been added with a contribution of ₹${amount}.`);
    } else {
        alert("Invalid input. Please try again.");
    }
});

// View Summary functionality
document.getElementById('viewSummaryBtn').addEventListener('click', function () {
    if (friendsList.length === 0) {
        alert("No contributions have been added yet.");
    } else {
        let summary = "Summary of Contributions:\n";
        friendsList.forEach((friend, index) => {
            summary += `${index + 1}. ${friend.name}: ₹${friend.amount}\n`;
        });
        summary += `\nTotal Collected: ₹${totalCollected}`;
        alert(summary);
    }
});

// Function to update the dashboard display
function updateDashboard() {
    document.querySelector('.dashboard h2:nth-child(1)').textContent = `Total Collected: ₹${totalCollected}`;
}

// Function to save data to Azure Blob Storage
async function saveData() {
    const blobData = {
        friendsList: friendsList,
        totalCollected: totalCollected
    };

    try {
        const response = await fetch(BLOB_URL + "?" + SAS_TOKEN, {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(blobData)
        });

        if (response.ok) {
            console.log("Data successfully saved to Azure Blob Storage.");
        } else {
            console.error("Failed to save data to Azure Blob Storage.", response.statusText);
        }
    } catch (error) {
        console.error("Error saving data to Azure Blob Storage:", error);
    }
}
