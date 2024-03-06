const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

// Enable CORS
app.use(cors());


// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tiger',
    database: 'nss'
  }); 
  
// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle login
app.post('/login', (req, res) => {
    const { VOLUNTEER_NAME, VOLUNTEER_PASSWORD, USER_TYPE } = req.body;

    // Check if all required fields are provided
    if (!VOLUNTEER_NAME || !VOLUNTEER_PASSWORD || !USER_TYPE) {
        console.error('Missing required fields');
        return res.status(400).send('Missing required fields');
    }

    // Query to check if the user exists in the users table
    const sqlUsers = 'SELECT * FROM users WHERE LOWER(email) = ? AND userType = ?';
    db.query(sqlUsers, [VOLUNTEER_NAME.trim().toLowerCase(), USER_TYPE], (err, userResult) => {
        if (err) {
            console.error('Error executing SQL query for users:', err);
            return res.status(500).send('Error logging in');
        }

        // Log the user type and query result
        console.log('USER_TYPE:', USER_TYPE);
        console.log('result from users:', userResult);

        if (userResult.length === 0) {
            // If user is not found in the users table, return "invalid credentials" message
            console.error('Invalid credentials');
            return res.status(401).send('Invalid credentials');
        } else {
            // Check if the user type is administrator
            if (USER_TYPE.toLowerCase() === 'administrator') {
                // If the user type is administrator, redirect them to activity_details.html page
                console.log('Login successful as Administrator');
                return res.status(200).json({ redirect: 'activity_details.html' });
            } else if (USER_TYPE.toLowerCase() === 'volunteer') {
                // If the user type is volunteer, check if the email is in volunteers table
                const sqlVolunteers = 'SELECT * FROM volunteers WHERE LOWER(EmailID) = ?';
                db.query(sqlVolunteers, [VOLUNTEER_NAME.trim().toLowerCase()], (err, volunteerResult) => {
                    if (err) {
                        console.error('Error executing SQL query for volunteers:', err);
                        return res.status(500).send('Error logging in');
                    }

                    // Log the query result
                    console.log('result from volunteers:', volunteerResult);

                    if (volunteerResult.length > 0) {
                        // If volunteer is found in the volunteers table, redirect them to display_activity_details.html
                        console.log('Existing volunteer logged in');
                        return res.status(200).json({ redirect: 'display_activity_details.html' });
                    } else {
                        // If volunteer is not found in the volunteers table, redirect them to enroll.html
                        console.log('New volunteer logged in');
                        return res.status(200).json({ redirect: 'enroll.html' });
                    }
                });
            } else {
                // Invalid user type
                console.error('Invalid user type');
                return res.status(401).send('Invalid user type');
            }
        }
    });
});

// Route to handle form submission
app.post('/submit_form', (req, res) => {
    const { username, email, password, userType } = req.body;

    console.log('Received form data:', req.body); // Log the request body

    // Check if username field is provided and not empty
    if (!username || username.trim() === '') {
        console.error('Username is required');
        return res.status(400).send('Username is required');
    }

    const sql = 'INSERT INTO users (username, email, password, userType) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, password, userType], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error submitting form'); // Log the error
        }
        console.log('Form submitted successfully');
        res.status(200).send('Form submitted successfully');
    });
});

// Route to handle form submission
app.post('/submit_form', (req, res) => {
    const { username, email, password, userType } = req.body;
  
    console.log('Received form data:', req.body); // Log the request body
  
    // Check if username field is provided and not empty
    if (!username || username.trim() === '') {
      console.error('Username is required');
      return res.status(400).send('Username is required');
    }
  
    const sql = 'INSERT INTO users (username, email, password, userType) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, password, userType], (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).send('Error submitting form'); // Log the error
      }
      console.log('Form submitted successfully');
      res.status(200).send('Form submitted successfully');
    });
  });


// Route to handle volunteer enrollment
app.post('/enroll', (req, res) => {
  const {enrollmentID,firstName,middleName,lastName,gender,dateOfBirth,branch,nssUnitNumber,community,phoneNumber,emailID,aadharNumber,height,weight,fatherName,address,bloodGroup} = req.body;

  // Perform validation if needed

  // Insert the volunteer record into the database
  const sql = `INSERT INTO volunteers (EnrollmentID, FirstName, MiddleName, LastName, Gender, DateOfBirth, Branch, NSSUnitNumber, Community, PhoneNumber, EmailID, AadharNumber, Height, Weight, FatherName, Address, BloodGroup) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [enrollmentID, firstName, middleName, lastName, gender, dateOfBirth, branch, nssUnitNumber, community, phoneNumber, emailID, aadharNumber, height, weight, fatherName, address, bloodGroup], (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).send('Error enrolling volunteer: ' + err.message);
      }
      console.log('Volunteer enrolled successfully');
      res.status(200).send('Volunteer enrolled successfully');
  });
});


// Endpoint to handle attendance submission
app.post('/attendance', (req, res) => {
  const { enrollmentID, eventID, eventdate, CheckInTime, CheckOutTime, location, dailyHours } = req.body;

  const sql = `INSERT INTO attendance_tracking(EnrollmentID, EventID, Date, CheckInTime, CheckOutTime, Location, DailyHours) VALUES(?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [enrollmentID, eventID, eventdate, CheckInTime, CheckOutTime, location, dailyHours], (err, result) => {
      if (err) {
          console.error('Error inserting attendance:', err);
          res.status(500).json({ error: 'Error inserting attendance' });
          return;
      }
      console.log('Attendance inserted successfully');
      res.status(200).json({ message: 'Attendance inserted successfully' });
  });
});


