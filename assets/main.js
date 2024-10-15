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
