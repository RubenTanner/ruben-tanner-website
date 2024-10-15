// strength-tracker.js - Combined Node.js backend and frontend logic

require("dotenv").config(); // Add this line at the top

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000; // Ensure that this port is open and accessible

let weeklyData = []; // In-memory storage for simplicity, replace with a real database

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "assets")));

// Serve the HTML file
app.get("/", (req, res) => {
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
}, 60 * 60 * 1000); // Check every hour

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Frontend JavaScript
const form = document.getElementById("strength-form");
const resultsDiv = document.getElementById("results");
const exportButton = document.getElementById("export-data");
const passwordInput = document.getElementById("password");
const positionFilter = document.getElementById("position-filter");

// Function to display results in a table format
function displayResults(data) {
  let filteredData = data;
  const selectedPosition = positionFilter.value;
  if (selectedPosition !== "all") {
    filteredData = data.filter((entry) => entry.position === selectedPosition);
  }

  let tableHTML =
    "<table><thead><tr><th>Name</th><th>Weight</th><th>Position</th><th>Bench</th><th>Squat</th><th>Deadlift</th><th>Date</th></tr></thead><tbody>";

  filteredData.forEach((entry) => {
    tableHTML += `<tr>
                    <td>${entry.name}</td>
                    <td>${entry.weight}</td>
                    <td>${entry.position}</td>
                    <td>${entry.bench}</td>
                    <td>${entry.squat}</td>
                    <td>${entry.deadlift}</td>
                    <td>${entry.date}</td>
                  </tr>`;
  });

  tableHTML += "</tbody></table>";
  resultsDiv.innerHTML = tableHTML;
}

// Function to export data to JSON file
function exportToJSON(data, filename) {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(data, null, 2)], {
    type: "text/plain",
  });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
}

// Handle form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const weight = document.getElementById("weight").value;
  const position = document.getElementById("position").value;
  const bench = document.getElementById("bench").value;
  const squat = document.getElementById("squat").value;
  const deadlift = document.getElementById("deadlift").value;

  if (!name || !weight || !position || !bench || !deadlift || !squat) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        weight,
        position,
        bench,
        squat,
        deadlift,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    alert("Data submitted successfully.");
    form.reset();
    loadResults();
  } catch (error) {
    alert(error.message);
  }
});

// Load results from the backend
async function loadResults() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error("Error loading results:", error);
  }
}

// Handle export button click
exportButton.addEventListener("click", async () => {
  const enteredPassword = passwordInput.value;

  try {
    const response = await fetch("/api/validate-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: enteredPassword }),
    });

    if (response.ok) {
      // Password is valid, proceed to export the data
      const weeklyDataResponse = await fetch("/api/data");
      const weeklyData = await weeklyDataResponse.json();
      const [year, week] = getWeekNumber(new Date());
      const filename = `strength-data_${year}_week${week}.json`;
      exportToJSON(weeklyData, filename);
      passwordInput.value = "";
    } else {
      throw new Error("Invalid password. Please try again.");
    }
  } catch (error) {
    alert(error.message);
  }
});

// Handle position filter change
positionFilter.addEventListener("change", loadResults);

// Initial load of results
loadResults();
