/*
  Leaflet doesn't use a callback function like Google Maps did
  (no "callback=initMap" trick needed), because we're not waiting
  on a key-check from a server - the library is just plain JS that
  is ready to use the instant it finishes loading. So we can run
  our code directly, top to bottom.
*/

// Step 1: Decide the STARTING coordinates.
// Leaflet wants coordinates as a simple [latitude, longitude] array,
// NOT an object like Google Maps used ({ lat, lng }). Different
// libraries, different conventions - this is a "Leaflet-specific" detail.
const chinaCenter = [35.0, 105.0]; // roughly the middle of China
const shenyang = [41.8057, 123.4315];

// Step 2: Create the map.
// L.map(...) is Leaflet's version of `new google.maps.Map(...)`.
// "L" is the global object Leaflet's library creates - everything
// Leaflet gives us hangs off of it, similar to how Google Maps
// used the "google.maps" object.
//
// .setView(coordinates, zoom) tells it where to center and how
// zoomed in to start. zoom 4 is zoomed out far enough to see all
// of China at once; try changing it to 12 to see the difference.
const map = L.map("map").setView(chinaCenter, 4);

// Step 3: Add a "tile layer" - the actual map pictures.
// Leaflet is just an empty frame until you tell it where to pull
// map images ("tiles") from. Here we use OpenStreetMap's free,
// no-key-required tile server.
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  // OpenStreetMap is maintained by volunteers and requires this
  // attribution credit to be shown - similar to how Google requires
  // their logo to stay visible.
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Step 4: Grab the <p id="coords"> and <p id="address"> elements from
// index.html so we can update their text later. This is plain
// JavaScript/DOM, not Leaflet - the same technique works no matter
// which map library you use.
const coordsDisplay = document.getElementById("coords");
const addressDisplay = document.getElementById("address");

// Used by the hospital ranking feature (Step 10, near the end of this
// file). Declared up here, before anything runs, because goToLocation()
// (defined next) gets called once immediately below - these need to
// already exist at that moment, even though the hospital markers
// themselves aren't created until Step 10 runs a bit later.
const hospitalRankingList = document.getElementById("hospitalRanking");
let hospitalMarkers = []; // filled in by Step 10; empty for now

