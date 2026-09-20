# Shenyang Hospital Navigation Prototype

A self-contained, browser-only prototype for finding and navigating to
hospitals in Shenyang, China. This is a **standalone copy**, separate from
the rest of the larger mental-health project — it doesn't depend on, or
modify, anything else in the repository.

## What this prototype does

- Displays an interactive map of Shenyang with a set of real hospital
  locations plotted on it.
- Lets you set "your location" three ways: clicking anywhere on the map,
  sharing your device's GPS location, or typing an address/coordinates
  directly.
- Ranks every hospital by distance from that location, nearest first, and
  updates live as you move the location marker.
- Lets you pick a hospital from the ranked list to see it as a second
  marker on the map, connected to your location by a line showing the
  straight-line displacement between the two points, along with the
  distance in kilometers.
- Reverse-geocodes locations (turns coordinates into a readable address)
  for both your picked location and, where available, hospital markers.

## Scope and important caveats

- **Currently focuses on Shenyang only.** The map, hospital data, and
  default view are all centered on Shenyang; it is not a general-purpose
  hospital finder for other cities.
- **Mapping is provided by [Leaflet](https://leafletjs.com/) +
  [OpenStreetMap](https://www.openstreetmap.org/)** — a free, open-source
  map library and open map data, requiring no API key or account. Address
  lookups use OpenStreetMap's free Nominatim geocoding service.
- **All hospital distances are straight-line ("as the crow flies")
  distances**, calculated with the Haversine formula — they are **not**
  driving distances or routed directions along actual roads. A hospital
  that appears close in a straight line may be considerably farther by
  any real route.
- **This tool is non-diagnostic.** It does not assess, diagnose, or make
  any claim about a user's health or mental health condition. It is
  purely a navigation/lookup aid for browsing hospital locations.
- **Hospital and service information is still prototype data.** Names and
  coordinates were entered manually and are believed accurate, but
  addresses, departments, phone numbers, and services are largely
  placeholder or incomplete, and should be independently verified against
  official sources before being relied upon or presented as authoritative.

## How to run it locally

No installation, build step, or account is required — this is plain
HTML, CSS, and JavaScript.

1. Make sure you have internet access (the map tiles, geocoding, and the
   Leaflet library itself all load over the network at runtime — see
   "Dependencies" below).
2. Open `index.html` directly in a web browser (e.g., double-click it), **or**
   serve the folder with any simple local static file server for a more
   realistic setup, for example:
   ```
   cd shenyang_hospital_navigation_prototype
   python3 -m http.server 8000
   ```
   then visit `http://localhost:8000/index.html` in your browser.
3. The map should load centered on Shenyang. Click anywhere on the map,
   use "Use my location," or type an address/coordinates to try it out.

### Dependencies

- **Local files** (included in this folder — see below): `index.html`,
  `style.css`, `script.js`, `hospitals.js`.
- **Leaflet 1.9.4** (map library): loaded from the `unpkg.com` CDN via a
  `<script>`/`<link>` tag in `index.html` — not bundled locally, requires
  internet access.
- **OpenStreetMap tile server** and **Nominatim geocoding service**: called
  live over the network by `script.js` for map imagery and address
  lookups — also requires internet access. No API key needed for either.

## Files in this folder

| File | Purpose |
|---|---|
| `index.html` | Page entry point — structure, and where the Leaflet CDN link is loaded from |
| `style.css` | All visual styling |
| `script.js` | All map/UI logic — creating the map, markers, click handling, distance ranking, geocoding |
| `hospitals.js` | Hospital data (name, coordinates, type, services, etc.) — loaded before `script.js` so its data is available when the app runs |

This is a copy of the working prototype previously developed under
`0_map_api_example/leaflet-displacement-calculator/` in this repository,
prepared as an independent, ready-to-publish folder.
