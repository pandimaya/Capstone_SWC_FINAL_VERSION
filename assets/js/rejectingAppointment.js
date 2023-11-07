document.addEventListener('DOMContentLoaded', function () {
    // Function to handle rejecting an appointment
    function rejectAppointment(appointmentId) {
      fetch(`/rejectAppointment/${appointmentId}`, {
        method: 'POST',
      })
      .then(response => {
        if (response.ok) {
          alert('Appointment rejected successfully!');
  
          // After a short delay, refresh the page
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.error('Failed to reject the appointment');
        }
      })
      .catch(error => {
        console.error('Error rejecting the appointment:', error);
        // Handle the error or show a message to the user
      });
    }
  
    // Event delegation to handle 'Reject' button clicks
    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('reject-appointment')) {
        const appointmentId = event.target.dataset.appointmentId;
        rejectAppointment(appointmentId);
      }
    });
  });
  