/*
  This function turns coordinates INTO an address - it's called
  "reverse geocoding" (a regular geocoder does the opposite: address
  -> coordinates). Drawing a map and looking up an address are two
  completely separate jobs, usually handled by two separate services,
  even though Google/Baidu bundle both under one company.

  Here we use Nominatim, OpenStreetMap's free, no-API-key reverse
  geocoding service. "async function" plus "await" just means:
  "this involves waiting for a reply over the internet - pause here
  until it arrives, without freezing the rest of the page."

  The second argument, onResult, is a CALLBACK FUNCTION - a function
  we pass in as data, which reverseGeocode will call once it actually
  has an answer (success or failure). This lets whoever calls
  reverseGeocode decide what to DO with the address text (update the
  page text, update a popup, both, etc) without this function needing
  to know anything about that.

  The third argument, updateSharedDisplay, defaults to true so every
  existing call to this function keeps behaving exactly like before.
  The new displacement calculator below looks up TWO addresses at
  once (User Location and Destination) - if both tried to write to
  the single shared <p id="address"> element at the same time, they'd
  overwrite each other and flicker. So the displacement calculator
  passes false here, and relies entirely on the onResult callback
  instead to put each address in its own marker's popup.
*/
async function reverseGeocode(lat, lng, onResult, updateSharedDisplay = true) {
  if (updateSharedDisplay) {
    addressDisplay.textContent = "Looking up address...";
  }

  // Build the request URL. format=json asks for a JSON response;
  // lat/lon are the coordinates we want turned into an address.
  // The trailing "&_=" with the current time is a "cache-buster" -
  // it makes each request's URL unique so neither the browser nor
  // Nominatim's own servers serve back a stale cached response.
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&_=${Date.now()}`;

  let addressText;
  try {
    // fetch() sends the actual request over the internet and waits
    // for a response - this is the same underlying browser feature
    // that would be used to talk to Baidu's geocoding API later.
    const response = await fetch(url);

    // response.ok is false for error statuses (404, 500, etc) - fetch()
    // does NOT treat those as errors by default, so we check manually.
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    // Nominatim returns a "display_name" field with a formatted,
    // human-readable address if it found one for these coordinates.
    addressText = data.display_name
      ? `Address: ${data.display_name}`
      : "Address: not found for this location.";
  } catch (error) {
    // Runs if the request fails entirely (no internet, CORS block,
    // etc). We print the actual error message on the page itself so
    // you can see what went wrong without needing to open the
    // browser's developer console.
    addressText = `Address lookup failed: ${error.message}`;
    console.error("Reverse geocoding failed:", error);
  }

  // Always update the text readout below the map (unless told not to)...
  if (updateSharedDisplay) {
    addressDisplay.textContent = addressText;
  }
  // ...and, if a callback was given, hand it the result too.
  if (onResult) {
    onResult(addressText);
  }
}

// Step 5: Create ONE marker to start with, sitting on Shenyang.
// We keep a reference to it in a variable (instead of just calling
// L.marker(...) and forgetting about it) because we're going to move
// this SAME marker around later, rather than creating a new one
// every time.
const marker = L.marker(shenyang).addTo(map);
marker.bindPopup("Shenyang, China (looking up address...)").openPopup();

/*
  Step 6: A SHARED "move the marker here" FUNCTION.

  Both the map-click feature AND the new coordinate-input-box feature
  below need to do the exact same set of steps: move the marker, show
  its coordinates, and look up its address. Instead of writing that
  logic twice, we write it ONCE here and have both features call it.
  This is a common programming habit - if you catch yourself about to
  copy-paste a block of code, it's usually a sign it should become a
  function instead.

  lat/lng: the coordinates to move to (plain numbers).
  sourceLabel: a short bit of text describing WHERE this location
    came from ("Last clicked location" vs "Location from input box"),
    just so the readout below the map is clearer about what happened.
  shouldRecenter: true/false - whether to also pan/zoom the map to
    this point. A map click already happened somewhere visible on
    screen, so it doesn't need recentering; typed-in coordinates could
    be anywhere in the world, so those DO need the map to jump there.
*/
function goToLocation(lat, lng, sourceLabel, shouldRecenter) {
  // L.latLng(...) builds the same kind of coordinate object Leaflet
  // gives us automatically from a map click (event.latlng) - we're
  // just constructing one ourselves this time, from our own numbers.
  const point = L.latLng(lat, lng);

  // Move our EXISTING marker to this spot, instead of creating a new
  // one - setLatLng() is Leaflet's way of repositioning something
  // that's already on the map.
  marker.setLatLng(point);

  // If asked to, pan/zoom the map so this point is actually visible -
  // map.setView(point, zoomLevel) is the same method we used to set
  // up the map's starting view back in Step 2.
  if (shouldRecenter) {
    map.setView(point, 12);
  }

  // Update the marker's popup text to show the exact coordinates
  // right away, and reopen it so it's visible without needing
  // another click. .toFixed(4) just trims the decimal to 4 digits
  // so it's readable. We add a second line saying the address is
  // still loading, since that lookup takes a moment over the network.
  const label = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
  marker.bindPopup(`${label}<br>Looking up address...`).openPopup();

  // Also update the plain text readout below the map (plain DOM,
  // no Leaflet involved) so the coordinates are visible even
  // without opening the popup.
  coordsDisplay.textContent = `${sourceLabel} - ${label}`;

  // Ask Nominatim to turn these coordinates into a readable address -
  // this is the SAME reverseGeocode() function from Step 4/the
  // click-on-map feature. We're not writing any new lookup logic
  // here, just calling the function that already exists, with a
  // callback that updates THIS marker's popup once the address
  // comes back.
  reverseGeocode(lat, lng, function (addressText) {
    marker.setPopupContent(`${label}<br>${addressText}`);
  });

  // Re-rank the hospitals list around this new location too - see
  // Step 10 below. This function is defined further down the file,
  // but that's fine: by the time goToLocation() actually RUNS (from
  // a click, a button, or the one call below), the whole file has
  // already finished loading top to bottom, so updateHospitalRanking
  // already exists as a real function by then.
  updateHospitalRanking(lat, lng);
}

// Run it once immediately for the starting Shenyang marker, so the
// popup and address line aren't stuck empty before anything happens.
// false = don't recenter, the map is already centered near here.
goToLocation(shenyang[0], shenyang[1], "Starting location", false);

/*
  Step 7: CLICK-ON-MAP (unchanged behavior, now reusing goToLocation).

  map.on("click", callback) tells Leaflet: "whenever the user clicks
  anywhere on the map, run this function for me." This is called an
  EVENT LISTENER - it doesn't run immediately, it just waits and
  reacts every time that event (a click) happens.

  Leaflet automatically figures out which real-world latitude/longitude
  was under the mouse when you clicked, and hands it to us as
  `event.latlng` - we don't have to do any of that math ourselves.
*/
map.on("click", function (event) {
  // event.latlng is an object like { lat: 39.9, lng: 116.4 }.
  // false = don't recenter - a click already happened somewhere
  // visible on screen, so there's nothing to pan/zoom to.
  goToLocation(event.latlng.lat, event.latlng.lng, "Last clicked location", false);
});

/*
  Step 8: THE NEW COORDINATE INPUT BOX.

  This is the new feature: type a latitude/longitude and click a
  button instead of clicking the map.
*/

// Grab the three new elements from index.html.
const latInput = document.getElementById("latInput");
const lngInput = document.getElementById("lngInput");
const goButton = document.getElementById("goButton");
const inputStatus = document.getElementById("inputStatus");

/*
  A small helper that checks one input box's text and turns it into a
  valid coordinate number, or returns null if it isn't one.

  WHY CONVERT FROM TEXT TO A NUMBER AT ALL?
  Every HTML <input>, no matter what you typed into it, stores its
  contents as plain TEXT in `.value` - even if it looks like a number
  on screen. Typing "41.8057" into a box gives you the STRING
  "41.8057", not the number 41.8057. Strings and numbers behave very
  differently in JavaScript (e.g. "41" + "1" gives you "411", not 42),
  so before we can use the input as a real coordinate - to compare it,
  do math with it, or hand it to Leaflet - we have to explicitly
  convert it. Number(someString) does that conversion.

  WHY VALIDATE?
  A real latitude must be between -90 and 90 (the poles), and a real
  longitude between -180 and 180 (all the way around the globe).
  Someone could type nothing, type letters, or type a wildly out-of-
  range number - we check for all of that BEFORE trying to move the
  marker, so we fail with a clear message instead of a broken map.
*/
function parseCoordinate(text, min, max) {
  const trimmed = text.trim(); // remove accidental leading/trailing spaces
  if (trimmed === "") {
    return null; // nothing was typed
  }

  const value = Number(trimmed);

  // Number.isNaN checks for "Not a Number" - what you get back from
  // Number(...) when the text couldn't be converted at all (e.g. "abc").
  if (Number.isNaN(value)) {
    return null;
  }

  // Out of the valid real-world range for this kind of coordinate.
  if (value < min || value > max) {
    return null;
  }

  return value;
}

/*
  HOW THE BUTTON CLICK EVENT WORKS:
  goButton.addEventListener("click", callback) is the exact same
  pattern as map.on("click", callback) from Step 7 - it's just a
  regular HTML button instead of a Leaflet map, so we use the
  browser's own addEventListener() method instead of Leaflet's .on().
  Same idea either way: "wait, and run this function every time this
  element is clicked."
*/
goButton.addEventListener("click", function () {
  // .value reads whatever text is CURRENTLY typed into each box at
  // the moment of the click - it's always read fresh, not just once
  // when the page loaded.
  const lat = parseCoordinate(latInput.value, -90, 90);
  const lng = parseCoordinate(lngInput.value, -180, 180);

  // If either one failed to parse/validate, show a message and stop
  // here (the "return" exits the function early) instead of trying
  // to move the marker to an invalid location.
  if (lat === null || lng === null) {
    inputStatus.textContent =
      "Please enter a valid latitude (-90 to 90) and longitude (-180 to 180).";
    return;
  }

  // Clear any old error message now that we have valid input.
  inputStatus.textContent = "";

  // Reuse the exact same function the map-click feature uses - this
  // is the "turn input coordinates into a Leaflet location" step:
  // goToLocation() itself calls L.latLng(lat, lng) internally.
  // true = DO recenter the map, since a typed coordinate could be
  // anywhere in the world, off-screen from the current view.
  goToLocation(lat, lng, "Location from input box", true);
});

/*
  That's the whole interactive example now. There are THREE ways to
  move the marker, and all three end up calling the SAME goToLocation()
  function (which itself calls the SAME reverseGeocode() function):
    1. The page loads and places it on Shenyang automatically.
    2. Clicking anywhere on the map moves it there.
    3. Typing coordinates and clicking "Go to Location" moves it there.

  This "click on the map OR type coordinates, either way it flows
  through the same code" pattern is exactly what a real feature like
  "set a hospital's location" would use - a real app would usually
  offer both options.
*/

/*
  ============================================================
  Step 9: DISPLACEMENT CALCULATOR (User Location -> Destination)
  ============================================================

  This is a separate, independent feature from everything above - it
  has its OWN two markers and does not touch the single `marker`
  variable used by the click/input-box feature. It reuses the
  reverseGeocode() function from Step 4, and the same
  parseCoordinate() validation helper from Step 8, instead of
  duplicating that logic.

  The physics connection: think of "User Location" as an initial
  position and "Destination" as a final position. The straight line
  we draw between them is the DISPLACEMENT VECTOR, and the distance
  we calculate is that vector's MAGNITUDE - "how far apart are these
  two points, in a straight line" - not the length of any road route
  between them.
*/

// Grab the new elements from index.html.
const userLatInput = document.getElementById("userLatInput");
const userLngInput = document.getElementById("userLngInput");
const destLatInput = document.getElementById("destLatInput");
const destLngInput = document.getElementById("destLngInput");
const calcButton = document.getElementById("calcButton");
const displacementStatus = document.getElementById("displacementStatus");
const distanceResult = document.getElementById("distanceResult");

// These start as `null` (meaning "doesn't exist yet"). We'll create
// the real marker/line objects the FIRST time the button is clicked,
// then just move/update those same objects on every click after
// that - never creating extras.
let userMarker = null;
let destinationMarker = null;
let displacementLine = null;

/*
  A small helper that builds a colored circle icon using L.divIcon -
  a Leaflet icon made out of a tiny bit of HTML/CSS instead of an
  image file. This lets us color the two markers differently (so
  "User Location" and "Destination" are visually distinct) without
  needing to download any extra image assets.
*/
function makeColoredDot(color) {
  return L.divIcon({
    className: "", // prevents Leaflet's default icon styling from interfering
    html: `<div class="marker-dot" style="background:${color}; width:16px; height:16px;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8], // centers the dot exactly on the coordinate
  });
}

