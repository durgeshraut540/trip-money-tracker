document.addEventListener("DOMContentLoaded", () => {
    const BLOB_URL = "https://durgeshpocstorage.blob.core.windows.net/tracker/data.json";
    const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";

    const contributorsTable = document.querySelector("#contributors-table tbody");
    const expensesTable = document.querySelector("#expenses-table tbody");

    if (!contributorsTable || !expensesTable) {
        console.error("Required table elements not found in the DOM.");
        return;
    }

    async function fetchData() {
        try {
            const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
            if (!response.ok) throw new Error("Failed to fetch data.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching data:", error);
            return { contributors: [], expenses: [] };
        }
    }

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

    async function initSummaryPage() {
        await renderContributors();
        await renderExpenses();
    }

    initSummaryPage();
});