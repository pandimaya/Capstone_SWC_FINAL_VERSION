const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const myapp = express();
const port = 3030;
const bcrypt = require('bcrypt');
const session = require('express-session');

myapp.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Configure express-session middleware
myapp.use(session({
  secret: 'your_secret_key', // Change this to a secret key for session encryption
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true if you use HTTPS
}));


// Middleware to prevent caching
myapp.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Supabase configuration
const { createClient, SupabaseClient } = require('@supabase/supabase-js');
const supabase = createClient('https://waeqvekicdlqijxmhclw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZXF2ZWtpY2RscWlqeG1oY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUyNjMxNjIsImV4cCI6MjAxMDgzOTE2Mn0.8Ga9_qwNgeAKlqWI_xCLQPJFqGha3XfiNMxrT8_RXaM');


// Middleware to parse JSON requests
myapp.use(express.json());
myapp.use(express.urlencoded({ extended: true }));
myapp.use(cors());

myapp.use(express.static('assets'));
myapp.set('view engine', 'ejs');
myapp.set('views', __dirname + '/view');

//LINKS
myapp.get('/', (req, res) => {
  res.render('LoginPage');
});

myapp.get('/Registerpage', (req, res) => {
  res.render('RegisterPage');
});

myapp.get('/StudentHomepage', (req, res) => {
  const studentData = req.session.studentData;
  res.render('StudentHomepage', { studentData });
});

myapp.get('/StudentProfilePage', (req, res) => {
  const studentData = req.session.studentData;
  res.render('StudentProfilePage', { studentData });
});

myapp.get('/StudentHomepage', (req, res) => {
  const studentData = req.session.studentData;
  res.render('StudentHomepage', { studentData });
});

myapp.get('/studentAppointmentStatus', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const studentData = req.session.studentData;
    const studentEmail = studentData.email; // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: pendingAppointment, error } = await supabase
      .from('Pending Appointment') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: acceptedAppointment, error1 } = await supabase
      .from('Accepted Appointment') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error1.message);
      return res.status(500).send('Internal server error');
    }

    res.render('studentAppointmentStatus', { studentData, pendingAppointment, acceptedAppointment });
  } catch (error1) {
    // Handle any unexpected server errors
    console.error('Server error:', error1.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/studentAppointmentHistory', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const studentData = req.session.studentData;
    const studentEmail = studentData.email;  // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .in('prog_status', ['COMPLETED', 'REJECTED', 'CANCELLED'])
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    const { data: ignoredAppointmentHistory, error1 } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('email', studentEmail)
      .in('prog_status', ['IGNORED'])
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error1.message);
      return res.status(500).send('Internal server error');
    }


    res.render('studentAppointmentHistory', { studentData, appointmentHistory, ignoredAppointmentHistory });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});
myapp.get('/CounselorList', (req, res) => {
  res.render('CounselorList');
});

myapp.get('/CreateAppointmentPage', (req, res) => {
  const studentData = req.session.studentData;
  res.render('CreateAppointmentPage', { studentData });
});

myapp.get('/CounselorHomePage', (req, res) => {
  const counselorData = req.session.counselorData;
  res.render('CounselorHomePage', { counselorData });
});

