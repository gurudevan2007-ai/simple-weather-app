const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = 3000;

// Serve static files from public folder
app.use(express.static("public"));

// Home Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});