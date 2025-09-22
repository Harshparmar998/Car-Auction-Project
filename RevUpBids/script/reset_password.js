document.getElementById('resetPasswordForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const role = urlParams.get('role');
    const newPassword = document.getElementById('newPassword').value;

    fetch('http://localhost:4000/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.href = '/buyer-panel/html/login.html';
        } else {
            alert(data.message || 'Failed to reset password. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});