myapp.get('/CounselorPendingAppointmentPage', async (req, res) => {
  try {
    const counselorData = req.session.counselorData;
    const counselorEmail = counselorData.email;

    const { data: counselorDepartments, error: counselorError } = await supabase
      .from('Counselor Role')
      .select('department')
      .eq('email', counselorEmail);

    if (counselorError) {
      console.error('Error fetching counselor departments:', counselorError.message);
      return res.status(500).send('Internal server error');
    }

    const departments = counselorDepartments.map(entry => entry.department);

    const { data: pendingAppointments, error } = await supabase
      .from('Pending Appointment')
      .select('*')
      .in('department', departments)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    const currentTime = new Date();
    const updatedPendingAppointments = [];

    for (const appointment of pendingAppointments) {
      const appointedDateTime = new Date(`${appointment.appointed_date} ${appointment.appointed_time}`);
      if (currentTime > appointedDateTime) {
        // Prepare data for 'Appointment History' with REJECTED status
        const rejectedAppointmentData = {
          counselor_email: counselorEmail,
          counselor_Fname: counselorData.first_name,
          counselor_Lname: counselorData.last_name,
          date: appointment.appointed_date,
          time: appointment.appointed_time,
          email: appointment.email,
          department: appointment.department,
          first_name: appointment.first_name,
          last_name: appointment.last_name,
          appointed_date: appointment.appointed_date,
          appointed_time: appointment.appointed_time,
          prog_status: 'IGNORED'
          // Add other fields needed for the Appointment History table
        };

        // Insert rejected appointment in the 'Appointment History' table
        const { data: insertedAppointment, error: insertError } = await supabase
          .from('Appointment History')
          .insert(rejectedAppointmentData);

        if (insertError) {
          console.error('Error inserting rejected appointment:', insertError.message);
          // Handle the error if insertion fails
        }
        const { error: deleteError } = await supabase
          .from('Pending Appointment')
          .delete()
          .eq('id', appointment.id);

        if (deleteError) {
          console.error('Error deleting expired appointment:', deleteError.message);
          // Handle the error if deletion fails
        }
      } else {
        // Appointment is still pending, add it to the updated list
        updatedPendingAppointments.push(appointment);
      }
    }

    res.render('CounselorPendingAppointmentPage', { counselorData, pendingAppointments: updatedPendingAppointments });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorAcceptedAppointmentPage', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const counselorData = req.session.counselorData;
    const counselorEmail = counselorData.email; // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: acceptedAppointments, error } = await supabase
      .from('Accepted Appointment') // Replace with your actual table name
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching pending appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorAcceptedAppointmentPage', { counselorData, acceptedAppointments });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.get('/CounselorAppointmentHistoryPage', async (req, res) => {
  try {
    // Extract counselor's email from the session data
    const counselorData = req.session.counselorData;
    const counselorEmail = counselorData.email; // Assuming the email is stored in counselorData

    // Fetch pending appointments data for all departments associated with the counselor
    const { data: appointmentHistory, error } = await supabase
      .from('Appointment History') // Replace with your actual table name
      .select('*')
      .eq('counselor_email', counselorEmail)
      .order('date', { ascending: true }); // You can add additional query options here

    if (error) {
      // Handle the error if the query for pending appointments fails
      console.error('Error fetching appointments:', error.message);
      return res.status(500).send('Internal server error');
    }

    res.render('CounselorAppointmentHistoryPage', { counselorData, appointmentHistory });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});



myapp.get('/adminEditRoles', async (req, res) => {
  try {
    const { data: editRoles, error } = await supabase
      .from('Counselor Accounts') 
      .select('*')

    if (error) {
      // Handle the error
      console.error('Error fetching Counselor Accounts:', error.message);
      return res.status(500).send('Internal server error');
    }
    res.render('adminEditRoles', {  editRoles });
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});






//=========POSTING===========//



// REGISTRATION
myapp.post('/register', async (req, res) => {
  const { idNumber, email, password, lastName, firstName, gender, birthDate, phoneNumber, accountType, departmentSelect } = req.body;

  try {

    // Encryption Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the user in Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Error registering user:', error.message);
      res.status(500).json({ error: 'Registration failed' });
      return;
    }
    
    // SEPERATE
    if (accountType === 'Student') {   
    // INSERT
    const { data: userData, error: userError } = await supabase
    .from('Student Accounts')
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        gender,
        email,
        password: hashedPassword, 
        id_number: idNumber,
        phone_number: phoneNumber,
        accountType: accountType,
        department:departmentSelect
      },
    ])
    .single();

  if (error) {
    if (error.message.includes('duplicate key value violates unique constraint')) {
      // Handle the case where the email is already registered
      res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
    } else {
      console.error('Error registering user:', error.message);
      res.status(500).json({ error: 'Registration failed' });
    }
    return;
  }
    } else if (accountType === 'Counselor') {
      // INSERT
    const { data: userData, error: userError } = await supabase
    .from('Counselor Accounts')
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        gender,
        email,
        password: hashedPassword, 
        id_number: idNumber,
        phone_number: phoneNumber,
        accountType: accountType,
        
      },
    ])
    .single();

  if (error) {
    if (error.message.includes('duplicate key value violates unique constraint')) {
      // Handle the case where the email is already registered
      res.status(400).json({ error: 'The email is already registered. Please log in or reset your password if you forgot it.' });
    } else {
      console.error('Error registering user:', error.message);
      res.status(500).json({ error: 'Registration failed' });
    }
    return;
  }
    }


    res.status(200).json({ success: 'Registration successful' });

    
  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// LOGIN
