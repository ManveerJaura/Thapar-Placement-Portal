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




const bodyParser = require("body-parser");
const express = require("express");
const connectToDB = require("./db");
const cors = require("cors");
const path = require("path");

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // React dev server (local)
  "https://thapar-placement-portal.vercel.app", // Deployed frontend
];

// ✅ Proper CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow tools like Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, "../client/build")));

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/contact-form", require("./routes/contact"));

// Default route
app.get("/", (req, res) => {
  res.send("✅ TIET Placement Portal backend is running!");
});


// React app fallback (MUST come after all API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Port setup
const port = process.env.PORT || 5000;

// Ensure DB is connected before starting server
connectToDB()
  .then(() => {
    console.log("✅ Database connected successfully");
    app.listen(port, () => {
      console.log(
        `🚀 TIET-PMS backend running locally on http://localhost:${port}`
      );
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
