document.addEventListener("DOMContentLoaded", function () {

    const locationInput = document.getElementById("location");
    const budgetInput = document.getElementById("budget");
    const timeInput = document.getElementById("time");
    const getLocationBtn = document.getElementById("getLocationBtn");

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

        // Dynamically update itinerary based on location
        document.getElementById("currentActivity1Title").textContent = `Sightseeing in ${location}`;
        document.getElementById("currentActivity2Title").textContent = `Local exploration around ${location}`;
        
        document.getElementById("newActivity1Title").textContent = `Indoor Museum in ${location}`;
        document.getElementById("newActivity2Title").textContent = `Local Restaurant in ${location}`;
        document.getElementById("newActivity3Title").textContent = `Relaxing Walk in ${location}`;
        document.getElementById("newActivity4Title").textContent = `Sunset view in ${location}`;


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
    // =========================
    // GET LOCATION
    // =========================

    if (getLocationBtn) {
        getLocationBtn.addEventListener("click", function () {
            if (navigator.geolocation) {
                getLocationBtn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span>';
                
                navigator.geolocation.getCurrentPosition(
                    async function (position) {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        try {
                            // Reverse geocode using OpenStreetMap Nominatim
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                            const data = await response.json();
                            
                            // Try to get a meaningful location name
                            const city = data.address.city || data.address.town || data.address.village || data.address.county || "Current Location";
                            locationInput.value = city;
                        } catch (error) {
                            console.error("Error fetching location name", error);
                            // Fallback to coordinates
                            locationInput.value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
                        } finally {
                            getLocationBtn.innerHTML = '<span class="material-symbols-outlined">my_location</span>';
                        }
                    },
                    function (error) {
                        console.error("Geolocation error:", error);
                        alert("Unable to retrieve your location. Please check your browser permissions.");
                        getLocationBtn.innerHTML = '<span class="material-symbols-outlined">my_location</span>';
                    }
                );
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        });
    }

});