document.getElementById('registrationForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission
    
    const form = event.target;
    const formData = {
        username: form.elements.username.value,
        email: form.elements.email.value,
        password: form.elements.password.value,
        userType: form.elements.userType.value
    };

    try {
        const response = await fetch('http://localhost:8000/submit_form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log('Form submitted successfully');
            alert('Form submitted successfully');
            form.reset(); // Reset the form after successful submission
        } else {
            console.error('Error submitting form');
            alert('Error submitting form');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting form');
    }
});
