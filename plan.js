document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // MAIN TRIP ELEMENTS
    // =====================================================

    const locationInput =
        document.getElementById("location");

    const budgetInput =
        document.getElementById("budget");

    const timeInput =
        document.getElementById("time");

    const startTripBtn =
        document.getElementById("startTrip");

    const rescueBtn =
        document.getElementById("rescueBtn");

    const resultSection =
        document.getElementById("result");

    const newPlanSection =
        document.getElementById("newPlan");

    const mapExplorer =
        document.getElementById("mapExplorer");

    const tripLocation =
        document.getElementById("tripLocation");

    const tripDetails =
        document.getElementById("tripDetails");

    const rescueLocation =
        document.getElementById("rescueLocation");

    const rescueDetails =
        document.getElementById("rescueDetails");

    const interestButtons =
        document.querySelectorAll(".interest");


    // =====================================================
    // INTEREST SELECTION
    // =====================================================

    interestButtons.forEach((button) => {

        button.addEventListener("click", () => {

            button.classList.toggle("selected");

        });

    });


    // =====================================================
    // CREATE TRIP
    // =====================================================

    startTripBtn.addEventListener(
        "click",
        async () => {

            const location =
                locationInput.value.trim();

            const budget =
                budgetInput.value.trim();

            const time =
                timeInput.value.trim();


            // ---------------------------------------------
            // SELECTED INTERESTS
            // ---------------------------------------------

            const interests = [];

            interestButtons.forEach((button) => {

                if (
                    button.classList.contains("selected")
                ) {

                    const interest =
                        button.dataset.interest ||
                        button.textContent.trim();

                    interests.push(interest);

                }

            });


            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (
                !location ||
                !budget ||
                !time
            ) {

                alert(
                    "Please fill in destination, budget and available time."
                );

                return;

            }


            if (interests.length === 0) {

                alert(
                    "Please select at least one interest."
                );

                return;

            }


            // ---------------------------------------------
            // LOADING
            // ---------------------------------------------

            startTripBtn.textContent =
                "🤖 Creating your trip...";

            startTripBtn.disabled = true;


            try {

                // -----------------------------------------
                // API REQUEST
                // -----------------------------------------

                const response =
                    await fetch(
                        "/api/create-trip",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                location,
                                budget,
                                time,
                                interests
                            })

                        }
                    );


                const trip =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        trip.error ||
                        "Trip generation failed."
                    );

                }


                console.log(
                    "TRIP RESPONSE:",
                    trip
                );


                // -----------------------------------------
                // TRIP INFORMATION
                // -----------------------------------------

                tripLocation.textContent =
                    trip.location || location;


                const totalCost =
                    Number(
                        trip.totalCost || budget
                    );


                tripDetails.textContent =
                    `NPR ${totalCost.toLocaleString()} · ${time}`;


                // -----------------------------------------
                // REMOVE OLD ACTIVITIES
                // -----------------------------------------

                document
                    .querySelectorAll(
                        "#result .activity"
                    )
                    .forEach(
                        (activity) =>
                            activity.remove()
                    );


                // -----------------------------------------
                // ITINERARY CARD
                // -----------------------------------------

                const itineraryCard =
                    document.querySelector(
                        "#result .itinerary-card"
                    );


                const problemBox =
                    document.querySelector(
                        "#result .problem-box"
                    );


                // -----------------------------------------
                // CREATE ACTIVITIES
                // -----------------------------------------

                if (
                    Array.isArray(
                        trip.activities
                    ) &&
                    trip.activities.length > 0
                ) {

                    trip.activities.forEach(
                        (activity) => {

                            const activityElement =
                                document.createElement(
                                    "div"
                                );


                            activityElement.className =
                                "activity";


                            const cost =
                                Number(
                                    activity.cost || 0
                                ).toLocaleString();


                            activityElement.innerHTML = `
                                <div>

                                    <span class="time">
                                        ${escapeHTML(
                                            activity.time ||
                                            "Flexible"
                                        )}
                                    </span>

                                    <h4>
                                        ${escapeHTML(
                                            activity.name ||
                                            "Activity"
                                        )}
                                    </h4>

                                    <p>
                                        ${escapeHTML(
                                            activity.description ||
                                            ""
                                        )}

                                        ${
                                            activity.category
                                                ? " · " +
                                                  escapeHTML(
                                                      activity.category
                                                  )
                                                : ""
                                        }

                                        · NPR ${cost}
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

                        }
                    );

                } else {

                    const emptyActivity =
                        document.createElement(
                            "div"
                        );


                    emptyActivity.className =
                        "activity";


                    emptyActivity.innerHTML = `
                        <div>

                            <span class="time">
                                Flexible
                            </span>

                            <h4>
                                Explore ${escapeHTML(location)}
                            </h4>

                            <p>
                                Discover nearby attractions,
                                local food and experiences.
                            </p>

                        </div>

                        <span class="status">
                            Planned
                        </span>
                    `;


                    itineraryCard.insertBefore(
                        emptyActivity,
                        problemBox
                    );

                }


                // -----------------------------------------
                // SHOW GENERATED PLAN
                // -----------------------------------------

                resultSection.classList.remove(
                    "hidden"
                );


                newPlanSection.classList.add(
                    "hidden"
                );


                // -----------------------------------------
                // SHOW MAP
                // -----------------------------------------

                mapExplorer.classList.remove(
                    "hidden"
                );


                // -----------------------------------------
                // SCROLL TO PLAN
                // -----------------------------------------

                resultSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


                // -----------------------------------------
                // INITIALIZE MAP
                // -----------------------------------------

                initializeMap();


                // -----------------------------------------
                // FIND DESTINATION ON MAP
                // -----------------------------------------

                setTimeout(() => {

                    geocodeDestination(
                        trip.location || location
                    );

                }, 700);


            } catch (error) {

                console.error(
                    "CREATE TRIP ERROR:",
                    error
                );


                alert(
                    "Trip generation failed:\n\n" +
                    error.message
                );

            } finally {

                startTripBtn.textContent =
                    "Create My Trip";

                startTripBtn.disabled =
                    false;

            }

        }
    );


    // =====================================================
    // RESCUE TRIP
    // =====================================================

    rescueBtn.addEventListener(
        "click",
        () => {

            const location =
                locationInput.value.trim() ||
                "your destination";


            rescueLocation.textContent =
                `Alternative plan for ${location}`;


            rescueDetails.textContent =
                "Your original activity changed. We've found another way forward.";


            newPlanSection.classList.remove(
                "hidden"
            );


            newPlanSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );


    // =====================================================
    // CURRENT LOCATION BUTTON
    // =====================================================

    const getLocationBtn =
        document.getElementById(
            "getLocationBtn"
        );


    if (getLocationBtn) {

        getLocationBtn.addEventListener(
            "click",
            () => {

                locateUser();

                mapExplorer.classList.remove(
                    "hidden"
                );

                initializeMap();

                setTimeout(() => {

                    mapExplorer.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }, 300);

            }
        );

    }


    // =====================================================
    // MAP VARIABLES
    // =====================================================

    let map = null;

    let currentLayer = null;

    let markersLayer = null;

    let debounceTimer = null;


    // =====================================================
    // MAP LAYERS
    // =====================================================

    const layers = {

        dark: L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
                maxZoom: 19,
                attribution:
                    "© OpenStreetMap, © CARTO"
            }
        ),

        satellite: L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 18,
                attribution:
                    "© Esri Satellite"
            }
        ),

        street: L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    "© OpenStreetMap contributors"
            }
        ),

        terrain: L.tileLayer(
            "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 17,
                attribution:
                    "© OpenTopoMap"
            }
        )

    };


    // =====================================================
    // INITIALIZE MAP
    // =====================================================

    function initializeMap() {

        if (map) {

            setTimeout(() => {
                map.invalidateSize();
            }, 300);

            return;

        }


        const mapElement =
            document.getElementById("map");


        if (!mapElement) {
            return;
        }


        map =
            L.map(
                "map",
                {
                    zoomControl: false,
                    worldCopyJump: true,
                    minZoom: 3,
                    maxZoom: 18,
                    layers: [layers.dark]
                }
            )
            .setView(
                [28.3949, 84.1240],
                7
            );


        currentLayer =
            layers.dark;


        markersLayer =
            L.layerGroup()
                .addTo(map);


        L.control.zoom({
            position: "bottomleft"
        }).addTo(map);


        setupSearch();


        setTimeout(() => {

            map.invalidateSize();

        }, 300);

    }


    // =====================================================
    // CHANGE MAP LAYER
    // =====================================================

    window.setMapLayer =
        function(type) {

            if (!map) {
                initializeMap();
            }


            if (!layers[type]) {
                return;
            }


            if (
                currentLayer &&
                map.hasLayer(currentLayer)
            ) {

                map.removeLayer(
                    currentLayer
                );

            }


            currentLayer =
                layers[type];


            map.addLayer(
                currentLayer
            );


            document
                .querySelectorAll(
                    ".layer-btn"
                )
                .forEach(
                    (button) => {

                        button.classList.remove(
                            "active"
                        );

                    }
                );


            const activeButton =
                document.getElementById(
                    `btn-${type}`
                );


            if (activeButton) {

                activeButton.classList.add(
                    "active"
                );

            }

        };


    // =====================================================
    // CUSTOM MAP PIN
    // =====================================================

    function createPin(
        color = "#6366f1"
    ) {

        return L.divIcon({

            className:
                "custom-pin",

            html: `
                <div
                    style="
                        background:${color};
                        width:18px;
                        height:18px;
                        border-radius:50%;
                        border:3px solid #fff;
                        box-shadow:0 0 15px ${color};
                    "
                ></div>
            `,

            iconSize: [
                18,
                18
            ],

            iconAnchor: [
                9,
                9
            ]

        });

    }


    // =====================================================
    // SEARCH SETUP
    // =====================================================

    function setupSearch() {

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        const clearBtn =
            document.getElementById(
                "clearBtn"
            );


        if (!searchInput) {
            return;
        }


        searchInput.addEventListener(
            "input",
            (event) => {

                const query =
                    event.target.value.trim();


                clearBtn.style.display =
                    query
                        ? "flex"
                        : "none";


                clearTimeout(
                    debounceTimer
                );


                if (
                    query.length < 2
                ) {

                    document
                        .getElementById(
                            "resultsList"
                        )
                        .classList.remove(
                            "active"
                        );

                    return;

                }


                debounceTimer =
                    setTimeout(
                        () => {

                            performSearch(
                                query
                            );

                        },
                        350
                    );

            }
        );


        clearBtn.addEventListener(
            "click",
            () => {

                searchInput.value =
                    "";

                document
                    .getElementById(
                        "resultsList"
                    )
                    .classList.remove(
                        "active"
                    );


                clearBtn.style.display =
                    "none";

            }
        );

    }


    // =====================================================
    // SEARCH NEPAL
    // =====================================================

    async function performSearch(
        query
    ) {

        showSpinner(true);


        try {

            const response =
                await fetch(
                    "https://nominatim.openstreetmap.org/search?" +
                    new URLSearchParams({
                        format: "json",
                        q: query,
                        countrycodes: "np",
                        limit: "6"
                    }),
                    {
                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );


            const data =
                await response.json();


            renderResults(
                data
            );


        } catch (error) {

            console.error(
                "Search error:",
                error
            );

        } finally {

            showSpinner(false);

        }

    }


    // =====================================================
    // SEARCH RESULTS
    // =====================================================

    function renderResults(
        results
    ) {

        const resultsList =
            document.getElementById(
                "resultsList"
            );


        resultsList.innerHTML =
            "";


        if (
            !results ||
            results.length === 0
        ) {

            resultsList.classList.remove(
                "active"
            );

            return;

        }


        results.forEach(
            (place) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "result-item";


                const shortName =
                    place.display_name
                        .split(",")[0];


                item.innerHTML = `

                    <span
                        class="material-symbols-outlined"
                        style="
                            font-size:18px;
                            color:#6366f1;
                        "
                    >
                        location_on
                    </span>

                    <div class="result-info">

                        <span class="result-name">
                            ${escapeHTML(
                                shortName
                            )}
                        </span>

                        <span class="result-sub">
                            ${escapeHTML(
                                place.display_name
                            )}
                        </span>

                    </div>
                `;


                item.addEventListener(
                    "click",
                    () => {

                        flyToLocation(
                            place.lat,
                            place.lon,
                            14,
                            shortName,
                            place.display_name
                        );


                        resultsList.classList.remove(
                            "active"
                        );

                    }
                );


                resultsList.appendChild(
                    item
                );

            }
        );


        resultsList.classList.add(
            "active"
        );

    }


    // =====================================================
    // SEARCH NEARBY POI
    // =====================================================

    window.searchPOI =
        async function(
            typeKey,
            color
        ) {

            if (!map) {
                initializeMap();
            }


            showSpinner(true);


            markersLayer.clearLayers();


            const center =
                map.getCenter();


            const south =
                center.lat - 0.05;

            const west =
                center.lng - 0.05;

            const north =
                center.lat + 0.05;

            const east =
                center.lng + 0.05;


            const bbox =
                `${south},${west},${north},${east}`;


            let filterTag =
                `["amenity"="${typeKey}"]`;


            if (
                typeKey === "park"
            ) {

                filterTag =
                    `["leisure"="park"]`;

            }


            if (
                typeKey === "hotel"
            ) {

                filterTag =
                    `["tourism"="hotel"]`;

            }


            const overpassQuery =
                `[out:json];node${filterTag}(${bbox});out 20;`;


            const overpassUrl =
                "https://overpass-api.de/api/interpreter?" +
                new URLSearchParams({
                    data:
                        overpassQuery
                });


            try {

                const response =
                    await fetch(
                        overpassUrl
                    );


                const data =
                    await response.json();


                if (
                    data.elements &&
                    data.elements.length > 0
                ) {

                    data.elements.forEach(
                        (poi) => {

                            const name =
                                poi.tags &&
                                poi.tags.name
                                    ? poi.tags.name
                                    : `Local ${typeKey}`;


                            const details =
                                (
                                    poi.tags &&
                                    (
                                        poi.tags.address ||
                                        poi.tags.cuisine ||
                                        poi.tags["addr:street"]
                                    )
                                ) ||
                                "Nepal location";


                            L.marker(
                                [
                                    poi.lat,
                                    poi.lon
                                ],
                                {
                                    icon:
                                        createPin(
                                            color
                                        )
                                }
                            )
                            .addTo(
                                markersLayer
                            )
                            .bindPopup(`
                                <div class="popup-title">
                                    ${escapeHTML(
                                        name
                                    )}
                                </div>

                                <div class="popup-desc">
                                    ${escapeHTML(
                                        details
                                    )}
                                </div>
                            `);

                        }
                    );

                } else {

                    alert(
                        `No registered ${typeKey}s found in this area. Try zooming into a city first.`
                    );

                }


            } catch (error) {

                console.error(
                    "Overpass query error:",
                    error
                );


                alert(
                    "Nearby search is temporarily unavailable."
                );

            } finally {

                showSpinner(false);

            }

        };


    // =====================================================
    // FLY TO LOCATION
    // =====================================================

    window.flyToLocation =
        function(
            lat,
            lon,
            zoom = 14,
            title = "",
            desc = ""
        ) {

            if (!map) {
                initializeMap();
            }


            const latitude =
                parseFloat(lat);


            const longitude =
                parseFloat(lon);


            if (
                Number.isNaN(latitude) ||
                Number.isNaN(longitude)
            ) {

                return;

            }


            map.flyTo(
                [
                    latitude,
                    longitude
                ],
                zoom,
                {
                    duration: 1.5
                }
            );


            markersLayer.clearLayers();


            if (title) {

                L.marker(
                    [
                        latitude,
                        longitude
                    ],
                    {
                        icon:
                            createPin(
                                "#6366f1"
                            )
                    }
                )
                .addTo(
                    markersLayer
                )
                .bindPopup(`
                    <div class="popup-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="popup-desc">
                        ${escapeHTML(desc)}
                    </div>
                `)
                .openPopup();

            }

        };


    // =====================================================
    // GEOCODE DESTINATION
    // =====================================================

    async function geocodeDestination(
        destination
    ) {

        if (!destination) {
            return;
        }


        try {

            const response =
                await fetch(
                    "https://nominatim.openstreetmap.org/search?" +
                    new URLSearchParams({
                        format: "json",
                        q: destination + ", Nepal",
                        countrycodes: "np",
                        limit: "1"
                    })
                );


            const data =
                await response.json();


            if (
                data &&
                data.length > 0
            ) {

                flyToLocation(
                    data[0].lat,
                    data[0].lon,
                    13,
                    destination,
                    "Your trip destination"
                );

            }

        } catch (error) {

            console.error(
                "Destination geocoding error:",
                error
            );

        }

    }


    // =====================================================
    // USER LOCATION
    // =====================================================

    window.locateUser =
        function() {

            if (!navigator.geolocation) {

                alert(
                    "Geolocation is not supported by your browser."
                );

                return;

            }


            if (!map) {
                initializeMap();
            }


            showSpinner(true);


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    showSpinner(false);


                    const lat =
                        position.coords.latitude;


                    const lon =
                        position.coords.longitude;


                    flyToLocation(
                        lat,
                        lon,
                        16,
                        "Your Current Location",
                        "GPS location"
                    );

                },


                (error) => {

                    showSpinner(false);


                    console.error(
                        "Geolocation error:",
                        error
                    );


                    alert(
                        "Location permission was denied or unavailable."
                    );

                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }

            );

        };


    // =====================================================
    // LOADING SPINNER
    // =====================================================

    function showSpinner(
        show
    ) {

        const spinner =
            document.getElementById(
                "loadingSpinner"
            );


        if (!spinner) {
            return;
        }


        spinner.style.display =
            show
                ? "inline-block"
                : "none";

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(value ?? "");


        return div.innerHTML;

    }

});