/*
  HOW THE TWO MARKERS ARE STORED SEPARATELY:
  This function is called once for the user marker and once for the
  destination marker, each time with its OWN variable (userMarker or
  destinationMarker) passed in as `existingMarker`. Because they're
  two completely separate variables, moving one never affects the
  other - they're independent objects, just built by the same
  reusable function (the same "write it once, call it twice" idea as
  goToLocation() being reused by both the map click and the input box).

  If existingMarker is null (first time), we CREATE a brand new
  marker with a permanent label and colored dot, and return it. If it
  already exists, we just reposition it with setLatLng() and return
  the SAME object - so clicking "Calculate Displacement" again moves
  the existing pins instead of stacking up new ones.
*/
function placeOrMoveMarker(existingMarker, point, color, label) {
  if (existingMarker) {
    existingMarker.setLatLng(point);
    return existingMarker;
  }

  return L.marker(point, { icon: makeColoredDot(color) })
    .addTo(map)
    // A "permanent" tooltip stays visible at all times (not just on
    // hover) - this is how "User Location" / "Destination" stay
    // labeled on the map at a glance.
    .bindTooltip(label, { permanent: true, direction: "top", offset: [0, -10] })
    .bindPopup("Looking up address...");
}

/*
  THE HAVERSINE FORMULA, explained in beginner terms:

  You might expect distance between two lat/lng points to just be
  sqrt((x2-x1)^2 + (y2-y1)^2) - the everyday flat-ruler distance
  formula from geometry class. That formula only works on a FLAT
  plane, though, and the Earth's surface is curved (a sphere, roughly
  speaking). Latitude and longitude are angles on that sphere, not
  flat x/y positions, so plugging them straight into the flat formula
  gives a wrong (and, at real-world scale, very wrong) answer.

  The Haversine formula instead calculates the "great-circle
  distance" - the shortest path between two points ALONG the curved
  surface of a sphere - using trigonometry (sine, cosine) on the
  angles involved, plus the sphere's radius. In plain terms: it's the
  proper version of "straight-line distance" for a round planet.

  Step by step, what the code below does:
    1. Convert both points' latitude/longitude from degrees to
       radians - trig functions like Math.sin/Math.cos expect radians,
       not degrees, in JavaScript.
    2. Find the difference in latitude and longitude between the two
       points (how far apart they are, angle-wise).
    3. Plug those differences into the Haversine formula (a standard,
       well-known equation - we're using it, not deriving it).
    4. Multiply the result by Earth's average radius (about 6,371 km)
       to convert from "an angle around the sphere" into an actual
       real-world distance - this is where "kilometers" comes from.
*/
function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371; // Earth's average radius, a well-known constant

  // Trig functions need radians, not degrees - this converts.
  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  // The Haversine formula itself - a standard equation for
  // great-circle distance. `a` represents the square of half the
  // straight-line chord distance between the points, expressed as an
  // angle; `c` converts that into the actual angular distance.
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Angular distance * Earth's radius = real-world distance in the
  // same unit as the radius we used (kilometers, since we used 6371).
  return earthRadiusKm * c;
}

