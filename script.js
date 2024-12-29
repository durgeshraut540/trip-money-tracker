const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

const contributorsTable = document.querySelector("#contributors-table");
const expensesTable = document.querySelector("#expenses-table");
const addExpenseButton = document.querySelector(".btn-add-expense");

async function fetchData() {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        return {
            contributors: data.contributors || [],
            expenses: data.expenses || [],
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { contributors: [], expenses: [] };
    }
}

async function saveData(data) {
    try {
        const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`, {
            method: "PUT",
            headers: { "x-ms-blob-type": "BlockBlob", "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to save data");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

async function renderContributors() {
    const { contributors } = await fetchData();
    contributorsTable.innerHTML = contributors
        .map(
            (c, i) => `
        <tr>
            <td>${c.name}</td>
            <td>₹${c.amount}</td>
            <td><button class="btn-delete" onclick="deleteContributor(${i})">Delete</button></td>
        </tr>`
        )
        .join("");
}

async function renderExpenses() {
    const { expenses } = await fetchData();
    expensesTable.innerHTML = expenses
        .map(
            (e, i) => `
        <tr>
            <td>${e.name}</td>
            <td>₹${e.amount}</td>
            <td>${e.paidBy}</td>
            <td>${e.comments}</td>
            <td><button class="btn-delete" onclick="deleteExpense(${i})">Delete</button></td>
        </tr>`
        )
        .join("");
}

async function deleteContributor(index) {
    const data = await fetchData();
    data.contributors.splice(index, 1);
    await saveData(data);
    await renderContributors();
}

async function deleteExpense(index) {
    const data = await fetchData();
    data.expenses.splice(index, 1);
    await saveData(data);
    await renderExpenses();
}

addExpenseButton.addEventListener("click", async () => {
    const name = document.querySelector("#expense-name").value;
    const amount = parseFloat(document.querySelector("#expense-amount").value);
    const paidBy = document.querySelector("#paid-by").value;
    const comments = document.querySelector("#comments").value;

    if (!name || isNaN(amount) || !paidBy) {
        alert("Please fill out all fields.");
        return;
    }

    const data = await fetchData();
    data.expenses.push({ name, amount, paidBy, comments });
    await saveData(data);
    await renderExpenses();

    document.querySelector("#expense-name").value = "";
    document.querySelector("#expense-amount").value = "";
    document.querySelector("#paid-by").value = "";
    document.querySelector("#comments").value = "";
});

window.onload = async () => {
    await renderContributors();
    await renderExpenses();
};
