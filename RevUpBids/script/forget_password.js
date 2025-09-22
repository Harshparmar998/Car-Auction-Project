document.getElementById('forgotPasswordForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;

    fetch('http://localhost:4000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message); // Display success message
        } else {
            alert(data.message || 'Failed to send reset link. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});