myapp.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.error('Error logging in:', loginError.message);
      res.status(500).json({ error: 'Login failed' });
      return;
    }

    if (!data || !data.user) {
      console.error('Authentication failed');
      res.status(401).json({ error: 'Authentication failed' });
      return;
    }
    console.log(data || data.userData);

      // Fetch the student data from the specific table
      const { data: studentData, error: studentError } = await supabase
        .from('Student Accounts')
        .select('*')
        .eq('email', email)
        .single();

        // Check if the user is a student
        if (studentData) {
          console.log(studentData);
        // Store the student data in the session
        req.session.studentData = studentData;
        res.status(200).json({ success: 'Login successful', accountType: 'Student' });
        return;
      
    }
    else {
    // Fetch the counselor data from the specific table
    const { data: counselorData, error: counselorError } = await supabase
      .from('Counselor Accounts')
      .select('*')
      .eq('email', email)
      .single();

      // Check if the user is a counselor
    if (counselorData) {
      console.log(counselorData);
      // Store the counselor data in the session
      req.session.counselorData = counselorData;
      // Redirect to the counselor homepage
      res.status(200).json({ success: 'Login successful', accountType: 'Counselor' });
        return;
    }
     else 
     {console.error('User data not found');
     res.status(404).json({ error: 'User not found' });
    }
     
    }
  } catch (e) {
    console.error('Unexpected error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// APPOINTMENT
myapp.post('/create-appointment', async (req, res) => {
  try {
    // Access session data, such as email and first name
    const userEmail = req.session.studentData.email;
    const userFirstName = req.session.studentData.first_name;
    const userLastName = req.session.studentData.last_name;
    const department = req.session.studentData.department;
    const appointmentDate = req.body.date;
    const appointmentTime = req.body.time;
    const service = req.body.service;

   // Get the current date and time when the "appoint" button is clicked in the Philippines Time Zone (Asia/Manila)
   const appointmentDateTime = new Date();
   const options = {
    timeZone: 'Asia/Manila',
    hour12: false, // Use 24-hour format
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  // Format the time in the desired time zone
  const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);

  // Extract the date component
  const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    const { data, error } = await supabase
      .from('Pending Appointment')
      .upsert([
        {
          email: userEmail,
          last_name: userLastName,
          first_name: userFirstName,
          date: appointmentDateStr,
          time: appointmentTimeStr,
          department: department,
          notes: service,
          appointed_time: appointmentTime ,
          appointed_date: appointmentDate,
          prog_stat: 'PENDING'
        },
      ]);

    if (error) {
      // Handle the error
      console.error('Error creating appointment:', error.message);
      res.json({ success: false });
    } else {
      // Appointment created successfully
      console.log('Appointment created successfully:', data);
      res.json({ success: true });
    }
  } catch (error) {
    // Handle any unexpected server errors
    console.error('Server error:', error.message);
    res.json({ success: false });
  }
});

//EDIT ROLES
myapp.post('/updateDepartments', async (req, res) => {
  const { email, departments } = req.body;

  try {
      // Fetch existing user departments from the database
      const { data: existingDepartments, error: existingError } = await supabase
          .from('Counselor Role')
          .select('department')
          .eq('email', email);

      if (existingError) {
          throw existingError;
      }

      // Extract existing department names from the result
      const existingDepartmentNames = existingDepartments.map(dept => dept.department);

      // Determine departments to delete and insert
      const departmentsToDelete = existingDepartmentNames.filter(dept => !departments.includes(dept));
      const departmentsToInsert = departments.filter(dept => !existingDepartmentNames.includes(dept));

      // Perform deletion and insertion
      await supabase
          .from('Counselor Role')
          .delete()
          .eq('email', email)
          .in('department', departmentsToDelete);

      await supabase
          .from('Counselor Role')
          .insert(
              departmentsToInsert.map(dept => ({ email, department: dept }))
          );

      res.status(200).json({ message: 'Departments updated successfully' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Failed to update departments' });
  }
});

myapp.post('/acceptAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = req.session.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId;  
   const appointmentDateTime = new Date();
   const options = {
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
  const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const acceptedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_stat: 'ACCEPTED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Accepted Appointment')
      .insert(acceptedAppointmentData);

    if (insertError) {
      console.error('Error inserting accepted appointment:', insertError.message);
      return res.status(500).send('Failed to accept the appointment');
    }

  // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment accepted successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/completeAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = req.session.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId;  
   const appointmentDateTime = new Date();
   const options = {
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
  const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'completed Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'completed Appointment' with counselor details and adjusted date/time
    const completedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'COMPLETED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(completedAppointmentData);

    if (insertError) {
      console.error('Error inserting completed appointment:', insertError.message);
      return res.status(500).send('Failed to cancel the appointment');
    }

  // Remove the appointment from 'completed Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Accepted Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error completed appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment completed successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/rejectAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = req.session.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId;  
   const appointmentDateTime = new Date();
   const options = {
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
  const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const rejectedAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'REJECTED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(rejectedAppointmentData);

    if (insertError) {
      console.error('Error inserting rejected appointment:', insertError.message);
      return res.status(500).send('Failed to reject the appointment');
    }

  // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment rejected successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/cancelAppointment/:appointmentId', async (req, res) => {
  try {
    const counselorData = req.session.counselorData;
    const counselorEmail = counselorData.email;
    const counselorFName= counselorData.first_name;
    const counselorLName= counselorData.last_name;
    const appointmentId = req.params.appointmentId;  
   const appointmentDateTime = new Date();
   const options = {
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
  const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Accepted Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const cancelledAppointmentData = {
      counselor_email: counselorEmail,
      counselor_Fname: counselorFName,
      counselor_Lname: counselorLName,
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'CANCELLED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(cancelledAppointmentData);

    if (insertError) {
      console.error('Error inserting cancelled appointment:', insertError.message);
      return res.status(500).send('Failed to cancel the appointment');
    }

  // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Accepted Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

myapp.post('/studentCancelAppointment/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;  
   const appointmentDateTime = new Date();
   const options = {
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  const appointmentTimeStr = appointmentDateTime.toLocaleString('en-US', options);
  const appointmentDateStr = appointmentDateTime.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });

    // Retrieve appointment details from 'Pending Appointment' based on appointmentId
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('Pending Appointment')
      .select('*')
      .eq('id', appointmentId);

    if (appointmentError || !appointmentData.length) {
      console.error('Error fetching appointment details:', appointmentError?.message);
      return res.status(404).send('Appointment not found');
    }

    const appointmentDetails = appointmentData[0];
    const student_Email = appointmentDetails.email;
    const student_FName = appointmentDetails.first_name;
    const student_LName = appointmentDetails.last_name;
    const dept = appointmentDetails.department;
    const appoint_date = appointmentDetails.appointed_date;
    const appoint_time = appointmentDetails.appointed_time;


    // Prepare data for 'Accepted Appointment' with counselor details and adjusted date/time
    const cancelledAppointmentData = {
      date: appointmentDateStr,
      time: appointmentTimeStr,
      email: student_Email,
      department: dept ,
      first_name: student_FName,
      last_name: student_LName,
      appointed_date: appoint_date,
      appointed_time: appoint_time,
      prog_status: 'CANCELLED'

    };

    // Save accepted appointment in the 'Accepted Appointment' table
    const { data: insertedAppointment, error: insertError } = await supabase
      .from('Appointment History')
      .insert(cancelledAppointmentData);

    if (insertError) {
      console.error('Error inserting cancelled appointment:', insertError.message);
      return res.status(500).send('Failed to cancel the appointment');
    }

  // Remove the appointment from 'Pending Appointment' after moving it to 'Accepted Appointment'
    const { error: deleteError } = await supabase
      .from('Pending Appointment')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Error deleting appointment from pending:', deleteError.message);
      // Handle the error (appointment accepted but not removed from pending)
    }
    // Send success response
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Internal server error');
  }
});

