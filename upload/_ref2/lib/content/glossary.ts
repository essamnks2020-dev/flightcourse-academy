import type { GlossaryTerm } from "@/lib/content-types";

// FlightPath Academy — Aviation Glossary
// 76 terms across 7 categories, mapped to modules 1-16 where relevant.
// Categories: Aerodynamics, Instruments, Navigation, Communications,
//             Weather, Procedures, General
//
// Approximate module map (used for moduleId assignments):
//  1  Intro / Foundations
//  2  Aerodynamics & the Four Forces
//  3  Flight Controls (Pitch / Roll / Yaw)
//  4  The Six-Pack (analog instruments)
//  5  Glass Cockpit & Avionics
//  6  Radio Communications
//  7  Airspace & ATC
//  8  Weather Theory
//  9  Weather Services & Briefing
// 10  Radio Navigation (VOR / GPS)
// 11  Sectional Charts & Pilotage
// 12  Traffic Pattern, Takeoff & Landing
// 13  Maneuvers (Stalls, Slow Flight)
// 14  Emergency Procedures
// 15  Cross-Country Flight Planning
// 16  Cockpit Procedures & Checklists

export const glossary: GlossaryTerm[] = [
  // ---------------------------------------------------------------------------
  // AERODYNAMICS (12)
  // ---------------------------------------------------------------------------
  {
    id: "angle-of-attack",
    term: "Angle of Attack",
    category: "Aerodynamics",
    definition:
      "The angle between the wing's chord line (an imaginary line from the leading edge to the trailing edge) and the oncoming airflow. A higher angle of attack generally produces more lift — until the wing stalls.",
    whyItMatters:
      "Pulling back too hard raises the angle of attack past the critical point and causes a stall, so it's the single most important angle to feel as a pilot.",
    moduleId: 2,
  },
  {
    id: "lift",
    term: "Lift",
    category: "Aerodynamics",
    definition:
      "The upward aerodynamic force created by the wings that opposes the aircraft's weight. Lift increases with airspeed and angle of attack up to the point of a stall.",
    whyItMatters:
      "Understanding lift is what makes flight possible — it's the force you balance every second you're airborne.",
    moduleId: 2,
  },
  {
    id: "drag",
    term: "Drag",
    category: "Aerodynamics",
    definition:
      "The rearward force that resists the aircraft's motion through the air, caused by friction and pressure differences. The two main types are parasite drag (from the aircraft's shape) and induced drag (a byproduct of making lift).",
    whyItMatters:
      "More drag means more thrust needed and more fuel burned, so pilots manage drag with airspeed, configuration, and a clean airframe.",
    moduleId: 2,
  },
  {
    id: "thrust",
    term: "Thrust",
    category: "Aerodynamics",
    definition:
      "The forward force produced by the engine and propeller (or jet) that overcomes drag. In most light aircraft, you control thrust with the throttle.",
    whyItMatters:
      "Thrust sets your airspeed and climb ability, and managing the throttle is one of the first skills a sim pilot must master.",
    moduleId: 2,
  },
  {
    id: "weight",
    term: "Weight",
    category: "Aerodynamics",
    definition:
      "The downward force of gravity acting on the aircraft's mass. Weight must be balanced by lift for the aircraft to stay airborne.",
    whyItMatters:
      "A heavier aircraft needs more lift and a higher takeoff speed, which directly changes runway length and climb performance.",
    moduleId: 2,
  },
  {
    id: "stall",
    term: "Stall",
    category: "Aerodynamics",
    definition:
      "A sudden loss of lift that occurs when the wing's angle of attack exceeds the critical angle and airflow separates from the upper surface. Recovery means reducing pitch and adding power.",
    whyItMatters:
      "Stalls near the ground (like on final approach) are deadly, so recognizing and recovering from them is a core pilot skill.",
    moduleId: 13,
  },
  {
    id: "aspect-ratio",
    term: "Aspect Ratio",
    category: "Aerodynamics",
    definition:
      "The ratio of a wing's wingspan to its average width (chord). High aspect ratio wings (long and skinny, like a glider) are more efficient; low aspect ratio wings (short and wide, like a fighter jet) are more maneuverable.",
    whyItMatters:
      "It explains why a glider floats forever and a jet doesn't — wing shape fundamentally changes how the aircraft behaves.",
    moduleId: 2,
  },
  {
    id: "boundary-layer",
    term: "Boundary Layer",
    category: "Aerodynamics",
    definition:
      "The thin layer of air right next to the wing's surface where friction slows the airflow. When the boundary layer separates, the wing loses lift and stalls.",
    whyItMatters:
      "Knowing this helps you understand why a smooth, clean wing matters and why stalls happen at the surface level.",
    moduleId: 2,
  },
  {
    id: "pitch",
    term: "Pitch",
    category: "Aerodynamics",
    definition:
      "The up-and-down movement of the aircraft's nose, controlled by the elevators on the tail. Pushing the yoke forward pitches the nose down; pulling back pitches it up.",
    whyItMatters:
      "Pitch is your primary control of airspeed and altitude, so mastering it is the foundation of smooth flying.",
    moduleId: 3,
  },
  {
    id: "roll",
    term: "Roll",
    category: "Aerodynamics",
    definition:
      "The rotation of the aircraft around its nose-to-tail axis, controlled by the ailerons on the wings. Rolling left or right banks the aircraft into a turn.",
    whyItMatters:
      "Roll is how you turn the airplane, so coordinating it with rudder prevents sloppy, uncomfortable turns.",
    moduleId: 3,
  },
  {
    id: "yaw",
    term: "Yaw",
    category: "Aerodynamics",
    definition:
      "The left-and-right movement of the aircraft's nose, controlled by the rudder on the tail. Yaw is used to keep the tail aligned behind the nose during turns and crosswinds.",
    whyItMatters:
      "Using rudder to manage yaw keeps your turns coordinated and prevents the uncomfortable slipping or skidding feeling.",
    moduleId: 3,
  },
  {
    id: "center-of-gravity",
    term: "Center of Gravity",
    category: "Aerodynamics",
    definition:
      "The single point where the aircraft's weight is considered to be balanced. The CG must stay within manufacturer limits for the aircraft to fly safely and predictably.",
    whyItMatters:
      "An out-of-limits CG can make the aircraft uncontrollable, so weight and balance is checked before every flight.",
    moduleId: 2,
  },

  // ---------------------------------------------------------------------------
  // INSTRUMENTS (12)
  // ---------------------------------------------------------------------------
  {
    id: "airspeed-indicator",
    term: "Airspeed Indicator",
    category: "Instruments",
    definition:
      "The instrument that shows the aircraft's speed through the air, measured in knots. It works by comparing ram air pressure from the pitot tube to static air pressure from the static port.",
    whyItMatters:
      "Flying below maneuvering speed or above never-exceed speed can damage or destroy the aircraft, so reading this gauge is essential.",
    moduleId: 4,
  },
  {
    id: "attitude-indicator",
    term: "Attitude Indicator",
    category: "Instruments",
    definition:
      "The gyroscopic instrument that shows the aircraft's pitch and roll attitude relative to the horizon. It's the only instrument that gives a direct picture of the aircraft's orientation.",
    whyItMatters:
      "In clouds or at night, the attitude indicator becomes your artificial horizon and keeps you alive.",
    moduleId: 4,
  },
  {
    id: "altimeter",
    term: "Altimeter",
    category: "Instruments",
    definition:
      "The instrument that displays the aircraft's height above a reference pressure level, usually mean sea level. It's a barometer that converts atmospheric pressure into altitude in feet.",
    whyItMatters:
      "Without an accurate altimeter you can't maintain safe altitudes or fly instrument approaches, so setting it correctly is non-negotiable.",
    moduleId: 4,
  },
  {
    id: "turn-coordinator",
    term: "Turn Coordinator",
    category: "Instruments",
    definition:
      "The instrument that shows the rate of turn and whether the turn is coordinated (no slip or skid). The miniature airplane tilts with roll, and the inclinometer ball shows rudder coordination.",
    whyItMatters:
      "It's the single best tool for keeping turns coordinated when you can't see the horizon.",
    moduleId: 4,
  },
  {
    id: "heading-indicator",
    term: "Heading Indicator",
    category: "Instruments",
    definition:
      "The gyroscopic instrument that shows the direction the nose is pointing, in degrees from 000 to 360. Unlike a magnetic compass it doesn't swing around in turbulence, but it must be set periodically to match the compass.",
    whyItMatters:
      "It gives you a steady, easy-to-read heading reference for steering precise courses.",
    moduleId: 4,
  },
  {
    id: "vertical-speed-indicator",
    term: "Vertical Speed Indicator (VSI)",
    category: "Instruments",
    definition:
      "The instrument that shows whether the aircraft is climbing or descending and at what rate, in feet per minute. It's also called the VSI.",
    whyItMatters:
      "It tells you at a glance if you're holding altitude or trending up or down, which helps smooth out your pitch control.",
    moduleId: 4,
  },
  {
    id: "tachometer",
    term: "Tachometer",
    category: "Instruments",
    definition:
      "The instrument that shows engine speed in revolutions per minute (RPM). In a fixed-pitch propeller aircraft, RPM is the main indication of engine power.",
    whyItMatters:
      "Running the engine above redline damages it, so the tachometer is your guide to safe power settings.",
    moduleId: 4,
  },
  {
    id: "manifold-pressure",
    term: "Manifold Pressure",
    category: "Instruments",
    definition:
      "The instrument that shows the air pressure in the engine's intake manifold, measured in inches of mercury (inHg). On constant-speed propeller aircraft it's used together with the tachometer to set power.",
    whyItMatters:
      "On more complex aircraft this gauge replaces RPM as your primary power indicator, so you must learn to read it.",
    moduleId: 4,
  },
  {
    id: "glass-cockpit",
    term: "Glass Cockpit",
    category: "Instruments",
    definition:
      "A modern flight deck where traditional round steam gauges are replaced by large flat-panel displays, usually a Primary Flight Display (PFD) and a Multi-Function Display (MFD). Examples include the Garmin G1000.",
    whyItMatters:
      "Most modern aircraft and sims use glass cockpits, so learning to read them is essential for any new pilot.",
    moduleId: 5,
  },
  {
    id: "six-pack",
    term: "Six-Pack",
    category: "Instruments",
    definition:
      "The classic arrangement of six analog flight instruments found in traditional cockpits: airspeed indicator, attitude indicator, altimeter, turn coordinator, heading indicator, and vertical speed indicator.",
    whyItMatters:
      "Recognizing the six-pack instantly helps you fly almost any older aircraft and teaches the foundations every instrument builds on.",
    moduleId: 4,
  },
  {
    id: "pitot-tube",
    term: "Pitot Tube",
    category: "Instruments",
    definition:
      "A small forward-facing tube on the wing or nose that captures ram air pressure to drive the airspeed indicator. If it gets blocked by ice or insects, the airspeed indicator will read incorrectly.",
    whyItMatters:
      "A blocked pitot tube causes dangerous airspeed errors, so many aircraft have a pitot heat switch to prevent icing.",
    moduleId: 4,
  },
  {
    id: "static-port",
    term: "Static Port",
    category: "Instruments",
    definition:
      "A small flush-mounted hole on the side of the fuselage that senses the still (static) air pressure outside the aircraft. It feeds the altimeter, airspeed indicator, and vertical speed indicator.",
    whyItMatters:
      "A blocked static port can make three instruments lie at once, which is why many aircraft have an alternate static source.",
    moduleId: 4,
  },

  // ---------------------------------------------------------------------------
  // NAVIGATION (12)
  // ---------------------------------------------------------------------------
  {
    id: "vor",
    term: "VOR",
    category: "Navigation",
    definition:
      "Very High Frequency Omnidirectional Range (VOR), a ground-based radio station that broadcasts signal courses (called radials) the aircraft can tune to and track. A VOR receiver shows whether you're left, right, or on a selected course.",
    whyItMatters:
      "Even in the GPS era, VORs are a backup navigation source and a required skill for many pilot certificates.",
    moduleId: 10,
  },
  {
    id: "heading",
    term: "Heading",
    category: "Navigation",
    definition:
      "The direction the aircraft's nose is pointing, measured in degrees clockwise from north. Heading is what you read on the heading indicator or compass.",
    whyItMatters:
      "In wind, your heading and your actual track are often different — understanding that difference is the heart of navigation.",
    moduleId: 10,
  },
  {
    id: "course",
    term: "Course",
    category: "Navigation",
    definition:
      "The intended path over the ground you want to fly, measured in degrees from north. Course is what you plan; heading is what you steer to get there.",
    whyItMatters:
      "Distinguishing course from heading is what lets you calculate wind correction and actually arrive at your destination.",
    moduleId: 10,
  },
  {
    id: "bearing",
    term: "Bearing",
    category: "Navigation",
    definition:
      "The direction from the aircraft to a particular object or station, measured in degrees from north. A bearing tells you where something is relative to you.",
    whyItMatters:
      "Bearings are how you find a station, a waypoint, or another aircraft in relation to your position.",
    moduleId: 10,
  },
  {
    id: "waypoint",
    term: "Waypoint",
    category: "Navigation",
    definition:
      "A defined geographic point used for navigation, stored as a name and coordinates in a GPS database. Waypoints can be VOR stations, intersections, airports, or user-defined points.",
    whyItMatters:
      "GPS navigation is built on stringing waypoints together, so understanding them unlocks modern flight planning.",
    moduleId: 10,
  },
  {
    id: "sectional-chart",
    term: "Sectional Chart",
    category: "Navigation",
    definition:
      "A 1:500,000-scale aeronautical chart used by VFR pilots for visual navigation, showing terrain, airports, airspace, radio aids, and landmarks. In the U.S. they're published by the FAA and updated regularly.",
    whyItMatters:
      "The sectional chart is the pilot's road map — it's how you plan routes, avoid restricted airspace, and find your way visually.",
    moduleId: 11,
  },
  {
    id: "gps",
    term: "GPS",
    category: "Navigation",
    definition:
      "Global Positioning System (GPS), a satellite-based navigation system that determines the aircraft's position and guides it along programmed routes. Most modern aircraft have a GPS receiver built into the avionics.",
    whyItMatters:
      "GPS is the most accurate and widely used navigation method today, so learning to program a GPS route is a core sim skill.",
    moduleId: 10,
  },
  {
    id: "dead-reckoning",
    term: "Dead Reckoning",
    category: "Navigation",
    definition:
      "Navigation by calculating your position from a known starting point, using heading, airspeed, time, and wind. It's pure math — no electronic aids required.",
    whyItMatters:
      "Dead reckoning is the backup skill that gets you home when the GPS dies and teaches you to actually understand your route.",
    moduleId: 15,
  },
  {
    id: "pilotage",
    term: "Pilotage",
    category: "Navigation",
    definition:
      "Navigation by comparing what you see outside the window to features on a chart — roads, rivers, towns, mountains. It's the most basic form of visual navigation.",
    whyItMatters:
      "Pilotage keeps you oriented when instruments fail and is the foundation of all VFR cross-country flying.",
    moduleId: 11,
  },
  {
    id: "magnetic-variation",
    term: "Magnetic Variation",
    category: "Navigation",
    definition:
      "The angular difference between true north (the geographic North Pole) and magnetic north (where the compass points). Variation varies by location and is shown on sectional charts.",
    whyItMatters:
      "Converting between true and magnetic is essential for accurate navigation, since the compass only reads magnetic.",
    moduleId: 11,
  },
  {
    id: "true-north",
    term: "True North",
    category: "Navigation",
    definition:
      "The direction of the geographic North Pole — the fixed point at the top of the Earth. Charts and many calculations use true north as their reference.",
    whyItMatters:
      "Knowing true north versus magnetic north keeps your course calculations consistent with both the map and the compass.",
    moduleId: 11,
  },
  {
    id: "ndb",
    term: "NDB",
    category: "Navigation",
    definition:
      "Non-Directional Beacon (NDB), a ground-based radio transmitter that sends a signal in all directions, which an Automatic Direction Finder (ADF) in the aircraft can point toward. NDBs are older and less precise than VORs and are being phased out.",
    whyItMatters:
      "Though largely obsolete, NDBs still appear in some sims and training scenarios, so knowing what they are helps you understand older procedures.",
    moduleId: 10,
  },

  // ---------------------------------------------------------------------------
  // COMMUNICATIONS (9)
  // ---------------------------------------------------------------------------
  {
    id: "ctaf",
    term: "CTAF",
    category: "Communications",
    definition:
      "Common Traffic Advisory Frequency (CTAF), a radio frequency pilots use to announce their position and intentions at non-towered airports. It's how pilots coordinate with each other when there's no controller.",
    whyItMatters:
      "Using CTAF correctly prevents collisions at uncontrolled airports, which is where most general aviation traffic operates.",
    moduleId: 6,
  },
  {
    id: "atis",
    term: "ATIS",
    category: "Communications",
    definition:
      "Automatic Terminal Information Service (ATIS), a recorded broadcast at towered airports that gives the current weather, runway in use, and other essential info. It's updated each time conditions change and given a letter identifier (Alpha, Bravo, etc.).",
    whyItMatters:
      "Listening to ATIS saves controller time and gives you a complete picture of the airport before you even call the tower.",
    moduleId: 6,
  },
  {
    id: "tower",
    term: "Tower",
    category: "Communications",
    definition:
      "The air traffic control unit responsible for managing aircraft on the active runways and in the immediate airspace around an airport. Tower controllers issue takeoff, landing, and runway crossing clearances.",
    whyItMatters:
      "At a towered airport, the tower controller is who clears you to land and take off — ignoring them is dangerous and illegal.",
    moduleId: 7,
  },
  {
    id: "ground-control",
    term: "Ground Control",
    category: "Communications",
    definition:
      "The air traffic control unit responsible for moving aircraft safely on taxiways and aprons. You talk to ground after landing and before takeoff to get taxi instructions.",
    whyItMatters:
      "Following ground control keeps you off active runways and prevents runway incursions while taxiing.",
    moduleId: 7,
  },
  {
    id: "phonetic-alphabet",
    term: "Phonetic Alphabet",
    category: "Communications",
    definition:
      "The standard International Civil Aviation Organization (ICAO) word-for-each-letter system: Alpha, Bravo, Charlie, and so on. It's used so letters sound distinct over noisy radios.",
    whyItMatters:
      "Saying B and D sound identical on a crackly radio, but Bravo and Delta don't — memorizing this alphabet is mandatory for clear communication.",
    moduleId: 6,
  },
  {
    id: "squawk",
    term: "Squawk",
    category: "Communications",
    definition:
      "The four-digit code a pilot enters into the transponder so air traffic control can identify the aircraft on radar. Controllers assign codes like squawk 1200 (the standard VFR code) or squawk 4471.",
    whyItMatters:
      "Squawking the right code lets ATC see who you are on their screen, which is essential in controlled airspace.",
    moduleId: 6,
  },
  {
    id: "transponder",
    term: "Transponder",
    category: "Communications",
    definition:
      "The onboard device that receives a radar ping from ATC and replies with the aircraft's squawk code and, in Mode C, its altitude. It's what makes an aircraft visible on a controller's radar display.",
    whyItMatters:
      "Without a working transponder you may be invisible to ATC, which restricts where you can fly.",
    moduleId: 6,
  },
  {
    id: "unicom",
    term: "Unicom",
    category: "Communications",
    definition:
      "A non-government radio frequency at some airports used by pilots to announce intentions and by airport staff to provide basic advisory info. It's distinct from CTAF, though at many smaller airports one frequency serves both.",
    whyItMatters:
      "Knowing when you're talking to Unicom versus CTAF affects what kind of information you can expect to receive.",
    moduleId: 6,
  },
  {
    id: "clearance-delivery",
    term: "Clearance Delivery",
    category: "Communications",
    definition:
      "The air traffic control position at towered airports that gives IFR pilots their route and altitude clearance before taxi. You contact them before ground to copy your clearance.",
    whyItMatters:
      "If you fly IFR, clearance delivery is your first stop — it's where you receive and read back the route you've been cleared to fly.",
    moduleId: 7,
  },

  // ---------------------------------------------------------------------------
  // WEATHER (12)
  // ---------------------------------------------------------------------------
  {
    id: "metar",
    term: "METAR",
    category: "Weather",
    definition:
      "Aviation Routine Weather Report (METAR), an hourly coded observation of current weather at an airport: wind, visibility, sky condition, temperature, dew point, and pressure. It's the standard snapshot of what's happening right now.",
    whyItMatters:
      "Every preflight weather brief starts with METARs — they tell you if it's safe to fly at your departure and arrival airports.",
    moduleId: 9,
  },
  {
    id: "taf",
    term: "TAF",
    category: "Weather",
    definition:
      "Terminal Aerodrome Forecast (TAF), a coded forecast of expected weather at an airport over the next 24 to 30 hours. It predicts wind, visibility, sky condition, and significant changes.",
    whyItMatters:
      "A TAF tells you whether the weather will still be good when you arrive, which is critical for go/no-go decisions on longer flights.",
    moduleId: 9,
  },
  {
    id: "density-altitude",
    term: "Density Altitude",
    category: "Weather",
    definition:
      "The altitude the aircraft feels like it's flying at, after adjusting pressure altitude for non-standard temperature. High, hot, and humid conditions raise density altitude and reduce performance.",
    whyItMatters:
      "On a hot day at a high airport, density altitude can turn a normal takeoff into a dangerously long one — ignoring it has caused many accidents.",
    moduleId: 8,
  },
  {
    id: "crosswind",
    term: "Crosswind",
    category: "Weather",
    definition:
      "A wind that blows across the runway direction rather than along it. Crosswinds push the aircraft sideways during takeoff and landing and require special crab or wing-low techniques.",
    whyItMatters:
      "Most real runways aren't aligned with the wind, so crosswind landings are a skill every pilot must develop.",
    moduleId: 8,
  },
  {
    id: "headwind",
    term: "Headwind",
    category: "Weather",
    definition:
      "A wind that blows directly opposite the aircraft's direction of flight. Headwinds slow groundspeed and shorten takeoff and landing distance but increase flight time.",
    whyItMatters:
      "A headwind helps you land shorter but makes cross-country flights longer, so it affects both safety and fuel planning.",
    moduleId: 8,
  },
  {
    id: "tailwind",
    term: "Tailwind",
    category: "Weather",
    definition:
      "A wind that blows in the same direction the aircraft is flying. Tailwinds increase groundspeed and shorten flight time but make takeoff and landing distances longer and riskier.",
    whyItMatters:
      "Taking off or landing with a tailwind uses a lot more runway and is something pilots usually avoid.",
    moduleId: 8,
  },
  {
    id: "wind-shear",
    term: "Wind Shear",
    category: "Weather",
    definition:
      "A sudden change in wind speed or direction over a short distance, often near thunderstorms or temperature inversions. Wind shear can abruptly change airspeed and altitude.",
    whyItMatters:
      "Wind shear on short final can drop an aircraft toward the ground without warning, so recognizing the risk is a key survival skill.",
    moduleId: 8,
  },
  {
    id: "visibility",
    term: "Visibility",
    category: "Weather",
    definition:
      "The horizontal distance at which prominent objects can be seen and identified, reported in statute miles (or meters in some countries). It's a key factor in whether VFR flight is legal.",
    whyItMatters:
      "Below certain visibilities you can't legally fly VFR at all, and low visibility is a major cause of disorientation and accidents.",
    moduleId: 8,
  },
  {
    id: "ceiling",
    term: "Ceiling",
    category: "Weather",
    definition:
      "The height of the lowest layer of clouds or obscuring phenomena that covers more than half the sky, measured above the ground. A low ceiling can make VFR flight impossible.",
    whyItMatters:
      "The ceiling sets whether you can stay below the clouds legally and safely on a VFR flight.",
    moduleId: 8,
  },
  {
    id: "airmet",
    term: "AIRMET",
    category: "Weather",
    definition:
      "Airmen's Meteorological Information (AIRMET), a weather advisory for conditions that may affect all aircraft but are especially hazardous to light aircraft: moderate icing, moderate turbulence, sustained winds, or low ceilings and visibilities over a wide area.",
    whyItMatters:
      "AIRMETs flag widespread hazards you need to plan around before launching into less-than-perfect weather.",
    moduleId: 9,
  },
  {
    id: "sigmet",
    term: "SIGMET",
    category: "Weather",
    definition:
      "Significant Meteorological Information (SIGMET), a weather advisory for severe or potentially hazardous conditions such as severe icing, severe turbulence, dust storms, or embedded thunderstorms. SIGMETs are more serious than AIRMETs.",
    whyItMatters:
      "A SIGMET means dangerous weather that can threaten any aircraft, so it's a strong signal to stay on the ground or divert.",
    moduleId: 9,
  },
  {
    id: "fog",
    term: "Fog",
    category: "Weather",
    definition:
      "A cloud that forms at ground level, reducing visibility to less than 5/8 of a statute mile in its dense form. Fog often forms on clear, calm nights when the air cools to its dew point.",
    whyItMatters:
      "Fog can close an airport with little warning and is one of the most common reasons VFR flights get stranded away from home.",
    moduleId: 8,
  },

  // ---------------------------------------------------------------------------
  // PROCEDURES (10)
  // ---------------------------------------------------------------------------
  {
    id: "traffic-pattern",
    term: "Traffic Pattern",
    category: "Procedures",
    definition:
      "The standard rectangular path pilots fly around an airport to organize arrivals and departures, with an upwind leg, a crosswind leg, a downwind leg, a base leg, and a final leg. Most patterns are flown at 1,000 feet above ground level and turn left.",
    whyItMatters:
      "Flying a consistent traffic pattern is what makes landings orderly and predictable at busy airports.",
    moduleId: 12,
  },
  {
    id: "downwind",
    term: "Downwind",
    category: "Procedures",
    definition:
      "The traffic pattern leg flown parallel to the runway in the opposite direction of landing, usually just past the runway and a thousand feet up. You fly downwind before turning base and then final.",
    whyItMatters:
      "Downwind is where you run your before-landing checklist and set up the airplane for a stable approach.",
    moduleId: 12,
  },
  {
    id: "base",
    term: "Base",
    category: "Procedures",
    definition:
      "The traffic pattern leg flown perpendicular to the runway, between downwind and final. You turn from downwind to base, then from base to final to line up with the runway.",
    whyItMatters:
      "The base-to-final turn is where many stall-spin accidents happen, so it's a critical moment to manage airspeed and bank.",
    moduleId: 12,
  },
  {
    id: "final",
    term: "Final",
    category: "Procedures",
    definition:
      "The traffic pattern leg aligned with the runway, flown inbound toward the landing point. You fly final to descend steadily down to the touchdown zone.",
    whyItMatters:
      "A stable final approach is the single biggest factor in a good landing — everything before it sets you up for it.",
    moduleId: 12,
  },
  {
    id: "flare",
    term: "Flare",
    category: "Procedures",
    definition:
      "The smooth nose-up pitch made just before the wheels touch, used to slow the descent rate and land softly. Too early or too late a flare leads to a hard landing, a balloon, or a porpoise.",
    whyItMatters:
      "The flare is the hardest part of landing to time, and getting it right is what separates smooth touchdowns from bounce-fests.",
    moduleId: 12,
  },
  {
    id: "go-around",
    term: "Go-Around",
    category: "Procedures",
    definition:
      "A discontinued landing in which the pilot applies full power, climbs back up, and re-enters the traffic pattern for another attempt. Also called a balked landing.",
    whyItMatters:
      "Knowing when and how to go around saves bad landings and is one of the most important safety skills a pilot has.",
    moduleId: 12,
  },
  {
    id: "hold-short",
    term: "Hold Short",
    category: "Procedures",
    definition:
      "An instruction to stop on a taxiway before reaching a runway and wait for further clearance. Pilots must read back hold short instructions word for word.",
    whyItMatters:
      "Hold short lines prevent runway incursions — one of the deadliest mistakes a pilot can make on the ground.",
    moduleId: 7,
  },
  {
    id: "taxi",
    term: "Taxi",
    category: "Procedures",
    definition:
      "The slow movement of an aircraft on the ground under its own power, using the rudder pedals (and sometimes toe brakes) to steer. Taxi speed is controlled with throttle and brakes.",
    whyItMatters:
      "Taxiing safely keeps you clear of obstacles and other aircraft before you even get to the runway.",
    moduleId: 16,
  },
  {
    id: "rotation",
    term: "Rotation",
    category: "Procedures",
    definition:
      "The moment during takeoff when the pilot pulls back smoothly to lift the nose off the runway at rotation speed (Vr). After rotation the aircraft accelerates in a climb attitude.",
    whyItMatters:
      "Rotating at the right speed and rate sets up a safe climb and prevents dragging the tail or climbing too early.",
    moduleId: 12,
  },
  {
    id: "best-glide-speed",
    term: "Best Glide Speed",
    category: "Procedures",
    definition:
      "The airspeed at which the aircraft glides the farthest distance for a given altitude loss, published by the manufacturer. It's the speed you fly if the engine quits and you need to maximize range.",
    whyItMatters:
      "If the engine fails, best glide speed gives you the most time and distance to find a landing spot — it's a number every pilot memorizes.",
    moduleId: 14,
  },

  // ---------------------------------------------------------------------------
  // GENERAL (9)
  // ---------------------------------------------------------------------------
  {
    id: "general-aviation",
    term: "GA (General Aviation)",
    category: "General",
    definition:
      "General Aviation (GA), the part of civil aviation that isn't military or scheduled airline — everything from training Cessnas to private business jets. GA is where virtually every pilot starts.",
    whyItMatters:
      "General Aviation is your world as a student pilot, and understanding it frames everything else you learn.",
    moduleId: 1,
  },
  {
    id: "vfr",
    term: "VFR",
    category: "General",
    definition:
      "Visual Flight Rules (VFR), flying by looking out the window and navigating visually, generally in good weather. VFR has specific minimums for visibility and distance from clouds.",
    whyItMatters:
      "VFR is the starting point for every pilot and the most common way sim pilots fly, so knowing its rules keeps you legal and safe.",
    moduleId: 1,
  },
  {
    id: "ifr",
    term: "IFR",
    category: "General",
    definition:
      "Instrument Flight Rules (IFR), flying by reference to instruments inside the cockpit, generally in clouds or low visibility. IFR requires special training, a rating, and an instrument-equipped aircraft.",
    whyItMatters:
      "IFR lets you fly when the weather won't allow VFR and is the next big step after earning a private license.",
    moduleId: 1,
  },
  {
    id: "atc",
    term: "ATC",
    category: "General",
    definition:
      "Air Traffic Control (ATC), the ground-based service that separates and directs aircraft in controlled airspace and at towered airports. ATC includes clearance delivery, ground, tower, approach, and center controllers.",
    whyItMatters:
      "Talking to ATC lets you use busy airports and airspace, and learning the lingo is essential for any pilot.",
    moduleId: 7,
  },
  {
    id: "fbo",
    term: "FBO",
    category: "General",
    definition:
      "Fixed-Base Operator (FBO), a commercial business at an airport that provides fuel, hangars, flight instruction, aircraft rental, and pilot services. FBOs are where general aviation pilots go for almost everything on the ground.",
    whyItMatters:
      "The FBO is your gateway to fuel, restrooms, weather planning, and a warm cup of coffee on a cross-country flight.",
    moduleId: 1,
  },
  {
    id: "notam",
    term: "NOTAM",
    category: "General",
    definition:
      "Notice to Air Missions (NOTAM), an official notice alerting pilots to changes or hazards at an airport or along a route — closed runways, navaid outages, airspace changes, and the like. NOTAMs are issued by aviation authorities.",
    whyItMatters:
      "Flying without checking NOTAMs can put you into a closed runway or inactive airspace, so it's a required preflight step.",
    moduleId: 9,
  },
  {
    id: "pirep",
    term: "PIREP",
    category: "General",
    definition:
      "Pilot Report (PIREP), a radio report from a pilot in flight describing actual weather conditions — cloud bases, turbulence, icing, or visibility. PIREPs are shared with other pilots and the National Weather Service.",
    whyItMatters:
      "PIREPs give you real-world weather that no forecast or observation can, so learning to read and give them makes you a safer pilot.",
    moduleId: 9,
  },
  {
    id: "knots",
    term: "Knots",
    category: "General",
    definition:
      "A unit of speed equal to one nautical mile per hour, used throughout aviation for airspeed, wind speed, and groundspeed. One knot equals about 1.15 statute miles per hour.",
    whyItMatters:
      "Every airspeed, wind, and distance in aviation is in knots, so getting comfortable with the unit is your first math step.",
    moduleId: 1,
  },
  {
    id: "nautical-mile",
    term: "Nautical Mile",
    category: "General",
    definition:
      "A unit of distance equal to 6,076 feet (about 1.15 statute miles), based on one minute of latitude. Nautical miles are the standard distance unit in aviation and marine navigation.",
    whyItMatters:
      "All aviation charts and distances use nautical miles, so understanding them is essential for planning and reading instruments.",
    moduleId: 1,
  },
];
