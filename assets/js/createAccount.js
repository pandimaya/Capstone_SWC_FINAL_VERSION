async function createAccount() {
  // Get input values
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const idNumber = document.getElementById('IDnumber').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  const accountType = document.getElementById('accountType').value;

  // Check for empty required fields
  if (!firstName || !lastName || !email || !idNumber || !phoneNumber || !accountType) {
    alert('Please fill in all required fields.');
    return;
  }

  // Validate First Name and Last Name (Letters Only)
  if (!/^[A-Za-z]+$/.test(firstName) || !/^[A-Za-z]+$/.test(lastName)) {
    alert('First name and last name must contain only letters.');
    return;
  }

  // Validate Email (@dlsud.edu.ph only)
  if (!email.endsWith('@dlsud.edu.ph')) {
    alert('Email must end with @dlsud.edu.ph.');
    return;
  }

  // Validate ID Number (9 Numbers Only)
  if (!/^\d{9}$/.test(idNumber)) {
    alert('ID Number must contain 9 numbers.');
    return;
  }

  // Validate Phone Number (Philippine Format)
  if (!/^(\+63|0)[0-9]{10}$/.test(phoneNumber)) {
    alert('Phone number must be in Philippine format.');
    return;
  }

  // Create account request data
  const formData = new FormData(document.getElementById('insertForm'));
  const data = Object.fromEntries(formData.entries());
  data.accountType = accountType;

  try {
    const response = await fetch('/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    alert(result.message);
    document.getElementById('insertForm').reset();
  } catch (error) {
    console.error('Error inserting record:', error);
    alert('An error occurred while inserting the record.');
  }
}
