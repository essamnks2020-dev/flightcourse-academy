import type { ModuleContent } from "@/lib/content-types";

// FlightPath Academy — Course Modules 9–16
// Real, accurate aviation content written for total beginners.
// Each module includes sections, a diagram, common mistake, sim exercise,
// key takeaways, and a 5-question quiz with explanations.
//
// Module map (per task brief):
//  9  Traffic Patterns & Landing
// 10  Navigation Basics
// 11  Radio Communications
// 12  Weather Basics
// 13  Emergency Procedures
// 14  Cross-Country Flight Planning
// 15  Intro to IFR
// 16  Aircraft-Specific Modules (C172, PA-28, airliner preview)

export const modules916: ModuleContent[] = [
  // ===========================================================================
  // MODULE 9 — TRAFFIC PATTERNS & LANDING
  // ===========================================================================
  {
    id: 9,
    title: "Traffic Patterns & Landing",
    shortTitle: "Patterns & Landings",
    category: "Flight Maneuvers",
    estimatedMinutes: 28,
    difficulty: "Intermediate",
    xpReward: 14,
    prerequisites: [7, 8],
    tagline:
      "Bring it all together — the standardized dance that ends every flight back on the runway.",
    whyItMatters:
      "Landings are where most beginner sim time is spent, and for good reason. The traffic pattern is the choreography that keeps every arriving and departing airplane predictable to each other.",
    sections: [
      {
        heading: "Why We Fly a Pattern",
        blocks: [
          {
            type: "paragraph",
            text: "If every airplane just pointed at the runway from wherever it happened to be, the sky near an airport would be chaos. The traffic pattern solves that problem with a simple idea: everyone flies the same rectangular path around the runway, in the same direction, at the same altitude. Predictability is safety.",
          },
          {
            type: "paragraph",
            text: "At non-towered airports, the pattern is an unwritten agreement between pilots — there's no controller sequencing you. You announce your position on a common frequency, and because everyone is flying the same shape, you can picture exactly where the other voices are.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Left traffic is the default",
            body: "Unless a chart or airport marking says otherwise, all turns in the pattern are to the left. Right traffic is used when terrain, noise abatement, or other traffic requires it — and it will always be explicitly published.",
          },
        ],
      },
      {
        heading: "The Five Legs",
        blocks: [
          {
            type: "paragraph",
            text: "The pattern has five named legs. Each one is a job: a place you should be, an altitude you should be at, and a thing you should be doing. Learn the names and the jobs, and the pattern stops feeling like memorization and starts feeling like a flow.",
          },
          {
            type: "diagram",
            diagramKey: "traffic-pattern",
            caption:
              "A standard left traffic pattern: upwind, crosswind, downwind, base, and final. All turns to the left, all legs at predictable altitudes.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Upwind — flying the same direction as landing, on the runway centerline extended, climbing away from the runway after takeoff. Also used by an arriving aircraft to climb back up through the pattern on a go-around.",
              "Crosswind — the 90° turn after upwind, climbing to pattern altitude. You're perpendicular to the runway now.",
              "Downwind — the leg parallel to the runway, traveling the opposite direction of landing. This is where you stabilize, run the before-landing checklist, and announce your position. Flown at pattern altitude (typically 1,000 ft AGL).",
              "Base — the 90° turn after downwind, perpendicular to the runway again, descending toward final. Wind correction here matters: a headwind on base shortens your final.",
              "Final — the last leg, aligned with the runway centerline, descending to landing. This is where you do the work that puts the airplane on the pavement smoothly.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Talk to yourself out loud",
            body: "As you fly each leg, say what leg you're on and what your next task is. \"Downwind, abeam the numbers, power back, before-landing checklist.\" It builds a rhythm and helps you stay ahead of the airplane.",
          },
        ],
      },
      {
        heading: "Pattern Altitude and Speeds",
        blocks: [
          {
            type: "paragraph",
            text: "Pattern altitude for light aircraft is typically 1,000 ft AGL (above ground level). You fly downwind at pattern altitude, then start descending abeam the numbers (the runway threshold paint) so you arrive at the runway aiming point at the right speed.",
          },
          {
            type: "paragraph",
            text: "Speeds matter more than altitude precision. A common Cessna 172 progression looks like this:",
          },
          {
            type: "list",
            items: [
              "Downwind: 90 KIAS (knots indicated airspeed), flaps up",
              "Abeam the numbers: power back, 80 KIAS, flaps 10°",
              "Base: 75 KIAS, flaps 20°",
              "Final: 65–70 KIAS, flaps 30° as required",
              "Over the threshold (the numbers): 65 KIAS",
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "Speed on final is non-negotiable",
            body: "Too fast and you'll float halfway down the runway. Too slow and you risk stalling short. A good rule: be on your target final approach speed by the time you're stabilized on final, with full flaps set, before you descend below 300 ft AGL.",
          },
        ],
      },
      {
        heading: "The Flare and Touchdown",
        blocks: [
          {
            type: "paragraph",
            text: "The flare is the moment you transition from flying (with power and airspeed) to landing (without power, slowing toward stall). As the runway fills your windscreen and the pavement seems to rise up to meet you, you ease the nose up slightly so the main wheels touch first, with the nosewheel held off until the airplane settles.",
          },
          {
            type: "paragraph",
            text: "Two errors ruin most beginner landings: flaring too high (which drops you onto the runway with a thump) and not flaring enough (which slams the nosewheel down). The sweet spot is small — maybe two or three degrees of pitch change — and you find it by looking at the runway's far end, not at the pavement right in front of you.",
          },
          {
            type: "callout",
            variant: "tip",
            title: "Look down the runway, not at it",
            body: "Your eyes naturally steer where you look. Stare at the threshold and you'll fly into it. Pick a point near the far end of the runway and let your peripheral vision judge height. That's how your flare timing gets accurate.",
          },
        ],
      },
      {
        heading: "Go-Arounds: A Sign of Good Judgment",
        blocks: [
          {
            type: "paragraph",
            text: "Here's something they don't tell you: a go-around (also called a 'balked landing') is not a failure. It's a sign of good judgment. If the landing isn't working out — you're too high, too fast, or a deer wanders onto the runway — you power up and try again. Every professional pilot has done hundreds of them.",
          },
          {
            type: "paragraph",
            text: "The mechanics are simple and should be rehearsed until they're reflexes:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Full power (smoothly, but with purpose).",
              "Pitch for a climb attitude — but be ready for the nose to rise as power comes in.",
              "Clean up flaps incrementally as you accelerate (don't dump them all at once in some types — check your aircraft).",
              "Climb straight ahead on the runway centerline until past the departure end and at a safe altitude.",
              "Re-enter the pattern, usually on crosswind, and try again.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Decide early",
            body: "A go-around started at 300 ft is easy. A go-around started at 30 ft after bouncing twice is thrilling in all the wrong ways. If anything feels off — speed, alignment, or sight picture — commit early.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Chasing the runway with power instead of pitch",
      body: "When a beginner finds themselves short on final, the reflex is to add power and point the nose at the threshold. But on final, pitch controls airspeed and power controls the glidepath — adding power without pitching for airspeed just makes you arrive hot and high simultaneously. The right answer: pitch for your target airspeed, use power to walk the airplane down to the runway, and if you can't get it stable, go around.",
    },
    tryItInSim: {
      title: "Fly a stabilized left traffic pattern",
      steps: [
        "Pick a small non-towered field with a single runway (KVNY Van Nuys or KGIF Winter Haven work well). Start the sim on the ground, runway 27.",
        "Take off, climb straight ahead to 500 ft AGL, then turn left crosswind. Climb to pattern altitude (1,000 ft AGL).",
        "Turn left downwind. Level off at pattern altitude. When abeam the runway numbers, reduce power, set flaps 10°, and start a descent. Say out loud: 'Downwind, abeam the numbers, before-landing checklist.'",
        "Turn left base when the runway threshold is 45° behind your wing. Set flaps 20°. Be at 75 KIAS.",
        "Turn final. Stabilize at 65 KIAS with full flaps. If you're not on speed and on path by 300 ft AGL, go around and try it again. Repeat until you can grease the landing.",
      ],
    },
    keyTakeaways: [
      "The traffic pattern is a standardized rectangle that makes everyone's behavior predictable.",
      "Default to left traffic, 1,000 ft AGL pattern altitude, with named legs: upwind, crosswind, downwind, base, final.",
      "Stabilize on final — on speed, on path, full flaps, by 300 ft AGL — or go around.",
      "The flare is small: ease the nose up as the runway rises to meet you, and look at the far end of the runway.",
      "A go-around is good judgment, not failure. Decide early, fly the airplane first.",
    ],
    quiz: [
      {
        question: "What is the standard direction of turns in a traffic pattern?",
        options: [
          "Right turns unless published otherwise",
          "Left turns unless published otherwise",
          "Both directions, pilot's choice",
          "Alternating left and right",
        ],
        correctIndex: 1,
        explanation:
          "Left traffic is the default. Right traffic is only used when published for terrain, noise, or traffic reasons.",
      },
      {
        question: "What is typical pattern altitude for a light general aviation aircraft?",
        options: ["500 ft AGL", "1,000 ft AGL", "1,500 ft AGL", "3,000 ft AGL"],
        correctIndex: 1,
        explanation:
          "1,000 ft AGL is standard for light GA aircraft. Larger or faster aircraft may use 1,500 ft or higher.",
      },
      {
        question:
          "On which leg do you typically announce your position and run the before-landing checklist at a non-towered field?",
        options: ["Upwind", "Crosswind", "Downwind", "Final"],
        correctIndex: 2,
        explanation:
          "Downwind is the stabilized, level leg — you have time to announce position, run checklists, and configure for the approach.",
      },
      {
        question:
          "You're on final and realize you're well below your target airspeed. What's the correct response?",
        options: [
          "Lower the nose to gain airspeed, accept the altitude loss",
          "Add power and lower the nose to maintain glidepath while regaining speed",
          "Add full flaps to slow further",
          "Pull up to trade airspeed for altitude",
        ],
        correctIndex: 1,
        explanation:
          "Pitch for airspeed, power for path. Adding power with the nose lowered keeps you on the glidepath while you recover airspeed. If you can't fix it before 300 ft AGL, go around.",
      },
      {
        question: "What is the most important reason to decide on a go-around early rather than late?",
        options: [
          "Late go-arounds use more fuel",
          "The earlier you decide, the closer you are to the runway, which is safer",
          "A late go-around from close to the ground after an unstable approach is much riskier than one started at 300 ft",
          "It's required by ATC",
        ],
        correctIndex: 2,
        explanation:
          "A go-around started early is a routine climb. A go-around started late, after bouncing or floating, can involve ground contact and is much higher risk. Decide early.",
      },
    ],
  },

  // ===========================================================================
  // MODULE 10 — NAVIGATION BASICS
  // ===========================================================================
  {
    id: 10,
    title: "Navigation Basics",
    shortTitle: "Navigation",
    category: "Navigation",
    estimatedMinutes: 26,
    difficulty: "Intermediate",
    xpReward: 13,
    prerequisites: [8],
    tagline:
      "How pilots know where they are, where they're going, and what to do when the wind disagrees.",
    whyItMatters:
      "Navigation is the difference between flying and being flown. Even with GPS on every panel, every pilot needs to understand charts, headings, and the ground-based aids that get you home when the screen goes dark.",
    sections: [
      {
        heading: "Why We Still Navigate Visually",
        blocks: [
          {
            type: "paragraph",
            text: "It's tempting to think GPS made old-school navigation obsolete. It didn't — it made it easier to verify. Every pilot needs the underlying skill of reading the ground against a chart, because screens fail, batteries die, and the day you stop watching the world outside is the day you become a passenger in your own airplane.",
          },
          {
            type: "paragraph",
            text: "Pilotage (navigating by comparing the ground to a chart) and dead reckoning (computing heading, time, and distance from a known point) are the foundations. Radio navigation (VOR) and satellite navigation (GPS) are powerful tools built on top.",
          },
          {
            type: "callout",
            variant: "info",
            title: "The hierarchy",
            body: "Pilotage is your primary tool in visual conditions. Dead reckoning backs it up with math. VOR and GPS give you precision when the ground stops matching the chart. A good pilot uses all four and cross-checks.",
          },
        ],
      },
      {
        heading: "Reading a Sectional Chart",
        blocks: [
          {
            type: "paragraph",
            text: "A sectional chart (so named because it covers a 'section' of the country) is the VFR pilot's primary map. It's drawn to scale, with terrain shown by contour lines and color shading, and overlaid with everything a VFR pilot needs: airports, airspace, obstructions, special-use areas, and ground reference features like roads, rivers, and railroads.",
          },
          {
            type: "list",
            items: [
              "Airports: magenta for non-towered, blue for towered. Symbols indicate runway type (hard-surface, turf, water).",
              "Airspace: Class B is solid blue, Class C is solid magenta, Class D is dashed blue, Class E is dashed magenta or faded shades.",
              "Obstructions: a tall tower or building is shown with a symbol, the elevation MSL, and a parenthetical AGL height.",
              "Terrain: contour lines and color bands — green is low, brown rises with altitude, white is the highest peaks.",
              "Isogonic lines: dashed magenta lines showing magnetic variation, which you'll need to convert true headings to magnetic.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Always check the date",
            body: "Sectionals expire. The current cycle is printed on the front panel. An old chart might show a closed airport, missing tower, or new airspace boundary. Always fly with a current chart.",
          },
        ],
      },
      {
        heading: "Heading, Course, and Track",
        blocks: [
          {
            type: "paragraph",
            text: "These three words are not synonyms, and conflating them is the source of about half of beginner navigation errors.",
          },
          {
            type: "list",
            items: [
              "Course — the path over the ground you want to follow, from where you are to where you're going.",
              "Heading — the direction the airplane's nose is pointed. The compass reads this.",
              "Track — the path over the ground you're actually following, after the wind has pushed you.",
            ],
          },
          {
            type: "paragraph",
            text: "When there's no wind, heading equals track. When there is wind — and there always is — you have to point the nose (heading) somewhat into the wind so that the resulting track matches your intended course. The angle between your heading and your course is called the wind correction angle.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Don't point the nose at your destination",
            body: "Beginners often point the airplane at where they want to go and assume they're tracking there. With any crosswind, you'll be pushed off course in a long, drift-shaped arc. Point ahead of the destination, into the wind, so the ground track stays straight.",
          },
        ],
      },
      {
        heading: "VOR: The Old Reliable",
        blocks: [
          {
            type: "paragraph",
            text: "VOR (VHF Omnidirectional Range — a ground-based navigation station that broadcasts directional signals) is older than GPS but still on the checkride for a reason: it works without satellites, it's been tested by decades of use, and learning it forces you to understand radials, courses, and the difference between 'to' and 'from'.",
          },
          {
            type: "paragraph",
            text: "A VOR station sends out 360 radials, like the spokes of a wheel — one for each degree of magnetic bearing from the station. By tuning the VOR receiver and centering the CDI (Course Deviation Indicator — the vertical needle in your nav indicator), you can identify which radial you're on, or which course to fly to or from the station.",
          },
          {
            type: "diagram",
            diagramKey: "vor-cone",
            caption:
              "A VOR station broadcasts 360 radials. Tune a course, center the needle, and you're tracking a specific radial to or from the station.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Tune the VOR frequency and identify the station by listening to its Morse code identifier.",
              "Rotate the OBS (Omni-Bearing Selector — the knob on the VOR receiver) until the needle centers with a TO flag.",
              "Fly the heading shown on the OBS. The needle stays centered as long as you're tracking the course to the station.",
              "If the needle drifts left, you're right of course — turn left to re-intercept, then back to your heading.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Identify before you trust",
            body: "Every VOR broadcasts a Morse code identifier. Listen to it before relying on the signal. If you can't hear it — or hear the wrong one — you're not on the station you think you are. This is a real checkride item.",
          },
        ],
      },
      {
        heading: "GPS and the Moving Map",
        blocks: [
          {
            type: "paragraph",
            text: "GPS (Global Positioning System — a constellation of satellites that lets a receiver compute its position) is the dominant navigation tool in modern GA. A moving-map display shows your position on a chart in real time, along with your groundspeed, track, estimated time of arrival, and distance to waypoints.",
          },
          {
            type: "paragraph",
            text: "The trap with GPS is that it's so good, you stop looking outside. The airplane is happily pointing itself across the sky while you stare at a screen and miss the traffic, terrain, or weather forming ahead. Use GPS as a situational-awareness tool, not a substitute for the window.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Batteries fail. Screens fail. Plans fail.",
            body: "Always have a backup. Cross-check your GPS against pilotage and dead reckoning. Know the nearest airport. Keep a paper chart within reach. The combination is what makes you safe — not any one tool.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Confusing heading with course",
      body: "If you set a course on your GPS of 270° (due west) and then fly a heading of 270°, you'll almost never track exactly west — the wind will push you. The GPS will tell you your actual track. You need to point the nose (heading) into the wind by enough that the resulting track equals 270°. Look at your ground track, not just your heading indicator, and adjust.",
    },
    tryItInSim: {
      title: "Tune and track a VOR radial",
      steps: [
        "Start the sim on the ground at a field with a VOR within ~30 nm. KGSO (Greensboro) and the GSO VOR are a classic combo. Tune the VOR frequency into your nav radio.",
        "Turn the volume up and listen for the Morse code identifier. Confirm it matches what the chart says for that VOR.",
        "Rotate the OBS until the CDI needle centers with a TO flag. Note the heading — that's the course to the station.",
        "Take off and climb to 3,500 ft MSL. Fly the heading shown on the OBS. Keep the needle centered by making small heading corrections when it drifts.",
        "Notice the time it takes to travel a known distance. Use it to compute your groundspeed. Then check your GPS — the numbers should agree closely if you tracked correctly.",
      ],
    },
    keyTakeaways: [
      "Course is where you want to go; heading is where the nose points; track is where you actually go. Wind is the difference.",
      "Sectional charts are the VFR pilot's primary map. Fly with a current one.",
      "VOR stations broadcast 360 radials; tune, identify, then track a course TO or FROM the station.",
      "GPS is precise but seductive — keep your eyes outside and always have a backup plan.",
      "Wind correction is not optional. Point your nose into the wind so your ground track is straight.",
    ],
    quiz: [
      {
        question: "What is the difference between course and heading?",
        options: [
          "Course is where the nose points; heading is the path over the ground",
          "Course is the path over the ground you want to follow; heading is the direction the nose is pointed",
          "They are the same thing",
          "Course is magnetic; heading is true",
        ],
        correctIndex: 1,
        explanation:
          "Course is the desired path over the ground; heading is where the nose actually points. With wind, they differ by the wind correction angle.",
      },
      {
        question: "On a sectional chart, what does a solid blue airport symbol indicate?",
        options: [
          "A non-towered airport",
          "A towered airport",
          "A military-only field",
          "A water landing strip",
        ],
        correctIndex: 1,
        explanation:
          "Blue indicates a towered airport with a control tower operating at least part-time. Magenta is non-towered.",
      },
      {
        question: "How many radials does a VOR station broadcast?",
        options: ["36", "180", "360", "It varies by station"],
        correctIndex: 2,
        explanation:
          "A VOR broadcasts 360 radials — one for each magnetic bearing from the station, like spokes on a wheel.",
      },
      {
        question: "What should you do before relying on a VOR signal for navigation?",
        options: [
          "Test your GPS as a backup",
          "Tune the frequency and identify the station by listening to its Morse code",
          "Climb above 5,000 ft for clearer reception",
          "Check that the OBS dial rotates freely",
        ],
        correctIndex: 1,
        explanation:
          "Always identify the station by its Morse code identifier before relying on it. If you hear the wrong code, or none, you're not on the station you think you are.",
      },
      {
        question:
          "You fly a heading of 090° to follow a GPS course of 090°, but the GPS shows your track as 100°. What is happening?",
        options: [
          "Your compass is broken",
          "A wind from the north is pushing you south of course",
          "A wind from the south is pushing you north of course",
          "The GPS course is wrong",
        ],
        correctIndex: 1,
        explanation:
          "Heading east (090°) with a track of 100° means you've been pushed right (south). A wind from the north is blowing you south of your intended course. Turn left (north) to re-intercept.",
      },
    ],
  },

  // ===========================================================================
  // MODULE 11 — RADIO COMMUNICATIONS
  // ===========================================================================
  {
    id: 11,
    title: "Radio Communications",
    shortTitle: "Radio Comms",
    category: "Communications",
    estimatedMinutes: 24,
    difficulty: "Intermediate",
    xpReward: 12,
    prerequisites: [5],
    tagline:
      "Sound like a pilot, not like someone reading a script. Talk clearly, briefly, and with purpose.",
    whyItMatters:
      "The radio is how you coordinate with other aircraft and controllers. Mumbling, rambling, or missing a call isn't just unprofessional — it can put you in conflict with traffic you never saw coming.",
    sections: [
      {
        heading: "Why We Talk on the Radio",
        blocks: [
          {
            type: "paragraph",
            text: "Radios are how pilots share intent. At towered airports, the controller is sequencing you with everyone else. At non-towered fields, the radio is your only way to know who else is in the pattern, where they are, and what they're about to do. Either way, the goal is the same: clear, brief, standardized communication so that no one has to guess.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Listen before you talk",
            body: "Always listen on the frequency for a few seconds before keying the mic. If two people transmit at once, neither is heard (this is called a 'stepped-on' transmission). A pause and a quick listen prevents most of these.",
          },
        ],
      },
      {
        heading: "The Four-Part Call Structure",
        blocks: [
          {
            type: "paragraph",
            text: "Almost every radio call follows the same four-part structure: who you're calling, who you are, where you are, and what you want. Memorize this rhythm and you'll never be at a loss for words on the radio.",
          },
          {
            type: "diagram",
            diagramKey: "radio-call-structure",
            caption:
              "Every radio call has four beats: who you're calling, who you are, where you are, what you want.",
          },
          {
            type: "paragraph",
            text: "A real example, calling Ground Control for taxi clearance at a towered field:",
          },
          {
            type: "callout",
            variant: "info",
            title: "Example: taxi call",
            body: "\"Greensboro Ground, Cessna N123AB, on the ramp at the general aviation terminal, requesting taxi to runway 27 for departure, westbound.\" — Four parts, in order, no extra words.",
          },
          {
            type: "paragraph",
            text: "At a non-towered field, you replace 'who you're calling' with the airport name plus 'traffic':",
          },
          {
            type: "callout",
            variant: "info",
            title: "Example: downwind call at a non-towered field",
            body: "\"Greenville Traffic, Cessna N123AB, left downwind runway 23, full stop, Greenville Traffic.\" — Note you announce who you're calling at both the start and end of the call. That helps late listeners catch the whole thing.",
          },
        ],
      },
      {
        heading: "The Phonetic Alphabet and Numbers",
        blocks: [
          {
            type: "paragraph",
            text: "On a noisy radio, 'B' and 'D' sound alike, and 'M' and 'N' are nearly impossible to tell apart. The phonetic alphabet fixes that with standard words for each letter. Every pilot learns it cold.",
          },
          {
            type: "list",
            items: [
              "A — Alpha, B — Bravo, C — Charlie, D — Delta, E — Echo",
              "F — Foxtrot, G — Golf, H — Hotel, I — India, J — Juliet",
              "K — Kilo, L — Lima, M — Mike, N — November, O — Oscar",
              "P — Papa, Q — Quebec, R — Romeo, S — Sierra, T — Tango",
              "U — Uniform, V — Victor, W — Whiskey, X — X-ray, Y — Yankee, Z — Zulu",
            ],
          },
          {
            type: "paragraph",
            text: "Numbers get their own pronunciation rules. Three is pronounced 'tree' (so it doesn't sound like 'free'), five is 'fife' (so it doesn't sound like 'fire'), and nine is 'niner' (so it doesn't get confused with the German 'nein'). Runway 27 becomes 'runway two-seven,' and altitude 4,500 becomes 'four thousand five hundred.'",
          },
          {
            type: "callout",
            variant: "tip",
            title: "Your tail number",
            body: "In the US, a Cessna registered N123AB is spoken as 'Cessna November one-two-three Alpha Bravo.' Controllers will often shorten it to 'Cessna 3AB' after the first call. Use the full call sign until the controller shortens it.",
          },
        ],
      },
      {
        heading: "Non-Towered Fields: CTAF",
        blocks: [
          {
            type: "paragraph",
            text: "CTAF (Common Traffic Advisory Frequency — a radio frequency used at non-towered airports to coordinate traffic) is where you announce your intentions at fields with no control tower. Other pilots hear you, you hear them, and everyone builds a mental picture of the pattern.",
          },
          {
            type: "paragraph",
            text: "Standard calls at a non-towered field include:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "10 miles out: position and intent (e.g., '10 north, inbound, landing runway 23').",
              "Entering downwind: leg and runway.",
              "Turning base and final: short positional calls so others know your progression.",
              "Clear of the runway: when you've taxied clear after landing.",
              "Departing the pattern: which direction you're leaving.",
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "UNICOM is not CTAF",
            body: "Many fields share one frequency for both CTAF and UNICOM (a service for fuel, parking, and field advisories), but they are conceptually different. Don't expect anyone to answer a 'traffic' call — it's a broadcast to other pilots, not a two-way conversation.",
          },
        ],
      },
      {
        heading: "Towered Airports",
        blocks: [
          {
            type: "paragraph",
            text: "At a towered airport, the controller does the sequencing. You talk to Ground for taxi, then Tower for takeoff and landing. Tower may also hand you to Approach or Departure once airborne. Each handoff is just a frequency change — you're being passed to the next controller along your route.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Ground: taxi clearance from ramp to runway.",
              "Tower: takeoff clearance, landing clearance, and pattern work.",
              "Departure/Approach: radar service once you leave the airport's immediate area.",
              "Always read back hold-short instructions and runway clearances — controllers expect this.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Write it down",
            body: "When you get a clearance with multiple elements — taxi route, altitude, frequency — jot it down before you read it back. A short pencil is better than a long memory, especially in the busy terminal area.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Keying the mic before you know what to say",
      body: "The most common radio mistake is pushing the push-to-talk button and then composing your message on the fly. The result is a long, stumbling 'Uhhh, Tower, this is, uhh, Cessna, uhh, three-Alpha-Bravo...' that blocks the frequency and signals to everyone that you're behind the airplane. Instead, think through the four parts first, key the mic, deliver it crisply, release.",
    },
    tryItInSim: {
      title: "Practice a non-towered arrival",
      steps: [
        "Pick a non-towered field with a CTAF frequency in the sim (KUAO Aurora or KHHR Hawthorne work well). Start about 10 miles out at 2,500 ft AGL.",
        "Listen on the CTAF frequency for at least 30 seconds before transmitting. Note any traffic you hear.",
        "Make your 10-mile inbound call using the four-part structure: airport name + 'Traffic,' your call sign, position, and intent.",
        "Announce entering downwind, turning base, and turning final. End each call by repeating the airport name and 'Traffic.'",
        "After landing, announce 'clear of the runway' on the same frequency. Listen for any traffic you may have missed during your own transmission.",
      ],
    },
    keyTakeaways: [
      "Every radio call follows the same structure: who you're calling, who you are, where you are, what you want.",
      "Use the phonetic alphabet for letters and the standard number pronunciations (tree, fife, niner).",
      "At non-towered fields, use CTAF to broadcast your intentions to other pilots.",
      "At towered fields, talk to Ground for taxi, Tower for takeoff and landing, and Approach/Departure for radar service.",
      "Listen before you transmit. Think before you key the mic.",
    ],
    quiz: [
      {
        question: "What is the standard four-part structure of a radio call?",
        options: [
          "Who you are, who you're calling, what you want, where you are",
          "Who you're calling, who you are, where you are, what you want",
          "Who you are, what you want, who you're calling, where you are",
          "Where you are, who you are, what you want, who you're calling",
        ],
        correctIndex: 1,
        explanation:
          "Standard order: who you're calling, who you are, where you are, what you want. This gets the recipient's attention first, then identifies you, then gives context, then your request.",
      },
      {
        question: "How is the number 9 pronounced on the radio?",
        options: ["Nine", "Niner", "Nin", "Niner-nine"],
        correctIndex: 1,
        explanation:
          "Nine is pronounced 'niner' to avoid confusion with the German 'nein' and to clearly distinguish it from 'five.'",
      },
      {
        question: "What does CTAF stand for, and where is it used?",
        options: [
          "Control Tower Authorized Frequency — used at towered fields",
          "Common Traffic Advisory Frequency — used at non-towered fields to coordinate traffic",
          "Clearance Tracking and Frequency — used by Approach controllers",
          "Combined Traffic Air Frequency — used only in mountainous terrain",
        ],
        correctIndex: 1,
        explanation:
          "CTAF (Common Traffic Advisory Frequency) is used at non-towered airports so pilots can broadcast their positions and intentions to each other.",
      },
      {
        question:
          "You're taxiing to the runway at a towered airport. Which controller gives you taxi clearance?",
        options: ["Tower", "Ground", "Approach", "Center"],
        correctIndex: 1,
        explanation:
          "Ground Control handles all taxi movement on the airport's movement areas (other than the active runway). Tower handles takeoff and landing clearances.",
      },
      {
        question:
          "What should you do if you receive a 'hold short of runway 27' instruction from Ground?",
        options: [
          "Acknowledge and continue taxiing onto 27 if it looks clear",
          "Read back the hold-short instruction verbatim, then taxi up to but not across the runway 27 hold line",
          "Switch to Tower and request permission to cross",
          "Hold position indefinitely without responding",
        ],
        correctIndex: 1,
        explanation:
          "Hold-short instructions must be read back verbatim. Taxi to the holding position markings (two yellow solid lines and two dashed lines) and stop short. Never cross a runway without explicit crossing clearance.",
      },
    ],
  },

  // ===========================================================================
  // MODULE 12 — WEATHER BASICS
  // ===========================================================================
  {
    id: 12,
    title: "Weather Basics",
    shortTitle: "Weather",
    category: "Weather",
    estimatedMinutes: 30,
    difficulty: "Intermediate",
    xpReward: 14,
    prerequisites: [8],
    tagline:
      "Reading the sky and the numbers — because every flight starts and ends with the weather.",
    whyItMatters:
      "Weather is the single biggest factor in flight safety. Knowing how to read a METAR, evaluate wind, and make a calm go/no-go decision is what separates pilots from people who own airplanes.",
    sections: [
      {
        heading: "Why Weather Comes First",
        blocks: [
          {
            type: "paragraph",
            text: "More accidents in general aviation trace back to weather than to any other single cause — and most of those accidents involve a pilot who decided to go. The skill isn't predicting the weather; it's reading what's reported, understanding the trends, and being honest with yourself about whether the conditions match your skills and your airplane.",
          },
          {
            type: "paragraph",
            text: "We're going to focus on VFR (Visual Flight Rules — flight by reference to the horizon and ground, outside the clouds) weather. The instruments and decisions of IFR flight come later. For now, the question is: can I fly this leg visually, safely?",
          },
        ],
      },
      {
        heading: "Reading a METAR",
        blocks: [
          {
            type: "paragraph",
            text: "A METAR (Meteorological Aerodrome Report — a routine weather observation taken at an airport, usually hourly) is the most common weather product a pilot reads. It looks like a string of cryptic abbreviations, but once you learn the order, it decodes cleanly.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Example METAR",
            body: "METAR KSEA 151755Z 22012G20KT 6SM -RA OVC025 15/12 A2992",
          },
          {
            type: "paragraph",
            text: "Here's that same METAR, piece by piece:",
          },
          {
            type: "list",
            items: [
              "METAR — this is a routine observation (SPECI would mean a special off-hour report).",
              "KSEA — the station identifier. K is the US prefix; SEA is Seattle.",
              "151755Z — date and time in UTC (Zulu). The 15th day of the month, at 17:55 Zulu.",
              "22012G20KT — wind from 220° at 12 knots, gusting to 20.",
              "6SM — visibility 6 statute miles.",
              "-RA — light rain (RA = rain; the minus sign is light, plus is heavy, no sign is moderate).",
              "OVC025 — overcast ceiling at 2,500 ft AGL.",
              "15/12 — temperature 15°C, dewpoint 12°C.",
              "A2992 — altimeter setting 29.92 inHg.",
            ],
          },
          {
            type: "diagram",
            diagramKey: "metar-breakdown",
            caption:
              "A METAR decoded block-by-block: identifier, time, wind, visibility, weather, sky, temp/dewpoint, altimeter.",
          },
          {
            type: "callout",
            variant: "tip",
            title: "UTC is universal",
            body: "Aviation weather is always reported in Zulu (UTC) time. Get in the habit of converting. If it's 17:55Z and you're on the US East Coast in standard time, that's 12:55 PM local. A clock set to Zulu on the panel saves a lot of math.",
          },
        ],
      },
      {
        heading: "Reading a TAF",
        blocks: [
          {
            type: "paragraph",
            text: "A TAF (Terminal Aerodrome Forecast — a forecast of expected weather at an airport, typically issued four times a day and valid for 24 or 30 hours) is the METAR's forward-looking cousin. The format is similar, with added groups for time-bounded changes.",
          },
          {
            type: "paragraph",
            text: "Key groups to know:",
          },
          {
            type: "list",
            items: [
              "BECMG — gradual change over the time block.",
              "TEMPO — temporary fluctuation expected for less than half the period.",
              "PROB30 — 30% probability of the following conditions.",
              "FM1730 — from 1730Z, the following conditions apply.",
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "Forecast ≠ observation",
            body: "A TAF is a forecast — someone's best prediction. A METAR is an observation — what actually happened. Don't treat them the same. The METAR tells you what's true right now; the TAF tells you what to expect (with uncertainty) later.",
          },
        ],
      },
      {
        heading: "Wind and Crosswinds",
        blocks: [
          {
            type: "paragraph",
            text: "Wind is reported as the direction the wind is from, in degrees, followed by speed. A wind of 22012G20KT means the wind is blowing from 220° at 12 knots, gusting to 20. To find your headwind and crosswind components, you need to compare the wind direction to your landing runway.",
          },
          {
            type: "paragraph",
            text: "If you're landing runway 27 (heading 270°) and the wind is from 220° at 12 knots, the angle between your heading and the wind is 50°. A quick rule of thumb: the crosswind component is roughly the wind speed times the sine of the angle. Sin(50°) is about 0.76, so your crosswind is around 9 knots. The headwind is the cosine, about 8 knots.",
          },
          {
            type: "callout",
            variant: "tip",
            title: "The clock-face trick",
            body: "Wind 30° off your nose = about half crosswind. 45° off = about 3/4. 60° off = about 9/10. 90° off = full crosswind. Multiply wind speed by these fractions for a quick mental estimate without trigonometry.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Know your airplane's limit",
            body: "Every airplane has a demonstrated crosswind component in its POH (Pilot's Operating Handbook — the aircraft's official manual). For a C172 it's around 15 knots. That's not a hard limit, but it's a clear signal: beyond that, you're test-flying. Stay under your demonstrated limit until you have lots of experience.",
          },
        ],
      },
      {
        heading: "Density Altitude",
        blocks: [
          {
            type: "paragraph",
            text: "Density altitude is the altitude the airplane thinks it's flying at. Hot air is less dense than cold air, and humid air is less dense than dry air. On a hot day at a high-elevation airport, the airplane behaves as if it's at a much higher altitude than the field elevation says. This affects takeoff distance, climb rate, and landing distance — sometimes dramatically.",
          },
          {
            type: "paragraph",
            text: "A rule of thumb: density altitude increases about 1,000 ft for every 15°C above standard temperature at a given pressure altitude. A 5,000 ft airport on a 90°F (32°C) summer day might have a density altitude of 8,000 ft or more — and the airplane will perform like it's at 8,000 ft.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Hot, high, and heavy is a killer",
            body: "The combination of high elevation, high temperature, and a heavy airplane is one of GA's classic traps. A runway that's fine on a winter morning can be a deathtrap on a summer afternoon. Always compute density altitude and check the takeoff distance chart before you go.",
          },
        ],
      },
      {
        heading: "VFR Go/No-Go Thinking",
        blocks: [
          {
            type: "paragraph",
            text: "The VFR go/no-go decision isn't a single calculation — it's a stack of questions. The honest answer to each one either moves you closer to flying or closer to staying on the ground.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Are ceilings and visibility legally VFR at my departure, along my route, and at my destination? (Day VFR minimums: 3 SM visibility, 1,000 ft ceilings, but personal minimums should be higher.)",
              "Is the wind within my airplane's demonstrated crosswind and my personal comfort?",
              "Is the density altitude acceptable for the load I'm carrying and the runway I'm using?",
              "Are there convective SIGMETs, AIRMETs for icing or turbulence, or any other hazards along the route?",
              "If conditions deteriorate en route, do I have a safe alternate within range, and enough fuel to get there?",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Set personal minimums — and stick to them",
            body: "Regulations set the floor. Your personal minimums should be higher. Write them down: 'Ceiling 2,000 ft, visibility 5 SM, crosswind 8 knots, day only.' Revise them as your experience grows, and never lower them on a day you really want to fly.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Looking only at the METAR and ignoring the trend",
      body: "A METAR is a snapshot — what's happening right now. The trap is reading a clean METAR and concluding the weather is fine, without checking the TAF or the recent history. If the METAR has been getting worse for three hours and the TAF says the ceiling will drop below VFR in 30 minutes, the snapshot is misleading you. Always check the trend, not just the current observation.",
    },
    tryItInSim: {
      title: "Decode a METAR, then fly the conditions",
      steps: [
        "Pull up any live METAR for an airport in your sim's region (aviationweather.gov is the canonical source). Decode it block by block: station, time, wind, visibility, weather, sky, temp/dewpoint, altimeter.",
        "Set the sim's weather to match the METAR. Use the wind direction and speed, ceiling, visibility, and altimeter. If it says -RA, set light rain.",
        "Compute your crosswind component for the active runway. If the wind is 220° at 12G20 and the runway is 23, the angle is about 10° — a mostly headwind with light crosswind. If the runway is 14, the angle is 80° — a strong crosswind near your limit.",
        "Compute density altitude: take field elevation, adjust for the altimeter setting (pressure altitude), then add 120 ft for every °C above standard temperature at that altitude.",
        "Go fly a pattern in those conditions. Notice the difference between the textbook number and the actual flying — especially on a gusty crosswind landing.",
      ],
    },
    keyTakeaways: [
      "A METAR is an observation; a TAF is a forecast. Both are in UTC (Zulu) time.",
      "Wind is reported as direction-from and speed. Compute crosswind component by the angle between wind and runway.",
      "Density altitude is what the airplane feels. Hot, high, and heavy is a dangerous combination.",
      "VFR legal minimums are a floor, not a target. Set and respect personal minimums.",
      "Check the trend, not just the snapshot. A clean METAR with a deteriorating TAF is a no-go.",
    ],
    quiz: [
      {
        question:
          "In the METAR 'KSEA 151755Z 22012G20KT 6SM -RA OVC025 15/12 A2992,' what does OVC025 mean?",
        options: [
          "Overcast ceiling at 25,000 ft MSL",
          "Overcast ceiling at 2,500 ft AGL",
          "Visibility 0.25 statute miles",
          "Outlook: variable clouds at 250 ft",
        ],
        correctIndex: 1,
        explanation:
          "OVC025 means an overcast sky (8/8 cloud coverage) with a ceiling at 2,500 ft above ground level (AGL). Cloud heights in a METAR are AGL; everything else is MSL.",
      },
      {
        question: "What does the abbreviation 'BECMG' in a TAF indicate?",
        options: [
          "Permanent change to the forecast",
          "A gradual change expected over the time block",
          "A temporary fluctuation lasting less than half the period",
          "A 30% probability condition",
        ],
        correctIndex: 1,
        explanation:
          "BECMG (becoming) signals a gradual change in conditions over the specified time period. TEMPO is for shorter temporary fluctuations; PROB30 is for probability.",
      },
      {
        question:
          "You're landing runway 27 (heading 270°) with wind 220° at 12 knots. What's the approximate crosswind component?",
        options: [
          "About 5 knots",
          "About 9 knots",
          "About 12 knots",
          "About 15 knots",
        ],
        correctIndex: 1,
        explanation:
          "The angle is 50° (270 - 220). Crosswind = wind × sin(angle) = 12 × sin(50°) ≈ 12 × 0.76 ≈ 9 knots. The headwind is about 12 × cos(50°) ≈ 8 knots.",
      },
      {
        question: "Density altitude is best described as:",
        options: [
          "The altitude shown on the altimeter when set to 29.92",
          "The altitude the airplane performs as if it's at, after correcting for non-standard temperature and pressure",
          "The true altitude above mean sea level",
          "The altitude above the local terrain",
        ],
        correctIndex: 1,
        explanation:
          "Density altitude is the pressure altitude corrected for non-standard temperature. It tells you what altitude the airplane 'feels' like it's at — which drives performance.",
      },
      {
        question:
          "How much visibility is required for day VFR flight in Class E airspace below 10,000 ft MSL?",
        options: [
          "1 statute mile",
          "3 statute miles",
          "5 statute miles",
          "10 statute miles",
        ],
        correctIndex: 1,
        explanation:
          "Class E below 10,000 ft MSL requires at least 3 SM visibility and cloud clearances of 500 ft below, 1,000 ft above, and 2,000 ft horizontal. Personal minimums should be higher.",
      },
    ],
  },

  // ===========================================================================
  // MODULE 13 — EMERGENCY PROCEDURES
  // ===========================================================================
  {
    id: 13,
    title: "Emergency Procedures",
    shortTitle: "Emergencies",
    category: "Procedures",
    estimatedMinutes: 26,
    difficulty: "Advanced",
    xpReward: 15,
    prerequisites: [8],
    tagline:
      "When something goes wrong, fly the airplane first. Everything else comes after.",
    whyItMatters:
      "Real emergencies are rare, but they're the moments when having rehearsed the right response saves lives. The skill isn't panicking — it's calmly doing the right thing in the right order.",
    sections: [
      {
        heading: "The Right Mindset",
        blocks: [
          {
            type: "paragraph",
            text: "The single most important fact about emergencies in light aircraft is this: the airplane will keep flying. A complete engine failure at 3,000 ft doesn't drop you out of the sky — it turns you into a glider, and a Cessna 172 glides at roughly 9 feet forward for every 1 foot down. That's a glide ratio of about 9:1, which gives you time to think.",
          },
          {
            type: "paragraph",
            text: "Your job in that time is not to panic, not to reach for the radio, and not to start troubleshooting before you've done the basics. Your job is to fly the airplane, pick a place to land, and only then worry about anything else. That order has a name.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Aviate, Navigate, Communicate",
            body: "Three words, in that order. Fly the airplane first. Then steer it somewhere safe. Then tell someone. Reverse them at your peril.",
          },
        ],
      },
      {
        heading: "Aviate, Navigate, Communicate",
        blocks: [
          {
            type: "paragraph",
            text: "This phrase is the backbone of every emergency response. Let's break it down:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Aviate — establish best glide speed, level the wings, trim the airplane, and make sure it's flying. Nothing else matters if the airplane isn't flying.",
              "Navigate — pick a landing site. Turn toward it. Plan your descent. Know where you're going.",
              "Communicate — declare an emergency on 121.5 (or your current frequency) and squawk 7700 on the transponder. Give ATC position, souls on board, and fuel remaining.",
            ],
          },
          {
            type: "paragraph",
            text: "The order matters because nothing else matters if the airplane isn't flying. A perfectly declared mayday on a non-flying airplane doesn't help anyone. A silent glider that lands in a nice field saves everyone.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Don't reverse the order",
            body: "The classic fatal mistake is reaching for the radio the moment something goes wrong. The airplane wanders, the airspeed decays, the stall horn sounds, and suddenly you're in a much worse emergency than you started with. Fly first, talk later.",
          },
        ],
      },
      {
        heading: "Engine Failure: The Flow",
        blocks: [
          {
            type: "paragraph",
            text: "Here's a flow for an engine failure in a single-engine piston airplane. Memorize the order — the speed and shape of the response matters more than the exact wording.",
          },
          {
            type: "diagram",
            diagramKey: "engine-failure-flow",
            caption:
              "Engine failure flow: best glide first, then pick a field, then troubleshoot, then communicate. Always in that order.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Best glide speed — for a Cessna 172, that's about 65 KIAS (Knots Indicated Airspeed — the speed shown on the airspeed indicator). Pitch for it immediately.",
              "Pick a field — within gliding range, into the wind if possible, with a clear approach. Bias toward large, open, and flat. Roads and highways work but watch for power lines and traffic.",
              "Troubleshoot — only if you have altitude and time. Mixture rich, fuel selector on a fuller tank, fuel pump on, magnetos on both, primer locked. If it doesn't restart in seconds, stop trying and prepare to land.",
              "Declare — squawk 7700 on the transponder, call Mayday on 121.5 or your current frequency. Give position, souls, and fuel.",
              "Configure for landing — seatbelts tight, doors unlatched (so they don't jam shut in a crash), mixture idle cutoff before touchdown, fuel selector off, master switch off just before touchdown.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Practice until it's boring",
            body: "In the sim, pull the engine to idle at altitude and run the flow out loud. Time how long it takes. The first time will feel frantic; the tenth time will feel like a checklist. That's the goal — boring competence under pressure.",
          },
        ],
      },
      {
        heading: "Best Glide and Selecting a Field",
        blocks: [
          {
            type: "paragraph",
            text: "Best glide speed (Vbg — Best Glide speed, the airspeed that gives you the maximum horizontal distance for a given altitude loss) is the number to know for your airplane. For a C172 it's about 65 KIAS at max gross weight, slightly lower when light. Pitch for that speed and the airplane will glide the farthest.",
          },
          {
            type: "paragraph",
            text: "When picking a field, the rule of thumb is to bias toward what's directly below or within 45° of your nose — those are the places you can reach. A field straight ahead is almost always better than one behind you. Pick a field that is large, flat, and free of obvious obstacles (power lines, fences, livestock).",
          },
          {
            type: "callout",
            variant: "info",
            title: "The 1,000-foot rule",
            body: "A C172 glides about 1.5 miles per 1,000 ft of altitude. So at 5,000 ft AGL, you can glide roughly 7.5 miles. That's your search radius for a landing site. Pick something inside that radius; don't try to stretch the glide to a farther field — you'll come up short.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Never stretch a glide",
            body: "The temptation when your chosen field is just out of reach is to raise the nose and 'stretch' the glide. It doesn't work — raising the nose increases drag and you actually lose more distance. Pitch for best glide, accept where you can land, and aim for a controlled arrival.",
          },
        ],
      },
      {
        heading: "Other Common Emergencies",
        blocks: [
          {
            type: "paragraph",
            text: "Engine failures are the famous one, but they're not the only one. A few others to know:",
          },
          {
            type: "list",
            items: [
              "Engine fire on the ground — mixture idle cutoff, fuel selector off, master off, evacuate. Don't try to taxi away.",
              "Engine fire in flight — mixture rich (to flood the engine and put out the fire), fuel selector off, cabin vents open, land as soon as possible.",
              "Electrical fire — master off, vents open, use a portable radio if available. Land soon.",
              "Door opening in flight — don't panic. The airplane will fly fine. Slow to reduce noise and buffeting, return to the airport, land normally. Don't try to close it in flight unless you have a passenger who can.",
              "Vacuum pump failure (in IMC) — partial panel. The attitude indicator will tumble after a few minutes. Trust the turn coordinator and pitot-static instruments. Get visual conditions as soon as possible.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Read your aircraft's emergency checklist",
            body: "Every POH has an emergency procedures section. Read it. Memorize the first few items for the most likely emergencies. The checklist is for the things that come after you've already flown the airplane.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Reaching for the radio before flying the airplane",
      body: "The classic fatal mistake in simulated (and real) emergencies is reaching for the radio the instant something goes wrong. The airplane wanders off heading, the airspeed decays, and the pilot is suddenly dealing with an aerodynamic stall on top of the original emergency. Fly first. Best glide, level wings, trim. Then pick a field. Then declare. The radio can wait 30 seconds; a stalled airplane cannot.",
    },
    tryItInSim: {
      title: "Practice the engine failure flow",
      steps: [
        "Climb to 5,000 ft AGL over an area with some open terrain. Trim for level flight at cruise power.",
        "Pull the throttle to idle (don't actually shut down the engine in the sim — idle simulates the failure well enough for the flow).",
        "Immediately: pitch for 65 KIAS (best glide). Level the wings. Trim.",
        "Pick a field within your gliding range. Aim for one into the wind and roughly straight ahead. Say out loud: 'Aviate — best glide. Navigate — field at 11 o'clock. Communicate — squawk 7700, Mayday.'",
        "Run the troubleshooting flow briefly (mixture rich, fuel pump on, mags both). If the engine doesn't restart in 15 seconds, stop and prepare for landing. Time yourself — aim for the whole flow under 90 seconds.",
      ],
    },
    keyTakeaways: [
      "Aviate, Navigate, Communicate — in that order. Always.",
      "Best glide speed for a C172 is about 65 KIAS. Pitch for it immediately after an engine failure.",
      "A C172 glides about 1.5 miles per 1,000 ft of altitude. Use that to size your landing options.",
      "Never stretch a glide. Pitch for best glide and accept where you can land.",
      "Declare on 121.5 MHz, squawk 7700, give position, souls, and fuel. But only after you're flying.",
    ],
    quiz: [
      {
        question: "What is the correct order of priorities during an emergency?",
        options: [
          "Communicate, Navigate, Aviate",
          "Navigate, Aviate, Communicate",
          "Aviate, Navigate, Communicate",
          "Aviate, Communicate, Navigate",
        ],
        correctIndex: 2,
        explanation:
          "Aviate (fly the airplane), Navigate (pick a landing site), Communicate (declare the emergency). Flying first is non-negotiable; the rest can wait 30 seconds.",
      },
      {
        question: "Approximate best glide speed for a Cessna 172?",
        options: ["45 KIAS", "55 KIAS", "65 KIAS", "80 KIAS"],
        correctIndex: 2,
        explanation:
          "Best glide for a C172 is about 65 KIAS at max gross weight (slightly lower when light). Check your specific POH for the exact number for your aircraft.",
      },
      {
        question:
          "You're at 5,000 ft AGL when the engine fails. Roughly how far can you glide in a C172?",
        options: [
          "About 2.5 miles",
          "About 5 miles",
          "About 7.5 miles",
          "About 15 miles",
        ],
        correctIndex: 2,
        explanation:
          "A C172 glides about 1.5 miles per 1,000 ft of altitude. At 5,000 ft AGL, that's roughly 7.5 miles — your search radius for a landing site.",
      },
      {
        question:
          "Your chosen landing field appears to be slightly out of gliding range. What should you do?",
        options: [
          "Raise the nose to 'stretch' the glide so you reach the field",
          "Pitch for best glide and pick a closer field you can actually reach",
          "Lower the nose to build airspeed and dive for the field",
          "Drop flaps to extend the glide",
        ],
        correctIndex: 1,
        explanation:
          "You cannot stretch a glide by raising the nose — you actually lose distance from increased drag. Pitch for best glide and pick a closer field. Controlled arrival short of your ideal field is better than stalling short of it.",
      },
      {
        question: "What transponder code should you squawk to declare an emergency?",
        options: ["7600", "7700", "7500", "1200"],
        correctIndex: 1,
        explanation:
          "7700 is the emergency code. 7600 is radio failure, 7500 is hijack, and 1200 is the standard VFR code. Set 7700 to alert ATC that you have an emergency, then call on 121.5.",
      },
    ],
  },

  // ===========================================================================
  // MODULE 14 — CROSS-COUNTRY FLIGHT PLANNING
  // ===========================================================================
  {
    id: 14,
    title: "Cross-Country Flight Planning",
    shortTitle: "XC Planning",
    category: "Navigation",
    estimatedMinutes: 30,
    difficulty: "Advanced",
    xpReward: 15,
    prerequisites: [10, 11, 12],
    tagline:
      "Plan the flight, fly the plan — but be ready to throw it out when the world doesn't cooperate.",
    whyItMatters:
      "Cross-country flying is where everything you've learned comes together. A good plan makes the flight boring in the best way. A bad plan makes it exciting in the worst way.",
    sections: [
      {
        heading: "What 'Cross-Country' Means",
        blocks: [
          {
            type: "paragraph",
            text: "In aviation, 'cross-country' has a specific meaning: a flight that lands at an airport at least 50 nautical miles from your departure point. (For private pilot certification, the rules are slightly more specific, but 50 nm is the working definition.) Beyond the regulation, cross-country flying is the act of going somewhere — and going somewhere requires planning, discipline, and a healthy respect for what could go wrong between here and there.",
          },
          {
            type: "paragraph",
            text: "The plan is your contract with yourself. You write it down before you fly, you refer to it during the flight, and you keep it updated as conditions change. The act of planning is what makes you safe — not the paper itself, but the thinking it forces.",
          },
        ],
      },
      {
        heading: "Choosing a Route",
        blocks: [
          {
            type: "paragraph",
            text: "A straight line on a sectional is rarely the best route. You want to consider terrain, airspace, weather patterns, available alternates, and visual landmarks that will help you confirm you're on course. A route that follows a highway or a river gives you a ground reference to verify your position; a route that crosses 80 miles of featureless desert doesn't.",
          },
          {
            type: "list",
            items: [
              "Choose checkpoints every 10–15 nm so you can verify position regularly.",
              "Avoid Class B airspace unless you have a specific reason to transit it (and are prepared for the radio work).",
              "Plan a route with available alternates — airports within gliding or near-gliding distance along the way.",
              "Consider terrain: a direct route over mountains may not be safe; a route that stays low and follows a valley may be longer but smarter.",
              "Note the minimum safe altitude for each segment — high enough for terrain, obstacles, and an engine-out glide to a reasonable spot.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Pick checkpoints you can't miss",
            body: "A small town is a better checkpoint than a tiny lake. A bend in a river is better than a straight section. A highway interchange is better than a country road. Pick features that you'll recognize instantly from the air, not features that 'should be around here somewhere.'",
          },
        ],
      },
      {
        heading: "Weather and NOTAMs",
        blocks: [
          {
            type: "paragraph",
            text: "You've already learned to read a METAR and a TAF. For cross-country, the question is broader: what's the weather doing across the whole route, not just at the endpoints? A route may have great conditions at both ends and a line of thunderstorms in the middle.",
          },
          {
            type: "list",
            items: [
              "Pull a standard briefing (online via 1800wxbrief.com or an app like ForeFlight). It includes adverse conditions, current weather, en-route forecasts, and destination forecasts.",
              "Check AIRMETs (Airmen's Meteorological Information — advisory forecasts for moderate icing, turbulence, sustained surface winds ≥30 kt, IFR conditions, or extensive mountain obscuration) along the route.",
              "Check SIGMETs (Significant Meteorological Information — advisory for severe or hazardous conditions like severe icing, severe or extreme turbulence, dust storms, or volcanic ash).",
              "Read NOTAMs (Notices to Airmen — official notices about airport closures, runway lights out, navaid outages, temporary flight restrictions, and more) for every airport you'll use, including alternates.",
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "Adverse weather is your decision, not ATC's",
            body: "ATC doesn't keep VFR pilots out of bad weather — that's your call. The briefing gives you the information; the go/no-go is yours. If you don't fully understand a hazard (convective SIGMET, freezing level over mountains), get a live briefing from Flight Service and ask questions until you do.",
          },
        ],
      },
      {
        heading: "Fuel Planning",
        blocks: [
          {
            type: "paragraph",
            text: "Fuel is the resource that turns an inconvenience into an emergency. The FAA requires a daytime VFR fuel reserve of 30 minutes; most instructors and experienced pilots recommend an hour or more. Plan to land with that reserve — not at empty.",
          },
          {
            type: "paragraph",
            text: "To compute fuel, you need three numbers for each leg: time, distance, and fuel burn. Here's the basic flow:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Determine true airspeed for your planned altitude and power setting (from the POH).",
              "Determine wind aloft at your planned altitude (from the winds-aloft forecast).",
              "Compute groundspeed by combining true airspeed and wind.",
              "Divide leg distance by groundspeed to get time for each leg.",
              "Multiply time by fuel burn rate (gallons per hour, from the POH) to get fuel used.",
              "Add the legs, add the reserve, and that's your required fuel. Compare to usable fuel on board.",
            ],
          },
          {
            type: "diagram",
            diagramKey: "xc-nav-log",
            caption:
              "A nav log organizes each leg with course, distance, true airspeed, wind, groundspeed, time, and fuel burn — updated in flight.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "Reserve is for the unexpected, not for being lazy",
            body: "Headwinds stronger than forecast, a longer-than-expected pattern entry, a missed approach and go-around, or a runway change at your destination — all eat into your reserve. If your plan has you landing with the legal minimum, you don't have a plan. You have a hope.",
          },
        ],
      },
      {
        heading: "The Nav Log",
        blocks: [
          {
            type: "paragraph",
            text: "A nav log is a table that organizes every calculation for your flight: one row per leg, columns for course, distance, true heading, wind correction, magnetic heading, magnetic variation, compass heading, true airspeed, wind, groundspeed, time, and fuel. It looks intimidating at first, but each column is just a step in the process we've already covered.",
          },
          {
            type: "paragraph",
            text: "On the flight, the nav log is your reference. You compare your actual time at each checkpoint to the planned time, and the difference tells you whether your groundspeed matches what you forecast. If you're consistently slower, your fuel calculations need updating — and you may need to divert.",
          },
          {
            type: "callout",
            variant: "tip",
            title: "Update in flight",
            body: "A nav log is not a contract; it's a baseline. If your groundspeed is 10 knots slower than planned because of a stronger headwind, write down the new number and recompute your arrival fuel. Plans that aren't updated in flight are plans that fail.",
          },
        ],
      },
      {
        heading: "Diversions",
        blocks: [
          {
            type: "paragraph",
            text: "A diversion is the decision to change your destination mid-flight. It might be because weather moved in, because a passenger got sick, because the destination airport closed, or because your fuel calculations showed you wouldn't have a safe reserve. Whatever the reason, the diversion itself is not an emergency — it's a normal, planned-for possibility.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Identify your current position on the chart (a checkpoint, a VOR radial, or a GPS fix).",
              "Pick a divert airport — one that's clearly within range, with weather and a runway suitable for your aircraft.",
              "Estimate the heading and distance with a chart, plotter, or the GPS direct function.",
              "Compute time and fuel to the divert airport. Verify you'll arrive with legal reserve.",
              "Tell ATC or Flight Service what you're doing. Get weather and runway information for the divert airport if you don't have it.",
              "Fly to the new destination. The diversion is complete when you're safely on the ground.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Decide early, decide calmly",
            body: "The earlier you divert, the easier it is. Waiting until fuel is critical turns a routine decision into a stressful one. If conditions at your destination are deteriorating or your fuel is getting tight, divert now. There is no shame in landing somewhere other than your plan.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Planning to land with the legal minimum fuel reserve",
      body: "The FAA's 30-minute day VFR reserve is a legal floor, not a target. Pilots who plan to arrive with exactly 30 minutes of fuel are setting themselves up for an emergency when the headwind is 5 knots stronger than forecast or the destination airport sequences them into a long pattern. Plan to land with an hour of fuel — or more — and you'll never have to make a fuel-stress decision in flight.",
    },
    tryItInSim: {
      title: "Plan and fly a short cross-country",
      steps: [
        "Pick two airports 80–120 nm apart on a sectional. Note the magnetic course, distance, and terrain between them. Pick 4–5 visual checkpoints along the way.",
        "Pull a (simulated or real) weather briefing for both airports and along the route. Note wind aloft at your planned cruising altitude.",
        "Compute your true airspeed, groundspeed, time en route, and fuel burn for the flight. Add a 1-hour reserve. Confirm your airplane can carry that much fuel.",
        "Take off and climb to your planned altitude. Fly the planned compass heading. At each checkpoint, note your actual time vs. planned time, and update your groundspeed and arrival fuel.",
        "Halfway through the flight, simulate a diversion: pick an alternate airport 20 nm off your route, compute heading and fuel, and fly to it. Land. The point is to practice the diversion flow, not just the planned route.",
      ],
    },
    keyTakeaways: [
      "Cross-country flying starts with a written plan: route, checkpoints, weather, fuel, and alternates.",
      "Choose a route with regular checkpoints, available alternates, and safe terrain.",
      "Plan fuel to land with at least an hour of reserve — the legal minimum is a floor, not a target.",
      "A nav log organizes calculations and provides a baseline to update in flight.",
      "Diversions are normal. Decide early, compute calmly, and never push fuel to make a planned destination.",
    ],
    quiz: [
      {
        question:
          "For private pilot certification, a cross-country flight must include a landing at least how far from the departure point?",
        options: ["25 nm", "50 nm", "100 nm", "250 nm"],
        correctIndex: 1,
        explanation:
          "The FAA defines a cross-country flight for the private pilot certificate as one with a landing at least 50 nm from the departure point.",
      },
      {
        question: "What is the minimum fuel reserve required for day VFR flight?",
        options: ["30 minutes", "45 minutes", "1 hour", "2 hours"],
        correctIndex: 0,
        explanation:
          "The FAA requires 30 minutes of fuel reserve at the planned destination for day VFR. However, most instructors recommend an hour or more as a personal minimum.",
      },
      {
        question: "What does an AIRMET advise pilots about?",
        options: [
          "Severe icing, severe turbulence, or dust storms",
          "Moderate icing, moderate turbulence, IFR conditions, or sustained 30+ kt surface winds",
          "Temporary flight restrictions",
          "Airport runway closures",
        ],
        correctIndex: 1,
        explanation:
          "AIRMETs (Airmen's Meteorological Information) cover moderate-level hazards. SIGMETs cover the severe-level hazards. NOTAMs cover airport and airspace closures.",
      },
      {
        question:
          "You planned a groundspeed of 110 knots, but your actual groundspeed is 100 knots. What should you do?",
        options: [
          "Speed up the airplane to make up the difference",
          "Ignore the discrepancy; it's within tolerance",
          "Update your nav log with the new groundspeed, recompute arrival fuel, and decide if you still have adequate reserve",
          "Declare an emergency",
        ],
        correctIndex: 2,
        explanation:
          "Update the nav log with actual groundspeed, recompute time and fuel, and confirm your reserve is still adequate. If not, divert. Plans must be updated in flight, not frozen.",
      },
      {
        question: "What is the first step when diverting to an alternate airport?",
        options: [
          "Call ATC and tell them your new destination",
          "Identify your current position on the chart",
          "Start descending to find the new airport",
          "Reset your GPS to direct-to the new airport",
        ],
        correctIndex: 1,
        explanation:
          "You can't plan a divert without knowing where you're starting from. Identify your current position first, then pick a divert airport, then compute heading and fuel, then communicate.",
      },
    ],
  },

  // ===========================================================================
  // MODULE 15 — INTRO TO IFR
  // ===========================================================================
  {
    id: 15,
    title: "Intro to IFR",
    shortTitle: "Intro to IFR",
    category: "Instrument Flying",
    estimatedMinutes: 28,
    difficulty: "Advanced",
    xpReward: 14,
    prerequisites: [10, 13],
    tagline:
      "A first look into the world of flight by instruments — preview, not mastery.",
    whyItMatters:
      "Instrument flying is a separate rating for a reason: it's a different way of thinking. This module won't make you IFR-rated, but it'll teach you what the instruments mean, how an approach works, and why every pilot should at least understand the basics.",
    sections: [
      {
        heading: "VFR vs IFR — What Changes",
        blocks: [
          {
            type: "paragraph",
            text: "VFR (Visual Flight Rules) means flying by what you see outside: the horizon, the ground, the sky. IFR (Instrument Flight Rules) means flying by what the instruments tell you, when the outside view isn't reliable enough to use. The difference isn't just about weather — it's a fundamentally different way to control the airplane.",
          },
          {
            type: "paragraph",
            text: "Under VFR, you control pitch and bank by looking at the horizon. Under IFR, you do the same thing by looking at the attitude indicator, altimeter, and heading indicator. The control inputs are identical. What changes is your reference: the real horizon vs. the artificial one inside the instrument.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Why this is just a preview",
            body: "The IFR rating takes 40–50 hours of dedicated training. We're going to cover the vocabulary and basic concepts so the system makes sense to you — not so you can fly IFR. Always fly within your rating and currency.",
          },
          {
            type: "callout",
            variant: "warning",
            title: "VFR pilots die in IMC",
            body: "The single most dangerous thing a VFR-only pilot can do is blunder into clouds. Spatial disorientation — your inner ear lying to you about which way is up — kills pilots within minutes. The first time you find yourself in IMC (Instrument Meteorological Conditions — weather below VFR minimums), the only correct response is a 180° turn back the way you came, on instruments, NOW.",
          },
        ],
      },
      {
        heading: "The Instrument Scan",
        blocks: [
          {
            type: "paragraph",
            text: "IFR flight requires a continuous scan of the six-pack instruments: attitude indicator, altimeter, airspeed indicator, heading indicator, turn coordinator, and vertical speed indicator. The attitude indicator is primary — it shows pitch and bank directly. The others confirm and refine.",
          },
          {
            type: "paragraph",
            text: "A basic scan looks like this: attitude indicator → altimeter → attitude indicator → heading indicator → attitude indicator → airspeed indicator. Always return to the attitude indicator between other instruments. It's the hub; everything else is a spoke.",
          },
          {
            type: "list",
            items: [
              "Attitude indicator — pitch and bank. Primary reference.",
              "Altimeter — altitude. Confirms whether pitch inputs are keeping you level.",
              "Heading indicator — direction. Confirms whether bank inputs are keeping you on heading.",
              "Airspeed indicator — speed. Confirms whether power and pitch are keeping you on speed.",
              "Turn coordinator — rate of turn and coordination (ball centered).",
              "Vertical speed indicator — climb/descent rate. Trend information, useful for precision approaches.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Small inputs, big effects",
            body: "On instruments, two degrees of bank change feels like nothing — but you'll be 30° off heading before you know it. Make small corrections: 2° heading changes, 100 ft altitude adjustments. Precision comes from small inputs held steadily, not big inputs corrected quickly.",
          },
        ],
      },
      {
        heading: "The Localizer: Lateral Guidance",
        blocks: [
          {
            type: "paragraph",
            text: "A localizer (LOC — the lateral component of an ILS, broadcasting a signal aligned with the runway centerline) is a radio beam that extends outward from the approach end of a runway. It tells you whether you're left, right, or on the runway centerline. The instrument that displays it is the same CDI (Course Deviation Indicator) needle you've used for VOR.",
          },
          {
            type: "paragraph",
            text: "When the needle is centered, you're on the runway centerline. If the needle deflects left, the course is to your left — you need to turn left to re-intercept. If it deflects right, the course is to your right. The localizer is about four times more sensitive than a VOR signal, so small corrections matter.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Localizer sensitivity",
            body: "A localizer is fully deflected at about 350 ft off centerline at the runway threshold. That means near the ground, even a small needle deflection is a lot of feet. As you get closer to the runway, smaller and smaller corrections are needed.",
          },
        ],
      },
      {
        heading: "The Glideslope: Vertical Guidance",
        blocks: [
          {
            type: "paragraph",
            text: "The glideslope (GS — the vertical component of an ILS, broadcasting a signal that defines a 3° descent path to the runway) is the second half of the precision approach. It tells you whether you're above, below, or on the proper descent angle. The horizontal needle on your nav indicator shows it.",
          },
          {
            type: "paragraph",
            text: "When the glideslope needle is centered, you're on the 3° path. If the needle deflects up, the glidepath is above you — you're too low, and you need to add power or reduce descent rate. If the needle deflects down, you're too high — reduce power or increase descent rate.",
          },
          {
            type: "diagram",
            diagramKey: "ils-approach",
            caption:
              "An ILS approach: the localizer (vertical needle) provides lateral guidance along the runway centerline; the glideslope (horizontal needle) provides vertical guidance down the 3° descent path.",
          },
          {
            type: "callout",
            variant: "tip",
            title: "Pitch for airspeed, power for the glideslope",
            body: "On the ILS, the rule of thumb is opposite from cruise flight: small pitch changes control airspeed, and small power changes control your descent rate (which keeps you on the glideslope). If you're slow, lower the nose and add power. If you're fast, raise the nose and reduce power. The two always move together.",
          },
        ],
      },
      {
        heading: "The ILS Approach",
        blocks: [
          {
            type: "paragraph",
            text: "An ILS (Instrument Landing System — a precision approach system combining localizer and glideslope signals, providing both lateral and vertical guidance to a runway) is the gold-standard instrument approach. It guides you down to a decision altitude, where you must either see the runway and land or execute a missed approach and try again.",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Intercept the localizer — fly the inbound heading, capture the localizer needle, track the centerline.",
              "Intercept the glideslope — at the right altitude, the glideslope needle comes down to center. As it centers, reduce power and begin your descent.",
              "Track both needles — small corrections to heading (localizer) and power/pitch (glideslope). Keep both needles centered.",
              "Decision altitude (DA) — the altitude at which you must decide to land or go around. If you see the runway environment, land. If not, execute the missed approach.",
              "Missed approach — full power, climb, and follow the published missed approach procedure. Try again, divert, or hold.",
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "Don't chase the needles",
            body: "Beginners tend to overcorrect: the needle goes left, they bank hard left; the needle overshoots right, they bank hard right. The result is a serpentine path that gets worse as you get closer to the runway. Make small corrections and wait — the needles move slowly, and so should your inputs.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Other approach types exist",
            body: "ILS is the precision standard, but there are also VOR approaches, RNAV (GPS) approaches, and localizer-only approaches. The concepts are similar — lateral guidance, sometimes vertical, down to a minimum altitude. The technology varies, but the discipline is the same.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Chasing the needles with large corrections",
      body: "On an ILS approach, the natural reaction to a needle deflection is to correct aggressively. But the needles are sensitive, and a big correction overshoots — which produces a bigger correction in the other direction — which produces an even bigger one. By the time you're near the runway, you're flying an S-curve. The cure: small inputs, two degrees at a time, and patience. Wait for the needle to respond before adding more correction.",
    },
    tryItInSim: {
      title: "Fly an ILS approach (in VFR conditions)",
      steps: [
        "Pick an airport with an ILS approach (KSEA, KDEN, and KATL all have several). Set up clear-day VFR conditions so you can see what's happening outside while you fly on instruments.",
        "Tune the ILS frequency into your nav radio. Set the published inbound course on the OBS or HSI.",
        "Fly to the approach entry point and intercept the localizer. Keep the vertical needle centered with small (2–5°) heading corrections.",
        "As the glideslope needle comes down to center, reduce power and begin a 500–700 fpm descent. Track both needles with small corrections.",
        "At decision altitude (about 200 ft AGL for a typical ILS), look up. If you see the runway, land. If not, execute the missed approach: full power, climb straight ahead, then follow the published missed approach procedure. The point is the discipline, not the landing.",
      ],
    },
    keyTakeaways: [
      "IFR is flight by instruments when outside references aren't reliable. It requires a separate rating.",
      "The instrument scan always returns to the attitude indicator between other instruments.",
      "A localizer provides lateral guidance — runway centerline. The vertical needle shows left/right.",
      "A glideslope provides vertical guidance — the 3° descent path. The horizontal needle shows above/below.",
      "An ILS approach ends at decision altitude: land if you see the runway, otherwise execute the missed approach.",
    ],
    quiz: [
      {
        question: "What is the key difference between VFR and IFR flight?",
        options: [
          "VFR is below 10,000 ft; IFR is above",
          "VFR is by outside visual reference; IFR is by instrument reference",
          "VFR is daytime; IFR is nighttime",
          "VFR uses towered airports; IFR uses non-towered",
        ],
        correctIndex: 1,
        explanation:
          "VFR uses the outside horizon and ground for control. IFR uses the instruments. The rating is required because flying by instruments is a different skill.",
      },
      {
        question: "What does the localizer needle on an ILS show?",
        options: [
          "Vertical position relative to the glideslope",
          "Lateral position relative to runway centerline",
          "Distance to the runway",
          "Airspeed trend",
        ],
        correctIndex: 1,
        explanation:
          "The localizer is the lateral (left/right) component of an ILS. The vertical needle shows whether you're left, right, or on the runway centerline.",
      },
      {
        question:
          "On an ILS approach, what does it mean if the glideslope needle deflects upward?",
        options: [
          "You need to climb — the glideslope is above you",
          "You need to descend — the glideslope is below you",
          "You're on the glideslope",
          "The glideslope is unusable",
        ],
        correctIndex: 0,
        explanation:
          "If the needle moves up, the glideslope path is above you — you're too low. Add power or reduce descent rate to climb back up to it.",
      },
      {
        question: "What is 'decision altitude' (DA) on an ILS approach?",
        options: [
          "The altitude at which you must decide whether to land or execute a missed approach",
          "The altitude at which you must start descending",
          "The minimum safe altitude for the route",
          "The altitude to switch from instruments to visual",
        ],
        correctIndex: 0,
        explanation:
          "DA is the altitude at which you must decide: if you see the runway environment, continue and land; if not, execute the missed approach immediately.",
      },
      {
        question:
          "What is the correct response to a small localizer needle deflection during an ILS?",
        options: [
          "Bank hard toward the needle to recover quickly",
          "Make a small heading change (2–5°) and wait for the needle to respond",
          "Ignore the needle until full-scale deflection",
          "Increase power to fix the deviation",
        ],
        correctIndex: 1,
        explanation:
          "Small corrections, then patience. The localizer is sensitive and the needle responds slowly. Aggressive corrections cause overshoot and oscillation.",
      },
    ],
  },

  // ===========================================================================
  // MODULE 16 — AIRCRAFT-SPECIFIC MODULES
  // ===========================================================================
  {
    id: 16,
    title: "Aircraft-Specific Modules",
    shortTitle: "Aircraft Specific",
    category: "Aircraft",
    estimatedMinutes: 28,
    difficulty: "Intermediate",
    xpReward: 13,
    prerequisites: [9, 14],
    tagline:
      "The Cessna 172 and Piper PA-28 are the two most-flown trainers in history. Here's how they actually differ.",
    whyItMatters:
      "Every airplane type has its own personality: speeds, systems, sight picture, and quirks. Knowing the differences makes you a better pilot — and a safer one when you transition to a new type.",
    sections: [
      {
        heading: "Why One Airframe Isn't Another",
        blocks: [
          {
            type: "paragraph",
            text: "A Cessna 172 and a Piper PA-28 Cherokee are both four-seat, single-engine trainers with 160 horsepower engines. On paper, they're nearly identical. In practice, they feel like different airplanes. The 172 has a high wing, tricycle gear, and a control yoke that comes out of the panel. The PA-28 has a low wing, tricycle gear, and a control yoke that comes out of the panel — but the wing placement changes everything: sight picture, fuel system, ground effect, crosswind behavior, and cockpit ergonomics.",
          },
          {
            type: "paragraph",
            text: "Every transition to a new type requires a checkout with an instructor and a careful read of the POH (Pilot's Operating Handbook — the aircraft's official manual). The speeds are different. The systems are different. The handling is different. Treat each type with respect.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Same category, different airplanes",
            body: "Both the C172 and PA-28 are in the same FAA category (single-engine land, under 12,500 lb). But each requires its own type-specific checkout. Don't assume that because you can fly one, you can fly the other.",
          },
        ],
      },
      {
        heading: "Cessna 172 Deep Dive",
        blocks: [
          {
            type: "paragraph",
            text: "The Cessna 172 Skyhawk is the most-produced aircraft in history. Over 44,000 have been built since 1956, and almost every flight school has at least one. It's the default trainer for a reason: forgiving, stable, predictable, and tolerant of beginner mistakes.",
          },
          {
            type: "list",
            items: [
              "Engine: Lycoming O-320 (older models) or O-360 (later), 160 hp, four-cylinder, normally aspirated.",
              "Wing: high-wing, braced with struts. Excellent downward visibility; the wing blocks upward turns.",
              "Fuel: two wing tanks (one per side), gravity-fed to the engine because of the high-wing placement — no fuel pump required. Selector has LEFT, RIGHT, BOTH, OFF positions.",
              "Landing gear: fixed tricycle. Steerable nosewheel linked to rudder pedals.",
              "Flaps: electrically actuated, 0/10/20/30 degrees.",
              "Cabin: four seats, two doors. High wing means a low cabin floor — easy entry and exit.",
            ],
          },
          {
            type: "paragraph",
            text: "Key speeds (at max gross weight, approximate — always verify with the POH for your specific aircraft):",
          },
          {
            type: "list",
            items: [
              "Rotation speed (Vr): ~55 KIAS",
              "Best rate of climb (Vy): ~73 KIAS",
              "Best angle of climb (Vx): ~62 KIAS",
              "Cruise: 110–120 KIAS depending on power setting and altitude",
              "Best glide (Vbg): ~65 KIAS",
              "Approach speed (Vapp): 65–70 KIAS with flaps",
              "Stall speed (Vs0, flaps down): ~40 KIAS at gross",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "The 172 forgives",
            body: "The 172 is famously tolerant of imperfect landings. It has a long, stable flare, the high wing gives plenty of ground effect, and the nosewheel is forgiving. That's why so many pilots learn in it — you can make mistakes and recover. Just don't get so comfortable that you stop being precise.",
          },
        ],
      },
      {
        heading: "Piper PA-28 Comparison",
        blocks: [
          {
            type: "paragraph",
            text: "The Piper PA-28 Cherokee family (including the Warrior, Archer, and Arrow) is the other great trainer dynasty. Same basic mission as the 172, but with a low wing, a different fuel system, and a slightly different feel in the air.",
          },
          {
            type: "list",
            items: [
              "Engine: Lycoming O-320 (160 hp in the Cherokee 160 and Warrior) or O-360 (180 hp in the Archer).",
              "Wing: low-wing, cantilever (no struts). Excellent upward visibility in turns; the wing blocks downward turns to that side.",
              "Fuel: two tanks (one per wing). Because the tanks sit below the engine, gravity feed won't work — the PA-28 needs an engine-driven fuel pump and an electric auxiliary fuel pump. Selector has LEFT, RIGHT, BOTH, OFF positions in most models.",
              "Landing gear: fixed tricycle. Gear legs are steel leaf springs — a noticeably firmer ride on landing than the 172's spring steel.",
              "Flaps: manually actuated by a Johnson bar between the seats, in 0/10/25/40 degree positions.",
              "Cabin: four seats, two doors. Single pilot-side door in older models; newer models add a right-side door.",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "The PA-28 family",
            body: "The Cherokee name covers many models. The PA-28-140 Cherokee Cruiser (150 hp), PA-28-160 Cherokee (160 hp), PA-28-161 Warrior II (160 hp, tapered wing), PA-28-181 Archer II (180 hp, tapered wing), and the retractable PA-28R Arrow are all related. Always verify which model you're flying.",
          },
        ],
      },
      {
        heading: "Handling Differences: 172 vs PA-28",
        blocks: [
          {
            type: "diagram",
            diagramKey: "c172-vs-pa28",
            caption:
              "The Cessna 172 (high wing, strut-braced) and Piper PA-28 (low wing, cantilever) differ in visibility, fuel system, and flare feel.",
          },
          {
            type: "list",
            items: [
              "Sight picture on landing — the 172's high wing means you see the runway from below the wing root; the PA-28's low wing puts the runway visible over the cowling. Both flare differently because of this.",
              "Ground effect — the 172's high wing produces less ground effect; the PA-28's low wing generates more ground effect, which means it floats more in the flare.",
              "Crosswind — both are certified for similar crosswind components (around 15 kt demonstrated), but the techniques differ. The 172's high wing catches crosswind on the ground; the PA-28's low wing is more stable on rollout.",
              "Visibility in turns — the 172 limits the upward view into a turn; the PA-28 limits the downward view. Both require clearing turns before maneuvering.",
              "Stall behavior — the 172 has a pronounced nose drop and gentle break; the PA-28's stall is often milder, sometimes with a wing-drop tendency that requires prompt rudder correction.",
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "Don't transfer speeds",
            body: "A common transition mistake is carrying C172 speeds into a PA-28 (or vice versa). V speeds differ slightly between types — a 65-KIAS approach in a 172 might be 70 KIAS in an Archer. Always brief the correct speeds for the airplane you're flying.",
          },
        ],
      },
      {
        heading: "Bonus: A Sneak Peek at Airliners",
        blocks: [
          {
            type: "paragraph",
            text: "Everything you've learned — pitch, power, attitude, energy management, the flare — scales up. A Boeing 737 or Airbus A320 is flying the same physics as a Cessna 172, just with more inertia, more systems, and more automation. The basic skills transfer.",
          },
          {
            type: "list",
            items: [
              "Airliners use the same traffic patterns (often called 'the visual' in airline ops), the same radio structure, and the same VFR-vs-IFR concepts.",
              "Jet engines respond slower than pistons — power changes take several seconds to spool up. This is why jets fly a more stabilized, more carefully planned approach.",
              "Automation (autopilot, autothrottles, flight management systems) handles much of the routine work, but pilots must monitor and intervene. The same instrument scan principles apply.",
              "Cockpit resource management — crew coordination, checklists, briefings, and communication — is a major topic in airline training. Single-pilot operations in light aircraft still apply the same principles at a smaller scale.",
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "Try a jet in the sim",
            body: "Once you've mastered the C172, the next sim challenge is a small jet like the Citation or the default 737. The handling is heavier, the speeds are higher, but the same skills apply. Use the autopilot as a tool, not a crutch — hand-fly the airplane to learn it.",
          },
          {
            type: "callout",
            variant: "info",
            title: "Airline flying is built on what you've learned here",
            body: "Every airline pilot started with the basics: traffic patterns, radio calls, weather decisions, and engine failure flows. The airliner is a bigger, faster, more automated version of the same ideas. Get the basics right, and the sky's the limit.",
          },
        ],
      },
    ],
    commonMistake: {
      title: "Treating every light aircraft the same",
      body: "After flying a C172 for 50 hours, a pilot new to the PA-28 might assume the speeds, sight picture, and flare all carry over. They don't. The PA-28 floats more in ground effect, has different V-speeds, and a different sight picture in the flare. Always brief the correct numbers for the type you're flying, get a checkout from an instructor, and don't expect muscle memory to substitute for type-specific knowledge.",
    },
    tryItInSim: {
      title: "Compare the C172 and PA-28 back-to-back",
      steps: [
        "Configure the sim with both a Cessna 172 and a Piper PA-28 (both are standard in MSFS and X-Plane). Pick a familiar airport with a long runway.",
        "Fly three landings in the C172 at the same target speeds (downwind 90, base 75, final 65). Pay attention to the sight picture in the flare, the float, and the crosswind behavior.",
        "Switch to the PA-28. Look up the published V-speeds (Warrior: rotation ~55, Vapp ~70, best glide ~73 — verify with the POH). Fly three landings at the correct PA-28 speeds.",
        "Note the differences: how the low wing changes your downward visibility in turns, how the airplane floats differently in ground effect, how the stall warning feels different.",
        "Fly a short cross-country in each. The basic navigation, radio work, and emergency procedures are the same — but the speeds, fuel system, and cockpit layout differ. The transferable skills are what you've learned; the type-specific details are what you'll always need to look up.",
      ],
    },
    keyTakeaways: [
      "The Cessna 172 (high wing) and Piper PA-28 (low wing) are the two dominant trainers — same mission, different feel.",
      "Each type requires its own checkout and its own memorized V-speeds. Never carry speeds from one type to another.",
      "Differences include sight picture, fuel system (gravity feed vs. fuel pump), ground effect, and flare behavior.",
      "Always fly with the POH for the specific aircraft, not your memory of a different model.",
      "The basic skills — pitch, power, energy management, the flare, the radio, the pattern — scale up to every aircraft you'll ever fly, including airliners.",
    ],
    quiz: [
      {
        question:
          "What is the primary visual difference between a Cessna 172 and a Piper PA-28?",
        options: [
          "The 172 has a low wing; the PA-28 has a high wing",
          "The 172 has a high wing; the PA-28 has a low wing",
          "The 172 has retractable gear; the PA-28 has fixed gear",
          "The 172 is a twin; the PA-28 is a single",
        ],
        correctIndex: 1,
        explanation:
          "The C172 is a high-wing aircraft (wing on top of the cabin, supported by struts). The PA-28 is a low-wing aircraft (wing below the cabin, cantilever).",
      },
      {
        question: "Approximate best glide speed for a Cessna 172?",
        options: ["55 KIAS", "65 KIAS", "75 KIAS", "85 KIAS"],
        correctIndex: 1,
        explanation:
          "Best glide (Vbg) for a C172 at max gross weight is approximately 65 KIAS. Verify with the POH for your specific aircraft and weight.",
      },
      {
        question:
          "What is a key difference in the fuel systems of a Cessna 172 (high wing) and a Piper PA-28 (low wing)?",
        options: [
          "Both use identical fuel systems",
          "The C172 relies on gravity feed from high-wing tanks; the PA-28 requires an engine-driven fuel pump and an electric auxiliary pump because the tanks are below the engine",
          "The C172 has fuel injection; the PA-28 has a carburetor",
          "The PA-28 has four tanks; the C172 has two",
        ],
        correctIndex: 1,
        explanation:
          "The high-wing C172 gravity-feeds fuel down to the engine — no pump needed. The low-wing PA-28 has tanks below the engine, so it must pump fuel up using an engine-driven pump, with an electric auxiliary pump as backup.",
      },
      {
        question:
          "Which aircraft generally produces more ground effect and tends to float more in the flare?",
        options: [
          "Cessna 172 (high wing)",
          "Piper PA-28 (low wing)",
          "They are identical",
          "Neither — ground effect only affects jets",
        ],
        correctIndex: 1,
        explanation:
          "Low-wing aircraft like the PA-28 produce more ground effect than high-wing aircraft because the wing is closer to the ground. This often causes the PA-28 to float more in the flare than the C172.",
      },
      {
        question:
          "What is the correct approach when transitioning from a C172 to a PA-28 for the first time?",
        options: [
          "Just go fly — the controls are similar",
          "Carry over your C172 V-speeds and adapt as you go",
          "Get a checkout with an instructor, read the POH, and brief the type-specific V-speeds before flight",
          "Only fly in visual conditions until you 'get used to it'",
        ],
        correctIndex: 2,
        explanation:
          "Every type transition requires a checkout, a POH review, and a thorough briefing of the correct V-speeds and systems. Never assume skills and speeds transfer.",
      },
    ],
  },
];
