document.addEventListener("DOMContentLoaded", function () {

    const locationInput = document.getElementById("location");
    const budgetInput = document.getElementById("budget");
    const timeInput = document.getElementById("time");

    const startTripBtn = document.getElementById("startTrip");
    const rescueBtn = document.getElementById("rescueBtn");

    const resultSection = document.getElementById("result");
    const newPlanSection = document.getElementById("newPlan");

    const tripLocation = document.getElementById("tripLocation");
    const tripDetails = document.getElementById("tripDetails");

    const interestButtons = document.querySelectorAll(".interest");

    // =========================
    // INTEREST BUTTONS
    // =========================

    interestButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            button.classList.toggle("selected");

        });

    });


    // =========================
    // CREATE MY TRIP
    // =========================

    startTripBtn.addEventListener("click", function () {

        const location = locationInput.value.trim();
        const budget = budgetInput.value.trim();
        const time = timeInput.value.trim();


        // Check required fields
        if (location === "" || budget === "" || time === "") {

            alert("Please fill in all trip details.");

            return;
        }


        // Update trip information
        tripLocation.textContent = location;

        tripDetails.textContent =
            "NPR " + Number(budget).toLocaleString() + " · " + time;


        // Show result section
        resultSection.classList.remove("hidden");


        // Hide old rescued plan
        newPlanSection.classList.add("hidden");


        // Scroll to result
        resultSection.scrollIntoView({
            behavior: "smooth"
        });

    });


    // =========================
    // RESCUE MY TRIP
    // =========================

    rescueBtn.addEventListener("click", function () {

        newPlanSection.classList.remove("hidden");

        newPlanSection.scrollIntoView({
            behavior: "smooth"
        });

    });

});