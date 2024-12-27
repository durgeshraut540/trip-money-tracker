
let contributors = [];

function navigate(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

document.getElementById('addFriendForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const amount = parseFloat(document.getElementById('amount').value);

    contributors.push({ name, amount });
    updateSummary();
    alert(`${name} added with ₹${amount}!`);
    this.reset();
    navigate('viewSummary');
});

function updateSummary() {
    const summaryDetails = document.getElementById('summaryDetails');
    summaryDetails.innerHTML = '';
    let totalCollected = 0;
    
    contributors.forEach(contributor => {
        totalCollected += contributor.amount;
        const div = document.createElement('div');
        div.textContent = `${contributor.name}: ₹${contributor.amount}`;
        summaryDetails.appendChild(div);
    });
    
    document.querySelector('.summary h2:nth-child(1)').textContent = `Total Collected: ₹${totalCollected}`;
}