/*
  HOW THE BUTTON CLICK EVENT WORKS (same pattern as Step 8's button):
  calcButton.addEventListener("click", callback) waits for a click on
  this specific button, then runs everything below.
*/
calcButton.addEventListener("click", function () {
  // HOW THE FOUR COORDINATE INPUTS ARE READ:
  // Same as Step 8 - each input's .value is read as text and passed
  // through parseCoordinate() (already defined above), which
  // converts it to a number AND validates it's a real coordinate,
  // reusing that exact function instead of writing new parsing logic.
  const userLat = parseCoordinate(userLatInput.value, -90, 90);
  const userLng = parseCoordinate(userLngInput.value, -180, 180);
  const destLat = parseCoordinate(destLatInput.value, -90, 90);
  const destLng = parseCoordinate(destLngInput.value, -180, 180);

  if (userLat === null || userLng === null || destLat === null || destLng === null) {
    displacementStatus.textContent =
      "Please enter valid coordinates for both User Location and Destination " +
      "(latitude -90 to 90, longitude -180 to 180).";
    return; // stop here - don't try to plot an invalid location
  }
  displacementStatus.textContent = "";

  // Build proper Leaflet coordinate objects from our plain numbers -
  // same L.latLng() technique used by goToLocation() in Step 6.
  const userPoint = L.latLng(userLat, userLng);
  const destPoint = L.latLng(destLat, destLng);

  // Place (first time) or move (every time after) each marker.
  // Notice these two lines never interfere with each other - each
  // reads and writes only its own variable.
  userMarker = placeOrMoveMarker(userMarker, userPoint, "#2b7de9", "User Location");
  destinationMarker = placeOrMoveMarker(destinationMarker, destPoint, "#e9412b", "Destination");

  /*
    HOW L.polyline() CREATES THE LINE, AND HOW IT'S UPDATED RATHER
    THAN CREATING UNLIMITED NEW LINES:
    L.polyline(arrayOfPoints, options) draws a line connecting a list
    of coordinates in order - with just two points, that's a single
    straight segment, which is exactly our displacement vector.

    Just like the markers above, we check whether displacementLine
    already exists. If it does, setLatLngs() replaces its points
    (moving the SAME line instead of drawing a new one on top of the
    old one). If it doesn't exist yet, we create it once and save it
    into the shared `displacementLine` variable so future clicks reuse it.
  */
  if (displacementLine) {
    displacementLine.setLatLngs([userPoint, destPoint]);
  } else {
    displacementLine = L.polyline([userPoint, destPoint], {
      color: "#8e44ad",
      weight: 3,
      dashArray: "6 8", // dashed, to visually read as "straight-line distance", not a road route
    }).addTo(map);
  }

  /*
    HOW THE MAP IS ADJUSTED TO SHOW BOTH POINTS:
    displacementLine.getBounds() returns the smallest rectangle that
    contains every point on the line (here, just our two markers).
    map.fitBounds(...) then pans/zooms the map so that entire
    rectangle is visible on screen - `padding` adds some breathing
    room around the edges so the markers/tooltips aren't cut off.
  */
  map.fitBounds(displacementLine.getBounds(), { padding: [50, 50] });

  /*
    HOW KILOMETERS ARE CALCULATED:
    Just call the haversineDistanceKm() function defined above with
    our four raw numbers - it does all the trigonometry internally
    and returns a plain number of kilometers, which we then format
    for display with .toFixed(2) (2 decimal places).
  */
  const distanceKm = haversineDistanceKm(userLat, userLng, destLat, destLng);
  distanceResult.innerHTML =
    `<strong>Displacement magnitude:</strong> ${distanceKm.toFixed(2)} km ` +
    `(straight-line distance - not a driving route)`;

  /*
    HOW REVERSE-GEOCODING IS REUSED FOR BOTH POINTS:
    We call the SAME reverseGeocode() function from Step 4 twice -
    once per point - with `false` as the 4th argument so neither call
    fights over the single shared #address paragraph (see the comment
    on reverseGeocode() itself for why). Each call's own callback
    updates only that marker's own popup once its address comes back,
    which is why the two addresses never get mixed up even though
    both requests are in flight over the network at the same time.
  */
  reverseGeocode(
    userLat,
    userLng,
    function (addressText) {
      userMarker.setPopupContent(
        `<strong>User Location</strong><br>Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)}<br>${addressText}`
      );
    },
    false
  );
  reverseGeocode(
    destLat,
    destLng,
    function (addressText) {
      destinationMarker.setPopupContent(
        `<strong>Destination</strong><br>Lat: ${destLat.toFixed(4)}, Lng: ${destLng.toFixed(4)}<br>${addressText}`
      );
    },
    false
  );
});

