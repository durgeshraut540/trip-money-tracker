// script.js

document.getElementById('addFriendBtn').addEventListener('click', function() {
    const name = prompt('Enter your friend\'s name:');
    const amount = prompt('Enter the amount they contributed:');
    alert(name + ' has contributed ₹' + amount);
});

document.getElementById('viewSummaryBtn').addEventListener('click', function() {
    alert('View Summary functionality will be implemented later.');
});
