const AZURE_STORAGE_ACCOUNT = "durgeshpocstorage";
const AZURE_CONTAINER_NAME = "tracker";
const SAS_TOKEN = "sp=racwdl&st=2024-12-28T06:15:39Z&se=2025-03-05T14:15:39Z&sv=2022-11-02&sr=c&sig=3KVwE9SnveqCG37i6kKHN809s2YqbLlSg5UNEhie%2F9c%3D";
const BLOB_URL = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/data.json`;

document.addEventListener("DOMContentLoaded", () => {
    const contributorForm = document.querySelector("#contributor-form");
    const contributorsList = document.querySelector("#contributors-list");

    if (!contributorForm || !contributorsList) {
        console.error("Required elements not found in the DOM.");
        return;
    }

    async function fetchData() {
        try {
            const response = await fetch(`${BLOB_URL}?${SAS_TOKEN}`);
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            return { contributors: data.contributors || [], expenses: data.expenses || [] };
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
        contributorsList.innerHTML = contributors
            .map((c, i) => `<li>${c.name} - ₹${c.amount} <button onclick="deleteContributor(${i})">Delete</button></li>`)
            .join("");
    }

    async function addContributor(name, amount) {
        const data = await fetchData();
        data.contributors.push({ name, amount });
        await saveData(data);
        await renderContributors();
    }

    async function deleteContributor(index) {
        const data = await fetchData();
        data.contributors.splice(index, 1);
        await saveData(data);
        await renderContributors();
    }

    contributorForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.querySelector("#name").value.trim();
        const amount = parseFloat(document.querySelector("#amount").value);
        if (!name || isNaN(amount)) {
            alert("Please enter valid details.");
            return;
        }

        await addContributor(name, amount);
        contributorForm.reset();
    });

    // Initial render
    renderContributors();
});