/*
  That's the displacement calculator:
    - two independent markers (User Location, Destination), each
      reusing the same placeOrMoveMarker() helper
    - a single reusable polyline connecting them (the displacement
      vector)
    - the map auto-adjusts to fit both points
    - haversineDistanceKm() calculates the vector's magnitude, in km
    - reverseGeocode() (unchanged from Step 4) is called twice to
      label each point with a real address

  Physics connection recap:
    User Location (initial position) -> Destination (final position)
    -> the drawn line (displacement vector) -> distanceKm (magnitude
    of displacement) - a straight-line "as the crow flies" answer,
    deliberately NOT a driving distance along roads.
*/

/*
  ============================================================
  Step 10: RANK HOSPITALS BY PROXIMITY (using hospitals.js)
  ============================================================

  This is where hospitals.js and this file connect. hospitals.js
  declared one global variable, `hospitals` - a plain array of
  objects. Because it was loaded (via <script src="hospitals.js">)
  BEFORE this file in index.html, that variable already exists by
  the time any code here runs, so we can just use it directly - no
  import, no fetch, nothing special.

  This feature reuses THREE things that already exist, rather than
  writing anything new for them:
    - haversineDistanceKm() from Step 9, for the actual distance math
    - makeColoredDot() from Step 9, for a marker icon
    - the single `marker` from Step 5-8 as "the user's location" -
      every time it moves (click, or the coordinate box), the ranking
      below is asked to refresh itself (see the end of goToLocation()).
*/

