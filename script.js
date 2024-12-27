// script.js

// Array to store friends' contributions
let friendsList = [];
let totalCollected = 0;

// Load data from localStorage when the page loads
window.onload = function () {
    const storedFriends = localStorage.getItem('friendsList');
    const storedTotal = localStorage.getItem('totalCollected');

    if (storedFriends) {
        friendsList = JSON.parse(storedFriends);
    }
    if (storedTotal) {
        totalCollected = parseFloat(storedTotal);
    }

    updateDashboard();
};

// Add Friend functionality
document.getElementById('addFriendBtn').addEventListener('click', function () {
    const name = prompt("Enter your friend's name:");
    const amount = parseFloat(prompt("Enter the amount they contributed (₹):"));

    if (name && !isNaN(amount) && amount > 0) {
        // Add the friend's name and amount to the list
        friendsList.push({ name: name, amount: amount });
        totalCollected += amount;

        // Save to localStorage
        saveData();

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

// Function to save data to localStorage
function saveData() {
    localStorage.setItem('friendsList', JSON.stringify(friendsList));
    localStorage.setItem('totalCollected', totalCollected.toString());
}
