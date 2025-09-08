// const bodyParser = require('body-parser');
// const express = require('express');
// const connectToDB = require('./db');
// const cors = require('cors');
// const app = express();

// const allowedOrigins = [
//   'https://tiet-placement-portal-se-project.vercel.app',
//   'http://localhost:5173',
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

// app.use(bodyParser.json());
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/announcements', require('./routes/announcements'));
// app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/applications', require('./routes/applications'));
// app.use('/api/contact-form', require('./routes/contact'));

// app.use('/', (req, res) => {
//   res.send('Hello World');
// });

// const port = 5000;

// // Ensure DB is connected before starting server
// connectToDB()
//   .then(() => {
//     console.log('Database connected successfully');
//     app.listen(port, () => {
//       console.log(`TIET-PMS is up and running on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Database connection failed:', err);
//     process.exit(1); // Exit if DB connection fails
//   });






const bodyParser = require('body-parser');
const express = require('express');
const connectToDB = require('./db');
const cors = require('cors');
const app = express();

// // ✅ Only allow local frontend now
// const allowedOrigins = [
//   'http://localhost:5173', // React dev server
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

const allowedOrigins = [
  'http://localhost:5173', // React dev server
  'https://tiet-placement-portal-se-project.vercel.app' // Production frontend
];

// app.use(cors({
//   origin: function(origin, callback) {
//     // allow requests with no origin (like Postman)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS: ' + origin));
//     }
//   },
//   credentials: true,
// }));


// allow localhost during dev
app.use(cors({
  origin: ["http://localhost:5173", "https://thapar-placement-portal.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));



app.use(bodyParser.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/contact-form', require('./routes/contact'));

// Default route
app.use('/', (req, res) => {
  res.send('Hello World 👋 Local server is running!');
});

const port = 5000;

// Ensure DB is connected before starting server
connectToDB()
  .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(port, () => {
      console.log(`🚀 TIET-PMS backend running locally on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
