require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const app = express();
const port = 3000;

let weeklyData = [];

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "assets")));

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve strength-tracker.html
app.get("strength-tracker/strength-tracker.html", (req, res) => {
  res.sendFile(path.join(__dirname, "strength-tracker.html"));
});

// API to submit strength data
app.post("/api/submit", (req, res) => {
  const { name, weight, position, bench, squat, deadlift } = req.body;

  if (!name || !weight || !position || !bench || !squat || !deadlift) {
    return res.status(400).send("Please fill in all fields.");
  }

  const [year, week] = getWeekNumber(new Date());
  const submissionKey = `${name}_${year}_week${week}`;

  if (weeklyData.find((entry) => entry.submissionKey === submissionKey)) {
    return res.status(400).send("You have already submitted data this week.");
  }

  const newData = {
    name,
    weight,
    position,
    bench,
    squat,
    deadlift,
    date: new Date().toLocaleDateString(),
    submissionKey,
  };

  weeklyData.push(newData);
  res.status(200).send("Data submitted successfully.");
});

// API to get all weekly data
app.get("/api/data", (req, res) => {
  res.json(weeklyData);
});

// API to validate password for export
app.post("/api/validate-password", (req, res) => {
  const { password } = req.body;
  if (password === process.env.EXPORT_PASSWORD) {
    res.status(200).send("Password is valid.");
  } else {
    res.status(403).send("Invalid password.");
  }
});

// Function to get the current year and week number
function getWeekNumber(date) {
  date = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return [date.getUTCFullYear(), weekNo];
}

// Function to save weekly data to file and reset it
function saveWeeklyDataToFile() {
  const [year, week] = getWeekNumber(new Date());
  const filename = `strength-data_${year}_week${week}.json`;
  const filePath = path.join(__dirname, filename);

  // Write the data to a file
  fs.writeFileSync(filePath, JSON.stringify(weeklyData, null, 2));
  console.log("Weekly data saved to file.");
  weeklyData = []; // Clear the data for the new week
}

// Schedule weekly data save (every Sunday at midnight)
setInterval(() => {
  const now = new Date();
  if (now.getDay() === 0 && now.getHours() === 0) {
    saveWeeklyDataToFile();
  }
}, 60 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