// One marker per hospital, created once below. hospitalMarkers[i]
// is always the Leaflet marker for hospitals[i] - same index, two
// parallel arrays - so we can look up "which marker goes with this
// ranked hospital" without needing to search or compare objects.
function createHospitalMarkers() {
    hospitals.forEach(function (hospital, index) {
        const point = L.latLng(hospital.latitude, hospital.longitude);
        hospitalMarkers[index] = L.marker(point, { icon: makeColoredDot("#16a34a") })
            .addTo(map)
            .bindPopup(hospital.name);
    });
}
createHospitalMarkers();

/*
  Takes the user's current location and:
    1. Calculates every hospital's distance from it (haversineDistanceKm,
       reused from Step 9 - no new distance math written here).
    2. Sorts that list nearest-first.
    3. Hands the sorted list to two small render functions below - one
       for the on-page list, one for the map markers' popups.

  We attach `index` to each entry (hospitals[index] is the original
  hospital, hospitalMarkers[index] is its marker) BEFORE sorting, so
  after .sort() shuffles the order, we can still find the right
  marker for each hospital.
*/
function updateHospitalRanking(userLat, userLng) {
    const ranked = hospitals
        .map(function (hospital, index) {
            return {
                hospital: hospital,
                index: index,
                distanceKm: haversineDistanceKm(
                    userLat,
                    userLng,
                    hospital.latitude,
                    hospital.longitude
                ),
            };
        })
        .sort(function (a, b) {
            return a.distanceKm - b.distanceKm;
        });

    renderHospitalRankingList(ranked);
    updateHospitalMarkerPopups(ranked);
}

