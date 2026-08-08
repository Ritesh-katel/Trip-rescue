document.addEventListener("DOMContentLoaded", () => {
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
    interestButtons.forEach(button => {
        button.addEventListener("click", () => {
            button.classList.toggle("selected");
        });
    });
    startTripBtn.addEventListener("click", async () => {
        const location = locationInput.value.trim();
        const budget = budgetInput.value.trim();
        const time = timeInput.value.trim();
        const interests = [];
        interestButtons.forEach(button => {
            if (button.classList.contains("selected")) {
                interests.push(button.textContent.trim());
            }
        });
        if (!location || !budget || !time) {
            alert("Please fill in destination, budget and time.");
            return;
        }
        if (interests.length === 0) {
            alert("Please select at least one interest.");
            return;
        }
        startTripBtn.textContent = "🤖 Creating your trip...";
        startTripBtn.disabled = true;
        try {
            const response = await fetch("/api/create-trip", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    location,
                    budget,
                    time,
                    interests
                })
            });
            const trip = await response.json();
            if (!response.ok) {
                throw new Error(trip.error || "Trip generation failed");
            }
            tripLocation.textContent = trip.location;

            tripDetails.textContent =
                `NPR ${Number(trip.totalCost).toLocaleString()} · ${time}`;
            document.querySelectorAll(".activity").forEach(activity => {
                activity.remove();
            });
            const itineraryCard =
                document.querySelector(".itinerary-card");
            const problemBox =
                document.querySelector(".problem-box");
            trip.activities.forEach(activity => {
                const activityElement =
                    document.createElement("div");
                activityElement.className = "activity";
                activityElement.innerHTML = `
                    <div>
                        <span class="time">
                            ${activity.time}
                        </span>
                        <h4>
                            ${activity.name}
                        </h4>
                        <p>
                            ${activity.description}
                            · ${activity.category}
                            · NPR ${activity.cost}
                        </p>
                    </div>
                    <span class="status">
                        Planned
                    </span>
                `;
                itineraryCard.insertBefore(
                    activityElement,
                    problemBox
                );
            });
            resultSection.classList.remove("hidden");
            newPlanSection.classList.add("hidden");
            resultSection.scrollIntoView({
                behavior: "smooth"
            });
       } catch (error) {
    console.error("CREATE TRIP ERROR:", error);
    alert(
        "Trip generation failed:\n\n" + error.message
    );
} startTripBtn.textContent = "Create My Trip";
        startTripBtn.disabled = false;
    });
    rescueBtn.addEventListener("click", () => {
        newPlanSection.classList.remove("hidden");
        newPlanSection.scrollIntoView({
            behavior: "smooth"
        });
    });
});
