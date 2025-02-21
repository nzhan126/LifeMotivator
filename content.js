document.addEventListener("DOMContentLoaded", function () {

    const hourlyEarningsInput = document.getElementById("hourlyEarnings");
    const saveButton = document.getElementById("save");
    const earnedAmount = document.getElementById("earnedAmount");
    const startTimeInput = document.getElementById("startTime");
    const endTimeInput = document.getElementById("endTime");
    const dropdown = document.getElementById("richDropdown");

    let hourlyEarnings = 0;
    let startTime, endTime;
   

    chrome.storage.sync.get(["hourlyEarnings", "startTimeValue", "endTimeValue","selectedPerson"], function (result) {
        console.log("Retrieved from storage:", result);

        if (result.hourlyEarnings) {
            hourlyEarnings = parseFloat(result.hourlyEarnings);
            hourlyEarningsInput.value = result.hourlyEarnings;
        }
        if (result.startTimeValue) {
            startTimeInput.value = result.startTimeValue;
        }
        if (result.endTimeValue) {
            endTimeInput.value = result.endTimeValue;
        }

        if (startTimeInput.value && endTimeInput.value) {
            calculateTime();
        }
        if (result.selectedPerson) {
            populateDropdown(people);
            dropdown.value = result.selectedPerson;
            calculateYearsToRich();
          }
    });

    saveButton.addEventListener("click", function () {
        console.log("Save button clicked");

        // Check if hourlyEarnings is valid
        hourlyEarnings = parseFloat(hourlyEarningsInput.value);
        if (hourlyEarnings <= 0 || isNaN(hourlyEarnings)) {
            alert("Please enter a valid numeric value for hourly earnings.");
            return;
        }

        const startTimeValue = startTimeInput.value;
        const endTimeValue = endTimeInput.value;

        // Check if start and end times are provided
        if (!startTimeValue || !endTimeValue) {
            alert("Please enter both start and end time.");
            return;
        }

        console.log("Saving values:", hourlyEarnings, startTimeValue, endTimeValue);

        // Save the data to chrome.storage.sync
        chrome.storage.sync.set({
            hourlyEarnings,
            startTimeValue,
            endTimeValue
        }, function () {
            console.log("Data saved successfully");
            calculateTime();
        });
    });

    function calculateTime() {
        const startTimeValue = startTimeInput.value;
        const endTimeValue = endTimeInput.value;

        // Parse the start time
        const [startHours, startMinutes] = startTimeValue.split(":").map(Number);
        startTime = new Date();
        startTime.setHours(startHours, startMinutes, 0, 0);

        // Parse the end time
        const [endHours, endMinutes] = endTimeValue.split(":").map(Number);
        endTime = new Date();
        endTime.setHours(endHours, endMinutes, 0, 0);

        console.log("Start Time:", startTime);
        console.log("End Time:", endTime);

        updateEarnings();
    }

    function updateEarnings() {
        if (!startTime || !endTime || isNaN(hourlyEarnings)) {
            console.warn("Invalid time data. Skipping update.");
            return;
        }

        const now = new Date();
        let earnedSoFar;
        if(now<startTime){
            earnedSoFar = 0;
        }
        else if (now >= endTime) {
         
            earnedSoFar = ((endTime - startTime) / 3600000 * hourlyEarnings).toFixed(2);
        } else {
         
            const elapsedTime = (now - startTime) / 3600000;
            earnedSoFar = (hourlyEarnings * elapsedTime).toFixed(2);
        }

        console.log("Earned Amount:", earnedSoFar);
        earnedAmount.textContent = `$${earnedSoFar}`;
    }

    function calculateYearsToRich() {
        const selectedNetWorth = parseFloat(dropdown.value);
        console.log("Start calculating the years for ", dropdown.value);
        if (!hourlyEarnings || !selectedNetWorth) {
          document.getElementById("yearsToRich").textContent = "__";
          return;
        }
    
        // Calculate annual income (assuming 40 hours per week and 52 weeks per year)
        const annualIncome = hourlyEarnings * 40 * 52;
        const yearsToReach = (selectedNetWorth / annualIncome).toFixed(2);
    
        // Display the result
        document.getElementById("yearsToRich").textContent = yearsToReach;
      }
    
      // Add event listeners
    dropdown.addEventListener("change", function () {
        console.log("Dropdown selection changed to:", dropdown.value);
        chrome.storage.sync.set({ selectedPerson: dropdown.value });
        calculateYearsToRich();
    });

      // Fetch the richest people from the background script
    console.log("Sending message to fetch richest people");
    chrome.runtime.sendMessage({ action: "fetchRichestPeople" }, function(response) {
        if (response.data) {
        console.log("Received data:", response.data);
        populateDropdown(response.data);
        } else {
        console.error("Error fetching richest people:", response.error);
        }
    });
    
            // Populate dropdown with top rich people
    function populateDropdown(people) {
        people.forEach(person => {
            const option = document.createElement("option");
            option.value = person.netWorth;
            option.textContent = `${person.name}`;
            dropdown.appendChild(option);
        });
        }

     
    






    setInterval(updateEarnings, 1000);

    function hideInput() {
        // Hide the input elements by setting their display to 'none'
        hourlyEarningsInput.style.display = "none";
        saveButton.style.display = "none";

        // Loop through the prompt elements and hide them
        for (let prompt of promptText) {
            prompt.style.display = "none";
        }
        startTime.style.display = "none";
        endTime.style.display = "none";
    }

    



});