// Rebuilds the <ol id="hospitalRanking"> list from scratch every time -
// simplest approach for a list this small: clear it out, then add one
// <li> per hospital in the (already sorted) order given.
function renderHospitalRankingList(ranked) {
    hospitalRankingList.innerHTML = "";
    ranked.forEach(function (entry) {
        const item = document.createElement("li");
        item.textContent = `${entry.hospital.name} — ${entry.distanceKm.toFixed(1)} km`;
        hospitalRankingList.appendChild(item);
    });
}

// Updates each hospital marker's popup to show its rank and distance.
// entry.index is how we find the matching marker in hospitalMarkers -
// see the comment above createHospitalMarkers() for why that works.
function updateHospitalMarkerPopups(ranked) {
    ranked.forEach(function (entry, rankPosition) {
        const hospitalMarker = hospitalMarkers[entry.index];
        if (!hospitalMarker) return; // markers not created yet - nothing to update
        hospitalMarker.setPopupContent(
            `#${rankPosition + 1} nearest — ${entry.hospital.name}<br>${entry.distanceKm.toFixed(1)} km away`
        );
    });
}

// The very first updateHospitalRanking() call (triggered by the initial
// goToLocation() call near the top of this file) ran before the hospital
// markers above existed, so their popups never got distance labels.
// Now that createHospitalMarkers() has run, refresh the ranking once
// more, using wherever the marker currently is.
updateHospitalRanking(marker.getLatLng().lat, marker.getLatLng().lng);

/*
  That's hospital ranking:
    - hospitals.js provides the data (a plain array of objects)
    - this file provides the behavior: place a marker per hospital,
      calculate every hospital's distance from the user's current
      location, sort nearest-first, and display that both as a list
      and as updated marker popups
    - it reuses goToLocation(), haversineDistanceKm(), and
      makeColoredDot() instead of writing new versions of any of them
*/
