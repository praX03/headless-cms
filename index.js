const express = require('express');
const mysql = require('mysql2');
const app = express();
const Entity = require('./models/entity'); 
const bodyParser = require('body-parser'); // Add bodyParser

const sequelize = require('./db');
const entityRoutes = require("./routes/entities")
const cors = require('cors');

// Enable CORS
app.use(cors());
app.use(bodyParser.json()); 
app.use('/entities', entityRoutes)


// Error Handling (Make this more robust later)
app.use((err, req, res, next) => {
    console.error(err.stack); 
    res.status(500).json({ message: 'Something went wrong' });
});

// Start server
const port = process.env.PORT || 3000; // Use a .env variable for the port 
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
