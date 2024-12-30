// Constants for Azure Blob Storage
const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

// DOM Elements
const contributorsTable = document.querySelector("#contributors-table tbody");
const expensesTable = document.querySelector("#expenses-table tbody");
const addContributorBtn = document.querySelector("#add-contributor-btn");
const addExpenseBtn = document.querySelector("#add-expense-btn");

// Fetch data from Azure Blob Storage
async function fetchData() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
        if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return { contributors: [], expenses: [] };
    }
}

// Save data to Azure Blob Storage
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
        if (!response.ok) throw new Error(`Failed to save data: ${response.status}`);
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

// Render Contributors
async function renderContributors() {
    try {
        const data = await fetchData();
        const contributors = data.contributors || [];
        contributorsTable.innerHTML = ""; // Clear previous rows

        contributors.forEach((contributor) => {
            const row = `
                <tr>
                    <td>${contributor.name}</td>
                    <td>₹${contributor.amount}</td>
                </tr>
            `;
            contributorsTable.insertAdjacentHTML("beforeend", row);
        });
    } catch (error) {
        console.error("Error rendering contributors:", error);
    }
}

// Render Expenses
async function renderExpenses() {
    try {
        const data = await fetchData();
        const expenses = data.expenses || [];
        expensesTable.innerHTML = ""; // Clear previous rows

        expenses.forEach((expense) => {
            const row = `
                <tr>
                    <td>${expense.name}</td>
                    <td>₹${expense.amount}</td>
                    <td>${expense.paidBy}</td>
                    <td>${expense.comments || "N/A"}</td>
                </tr>
            `;
            expensesTable.insertAdjacentHTML("beforeend", row);
        });
    } catch (error) {
        console.error("Error rendering expenses:", error);
    }
}

// Add Contributor
addContributorBtn.addEventListener("click", async () => {
    const contributorName = document.querySelector("#contributor-name").value.trim();
    const contributorAmount = parseFloat(document.querySelector("#contributor-amount").value);

    if (!contributorName || isNaN(contributorAmount)) {
        alert("Please fill out all required fields!");
        return;
    }

    try {
        const data = await fetchData();
        const contributors = data.contributors || [];

        contributors.push({
            name: contributorName,
            amount: contributorAmount,
        });

        await saveData({ ...data, contributors }); // Update Azure Blob Storage
        alert("Contributor added successfully!");
        renderContributors(); // Refresh the contributors table
    } catch (error) {
        console.error("Error adding contributor:", error);
    }
});

// Add Expense
addExpenseBtn.addEventListener("click", async () => {
    const expenseName = document.querySelector("#expense-name").value.trim();
    const expenseAmount = parseFloat(document.querySelector("#expense-amount").value);
    const expensePaidBy = document.querySelector("#expense-paidby").value.trim();
    const expenseComments = document.querySelector("#expense-comments").value.trim();

    if (!expenseName || isNaN(expenseAmount) || !expensePaidBy) {
        alert("Please fill out all required fields!");
        return;
    }

    try {
        const data = await fetchData();
        const expenses = data.expenses || [];

        expenses.push({
            name: expenseName,
            amount: expenseAmount,
            paidBy: expensePaidBy,
            comments: expenseComments,
        });

        await saveData({ ...data, expenses }); // Update Azure Blob Storage
        alert("Expense added successfully!");
        renderExpenses(); // Refresh the expense table
    } catch (error) {
        console.error("Error adding expense:", error);
    }
});

// Initialize Summary Page
(async function initSummaryPage() {
    await renderContributors();
    await renderExpenses();
})();