// Route to handle report issuance
app.post('/issue_report', (req, res) => {
    const { eventID, fullName, enrollmentID, description } = req.body;

    console.log('Received report data:', req.body); // Log the request body

    try {
        // Check if all required fields are provided
        if (!eventID || !fullName || !enrollmentID || !description) {
            console.error('Missing required fields');
            return res.status(400).send('Missing required fields');
        }

        // Perform database insert operation
        const sql = 'INSERT INTO report_issuing (EventID, FullName, EnrollmentID, Description) VALUES (?, ?, ?, ?)';
        db.query(sql, [eventID, fullName, enrollmentID, description], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).send('Error issuing report: ' + err.message); // Log the error
            }
            console.log('Report issued successfully');
            res.status(200).send('Report issued successfully');
        });
    } catch (error) {
        console.error('Error handling report issuance:', error);
        res.status(500).send('Error handling report issuance');
    }
});

// Route to handle adding activity details
app.post('/add_activity', (req, res) => {
  const { activityID, description, duration, organizer } = req.body;

  // Perform validation if needed

  // Insert the activity details into the database
  const sql = 'INSERT INTO activity_details (ActivityID, Description, Duration, Organizer) VALUES (?, ?, ?, ?)';
  db.query(sql, [activityID, description, duration, organizer], (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).json({ error: 'Error adding activity details' });
      }
      console.log('Activity details added successfully');
      res.status(200).json({ message: 'Activity details added successfully' });
  });
});
// Route to fetch attendance data
app.get('/attendance_data', (req, res) => {
  const sql = 'SELECT * FROM attendance';
  db.query(sql, (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).send('Error fetching attendance data');
      }
      console.log('Attendance data:', result);
      res.json(result);
  });
});

// Route to handle adding activity details and inserting into attendance table
app.post('/add_activity', (req, res) => {
  const { activityID, description, duration, organizer } = req.body;

  // Perform validation if needed

  // Insert the activity details into the database
  const sql = 'INSERT INTO activity_details (ActivityID, Description, Duration, Organizer) VALUES (?, ?, ?, ?)';
  db.query(sql, [activityID, description, duration, organizer], (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).json({ error: 'Error adding activity details' });
      }
      console.log('Activity details added successfully');

      // Insert the same details into the attendance table with Completed_hours set to 0
      const attendanceSql = 'INSERT INTO attendance (ActivityID, Description, Duration, Organizer, Completed_hours) VALUES (?, ?, ?, ?, ?)';
      db.query(attendanceSql, [activityID, description, duration, organizer, 0], (err, result) => {
          if (err) {
              console.error('Error executing SQL query:', err);
              return res.status(500).json({ error: 'Error adding activity details to attendance table' });
          }
          console.log('Activity details added to attendance table successfully');
          res.status(200).json({ message: 'Activity details added successfully' });
      });
  });
});


// Route to handle adding and displaying activity details
app.post('/display_activity', (req, res) => {
  const { enrollmentid, volunteername, activityid, activityname, duration, organizer } = req.body;

  // Perform validation if needed

  // Insert the activity details into the database
  const activitySql = 'INSERT INTO activity (EnrollmentID, ActivityID, Name, Description, Duration, Organizer) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(activitySql, [enrollmentid, activityid, volunteername, activityname, duration, organizer], (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).json({ error: 'Error adding activity details' });
      }
      console.log('Activity details added successfully');

      // Insert the same details into the attendance table with Completed_hours set to 0
      const attendanceSql = 'INSERT INTO attendance (EnrollmentID, ActivityID, Name, Description, Duration, Organizer, Completed_hours) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(attendanceSql, [enrollmentid, activityid, volunteername, activityname, duration, organizer, 0], (err, result) => {
          if (err) {
              console.error('Error executing SQL query:', err);
              return res.status(500).json({ error: 'Error adding activity details to attendance table' });
          }
          console.log('Activity details added to attendance table successfully');
          res.status(200).json({ message: 'Activity details added successfully' });
      });
  });
});




app.get('/student_data', (req, res) => {
  const sql = 'SELECT * FROM  activity_details';
  db.query(sql, (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).send('Error fetching student data');
      }
      console.log('Student data:', result);
      res.json(result);
  });
});

// Route to fetch activity data
app.get('/activity_data', (req, res) => {
  const sql = 'SELECT ActivityID, Description, Duration ,Organizer FROM activity_details';
  db.query(sql, (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).send('Error fetching activity data');
      }
      console.log('Activity data:', result);
      res.json(result);
  });
});


// <- remaining code remains as it is --->

// Start the server`
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});