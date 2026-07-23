import type { Checklist } from "../content-types";

// Realistic Cessna 172 Skyhawk checklists for training use.
// Values are drawn from the Cessna 172S Pilot's Operating Handbook conventions
// commonly used in flight training. These are training aids, not a substitute
// for the official POH for the specific aircraft you fly.

export const checklists: Checklist[] = [
  {
    id: "c172-before-start",
    title: "C172 Before Start",
    aircraft: "Cessna 172 Skyhawk",
    description:
      "From arrival at the aircraft through cockpit setup, ending just before engine start. Includes the exterior walk-around.",
    sections: [
      {
        name: "Pre-Flight Inspection — Cabin",
        items: [
          { text: "Documents on board", detail: "ARROW: Airworthiness, Registration, Radio station license (if IFR/international), Operating handbook, Weight & balance data" },
          { text: "Control wheel lock — REMOVE", detail: "Stow it in the door pocket, not on the floor" },
          { text: "Ignition switch — OFF", detail: "Verify key is out before touching the prop" },
          { text: "Avionics master switch — OFF", detail: "Protects avionics from voltage spikes during start" },
          { text: "Fuel selector valve — check BOTH, then back to OFF", detail: "Confirm detent feel and that the valve turns freely" },
        ],
      },
      {
        name: "Pre-Flight Inspection — Empennage (Tail)",
        items: [
          { text: "Horizontal stabilizer and elevator — CHECK", detail: "Free movement, no damage, no ice or frost" },
          { text: "Vertical stabilizer and rudder — CHECK", detail: "Free movement, secure, hinges intact" },
          { text: "Tail tie-down — REMOVE", detail: "Stow in cabin; verify rope or chain is free" },
          { text: "Rudder cables and fairleads — CHECK", detail: "Visible at the tail if accessible" },
          { text: "Beacon — CHECK", detail: "Visually confirm lens is intact; operation checked later" },
        ],
      },
      {
        name: "Pre-Flight Inspection — Right Wing",
        items: [
          { text: "Right aileron — CHECK", detail: "Free movement up and down, no binding" },
          { text: "Right flap — CHECK", detail: "Secure, no play, hinges intact" },
          { text: "Right wing tie-down — REMOVE" },
          { text: "Right main fuel sump — DRAIN", detail: "Check for water, debris, correct fuel color (100LL is blue). Return to closed" },
          { text: "Right fuel tank — CHECK quantity visually", detail: "Do not trust the gauge alone — look in the tank" },
          { text: "Right fuel cap — SECURE and sealed" },
          { text: "Right main tire — CHECK", detail: "Pressure, tread, no bald spots, no flat spots" },
          { text: "Right brake assembly — CHECK", detail: "No fluid leaks, brake pads present" },
        ],
      },
      {
        name: "Pre-Flight Inspection — Nose",
        items: [
          { text: "Engine oil level — CHECK", detail: "6-8 quarts typical for a C172S; minimum is 5 quarts for flight. Check with the dipstick" },
          { text: "Propeller and spinner — CHECK", detail: "No nicks, cracks, or oil splatter; rotate by hand only if ignition is OFF and verified" },
          { text: "Air inlets and alternator belt — CHECK", detail: "Clear of debris, belt tension normal" },
          { text: "Fuel strainer (gascolator) — DRAIN", detail: "Check for water and contaminants; close securely" },
          { text: "Nose wheel and strut — CHECK", detail: "Tire pressure, strut extension visible (a few inches), no fluid leaks" },
          { text: "Landing/taxi light — CHECK lens intact" },
          { text: "Engine cowling — secure, no fasteners missing" },
        ],
      },
      {
        name: "Pre-Flight Inspection — Left Wing",
        items: [
          { text: "Pitot tube — REMOVE cover", detail: "Confirm the hole is clear, no insect nests" },
          { text: "Stall warning vent — CHECK", detail: "Cover the hole with your mouth and suck lightly; the horn should sound in the cabin" },
          { text: "Left main fuel sump — DRAIN", detail: "Check for water, debris, correct fuel color (100LL is blue)" },
          { text: "Left fuel tank — CHECK quantity visually" },
          { text: "Left fuel cap — SECURE and sealed" },
          { text: "Left wing tie-down — REMOVE" },
          { text: "Left flap — CHECK", detail: "Secure, no play" },
          { text: "Left aileron — CHECK", detail: "Free movement, no binding" },
          { text: "Left main tire and brake — CHECK", detail: "Pressure, tread, no leaks" },
        ],
      },
      {
        name: "Pre-Flight Inspection — Final",
        items: [
          { text: "Windshield — CLEAN", detail: "Bug strikes and haze hide traffic; clean from outside with proper cleaner" },
          { text: "Baggage door — SECURE and locked" },
          { text: "Cabin doors — CHECK hinges and latches" },
        ],
      },
      {
        name: "Before Starting Engine — Cockpit Setup",
        items: [
          { text: "Seats and seatbelts — ADJUST and SECURE", detail: "Full travel check on the seat rails; lock confirmed" },
          { text: "Doors — CLOSED and LATCHED", detail: "Visually check the latch pin is engaged" },
          { text: "Flight controls — FULL and FREE", detail: "Move yoke through full range; confirm correct deflection (pull back, elevator goes up)" },
          { text: "Fuel selector valve — BOTH", detail: "The most important 'BOTH' you'll say all day" },
          { text: "Avionics master switch — OFF", detail: "Still off; do not power radios before engine start" },
          { text: "Auto-pilot — OFF" },
          { text: "Mixture — RICH", detail: "Full forward for sea-level start; lean only if density altitude is very high" },
          { text: "Throttle — OPEN 1/4 inch", detail: "Just a crack; too much floods the engine" },
          { text: "Brakes — SET and TEST", detail: "Pump the pedals, hold pressure, confirm parking brake engaged" },
          { text: "Circuit breakers — CHECK all IN" },
          { text: "Exterior — CLEAR", detail: "Visually confirm no one near prop; call 'CLEAR PROP' loudly before start" },
        ],
      },
    ],
  },
  {
    id: "c172-before-takeoff",
    title: "C172 Before Takeoff",
    aircraft: "Cessna 172 Skyhawk",
    description:
      "Runup, systems check, and takeoff briefing. Performed at the runup area or hold-short line, before taxiing onto the active runway.",
    sections: [
      {
        name: "Before Takeoff — Cockpit",
        items: [
          { text: "Position — nose into the wind for runup", detail: "Helps engine cooling and gives accurate readings" },
          { text: "Doors and windows — CLOSED and LATCHED" },
          { text: "Seats and seatbelts — SECURE" },
          { text: "Flight controls — FREE and CORRECT", detail: "One last confirmation of correct deflection" },
          { text: "Fuel selector valve — BOTH" },
        ],
      },
      {
        name: "Engine Runup",
        items: [
          { text: "Brakes — HOLD", detail: "Heels on the brakes, parking brake as backup. The airplane will try to move" },
          { text: "Throttle — 1800 RPM", detail: "Smooth pull to 1800; wait for instruments to stabilize" },
          { text: "Oil pressure and temperature — IN THE GREEN", detail: "Oil pressure should rise within 30 seconds of start" },
          { text: "Vacuum (suction) gauge — 4.5 to 5.5 in Hg", detail: "Powers the attitude and heading indicators" },
          { text: "Ammeter — CHECK", detail: "Positive charge with low load; not pegged high or showing discharge" },
          { text: "Magnetos — check RIGHT, then LEFT, then BOTH", detail: "Note RPM drop on each; max drop 175 RPM, max difference between mags 50 RPM. Smooth drop = healthy" },
          { text: "Vacuum gauge — RECHECK in the green" },
          { text: "Engine instruments — ALL IN GREEN" },
          { text: "Carburetor heat — ON, note RPM drop, then OFF", detail: "Brief drop confirms it's working; ice would be invisible otherwise" },
          { text: "Throttle — 1000 RPM", detail: "Return to idle area; do not slam shut" },
        ],
      },
      {
        name: "Pre-Takeoff — Systems & Instruments",
        items: [
          { text: "Flight instruments — SET and CROSS-CHECK", detail: "Altimeter set to field elevation or local altimeter; attitude indicator erect; heading indicator aligned to compass within 5°" },
          { text: "Pitot heat — CHECK ON, then OFF", detail: "Brief check; ammeter should flicker when it draws current" },
          { text: "Avionics master — ON" },
          { text: "Radios — TUNED and CONFIRMED", detail: "ATIS or AWOS received, ground/tower frequency set" },
          { text: "Transponder — set to ALT (Mode C) on the runway", detail: "Don't squawk ALT until you're cleared for takeoff; some schools set it on the roll" },
          { text: "Trim — SET for takeoff", detail: "Takeoff trim position; usually neutral for the C172" },
          { text: "Mixture — RICH", detail: "Unless density altitude is high; lean for climb only per POH" },
          { text: "Fuel selector valve — BOTH" },
          { text: "Flaps — SET for takeoff (0° or 10°)", detail: "0° (up) for a normal takeoff; 10° for short-field or soft-field" },
          { text: "Circuit breakers — CHECK all IN" },
          { text: "Hatch and window — CLOSED and LATCHED" },
        ],
      },
      {
        name: "Takeoff Briefing (say it out loud)",
        items: [
          { text: "Runway — CONFIRM number and heading", detail: "Read the painted number; verify against heading indicator" },
          { text: "Wind — DIRECTION and SPEED", detail: "Confirm headwind component; note any crosswind" },
          { text: "Takeoff roll", detail: "Throttle full, smooth; engine gauges in green by 1000 RPM; rotate at 55 KIAS" },
          { text: "Climb — 75 KIAS initially, 73 KIAS best climb", detail: "Pitch for airspeed, not altitude" },
          { text: "Departure path — STATE the intended ground track", detail: "E.g., 'straight out, climbing runway heading to 1500 before any turns'" },
          { text: "Engine failure plan", detail: "Below 800 AGL: land straight ahead, no turns back. Above 800 AGL: pick a field within 60° of the nose" },
          { text: "Announce: 'Takeoff brief complete'", detail: "Verbal close-out so both pilots know the brief is done" },
        ],
      },
    ],
  },
  {
    id: "c172-before-landing",
    title: "C172 Before Landing",
    aircraft: "Cessna 172 Skyhawk",
    description:
      "The pre-landing flow, started on downwind and continued through final approach. Carburetor heat matters on every power reduction in the C172.",
    sections: [
      {
        name: "Pre-Landing — Downwind Leg (abeam the numbers)",
        items: [
          { text: "Seats and seatbelts — SECURE" },
          { text: "Fuel selector valve — BOTH" },
          { text: "Mixture — RICH", detail: "Full rich for landing; you'll want full power available for a go-around" },
          { text: "Carburetor heat — ON", detail: "Apply BEFORE reducing throttle; the RPM rise when you turn it on is the cue it's working" },
          { text: "Throttle — REDUCE to ~1500 RPM", detail: "Begin the descent; this is your baseline power for the pattern" },
          { text: "Airspeed — 75-85 KIAS on downwind", detail: "Trim for the airspeed; a well-trimmed airplane lands itself" },
          { text: "Flaps — 10° when below 110 KIAS", detail: "First notch abeam the numbers or when ready to descend" },
          { text: "Landing checklist — COMPLETE below 1000 AGL" },
        ],
      },
      {
        name: "Approach — Base to Final",
        items: [
          { text: "Flaps — 20° on base", detail: "Below 110 KIAS; airspeed should settle around 70-75 KIAS" },
          { text: "Carburetor heat — stays ON until cleared to land or on short final", detail: "Re-apply any time you reduce power" },
          { text: "Turn final — CONFIRM runway", detail: "Read the numbers; you would not be the first to line up on the wrong strip" },
          { text: "Flaps — 30° on final as required", detail: "Full flaps for a normal landing; less for a short-field or in a strong crosswind" },
          { text: "Airspeed on final — 65 KIAS (normal)", detail: "60-62 KIAS for a short-field approach over an obstacle; never below 60 KIAS without obstacle clearance reason" },
          { text: "Aim point — fixed on the runway", detail: "If the aim point moves UP your windshield, you're going to land short; if it moves DOWN, you'll fly past" },
          { text: "Power — AS REQUIRED to hold the aim point", detail: "Pitch for airspeed, power for altitude — the rule that never stops being true" },
        ],
      },
      {
        name: "Before Touchdown",
        items: [
          { text: "Flaps — CONFIRM set (30° normal landing)" },
          { text: "Airspeed — 65 KIAS over the threshold", detail: "Don't let it bleed off early; the airplane needs energy for the roundout" },
          { text: "Carburetor heat — ON (will go OFF after landing)" },
          { text: "Trim — confirm for landing attitude" },
          { text: "Land on main wheels first", detail: "Hold the nosewheel off as long as practical; a flat landing on all three is a bounce waiting to happen" },
        ],
      },
      {
        name: "After Landing (rolling out)",
        items: [
          { text: "Control the roll", detail: "Brakes as needed, stay on centerline, be ready for crosswind" },
          { text: "Flaps — UP", detail: "Get them up before you forget — they hurt braking and can lift the airplane back off in a gust" },
          { text: "Carburetor heat — OFF" },
          { text: "Trim — RESET to takeoff position", detail: "So the next takeoff doesn't surprise you" },
          { text: "Transponder — keep ALT until clear of the runway", detail: "Then standby or as instructed" },
          { text: "Lights — landing/taxi light as needed" },
        ],
      },
    ],
  },
  {
    id: "c172-engine-failure-in-flight",
    title: "Engine Failure In Flight",
    aircraft: "Cessna 172 Skyhawk",
    description:
      "The real emergency flow, built around the Aviate-Navigate-Communicate principle. Memorize the first 10 seconds — that's the part that has to be reflex. Everything else is checklist.",
    sections: [
      {
        name: "AVIATE — Immediate (first 5 seconds)",
        items: [
          { text: "PITCH for BEST GLIDE — 65 KIAS", detail: "Best glide for a C172S at max weight is ~65 KIAS. Pitch down immediately — do not wait" },
          { text: "TRIM for best glide", detail: "Trim off the pressure so you can think. This is the most under-taught step" },
          { text: "Carburetor heat — ON", detail: "If ice was the cause, this is the fix; costs you nothing to apply" },
          { text: "Fuel selector valve — BOTH", detail: "If you were on a single tank, switch to both; if on both, confirm" },
          { text: "Mixture — RICH", detail: "If you'd leaned for cruise, restore full rich in case the engine recovers" },
          { text: "Magnetos — confirm BOTH", detail: "If a mag failed, the other will keep you going" },
          { text: "Primer — IN and LOCKED", detail: "A loose primer can lean the mixture to a stop; check it" },
        ],
      },
      {
        name: "NAVIGATE — Pick a Field (seconds 5-15)",
        items: [
          { text: "PICK A LANDING SITE", detail: "Into the wind if you have a choice. Look for: green/blue (grass/water), long and rectangular, near a road, slope visible. Avoid: trees, power lines, buildings, water you can't judge depth on" },
          { text: "Gliding range check", detail: "A C172 at best glide covers roughly 1.5 NM per 1000 ft of altitude. You have less than you think" },
          { text: "Plan the pattern", detail: "Aim to be ~1000 ft AGL abeam your intended touchdown point on the downwind-equivalent, then a normal pattern" },
          { text: "Stay within gliding range — don't get fancy", detail: "A forced landing with a controlled approach beats a perfect site you can't reach" },
        ],
      },
      {
        name: "TROUBLESHOOT — Only If Altitude Permits",
        items: [
          { text: "Fuel selector — try the OTHER tank", detail: "If the engine was drawing from one tank and it ran dry or had water, the other may save you" },
          { text: "Fuel shutoff valve — check ON/PULL-OUT (not OFF)", detail: "Verify it hasn't vibrated toward the OFF position" },
          { text: "Electric fuel pump (if equipped) — ON", detail: "Some C172 variants have an auxiliary pump; older ones don't" },
          { text: "Magnetos — try L, then R, then BOTH", detail: "A bad mag may run fine on the other one" },
          { text: "Mixture — try full RICH, then if no joy, try slight lean", detail: "Sometimes the opposite of what you expect" },
          { text: "Engine instruments — quick scan", detail: "Fuel pressure, oil pressure, EGT/CHT. Any needle in the red tells a story" },
          { text: "Primer — verify locked", detail: "If it popped out, push it in and lock; that may be your whole problem" },
          { text: "Do NOT restart troubleshooting past ~1000 ft AGL", detail: "Below that, secure the cockpit and fly the airplane to the ground" },
        ],
      },
      {
        name: "COMMUNICATE — Declare the Emergency",
        items: [
          { text: "Squawk 7700", detail: "Sets your transponder to the universal emergency code; ATC will see you immediately" },
          { text: "Tune 121.5 (guard frequency) or current ATC frequency", detail: "If you're already talking to a controller, stay with them — they know where you are" },
          { text: "Mayday call: 'Mayday, Mayday, Mayday. [Callsign], engine failure, [position], [souls on board], [fuel in hours/minutes], declaring emergency'", detail: "If time is short, callsign and 'engine failure, N [number] souls, [location]' is enough — ATC will fill in the rest" },
          { text: "ELT — arm if installed", detail: "Most modern C172s have a 406 MHz ELT that activates on impact; some have a cockpit switch" },
          { text: "Set transponder to emergency (already done) — confirm" },
        ],
      },
      {
        name: "SECURE — Below 1000 ft AGL, If Restart Failed",
        items: [
          { text: "Doors — UNLATCH before touchdown", detail: "In a crash, jammed doors are the #1 way people get trapped. Crack both doors open but hold them" },
          { text: "Seats and seatbelts — TIGHT", detail: "Shoulder harness locked; this is the single biggest factor in walk-away survival" },
          { text: "Fuel selector valve — OFF", detail: "Reduces fire risk after impact" },
          { text: "Mixture — IDLE CUTOFF (full out)", detail: "Starves the engine of fuel" },
          { text: "Magnetos — OFF", detail: "Kills ignition source" },
          { text: "Master switch — OFF", detail: "After you've made your mayday call and no longer need the radios; cuts electrical fire risk" },
          { text: "Flaps — as needed for landing distance" },
          { text: "Touch down at minimum controllable airspeed, on the mains", detail: "Slow = survivable. Stall it onto the ground if you can" },
          { text: "After stopping: evacuate upwind, away from fuel, and stay clear until rescue arrives", detail: "Take the aircraft paperwork if it's safe to grab, but get out first" },
        ],
      },
    ],
  },
  {
    id: "vfr-cross-country-planning",
    title: "VFR Cross-Country Planning",
    aircraft: "Cessna 172 Skyhawk (planning principles apply to any aircraft)",
    description:
      "Pre-flight planning steps for a VFR cross-country flight under FAA day-VFR rules. Adapt fuel reserves and minimums to your local regulations if outside the US.",
    sections: [
      {
        name: "Route Planning",
        items: [
          { text: "Departure and destination airports — IDENTIFY", detail: "Note ICAO codes, runway lengths, and fuel availability" },
          { text: "Pick an alternate airport", detail: "Within range, with a longer runway and better weather than the minimums at destination" },
          { text: "Plot the course on a sectional chart (or digital equivalent)", detail: "Straight line is rarely best; follow roads, ridgelines, or visual landmarks" },
          { text: "Choose checkpoints every 10-15 NM", detail: "Pick unmistakable features: lakes, road intersections, bridges, distinctive towns. Not 'a green field'" },
          { text: "Measure TRUE COURSE for each leg", detail: "Use a plotter; record to the nearest degree" },
          { text: "Measure DISTANCE for each leg", detail: "Total distance is the sum, but you fly leg by leg" },
          { text: "Note MAGNETIC VARIATION for each leg", detail: "From the isogonic lines on the sectional; east is least, west is best (add west, subtract east)" },
          { text: "Identify airspace along the route", detail: "Class B, C, D, special use airspace. Plan to avoid or to request transitions" },
          { text: "Identify terrain and obstacles", detail: "MEF (Maximum Elevation Figure) for each quadrant; antenna guy-wires reach further than you think" },
        ],
      },
      {
        name: "Weather",
        items: [
          { text: "METARs — departure, destination, alternate", detail: "Current conditions; check within 30 minutes of departure" },
          { text: "TAFs — destination and alternate", detail: "Forecast valid during your arrival window, plus an hour of margin" },
          { text: "Winds aloft — for your cruise altitude", detail: "Used to compute wind correction angle and groundspeed" },
          { text: "AIRMETs and SIGMETs — CHECK along route", detail: "Especially Tango (turbulence), Zulu (icing), and Sierra (IFR/mountain obscuration)" },
          { text: "PIREPs — REVIEW", detail: "Pilot reports give you what the METAR can't: actual ride quality, cloud tops, icing encounters" },
          { text: "Area forecast / convective SIGMET — CHECK", detail: "For broader trends the TAFs miss" },
          { text: "Go / NO-GO DECISION — write it down", detail: "State the reasons out loud. A decision you can articulate is a decision you can defend" },
        ],
      },
      {
        name: "Aircraft Performance",
        items: [
          { text: "Weight & balance — COMPUTE", detail: "Aircraft empty weight + pilot + passengers + baggage + fuel. Confirm within CG envelope and below max gross (2550 lb for a C172S)" },
          { text: "Density altitude — CALCULATE", detail: "Pressure altitude adjusted for temperature. High density altitude = longer takeoff roll, lower climb rate" },
          { text: "Takeoff distance — CHECK from POH", detail: "At your weight, altitude, temperature. Add 50% margin for grass, slope, or inexperience" },
          { text: "Climb rate — VERIFY from POH", detail: "Confirm you can clear terrain and obstacles on the departure route" },
          { text: "Cruise power setting — SELECT", detail: "Typical C172 cruise: 2300-2400 RPM, ~65-75% power. Note expected true airspeed and fuel burn" },
          { text: "Landing distance at destination — CHECK from POH", detail: "At expected landing weight; confirm runway is long enough with margin" },
        ],
      },
      {
        name: "Fuel Planning",
        items: [
          { text: "Compute TIME ENROUTE", detail: "Distance ÷ groundspeed, leg by leg. Add 5-10 minutes for pattern, taxi, and climb" },
          { text: "Compute FUEL BURN", detail: "C172 at ~65% power burns ~10-11 gallons/hour. Multiply by time enroute" },
          { text: "Add RESERVE — 30 minutes day VFR (FAA minimum)", detail: "45 minutes at night or IFR. Most instructors want 60 minutes minimum, period — the FAA number is a floor, not a target" },
          { text: "Add contingency for wind", detail: "Headwind worse than forecast? You'll burn more. Add 10% on top of the reserve" },
          { text: "Confirm fuel at departure — VISUALLY", detail: "Dip the tanks. Gauges lie; the dipstick doesn't" },
          { text: "Confirm fuel availability at destination", detail: "Call ahead. Not every airport sells 100LL, and not every pump works" },
          { text: "Round UP generously — never plan to arrive on fumes", detail: "The fuel you don't need is weight; the fuel you do need is life" },
        ],
      },
      {
        name: "Flight Log (NavLog)",
        items: [
          { text: "For each leg: checkpoint, true course, magnetic variation, wind correction angle, magnetic heading, distance, groundspeed, ETE, fuel", detail: "This is the table you'll actually fly from. Lay it out so it's readable in a bouncing cockpit" },
          { text: "Frequencies — ATIS/AWOS, ground, tower, departure, approach, CTAF, FSS, Guard (121.5)", detail: "Write them in flight order; don't hunt for them airborne" },
          { text: "Airport diagrams — departure and destination", detail: "Know which FBO, which runway is likely active, where you'll park" },
          { text: "Frequencies and runway info for the alternate", detail: "If you have to divert, you don't want to be looking it up at low altitude" },
          { text: "Note VOR radials you can use as backups", detail: "GPS is wonderful until it isn't. Have a ground-based backup" },
          { text: "Brief your passengers (if any)", detail: "Seatbelt use, no control touching, what to do if you become incapacitated" },
        ],
      },
      {
        name: "Pre-Flight (Day of Flight)",
        items: [
          { text: "Re-check weather — within 30 minutes of departure", detail: "Conditions change. A morning brief doesn't count at noon" },
          { text: "Re-check NOTAMs — destination and alternates", detail: "Runway closures, taxiway closures, TFRs, GPS outages. NOTAMs are the most-skipped and most-important step" },
          { text: "File a VFR flight plan with FSS (optional but recommended)", detail: "Doesn't keep you from hitting terrain, but it does mean someone comes looking if you don't show up" },
          { text: "Get a standard briefing from FSS or 1800wxbrief.com", detail: "Or use ForeFlight/Lockheed's online briefing — the point is to make an official record" },
          { text: "Inspect the aircraft — full pre-flight walk-around", detail: "Same checklist you'd use for any flight; cross-country means more time to discover a problem" },
          { text: "Verify fuel one more time" },
          { text: "File a GPS clock or note the time", detail: "You'll need accurate time for fuel calculations in flight" },
          { text: "Final go/no-go — out loud, with reasons", detail: "If you can't say 'I'm going because...' in one clear sentence, you might be going for the wrong reasons" },
        ],
      },
    ],
  },
];
