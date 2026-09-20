# Leaflet Map + Displacement Calculator (No API Key Needed)

A self-contained, reusable example built with **Leaflet** (a free JavaScript
map library) and **OpenStreetMap** (free map data). No API key, no account,
no credit card needed — just open [index.html](index.html) in a browser.

Keep this folder around as a reference/starting point for future projects:
it already has a working map, marker placement (by click or typed
coordinates), reverse geocoding (coordinates → address), and a straight-line
"displacement" calculator between two points.

## What's in this example

1. **A basic map**, centered to show all of China, with one marker.
2. **Click anywhere on the map** to move that marker there — its popup shows
   the coordinates, then updates a moment later with the human-readable
   address once a lookup finishes.
3. **A coordinate input box** (Latitude/Longitude + "Go to Location" button)
   as an alternative to clicking — same marker, same address lookup, just
   triggered by typed numbers instead of a click.
4. **A Displacement Calculator**: enter a "User Location" and a
   "Destination" (each its own lat/lng pair) and click "Calculate
   Displacement." This places two distinctly colored, labeled markers,
   connects them with a straight dashed line, auto-fits the map to show
   both, and calculates the straight-line distance between them in
   kilometers using the **Haversine formula** — deliberately *not* a driving
   route. Framed as the physics idea: *initial position → final position →
   displacement vector → magnitude of displacement.*

Read through [script.js](script.js) — it's heavily commented, numbered
"Step 1" through "Step 9," explaining every function and why it's written
the way it is (including the Haversine math, the reverse-geocoding callback
pattern, and why marker/line objects are reused instead of duplicated).

## Why no API key here?

Leaflet is free, open-source software, and OpenStreetMap is a nonprofit,
volunteer-run, open-data project (think "Wikipedia for maps"). Anyone can use
its map tiles for free, with no key, no account, and no billing — the only
requirement is showing an attribution credit ("© OpenStreetMap contributors"),
which you'll see in a corner of the map.

This isn't just a "beginner" stand-in for a commercial map API — plenty of
real production apps use Leaflet + OpenStreetMap permanently, precisely
because of this.

## Reverse geocoding (coordinates → address)

Drawing a map and looking up an address are **two separate jobs**:

- **Forward geocoding**: address → coordinates ("123 Main St" → `{lat, lng}`)
- **Reverse geocoding**: coordinates → address (`{lat, lng}` → "123 Main St")

This example uses [Nominatim](https://nominatim.org/), OpenStreetMap's free
reverse-geocoding service — see the `reverseGeocode()` function in
[script.js](script.js). No API key, same as the map tiles.

**Good to know if you reuse this beyond a tutorial:**
- Its [usage policy](https://operations.osmfoundation.org/policies/nominatim/)
  caps the free public server at ~1 request/second and asks that you not
  build a high-traffic production app directly against it — fine for
  learning and even a small real app, but a busy production app should look
  at a paid geocoder or self-hosting Nominatim.
- Address data quality varies by region since it's crowd-sourced (like
  Wikipedia) — dense city addresses tend to resolve well; don't assume every
  rural coordinate will.

## If you later want a China-specific map provider

Leaflet + OpenStreetMap (used here) works worldwide, including all of China,
for free. If you later want richer Chinese road/address/POI detail, the
realistic options are:

| Option | Key required? | Cost/account | Best for |
|---|---|---|---|
| **Leaflet + OpenStreetMap** (this example) | No | Nothing — fully free, no account | Prototypes, general use, anywhere you don't need China-specific detail |
| **AMap (Gaode Maps, 高德地图)** | Yes ("key") | Free tier, sign up with a Chinese phone number — no credit card | Very detailed Chinese roads/POIs/traffic |
| **Baidu Maps** | Yes ("AK") | Free tier, sign up with a phone number/Baidu account — no credit card | Similar to AMap; strong for China-specific navigation |
| **Tianditu (天地图)** | Yes | Free, China's official state mapping service | Authoritative/government base map data for China |
| **Google Maps** | Yes | Free tier, but requires a credit card | Blocked inside mainland China — not usable there |

Worth knowing ahead of time: AMap, Baidu, and Tianditu all use **GCJ-02 or
BD-09** coordinate systems (deliberately shifted from real GPS coordinates,
a China-specific regulation), while OpenStreetMap/Leaflet and plain GPS use
unshifted **WGS-84**. Coordinates that look correct here can land visibly
offset (streets shifted ~100-700m) if plugged directly into Baidu or AMap —
a well-documented, solvable conversion step, just good to know exists.

## How to open this example

No key, no setup needed:

1. Double-click [index.html](index.html), or open it with VS Code's
   "Live Server" extension (or any local static file server).
2. You should see a map of China with a marker on Shenyang. Click anywhere,
   type coordinates, or try the Displacement Calculator.
