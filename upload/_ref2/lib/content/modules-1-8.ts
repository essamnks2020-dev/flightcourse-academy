import type { ModuleContent } from "@/lib/content-types";

export const modules18: ModuleContent[] = [
  // ============================================================
  // MODULE 1 — Welcome to Flight Simulation
  // ============================================================
  {
    id: 1,
    title: "Welcome to Flight Simulation",
    shortTitle: "Welcome",
    category: "Getting Started",
    estimatedMinutes: 20,
    difficulty: "Beginner",
    xpReward: 10,
    prerequisites: [],
    tagline: "What sim flying is, which sim to pick, and the only hardware you actually need to start.",
    whyItMatters:
      "You can't learn to fly by reading about it — you need a sandbox where mistakes are free. Flight simulators give you that sandbox. This module orients you to what sim flying is, what gear you actually need, and what kind of flying you'll be doing for the rest of this course.",
    sections: [
      {
        heading: "So, what is flight simulation?",
        blocks: [
          {
            type: "paragraph",
            text: "A flight simulator is software that pretends to be an airplane. The good ones model aerodynamics, weather, instruments, and the world below accurately enough that real-world pilots use them for practice. You sit at a desk, work a yoke and throttle and rudder pedals (or just a mouse and keyboard to start), and the software shows you what a pilot would see out the windshield and on the panel."
          },
          {
            type: "paragraph",
            text: "FlightPath Academy is built around 'study-level' general aviation simulation — meaning the simulated airplane behaves like the real one. We're not pushing buttons on an autopilot; we're learning to actually fly a small propeller plane."
          },
          {
            type: "callout",
            variant: "info",
            title: "Two camps of simmers",
            body: "Casual simmers treat the sim like a game — turn it on, fly around, have fun. Study simmers treat it like training — checklists, procedures, real-world weather. This course is firmly in the second camp. The first camp has more fun for a weekend. The second camp has more fun for a decade."
          }
        ]
      },
      {
        heading: "MSFS, X-Plane, and DCS: which one?",
        blocks: [
          {
            type: "paragraph",
            text: "Three simulators dominate the desktop scene in 2024. Each has a personality. You can learn to fly in any of them."
          },
          {
            type: "diagram",
            diagramKey: "sim-comparison",
            caption: "The three main desktop simulators at a glance: MSFS (photoreal world, great defaults), X-Plane (best flight model, used for real-world practice), DCS World (military combat focus, very detailed aircraft)."
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Microsoft Flight Simulator (MSFS): the prettiest. Photorealistic world, real-time weather, polished default aircraft. Best for beginners who want to be wowed. The default Cessna 172 and the free Working Title avionics updates are study-quality.",
              "X-Plane: the most accurate flight model. Used by real pilots for procedural practice because the physics engine is excellent. Slightly less pretty than MSFS, but the airplane behavior is unmatched at this price.",
              "DCS World: the combat simulator. Exquisitely detailed military aircraft. Steeper learning curve, focused on fighters and attack jets. Not where you start as a beginner — but it's a beautiful second sim once you have the basics."
            ]
          },
          {
            type: "callout",
            variant: "tip",
            title: "Pick one and stick with it",
            body: "For this course, we recommend MSFS or X-Plane. They both include a flyable Cessna 172, which is the aircraft we'll reference throughout. If you already have DCS, the aerodynamics lessons still apply — but the procedures in modules 5-7 are Cessna-specific."
          }
        ]
      },
      {
        heading: "Hardware: what you actually need",
        blocks: [
          {
            type: "paragraph",
            text: "Let's kill a myth right now: you do not need a $2,000 rig to start flight simming. You need a computer that can run the sim, and a way to control the airplane. That's it."
          },
          {
            type: "list",
            ordered: true,
            items: [
              "A PC or Mac (or Xbox for MSFS). MSFS recommends at least an Intel i5-8400 / Ryzen 5 1500X, 16 GB RAM, and a GTX 970-class GPU. X-Plane is friendlier on older hardware.",
              "A control input. To start, this can literally be your mouse and keyboard. The sim will be flyable — not pleasant, but flyable.",
              "An entry-level joystick (e.g., Logitech Extreme 3D Pro, around $40) is the next step up. A yoke (Honeycomb Alpha, around $250) is the dream — but only after you've decided you love this hobby.",
              "Rudder pedals come later. For your first ten hours, the sim will help you with rudder if you don't have pedals."
            ]
          },
          {
            type: "callout",
            variant: "warning",
            title: "Don't go hardware shopping on day one",
            body: "It's tempting to drop $800 on a yoke, throttle quadrant, and rudder pedals the day you install the sim. Don't. Fly for a few weeks with what you have. You'll either fall in love (then buy hardware) or move on (and save the money)."
          }
        ]
      },
      {
        heading: "Setting expectations: GA vs. airliners",
        blocks: [
          {
            type: "paragraph",
            text: "When most people picture 'flying an airplane,' they picture a 737 cockpit at 35,000 feet with two pilots and a thousand buttons. That's the airliner world, and it's the last place a beginner should start."
          },
          {
            type: "paragraph",
            text: "General aviation (GA) is the world of small propeller planes — Cessnas, Pipers, two to six seats, one or two pilots, flying low and slow and visual. This is where every real-world airline pilot started. It's also where flight simulation is the most fun, the most approachable, and the most instructive."
          },
          {
            type: "paragraph",
            text: "FlightPath Academy focuses on GA. By the end of these modules, you'll be able to start up a Cessna 172, taxi to the runway, take off, fly a traffic pattern, and land. That's the foundation. Airliners come later — and they're easier once you understand how an airplane flies, not just how to program an FMC."
          },
          {
            type: "callout",
            variant: "info",
            title: "FMC — what?",
            body: "FMC stands for Flight Management Computer — the box in airliners that handles navigation, fuel planning, and a hundred other things. It's a fascinating piece of kit and we'll get to it much later. For now, the only computer you need is your brain."
          }
        ]
      },
      {
        heading: "How to get the most out of this course",
        blocks: [
          {
            type: "paragraph",
            text: "Each module has the same shape: a 'why this matters' hook, several sections of content with diagrams and callouts, a 'common mistake' section so you know what to watch for, a 'try it in the sim' walkthrough, key takeaways, and a 5-question quiz."
          },
          {
            type: "paragraph",
            text: "Read the module. Then open the sim and do the 'try it' steps. Then take the quiz. That's the rhythm. Don't skip the sim time — reading about a stall is not the same as feeling the yoke go mushy in your hand."
          },
          {
            type: "callout",
            variant: "tip",
            title: "Real-world habits transfer",
            body: "If you ever decide to pursue a real-world pilot certificate, the knowledge from these modules maps directly to the FAA Private Pilot written and practical tests. Treat it like ground school and you're getting the first 20 hours for free."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Skipping straight to the airliners",
      body: "Almost every new simmer installs MSFS, immediately spawns a 747 at JFK, and bounces down the runway in a fireball of confusion. The 747 has four engines, twelve fuel pumps, a hydraulic system, an electrical system, a pressurization system, and an FMC that all want your attention. Start in a Cessna 172 at a small airport. You'll learn more in an hour than you will in ten hours fighting a heavy jet."
    },
    tryItInSim: {
      title: "Get your sim set up for learning",
      steps: [
        "Install MSFS or X-Plane. Update to the latest version.",
        "Pick a small, quiet airport — try KVNY (Van Nuys, California) or EGLM (White Waltham, UK). Big airports are stressful; small ones let you think.",
        "Spawn a Cessna 172 (C172) on the runway in clear weather, midday, no wind.",
        "Try the camera views: press C for cockpit, press S for outside, hold the right mouse button to look around. Find the view that feels natural to you.",
        "Don't try to fly yet. Just sit on the runway, look at the panel, and find the six round instruments in the middle. We'll cover them in Module 2."
      ]
    },
    keyTakeaways: [
      "Flight simulation is a real training tool, not just a game — the good sims model aerodynamics accurately enough for real-world practice.",
      "For learning, you want a general aviation aircraft (like the Cessna 172), not an airliner. GA is where every real pilot starts.",
      "You don't need expensive hardware. A PC and a $40 joystick is plenty for your first few weeks.",
      "MSFS and X-Plane are the two sims we recommend for this course. Both ship a flyable Cessna 172.",
      "Reading isn't enough. Always do the 'Try It In The Sim' steps for each module."
    ],
    quiz: [
      {
        question: "Which of the three main desktop simulators is most focused on combat aircraft?",
        options: [
          "Microsoft Flight Simulator",
          "X-Plane",
          "DCS World",
          "Aerofly FS"
        ],
        correctIndex: 2,
        explanation: "DCS World is the combat-focused simulator, with detailed military aircraft like the F-16, F/A-18, and A-10. MSFS and X-Plane focus on civil aviation."
      },
      {
        question: "What kind of aircraft does this course recommend you start with?",
        options: [
          "A small, single-engine propeller plane like a Cessna 172",
          "A regional jet like a CRJ-700",
          "A four-engine airliner like a 747",
          "A fighter jet"
        ],
        correctIndex: 0,
        explanation: "General aviation aircraft like the Cessna 172 are simple, slow, and forgiving — perfect for learning the fundamentals. Airliners and fighters pile dozens of systems on top of basic flying."
      },
      {
        question: "Which of these is the minimum hardware required to start flight simming?",
        options: [
          "A purpose-built PC with dual GPUs and a yoke",
          "A computer that runs the sim and some way to control the airplane (even a mouse)",
          "A yoke, throttle quadrant, and rudder pedals",
          "A VR headset and motion platform"
        ],
        correctIndex: 1,
        explanation: "You can fly with a mouse and keyboard. It's not great, but it's enough to start. Buy hardware after you've decided you love the hobby."
      },
      {
        question: "Why does the course recommend against starting in an airliner?",
        options: [
          "Airliners cost money in the sim",
          "Airliners have too many systems competing for your attention on top of basic flying skills you don't have yet",
          "Airliners aren't modeled accurately in modern sims",
          "Airliners are easier to fly than they should be"
        ],
        correctIndex: 1,
        explanation: "Airliners pile pressurization, hydraulics, electrics, fuel management, and FMC programming on top of the actual flying. You can't learn to fly while also learning twelve systems. Start small."
      },
      {
        question: "What does GA stand for in aviation, and what does it mean?",
        options: [
          "General Aviation — small propeller aircraft used for personal and training flying",
          "Giant Aircraft — anything over 12,500 lbs",
          "Glide Approach — a type of emergency landing",
          "Ground Awareness — situational awareness on the ground"
        ],
        correctIndex: 0,
        explanation: "General Aviation (GA) is the umbrella term for all civil flying that isn't airline or military. Cessnas, Pipers, business jets, and crop dusters all live here. It's where every pilot starts."
      }
    ]
  },

  // ============================================================
  // MODULE 2 — Cockpit Fundamentals
  // ============================================================
  {
    id: 2,
    title: "Cockpit Fundamentals",
    shortTitle: "Cockpit",
    category: "Cockpit",
    estimatedMinutes: 25,
    difficulty: "Beginner",
    xpReward: 12,
    prerequisites: [1],
    tagline: "The six-pack instruments, the three primary controls, and trim — the universal language of any cockpit.",
    whyItMatters:
      "The cockpit panel looks like a wall of dials and switches, but it's actually organized. Once you know the 'six-pack' — the six core instruments in the center — you can read any general aviation cockpit in the world. This module teaches you what each instrument tells you and how they fit together.",
    sections: [
      {
        heading: "The Six-Pack: your six core instruments",
        blocks: [
          {
            type: "paragraph",
            text: "Look at the center of a Cessna 172 panel and you'll see six round instruments arranged in two rows of three. Pilots call this the 'six-pack' — and it's been the core of cockpit instrumentation since the 1930s. Even glass-cockpit planes (like the Garmin G1000) display the same six things, just on screens."
          },
          {
            type: "diagram",
            diagramKey: "six-pack",
            caption: "The standard six-pack instrument layout: top row left-to-right is airspeed indicator, attitude indicator, altimeter; bottom row is turn coordinator, heading indicator, vertical speed indicator."
          },
          {
            type: "paragraph",
            text: "Here's a way to remember them: top row is Airspeed, aTtitude (T for top, middle), Altimeter. Bottom row is Turn coordinator, Heading, VSI. Or just remember: the attitude indicator is dead center — your most-looked-at instrument — with airspeed and altitude flanking it, and the secondary instruments below."
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Airspeed indicator — how fast you're moving through the air (not over the ground).",
              "Attitude indicator — your artificial horizon; pitch and bank at a glance.",
              "Altimeter — your altitude above sea level.",
              "Turn coordinator — shows your rate of turn and whether the turn is coordinated (ball centered).",
              "Heading indicator — which direction you're pointing.",
              "Vertical speed indicator (VSI) — how fast you're climbing or descending, in feet per minute."
            ]
          }
        ]
      },
      {
        heading: "Each instrument, in plain English",
        blocks: [
          {
            type: "heading",
            text: "Airspeed Indicator (ASI)"
          },
          {
            type: "paragraph",
            text: "The airspeed indicator tells you how fast air is flowing over the wings, in knots. Notice I said 'over the wings,' not 'over the ground' — that's a critical distinction. If you're flying at 100 knots into a 20-knot headwind, your airspeed is 100 knots but your ground speed is 80 knots. The airplane doesn't care about the ground; it only cares about the air."
          },
          {
            type: "paragraph",
            text: "The ASI is color-coded. The green arc is the normal operating range. The yellow arc is caution — only fly here in smooth air. The red line is Vne (never-exceed speed). The white arc is the flap operating range."
          },
          {
            type: "callout",
            variant: "info",
            title: "Knots, not mph",
            body: "A knot is one nautical mile per hour, equal to 1.15 statute mph or 1.85 km/h. Aviation uses nautical miles because they tie neatly to latitude/longitude on charts (one minute of latitude = one nautical mile). Get used to thinking in knots."
          },
          {
            type: "heading",
            text: "Attitude Indicator (AI)"
          },
          {
            type: "paragraph",
            text: "The attitude indicator is your artificial horizon. It shows you whether you're pitched up, down, level, banked left, or banked right — even when you can't see the real horizon through clouds or at night. The top half is blue (sky), the bottom half is brown (ground), and the orange line between them is your horizon line. The little airplane symbol in the middle represents your aircraft."
          },
          {
            type: "paragraph",
            text: "The AI is the only instrument that gives you direct, immediate information about your attitude (pitch and bank). Every other instrument lags or shows a secondary effect. When things get confusing, the AI is your best friend."
          },
          {
            type: "heading",
            text: "Altimeter"
          },
          {
            type: "paragraph",
            text: "The altimeter tells you your altitude above sea level, in feet. It works by measuring air pressure — the higher you go, the lower the pressure. The dial looks like a clock with two hands: the long hand is hundreds of feet, the short hand is thousands. If the long hand is on 5 and the short hand is between 3 and 4, you're at 3,500 feet."
          },
          {
            type: "callout",
            variant: "warning",
            title: "Above sea level, not above the ground",
            body: "If the airport is at 5,000 feet elevation (like Denver), and your altimeter reads 5,000 feet, you're on the ground. The altimeter doesn't know where the ground is — only where sea level is. To know your height above the ground (AGL), subtract the airport elevation from your altimeter reading."
          },
          {
            type: "heading",
            text: "Turn Coordinator"
          },
          {
            type: "paragraph",
            text: "The turn coordinator shows two things: your rate of turn (using the little airplane symbol that tilts when you bank) and whether your turn is coordinated (using the inclinometer — the little black ball in a tube of liquid at the bottom). The standard-rate turn mark is the L and R marks at the top — when the wing of the little airplane aligns with a mark, you're turning at 3 degrees per second (a 'standard rate' or 'two-minute turn')."
          },
          {
            type: "paragraph",
            text: "The ball tells you whether your rudder is in sync with your ailerons. If the ball is on the inside of the turn, you're 'slipping' — add rudder in the direction of the turn. If the ball is on the outside, you're 'skidding' — reduce rudder. The old mnemonic: 'step on the ball' — press the rudder pedal on the same side as the ball to center it."
          },
          {
            type: "heading",
            text: "Heading Indicator (HI)"
          },
          {
            type: "paragraph",
            text: "The heading indicator shows which direction you're pointing, in degrees from 000 (north) to 359. It looks like a compass but is more stable — real compasses bounce around in turbulence and lean during turns. The HI is gyro-driven and rock-solid. The catch: it slowly drifts (real-world HIs need to be realigned to the compass every 15 minutes or so; in the sim this is mostly handled for you)."
          },
          {
            type: "heading",
            text: "Vertical Speed Indicator (VSI)"
          },
          {
            type: "paragraph",
            text: "The VSI shows your rate of climb or descent in feet per minute. Zero is level flight. Up is climbing, down is descending. Numbers are typically 0, 500, 1000, 1500, 2000. The VSI lags a few seconds behind reality — when you pitch up, the altimeter starts moving immediately but the VSI takes a moment to catch up."
          }
        ]
      },
      {
        heading: "The controls: yoke, throttle, rudder",
        blocks: [
          {
            type: "paragraph",
            text: "Three primary controls move the airplane. The yoke (or stick) controls pitch and roll. The throttle controls engine power. The rudder pedals control yaw — the nose pointing left or right."
          },
          {
            type: "paragraph",
            text: "Hold the yoke with both hands (or one hand if you're flying from the right seat). Pull back to pitch the nose up; push forward to pitch it down. Turn the yoke left to bank left, right to bank right. The yoke is not a steering wheel — you don't spin it. A small turn of the yoke deflects the ailerons a little; more turn deflects them more."
          },
          {
            type: "paragraph",
            text: "The throttle is the black knob, usually in the lower center of the panel. Push it in for more power, pull it out for less. In a Cessna 172 it's a push-pull knob; in some planes it's a quadrant lever."
          },
          {
            type: "paragraph",
            text: "The rudder pedals are on the floor. Push the left pedal to swing the nose left, the right pedal to swing it right. The pedals also steer the nosewheel on the ground (and the brakes, when you press the tops of the pedals). If you don't have rudder pedals, the sim will help you — usually with 'auto-rudder' enabled by default."
          }
        ]
      },
      {
        heading: "Trim: your underappreciated best friend",
        blocks: [
          {
            type: "paragraph",
            text: "Trim is the most underrated control in the cockpit. It's a small wheel or tab, usually between the seats or on the yoke, that adjusts the elevator's neutral position. Set it right, and the airplane flies itself hands-off. Set it wrong, and you'll be fighting the yoke the whole flight."
          },
          {
            type: "paragraph",
            text: "Here's the mental model: trim doesn't make the airplane go up or down. It changes the pitch the airplane wants to hold on its own. If you have to hold back pressure to keep the nose up, you need nose-up trim — roll the wheel until the pressure goes away. If you're pushing forward, you need nose-down trim."
          },
          {
            type: "callout",
            variant: "tip",
            title: "Trim for hands-off flight",
            body: "A well-trimmed airplane in smooth air will hold altitude and heading for many seconds with your hands off the yoke. If yours doesn't, your trim is wrong. Fix it. You'll be amazed how much less tiring flying becomes."
          },
          {
            type: "paragraph",
            text: "The Cessna 172 has a trim wheel between the seats. Roll it forward (or up, depending on labeling) for nose-down trim, backward (or down) for nose-up trim. The exact direction is labeled on the wheel — and we'll show it in the diagram for module 5."
          }
        ]
      },
      {
        heading: "Camera views: seeing what you need to see",
        blocks: [
          {
            type: "paragraph",
            text: "In a real cockpit, you can turn your head. In the sim, you have to use camera views. Here are the ones you'll use constantly:"
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Cockpit / Pilot view (default, usually key C): your normal seat. Use this 80% of the time.",
              "Look around (hold right mouse button, or hat switch on a joystick): glance left, right, up, behind.",
              "External / chase view (key S or V): see the airplane from outside. Great for understanding what bank and pitch actually look like.",
              "Tower view: see the airplane from a fixed point. Useful when practicing landings.",
              "Map / VFR map (usually Ctrl+V or a menu option): see where you are."
            ]
          },
          {
            type: "paragraph",
            text: "The trap new simmers fall into is flying the airplane from the external view. It looks cool, but it teaches bad habits — you can't read the instruments, you can't judge flare height, and you don't build the panel-scan muscle that real flying requires. Spend most of your time in the cockpit view. Use external view to admire your work after you land."
          },
          {
            type: "callout",
            variant: "warning",
            title: "Learn to fly from inside the cockpit",
            body: "If you only ever fly from the chase view, you'll never develop the instrument scan that real pilots rely on. Cockpit view first; external view for fun."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Staring at one instrument",
      body: "New pilots tend to fixate on whatever instrument they're worried about — usually the altimeter. The problem: while you're staring at altitude, your heading drifts, your airspeed decays, and your bank increases. The fix is a scan: eyes moving across the six-pack in a pattern, never resting on any one dial for more than a second or two. We'll cover the scan in later modules; for now, just practice moving your eyes, not parking them."
    },
    tryItInSim: {
      title: "Read the six-pack before you fly",
      steps: [
        "Spawn a Cessna 172 on the runway at a small airport, engine off or idling.",
        "Find the six-pack in the center of the panel. Touch each one with your eyes and name it: ASI, AI, altimeter, turn coordinator, HI, VSI.",
        "Read the values out loud: what's the airspeed? (Probably zero.) What's the altitude? (Should match the airport elevation.) What's the heading?",
        "Find the throttle, the trim wheel, and (if you have them) the rudder pedals. Locate each one with your hand without looking.",
        "Cycle through the camera views (C, S, hold right mouse to look around). Find your default cockpit view and stick with it."
      ]
    },
    keyTakeaways: [
      "The six-pack is the universal core of cockpit instrumentation: airspeed, attitude, altimeter, turn coordinator, heading, VSI.",
      "The attitude indicator is the only instrument that directly shows your pitch and bank. When in doubt, believe the AI.",
      "The altimeter reads above sea level, not above the ground. Subtract airport elevation to know how high you are.",
      "Trim sets the pitch the airplane wants to hold on its own. A trimmed airplane flies itself.",
      "Spend most of your sim time in the cockpit view, not the external view. Instrument scan is a real skill."
    ],
    quiz: [
      {
        question: "Which instrument directly shows your pitch and bank attitude, even in clouds or at night?",
        options: [
          "Altimeter",
          "Attitude Indicator (AI)",
          "Heading Indicator",
          "Vertical Speed Indicator"
        ],
        correctIndex: 1,
        explanation: "The attitude indicator (also called the artificial horizon) is the only one of the six-pack instruments that directly displays pitch and bank. The others show effects or rates."
      },
      {
        question: "Your altimeter reads 3,500 feet. The airport elevation is 500 feet. How high are you above the ground?",
        options: [
          "3,500 feet",
          "4,000 feet",
          "3,000 feet",
          "You can't tell from the altimeter"
        ],
        correctIndex: 2,
        explanation: "The altimeter reads altitude above sea level. To get height above the ground (AGL), subtract the airport elevation: 3,500 − 500 = 3,000 feet AGL."
      },
      {
        question: "What does the airspeed indicator actually measure?",
        options: [
          "Speed over the ground",
          "Speed of the air flowing over the aircraft (dynamic pressure)",
          "Engine RPM converted to knots",
          "GPS-derived ground speed"
        ],
        correctIndex: 1,
        explanation: "The ASI measures dynamic pressure from the pitot tube — effectively, how fast air is hitting the airplane. A strong headwind means your airspeed can be 100 knots while your ground speed is much less."
      },
      {
        question: "You're holding back pressure on the yoke to keep the nose up. What should you do with trim?",
        options: [
          "Add nose-down trim",
          "Add nose-up trim",
          "Nothing — trim doesn't affect pitch",
          "Increase throttle"
        ],
        correctIndex: 1,
        explanation: "If you're holding back pressure, you need nose-up trim. Roll the trim wheel in the nose-up direction until the pressure goes away and the airplane holds the pitch on its own."
      },
      {
        question: "The little ball in the turn coordinator is pushed to the right side of its tube during a left turn. What does this mean and what should you do?",
        options: [
          "You're coordinated; do nothing",
          "You're slipping; add left rudder",
          "You're skidding; reduce left rudder (or add right rudder)",
          "The instrument is broken"
        ],
        correctIndex: 2,
        explanation: "'Step on the ball.' If the ball is on the right during a left turn, you're skidding — the nose is being pushed too far into the turn. Reduce left rudder or add a touch of right rudder to center the ball."
      }
    ]
  },

  // ============================================================
  // MODULE 3 — The Four Forces & Basic Aerodynamics
  // ============================================================
  {
    id: 3,
    title: "The Four Forces & Basic Aerodynamics",
    shortTitle: "Four Forces",
    category: "Aerodynamics",
    estimatedMinutes: 25,
    difficulty: "Foundational",
    xpReward: 13,
    prerequisites: [1],
    tagline: "Lift, weight, thrust, drag — and the truth about how wings actually generate lift.",
    whyItMatters:
      "You can memorize every checklist and every procedure in this course, but if you don't understand why an airplane flies, you'll always be guessing. This module teaches the four forces — lift, weight, thrust, drag — and gives you an accurate (not the popular myth) explanation of how wings generate lift. Once this clicks, every other module becomes easier.",
    sections: [
      {
        heading: "The Four Forces",
        blocks: [
          {
            type: "paragraph",
            text: "An airplane in flight is a tug-of-war between four forces. Lift pushes up. Weight pulls down. Thrust pushes forward. Drag pulls back. When all four are balanced, the airplane flies straight and level at a constant speed."
          },
          {
            type: "diagram",
            diagramKey: "four-forces",
            caption: "The four forces in level flight: lift upward from the wings, weight downward from gravity, thrust forward from the propeller, drag backward from air resistance."
          },
          {
            type: "paragraph",
            text: "Here's the key insight: the four forces aren't just static — they're dynamic, and the airplane adjusts them constantly. Want to climb? Increase lift (and thrust) beyond what's needed for level flight. Want to descend? Reduce lift (or thrust) below that balance point. Want to speed up in level flight? Increase thrust beyond drag, then re-trim."
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Lift — produced by the wings, acts upward (perpendicular to the wingspan, but for simplicity, think 'up').",
              "Weight — gravity pulling the airplane toward the center of the earth, acts through the center of gravity.",
              "Thrust — produced by the propeller (or jet), acts forward along the airplane's longitudinal axis.",
              "Drag — air resistance opposing the airplane's motion, acts backward."
            ]
          },
          {
            type: "paragraph",
            text: "In steady, straight-and-level flight: lift = weight, and thrust = drag. The forces balance. Change any one, and the airplane will accelerate (climb, descend, speed up, or slow down) until they rebalance."
          }
        ]
      },
      {
        heading: "How wings actually generate lift",
        blocks: [
          {
            type: "paragraph",
            text: "Here's the truth that might surprise you: the popular 'equal transit time' explanation of lift you may have heard is wrong. Air over the top of the wing does not need to 'meet up' with air on the bottom at the trailing edge. Wind tunnel tests have shown that the air over the top actually arrives at the trailing edge significantly before the air on the bottom does."
          },
          {
            type: "paragraph",
            text: "Lift comes from a combination of two things, and both matter:"
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Pressure difference (Bernoulli): the wing is shaped (and angled) so that air flows faster over the top than under the bottom. Faster air = lower pressure (Bernoulli's principle). The higher pressure underneath pushes the wing up into the lower pressure above.",
              "Downward deflection (Newton): the wing is angled slightly upward into the airflow, and it deflects air downward. By Newton's third law — for every action there's an equal and opposite reaction — if the wing pushes air down, the air pushes the wing up."
            ]
          },
          {
            type: "paragraph",
            text: "Both explanations are correct, and both are incomplete on their own. Engineers use the more complete Navier-Stokes equations to model lift fully, but for pilots, the pressure + Newton mental model is enough. Wings generate lift by combining curved shape and angle of attack to push air down, which pushes the wing up."
          },
          {
            type: "callout",
            variant: "info",
            title: "Why this matters",
            body: "If you think lift is only about the wing's shape (the Bernoulli-only myth), you'll be confused when a symmetrical airfoil (like an Extra 300 aerobatic plane) flies — or when a Cessna 172 flies inverted. The truth is that angle of attack matters more than shape for most flying. A flat board generates lift if you angle it into the wind — just not very efficiently."
          }
        ]
      },
      {
        heading: "Angle of Attack: the most important angle in flying",
        blocks: [
          {
            type: "paragraph",
            text: "Angle of attack (AoA) is the angle between the wing's chord line (an imaginary line from leading edge to trailing edge) and the oncoming airflow. It's not the same as pitch attitude — pitch is what the airplane's nose is doing relative to the horizon, AoA is what the wing is doing relative to the air."
          },
          {
            type: "diagram",
            diagramKey: "angle-of-attack",
            caption: "Angle of attack is the angle between the wing's chord line and the oncoming airflow. Increase AoA and you increase lift — up to a point."
          },
          {
            type: "paragraph",
            text: "Here's the rule: increase angle of attack, increase lift (up to a point). Pull the nose up, and you're increasing AoA, which means more lift, which means the airplane climbs (if you have enough thrust) or slows down (if you don't). Push the nose down, decrease AoA, less lift, the airplane descends."
          },
          {
            type: "paragraph",
            text: "There's a limit. Around 16-18 degrees AoA for most GA wings, the airflow can no longer follow the curved upper surface of the wing. It separates, becomes turbulent, and lift collapses. This is a stall. We'll cover stalls in detail later — for now, remember: too much AoA = stall, regardless of airspeed."
          }
        ]
      },
      {
        heading: "Stalls: when lift goes away",
        blocks: [
          {
            type: "paragraph",
            text: "A stall happens when the wing exceeds its critical angle of attack. The airflow separates from the upper surface, lift drops abruptly, and the nose tends to drop on its own (this is good — it's the airplane trying to recover by reducing AoA)."
          },
          {
            type: "callout",
            variant: "warning",
            title: "Stalls are about angle, not speed",
            body: "A common myth is that stalls happen at a specific low airspeed. Not quite. Stalls happen at a specific high angle of attack. You can stall at any airspeed, in any attitude, if you pull hard enough. The 'stall speed' you see in the manual is just the speed at which you'll reach critical AoA in level, 1G flight — pull harder than 1G and you'll stall faster."
          },
          {
            type: "paragraph",
            text: "Recovery is simple: reduce the angle of attack (relax back pressure or push forward slightly) and add power. The wing starts flying again almost immediately. We'll practice this in a later module."
          }
        ]
      },
      {
        heading: "Straight and level: the balanced state",
        blocks: [
          {
            type: "paragraph",
            text: "Now put it all together. In straight-and-level, unaccelerated flight:"
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Lift = Weight (no climb or descent)",
              "Thrust = Drag (constant airspeed)",
              "The wing is at some moderate angle of attack — enough to make lift equal weight at your current airspeed and power setting",
              "Pitch attitude is whatever keeps that AoA — usually a degree or two nose-up in cruise"
            ]
          },
          {
            type: "paragraph",
            text: "If you want to climb, you need more lift than weight. The classic pilot move: add power (more thrust) and pitch up slightly (more AoA). The airplane climbs. The airspeed will probably drop a bit because you've added drag by increasing AoA — that's why climbs need more power."
          },
          {
            type: "paragraph",
            text: "If you want to descend, reduce power. The airplane slows, less lift is generated, and it starts to sink. Pitch down slightly to maintain airspeed. Lower the nose, the descent rate increases; raise the nose, the descent rate decreases (and airspeed drops)."
          },
          {
            type: "callout",
            variant: "tip",
            title: "Pitch + Power = Performance",
            body: "Memorize this phrase: pitch plus power equals performance. Your airspeed is primarily set by pitch. Your altitude is primarily set by power. There's more nuance to it, but that mental model will get you through 90% of basic flying. We'll come back to it in every maneuver module."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Confusing pitch attitude with angle of attack",
      body: "Pitch attitude is what the nose is doing relative to the horizon — you can see it on the attitude indicator. Angle of attack is what the wing is doing relative to the oncoming air — you can't see it directly. The two are related but not the same. A plane climbing at 80 knots and a plane level at 80 knots have very different AoAs. Pulling the nose up at low airspeed can stall the wing even though the AI shows 'only' a 10-degree pitch up. Watch your airspeed when you pull."
    },
    tryItInSim: {
      title: "Feel the four forces in action",
      steps: [
        "Spawn a Cessna 172 in the air at 3,000 feet, straight and level, in clear weather. (Most sims have a 'free flight' option that lets you start airborne.)",
        "Without touching the throttle, gently pull the nose up 5 degrees. Watch the airspeed bleed off and the VSI climb briefly, then settle. You traded speed for altitude.",
        "Push the nose back to level. Then reduce the throttle to idle. Watch the airspeed stay roughly constant as the airplane descends — you reduced thrust, drag won, the airplane sinks.",
        "Add full throttle while holding the nose level. The airplane will accelerate and eventually start climbing. You added thrust beyond drag.",
        "Look at the angle-of-attack relationship: each time you change pitch or power, something else changes. The four forces are always rebalancing."
      ]
    },
    keyTakeaways: [
      "The four forces are lift, weight, thrust, and drag. In straight-and-level flight, lift = weight and thrust = drag.",
      "Lift comes from a combination of pressure difference (faster air over the top = lower pressure) and Newton's third law (the wing deflects air down, so air pushes the wing up). The 'equal transit time' explanation is wrong.",
      "Angle of attack (AoA) is the angle between the wing's chord and the oncoming air. More AoA = more lift, up to the critical angle (about 16-18°) where the wing stalls.",
      "Stalls are caused by exceeding the critical AoA, not by low airspeed directly. You can stall at any speed if you pull hard enough.",
      "'Pitch + Power = Performance' — pitch mainly controls airspeed, power mainly controls altitude. This is the foundational mental model for all basic flying."
    ],
    quiz: [
      {
        question: "In straight-and-level unaccelerated flight, which pair of forces must be equal?",
        options: [
          "Lift and Thrust",
          "Lift and Weight (and separately, Thrust and Drag)",
          "Drag and Weight",
          "Thrust and Lift"
        ],
        correctIndex: 1,
        explanation: "In steady level flight, lift equals weight (no vertical acceleration) and thrust equals drag (no horizontal acceleration). Both pairs must balance."
      },
      {
        question: "The 'equal transit time' explanation of lift says air over the top of the wing must arrive at the trailing edge at the same time as air underneath. Is this correct?",
        options: [
          "Yes, it's the standard physics explanation",
          "No — wind tunnel tests show air over the top arrives earlier; lift comes from pressure differences and downward deflection of air",
          "Yes, but only for symmetrical airfoils",
          "No — only Newton's third law explains lift"
        ],
        correctIndex: 1,
        explanation: "The equal-transit-time explanation is a myth. Air over the top actually arrives at the trailing edge before air on the bottom. Lift comes from a combination of pressure differences (Bernoulli) and downward deflection (Newton's third law)."
      },
      {
        question: "What is angle of attack?",
        options: [
          "The angle between the airplane's nose and the horizon",
          "The angle between the wing's chord line and the oncoming airflow",
          "The angle of the elevator relative to the horizontal stabilizer",
          "The bank angle in a turn"
        ],
        correctIndex: 1,
        explanation: "Angle of attack is between the wing's chord line (leading edge to trailing edge) and the oncoming airflow. Pitch attitude is between the nose and the horizon — they're related but different."
      },
      {
        question: "What causes a wing to stall?",
        options: [
          "Flying too slowly",
          "Exceeding the critical angle of attack",
          "Engine failure",
          "Turbulence"
        ],
        correctIndex: 1,
        explanation: "A stall happens when the wing exceeds its critical angle of attack (around 16-18° for most GA wings). Airflow separates from the upper surface and lift collapses. Stall speed varies with load factor — you can stall at any speed if you pull hard enough."
      },
      {
        question: "Which statement best reflects the 'Pitch + Power = Performance' model?",
        options: [
          "Pitch controls altitude and power controls airspeed",
          "Pitch controls airspeed and power controls altitude",
          "Both controls do the same thing",
          "Only power matters in level flight"
        ],
        correctIndex: 1,
        explanation: "This is a simplification, but it's the most useful mental model for basic flying: pitch primarily sets airspeed, power primarily sets whether you climb, descend, or hold altitude. Hold a pitch attitude and the airspeed settles; change power and the flight path changes."
      }
    ]
  },

  // ============================================================
  // MODULE 4 — Flight Controls Deep Dive
  // ============================================================
  {
    id: 4,
    title: "Flight Controls Deep Dive",
    shortTitle: "Flight Controls",
    category: "Flight Controls",
    estimatedMinutes: 22,
    difficulty: "Foundational",
    xpReward: 13,
    prerequisites: [2, 3],
    tagline: "Ailerons, elevator, rudder — and why the rudder exists at all (it's not for turning).",
    whyItMatters:
      "Last module we covered the four forces. This module is about how you actually manipulate them. Every maneuver in flying — turns, climbs, descents, landing — is some combination of three control inputs: roll (ailerons), pitch (elevator), and yaw (rudder). Get these three right, and you can fly. Get them wrong, and you'll spend the whole flight fighting the airplane.",
    sections: [
      {
        heading: "Three axes, three controls",
        blocks: [
          {
            type: "paragraph",
            text: "An airplane moves around three axes, all passing through its center of gravity. Each axis has a primary control surface that moves it."
          },
          {
            type: "diagram",
            diagramKey: "control-axes",
            caption: "The three axes of flight: longitudinal (nose-to-tail) for roll, controlled by ailerons; lateral (wingtip-to-wingtip) for pitch, controlled by the elevator; vertical (top-to-bottom) for yaw, controlled by the rudder."
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Longitudinal axis — nose to tail. Rotation around this axis is roll (banking left or right). Controlled by the ailerons.",
              "Lateral axis — wingtip to wingtip. Rotation around this axis is pitch (nose up or down). Controlled by the elevator.",
              "Vertical axis — straight down through the airplane. Rotation around this axis is yaw (nose swinging left or right). Controlled by the rudder."
            ]
          },
          {
            type: "paragraph",
            text: "The yoke controls two of these (roll and pitch). The rudder pedals control the third (yaw). The throttle isn't a flight control in this sense — it controls engine power, not the orientation of the airplane."
          }
        ]
      },
      {
        heading: "Ailerons: roll control",
        blocks: [
          {
            type: "paragraph",
            text: "Ailerons are hinged surfaces on the outboard trailing edge of each wing. They move in opposite directions: when the right aileron goes up, the left goes down. Turn the yoke left and the left aileron goes up (reducing lift on the left wing) while the right aileron goes down (increasing lift on the right wing). The right wing rises, the left wing drops — the airplane banks left."
          },
          {
            type: "diagram",
            diagramKey: "aileron-roll",
            caption: "When you turn the yoke left, the left aileron rises (less lift on left wing) and the right aileron drops (more lift on right wing). The airplane rolls left."
          },
          {
            type: "paragraph",
            text: "Notice something subtle: the wing that gets more lift also gets more drag. This is called 'adverse yaw' — and it's the reason your rudder exists. We'll cover it in detail in the next section."
          },
          {
            type: "paragraph",
            text: "Ailerons are your primary turning control. To turn left, you bank left with the ailerons. To stop the turn, you level the wings with the ailerons (turn the yoke right, briefly, to neutralize the bank). Most of your turning is done with the ailerons, not the rudder."
          }
        ]
      },
      {
        heading: "Elevator: pitch control",
        blocks: [
          {
            type: "paragraph",
            text: "The elevator is a hinged surface on the back of the horizontal stabilizer (the small wing at the tail). Pull the yoke back and the elevator deflects upward, which pushes the tail down, which pitches the nose up. Push the yoke forward and the opposite happens — nose goes down."
          },
          {
            type: "paragraph",
            text: "Here's a subtle but critical point: the elevator doesn't directly make the airplane climb or descend. It changes the wing's angle of attack. Pulling back increases AoA, which (at a given airspeed) increases lift, which (if you have enough power) makes the airplane climb. The elevator's effect depends on what the engine is doing."
          },
          {
            type: "callout",
            variant: "info",
            title: "Elevator = AoA control",
            body: "Thinking of the elevator as 'the up/down control' is the most common mental model — and it's wrong enough to get you in trouble. The elevator controls pitch, which controls AoA, which (combined with power) determines whether you climb or descend. Power matters as much as pitch."
          }
        ]
      },
      {
        heading: "Rudder: yaw control",
        blocks: [
          {
            type: "paragraph",
            text: "The rudder is a hinged surface on the back of the vertical stabilizer (the fin at the tail). Push the left rudder pedal and the rudder deflects to the left, the tail swings right, and the nose points left. Push the right pedal and the opposite happens."
          },
          {
            type: "paragraph",
            text: "New pilots often think the rudder is for turning. It's not — at least, not primarily. The ailerons turn the airplane (by banking). The rudder's job is to keep the tail aligned with the nose during the turn, and to compensate for various yaw-inducing effects: adverse yaw from the ailerons, engine torque on takeoff, and 'P-factor' (asymmetric thrust from the propeller at high angles of attack)."
          },
          {
            type: "paragraph",
            text: "In a coordinated turn, the rudder and ailerons work together. You bank with ailerons and add a touch of rudder in the same direction to keep the tail from dragging. The ball in the turn coordinator tells you if you got it right."
          }
        ]
      },
      {
        heading: "Adverse yaw and coordinated turns",
        blocks: [
          {
            type: "paragraph",
            text: "Adverse yaw is the single most important reason the rudder exists. When you roll into a bank, the wing going up (the outside wing in a turn) is generating more lift and therefore more induced drag. That extra drag pulls the nose in the opposite direction of your intended turn."
          },
          {
            type: "diagram",
            diagramKey: "adverse-yaw",
            caption: "When banking left, the right (rising) wing generates more lift AND more drag. That extra drag pulls the nose to the right — opposite the direction of the turn. Add left rudder to compensate."
          },
          {
            type: "paragraph",
            text: "Example: you bank left to turn left. The right wing rises (good) but it also has more drag, which yaws the nose to the right (bad). Without rudder, the airplane would skid through the turn, the tail hanging out to the right. The fix: add a touch of left rudder as you roll into the bank."
          },
          {
            type: "paragraph",
            text: "A coordinated turn is one where the rudder exactly cancels the adverse yaw. The turn coordinator's ball stays centered. In the sim, with auto-rudder on, this is done for you. With auto-rudder off (or with real rudder pedals), you have to do it yourself. The mnemonic is 'step on the ball' — if the ball is to the right, press the right rudder pedal; if it's to the left, press the left pedal."
          },
          {
            type: "callout",
            variant: "tip",
            title: "The bigger the aileron input, the more rudder you need",
            body: "Adverse yaw is worst when you make large, fast aileron inputs — like rolling into a steep turn quickly. Smooth, small inputs need only a tiny bit of rudder. The Cessna 172 has relatively mild adverse yaw; some older designs (like a Piper Cub) have so much that coordinated flying is a constant dance."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Using the rudder to steer",
      body: "The single most common control mistake in new simmers (and student pilots) is using the rudder as if it were a car steering wheel — pedal left to go left, pedal right to go right. The rudder yaws the nose but doesn't turn the airplane. If you try to 'turn' using rudder alone, the nose swings sideways, the airplane skids, and lift drops on the outside wing. Use the ailerons to bank, then use a touch of rudder to coordinate. Think of it like riding a bicycle: you steer by leaning, not by twisting the handlebars."
    },
    tryItInSim: {
      title: "See each control surface in action",
      steps: [
        "Spawn a Cessna 172 in cruise, straight and level, in clear weather. Switch to the external (chase) view for this exercise so you can see the surfaces move.",
        "Slowly turn the yoke to the right and watch the ailerons: right aileron goes up, left aileron goes down. Return to center.",
        "Pull the yoke back slightly and watch the elevator on the tail — it deflects up. Push forward and it deflects down.",
        "Switch back to cockpit view. Bank left with the ailerons, hold the bank for 10 seconds, then level the wings. Notice whether the ball stayed centered or drifted.",
        "Try a turn with deliberate opposite rudder (bank left, press right rudder) — feel the skid. Then try a coordinated turn (bank left, slight left rudder) — feel how much smoother it is."
      ]
    },
    keyTakeaways: [
      "The airplane moves around three axes: longitudinal (roll, via ailerons), lateral (pitch, via elevator), and vertical (yaw, via rudder).",
      "Ailerons roll the airplane by moving in opposite directions on each wing. The wing with the down aileron gets more lift and rises.",
      "Elevator controls pitch, which controls angle of attack. Pulling back increases AoA — but only increases lift if you have enough airspeed and power.",
      "Rudder's main job is to compensate for adverse yaw and keep turns coordinated, not to turn the airplane. Ailerons turn; rudder coordinates.",
      "Adverse yaw happens because the rising wing (more lift) also has more drag. Coordinate with rudder in the direction of the turn."
    ],
    quiz: [
      {
        question: "Which control surface is used to roll the airplane into a bank?",
        options: [
          "Elevator",
          "Rudder",
          "Ailerons",
          "Flaps"
        ],
        correctIndex: 2,
        explanation: "Ailerons, on the outboard trailing edge of each wing, are the primary roll control. They move in opposite directions, raising one wing and lowering the other."
      },
      {
        question: "When you pull back on the yoke, what is the elevator actually doing?",
        options: [
          "Pushing the nose up directly",
          "Deflecting upward, which pushes the tail down, which pitches the nose up (increasing AoA)",
          "Increasing engine power",
          "Deploying flaps"
        ],
        correctIndex: 1,
        explanation: "The elevator is on the tail. Pulling back deflects it upward, creating downward force on the tail, which pivots the nose up around the lateral axis. This increases the wing's angle of attack."
      },
      {
        question: "What is adverse yaw?",
        options: [
          "The nose pitching down in a turn",
          "The nose yawing opposite the direction of the turn because the rising wing has more drag",
          "The airplane slipping toward the inside of the turn",
          "Loss of airspeed in a steep turn"
        ],
        correctIndex: 1,
        explanation: "Adverse yaw is caused by the rising wing (which has more lift) also having more induced drag. When you bank left, the right wing rises and pulls more drag, yawing the nose to the right — opposite the turn."
      },
      {
        question: "You're in a left turn and the ball in the turn coordinator is pushed to the left side of the tube. What should you do?",
        options: [
          "Add right rudder to center the ball",
          "Add left rudder to center the ball",
          "Increase bank angle",
          "Reduce throttle"
        ],
        correctIndex: 1,
        explanation: "'Step on the ball.' If the ball is on the left, you're slipping — not enough rudder for the turn. Press the left rudder pedal to add left rudder and center the ball."
      },
      {
        question: "Which statement about the rudder is most accurate?",
        options: [
          "The rudder is the primary turning control",
          "The rudder turns the airplane; ailerons coordinate",
          "The rudder primarily coordinates turns and compensates for yaw effects; ailerons do the actual turning by banking",
          "The rudder controls pitch in the absence of an elevator"
        ],
        correctIndex: 2,
        explanation: "The rudder's primary job is to keep the tail aligned with the nose during turns (coordination) and to compensate for yaw-inducing effects like adverse yaw, engine torque, and P-factor. Ailerons actually turn the airplane by banking it."
      }
    ]
  },

  // ============================================================
  // MODULE 5 — Engine Startup & Pre-Flight
  // ============================================================
  {
    id: 5,
    title: "Engine Startup & Pre-Flight",
    shortTitle: "Startup & Pre-Flight",
    category: "Procedures",
    estimatedMinutes: 28,
    difficulty: "Foundational",
    xpReward: 14,
    prerequisites: [2, 4],
    tagline: "Why checklists save lives — and a full Cessna 172 startup walkthrough in plain language.",
    whyItMatters:
      "Real pilots don't just hop in and fly. They follow a checklist — every single time, even for an airplane they've flown a thousand times. Why? Because human memory is unreliable, and aviation history is full of accidents caused by skipped steps: a fuel valve left off, a control lock still in, a magneto switch left on. This module teaches you the pre-flight inspection and engine start for a Cessna 172, in plain language. Same procedure works in the sim.",
    sections: [
      {
        heading: "Why checklists are non-negotiable",
        blocks: [
          {
            type: "paragraph",
            text: "In aviation, checklists aren't a sign that you don't know what you're doing. They're a sign that you take it seriously. Every professional pilot — from a 200-hour CFI (Certified Flight Instructor) to a 20,000-hour airline captain — uses checklists on every flight. The airplane doesn't care how many hours you have; it cares whether the fuel valve is open and the flaps are set."
          },
          {
            type: "paragraph",
            text: "Checklists serve two purposes: they make sure you do everything, and they make sure you do it in the right order. Starting the engine with the throttle wide open is just as bad as not starting it at all. The checklist keeps you honest."
          },
          {
            type: "callout",
            variant: "warning",
            title: "The 'I'll remember it' trap",
            body: "The most dangerous words in aviation are 'I've got it memorized.' After 50 flights in the same plane, you might be able to do the start from memory — and one day you'll miss that the fuel selector was bumped to OFF during the last servicing. Memory is not a procedure. Use the checklist."
          }
        ]
      },
      {
        heading: "Pre-flight walkaround",
        blocks: [
          {
            type: "paragraph",
            text: "Before you ever get in the cockpit, real pilots walk around the airplane. They're looking for anything wrong: low tire pressure, missing screws, fuel leaks, bird nests in the engine, ice on the wings, control surface damage. In the sim, you can skip the physical walkaround — but you should know what one looks like, because some sims model it and you should know what real pilots do."
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Start at the cockpit: ignition off, fuel selector ON (both tanks), master switch off. Check fuel quantity gauges.",
              "Walk to the left wing: check the fuel cap is secure. Sump the fuel tank (drain a tiny sample into a clear cup and check for water or debris). Inspect the leading edge, the pitot tube, the stall warning vane.",
              "Check the left main gear: tire condition, brake line, no leaks.",
              "At the tail: check the elevator and rudder move freely, no play. Check the tiedown ring, the beacon light.",
              "Right side, same as left: gear, elevator, control surfaces, fuel cap, sump the tank.",
              "Nose: check the propeller for nicks, the oil level (dipstick), the nose gear, the air intake, the static port.",
              "Back to the cockpit: control surfaces free and correct (yoke left = right aileron up), no unusual resistance."
            ]
          },
          {
            type: "callout",
            variant: "info",
            title: "Sumping",
            body: "Sumping means draining a small sample of fuel from the lowest point of each tank and the fuel strainer. You're checking for water (which sinks in avgas) and debris. In the sim, this is usually skipped — but in the real world, it's how you avoid engine failure from water in the fuel."
          }
        ]
      },
      {
        heading: "Cockpit setup before start",
        blocks: [
          {
            type: "paragraph",
            text: "Now you're in the cockpit, seatbelt on, doors closed. Before you turn the key, you have a few items to set:"
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Parking brake: set. You don't want to roll during start.",
              "Fuel selector: BOTH (Cessna 172s feed from both tanks simultaneously).",
              "Mixture: full rich (pushed all the way in). For sea-level start, you want maximum fuel.",
              "Throttle: cracked open about 1/4 inch. Too closed and the engine won't start; too open and it'll roar to life at high RPM.",
              "Flaps: up.",
              "Trim: takeoff setting (usually the indicator lined up with the mark on the placard).",
              "All switches (lights, avionics) OFF. Avionics especially — the engine start can cause a voltage spike that fries them."
            ]
          },
          {
            type: "diagram",
            diagramKey: "cesna-panel",
            caption: "The Cessna 172 cockpit panel. Key items for start: the magneto switch (lower left), the throttle (black knob, lower center), the mixture (red knob, right of throttle), the master switch (battery + alternator, top of switch column), and the fuel selector (between the seats)."
          }
        ]
      },
      {
        heading: "The engine start procedure",
        blocks: [
          {
            type: "paragraph",
            text: "Here's the actual start sequence for a Cessna 172. Read it a few times; then do it in the sim."
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Master switch ON (both battery and alternator). This powers the electrical system.",
              "Check fuel quantity on the gauges. You should have at least enough for your flight plus reserves.",
              "Prime the engine: in the sim, this is usually automatic; in the real plane, you'd use the primer pump 2-3 strokes for a cold engine.",
              "Magnetos to START (turn the key to START, or press the starter button).",
              "As soon as the engine catches, release the key. It'll spring back to the BOTH position.",
              "Adjust the throttle to a smooth 1,000 RPM idle.",
              "Oil pressure: should rise within 30 seconds. If it doesn't, shut down immediately — the engine will destroy itself without oil.",
              "Avionics master ON. Now you can turn on the radios and GPS without frying them."
            ]
          },
          {
            type: "callout",
            variant: "warning",
            title: "Hand on the throttle during start",
            body: "Keep your hand on the throttle during the first few seconds after start. If the engine races above 1,200 RPM or sputters, you need to react quickly — pull the throttle out to idle, or pull the mixture to cutoff if things get really bad. Don't let the engine over-rev unloaded."
          }
        ]
      },
      {
        heading: "Post-start checks and taxi prep",
        blocks: [
          {
            type: "paragraph",
            text: "Once the engine is running smoothly at around 1,000 RPM, you do a few more checks before you taxi:"
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Avionics master ON, radios tuned to the ATIS/AWOS frequency (we'll cover this in a later module) for weather.",
              "Flaps to takeoff setting (usually up for a Cessna 172 normal takeoff).",
              "Trim to takeoff.",
              "Flight instruments: attitude indicator erect (the artificial horizon level), heading indicator aligned with the compass, altimeter set to the current barometric pressure (the ATIS gives this to you).",
              "Engine runup: at a designated runup area, set the brakes, bring throttle to 1,800 RPM, check magnetos (switch to L, then R, then BOTH — RPM drop should be less than ~175 RPM on each), check vacuum and ammeter, carb heat (if equipped) ON briefly to confirm it works, then OFF.",
              "Takeoff briefing: state your plan out loud. 'Today I'll use runway 27, normal takeoff, climb straight out to 1,000 feet, then crosswind to 1,500, then downwind.' It sounds silly. Real pilots do it anyway."
            ]
          },
          {
            type: "callout",
            variant: "tip",
            title: "The runup is not optional",
            body: "The engine runup (also called the pre-takeoff check) is where you confirm the engine is producing full power, the magnetos aren't failing, and the instruments are reading correctly. Skip it and you might discover a problem at 500 feet on climbout — which is the worst possible time. Always do the runup."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Avionics on before engine start",
      body: "Turning on the avionics master before starting the engine is a classic mistake — and a real-world way to fry your radios. The starter draws huge current, and the voltage can spike when the engine catches and the alternator kicks in. If the avionics are on during that spike, they can be damaged. The rule: master (battery/alternator) ON, start the engine, confirm oil pressure, THEN avionics master ON. In the sim you won't actually break anything, but build the habit."
    },
    tryItInSim: {
      title: "Do a full cold-start in the Cessna 172",
      steps: [
        "Spawn a Cessna 172 at a parking ramp at a small airport. Engine off. Cold and dark.",
        "Set the parking brake. Confirm fuel selector on BOTH. Confirm mixture rich, throttle cracked ~1/4 inch, flaps up.",
        "Master switch ON. Listen for the electrical hum. Check fuel quantity on the gauges.",
        "Turn the key (or press the starter) to START. As soon as the engine catches, release. Adjust throttle to ~1,000 RPM idle.",
        "Confirm oil pressure rises. Turn on the avionics master. Set your altimeter to the local barometric pressure (B key in MSFS) and check the heading indicator against the compass."
      ]
    },
    keyTakeaways: [
      "Checklists are non-negotiable in aviation. Use them every flight, every time, even when you 'know it by heart.'",
      "The pre-flight walkaround checks the airplane for physical issues: fuel, tires, control surfaces, oil. In the sim you can skip it, but learn what real pilots look for.",
      "Before start: parking brake set, fuel selector on BOTH, mixture rich, throttle cracked, avionics OFF. The 'avionics off' part protects the radios from the start voltage spike.",
      "Engine start: master ON, prime (if needed), magnetos to START, release as soon as it catches, idle at 1,000 RPM, confirm oil pressure, then avionics ON.",
      "Always do the engine runup before takeoff. It's where you confirm the engine is producing full power and the magnetos are healthy."
    ],
    quiz: [
      {
        question: "Why are the avionics kept OFF during engine start?",
        options: [
          "To save battery",
          "The voltage spike from the starter and alternator can damage the radios",
          "The engine won't start with them on",
          "It's a regulatory requirement"
        ],
        correctIndex: 1,
        explanation: "The starter draws huge current and the alternator kicks in abruptly when the engine catches. Both cause voltage spikes that can fry sensitive avionics. Wait until the engine is running smoothly and oil pressure is confirmed before turning avionics on."
      },
      {
        question: "What should the mixture be set to for a normal engine start at sea level?",
        options: [
          "Full lean",
          "Full rich (pushed all the way in)",
          "Halfway",
          "It doesn't matter"
        ],
        correctIndex: 1,
        explanation: "For a start at low altitude, full rich gives maximum fuel — and at sea level, the air is dense enough that full rich is the correct mixture. You lean the mixture only at cruise altitude or for taxi at high-elevation airports."
      },
      {
        question: "How long do you have to see oil pressure rise after engine start before you should shut down?",
        options: [
          "30-60 seconds",
          "30 seconds",
          "5 minutes",
          "Until the engine warms up"
        ],
        correctIndex: 1,
        explanation: "Oil pressure should rise within 30 seconds. If it doesn't, the engine isn't getting lubrication and will destroy itself. Shut down immediately and investigate."
      },
      {
        question: "What is the purpose of the engine runup?",
        options: [
          "To warm up the engine",
          "To confirm the engine produces full power, the magnetos work, and the instruments read correctly before takeoff",
          "To test the brakes",
          "To impress passengers"
        ],
        correctIndex: 1,
        explanation: "The runup is a full-power ground check: magnetos (each should drop RPM by less than ~175), vacuum pressure, ammeter, carb heat. It's your last chance to catch engine problems while still on the ground."
      },
      {
        question: "During the magneto check at the runup, you switch from BOTH to L and the RPM drops 50 RPM, then to R and it drops 75 RPM. Is this acceptable?",
        options: [
          "No, any drop is unacceptable",
          "Yes, drops under ~175 RPM on each magneto are normal",
          "No, the L and R drops must be identical",
          "Only if the BOTH drop is also 50 RPM"
        ],
        correctIndex: 1,
        explanation: "Each magneto should produce a small RPM drop when running alone (typically 50-100 RPM, max ~175). The two drops don't have to be identical — a small difference is fine. A drop over 175, a rough-running engine, or no drop at all (a broken magneto ground — dangerous) is a problem."
      }
    ]
  },

  // ============================================================
  // MODULE 6 — Taxiing & Ground Operations
  // ============================================================
  {
    id: 6,
    title: "Taxiing & Ground Operations",
    shortTitle: "Taxiing",
    category: "Ground Operations",
    estimatedMinutes: 20,
    difficulty: "Foundational",
    xpReward: 13,
    prerequisites: [5],
    tagline: "How to actually move on the ground — steering, taxiway markings, and the sacred hold-short line.",
    whyItMatters:
      "Flight time starts when the engine starts — but you don't fly until you're in the air. Taxiing is what gets you from the ramp to the runway, and it's where many new simmers (and student pilots) first get into trouble. The steering feels weird, the markings are confusing, and over-controlling is almost guaranteed. This module teaches you how to move on the ground like a pilot.",
    sections: [
      {
        heading: "How steering works on the ground",
        blocks: [
          {
            type: "paragraph",
            text: "On the ground, an airplane doesn't steer like a car. The rudder pedals control the nosewheel (or tailwheel) directly through a mechanical linkage, up to a small angle — typically about 10 degrees in a Cessna 172. For tighter turns, you use differential braking: press the brake on the side you want to turn toward, more than the other side."
          },
          {
            type: "paragraph",
            text: "This takes getting used to. In a car, the steering wheel is your primary input. In an airplane, the yoke does almost nothing on the ground (it controls ailerons, which only matter once you have airflow). You steer with your feet. Your hands are for throttle, mixture, flaps, radio — not turning."
          },
          {
            type: "callout",
            variant: "info",
            title: "Yoke position while taxiing",
            body: "You actually do use the yoke while taxiing — but not for steering. You position the ailerons to protect the airplane from wind: yoke into a headwind, yoke away from a tailwind. We'll cover this in detail later. For now, just know the yoke isn't your steering wheel on the ground."
          }
        ]
      },
      {
        heading: "Taxi speed: slower than you think",
        blocks: [
          {
            type: "paragraph",
            text: "A common mistake is taxiing too fast. The rule of thumb: brisk-walk speed, around 5-8 knots on a straight taxiway, slower in turns. Faster than that and you risk ground-looping (the airplane spinning around on the ground) or nosewheel damage, especially in turns."
          },
          {
            type: "paragraph",
            text: "To control taxi speed, use the throttle and brakes together. Throttle up to start moving, throttle back to idle to slow down, and add intermittent braking if needed. Don't ride the brakes — they'll overheat and fade. Real-world technique: set a low power setting, let the airplane accelerate to taxi speed, then reduce to idle and brake gently to maintain it."
          },
          {
            type: "callout",
            variant: "tip",
            title: "Think 'tap the brakes,' not 'ride the brakes'",
            body: "If you're constantly holding brake pressure to control your speed, your power setting is too high. Reduce throttle to idle, let the airplane slow, then add a touch of power to keep moving. Brakes are for stopping and for tight turns — not for cruising the taxiway."
          }
        ]
      },
      {
        heading: "Taxiway markings: where to drive",
        blocks: [
          {
            type: "paragraph",
            text: "Taxiways are marked with yellow lines on dark pavement. Two types of lines matter to you right now:"
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Yellow centerline: a single solid yellow line down the middle of the taxiway. Drive on it. Your nosewheel should track right down the centerline.",
              "Yellow edge lines: solid yellow lines marking the edge of the taxiway. Stay inside them.",
              "Runway hold-short lines: a pattern of four yellow lines — two solid, two dashed — across the taxiway at the entrance to a runway. The solid lines are on the side you approach from; the dashed lines are on the runway side. NEVER cross a hold-short line without explicit ATC (Air Traffic Control) clearance at a towered airport, or a careful visual check at an uncontrolled field."
            ]
          },
          {
            type: "diagram",
            diagramKey: "hold-short-line",
            caption: "A runway hold-short line: four yellow lines — two solid on the taxiway side, two dashed on the runway side. You must stop before the solid lines until cleared to cross. Never taxi past the hold-short line onto a runway without clearance."
          },
          {
            type: "paragraph",
            text: "There are also taxiway signs — yellow signs with black letters/numbers that identify the taxiway (e.g., 'A' for Taxiway Alpha) or point to destinations. Black signs with yellow letters are mandatory instruction signs (runway numbers, 'ILS,' 'NO ENTRY'). Treat these as commands, not suggestions."
          }
        ]
      },
      {
        heading: "The hold-short line: sacred ground",
        blocks: [
          {
            type: "paragraph",
            text: "If there's one marking on the airport you must never violate, it's the hold-short line. It marks the boundary between the taxiway and the runway. Crossing it without clearance is one of the most serious infractions in aviation — called a 'runway incursion.' At a towered airport, it can cost you your pilot certificate. At an uncontrolled airport, it can cost you your life if someone is landing."
          },
          {
            type: "callout",
            variant: "warning",
            title: "The runway is not a taxiway",
            body: "A surprising number of accidents happen because a pilot taxied across (or onto) an active runway without looking. Always do a clearing scan before crossing any runway, even at an uncontrolled airport with no other traffic in sight. Look left, look right, look left again. Then cross. At a towered airport, never cross without hearing 'cleared to cross' from ATC."
          }
        ]
      },
      {
        heading: "The taxi checklist",
        blocks: [
          {
            type: "paragraph",
            text: "While you taxi, real pilots run through a brief checklist of items. You don't have to be obsessive about this in the sim, but it's a good habit:"
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Flight instruments: attitude indicator erect and aligned, heading indicator matching compass, altimeter set.",
              "Radios: tuned to the appropriate frequency (CTAF/UNICOM at uncontrolled fields, ground control at towered fields).",
              "Trim: takeoff. Flaps: as required (usually up for normal takeoff).",
              "Mixture: rich for takeoff. Fuel selector: BOTH.",
              "Engine gauges: oil temperature and pressure in the green, ammeter showing a charge.",
              "Controls: free and full movement, correct direction.",
              "Mental takeoff briefing: runway, wind, abort plan."
            ]
          },
          {
            type: "callout",
            variant: "tip",
            title: "Check flight controls during taxi",
            body: "You can verify control movement while taxiing (with the engine running and the airplane in motion). Move the yoke full left, full right, full forward, full back. Confirm it moves freely and in the correct direction. This is harder to do in the sim, but it's a real-world check you should know about."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Over-controlling the steering",
      body: "New simmers (and student pilots) almost always over-control the rudder pedals on the ground. They press too hard, the airplane yaws too far, they correct with the other pedal, and now they're weaving down the taxiway like a drunk driver. The fix: small inputs. Just a tiny pressure on the pedal you need. Let the airplane settle. Add a bit more if needed. Differential braking for tight turns should be a quick tap, not a steady press. Smoothness is the goal — small corrections, patiently applied."
    },
    tryItInSim: {
      title: "Taxi from the ramp to the runway",
      steps: [
        "Start with the Cessna 172 parked on a ramp at a small airport, engine running. Find a runway and a taxi route to it (use the airport diagram if the sim has one).",
        "Release the parking brake and add a small amount of throttle. The airplane will start to roll. Reduce to idle as soon as you're moving.",
        "Use the rudder pedals (or your assigned rudder keys) to steer down the yellow taxiway centerline. Try to keep the nosewheel on the line.",
        "Approach the runway hold-short line. STOP before the solid lines. Do a clearing scan: look left, right, left.",
        "Once you've confirmed no traffic, taxi across the hold-short line onto the runway, and turn to align with the runway centerline. You're ready for the takeoff module."
      ]
    },
    keyTakeaways: [
      "On the ground, you steer with the rudder pedals (which control the nosewheel), not the yoke. For tight turns, use differential braking.",
      "Taxi at a brisk-walk speed: 5-8 knots straight, slower in turns. Use throttle to start moving, brakes to slow or stop.",
      "Yellow centerlines mark the taxiway; the yellow hold-short line (two solid, two dashed) marks the runway boundary. Never cross the hold-short line without clearance.",
      "Runway incursions (crossing a runway without clearance) are serious. Always do a clearing scan: left, right, left.",
      "Run through a brief taxi checklist as you move: instruments set, radios tuned, controls free, engine gauges in the green."
    ],
    quiz: [
      {
        question: "How do you steer a Cessna 172 on the ground?",
        options: [
          "With the yoke, like a car steering wheel",
          "With the rudder pedals, which control the nosewheel directly",
          "With the brakes only",
          "With the throttle"
        ],
        correctIndex: 1,
        explanation: "On the ground, the rudder pedals are linked to the nosewheel (and rudder) for steering. The yoke controls ailerons, which need airflow to work. For tight turns, use differential braking in addition to rudder."
      },
      {
        question: "What is the recommended taxi speed?",
        options: [
          "As fast as safe handling allows",
          "About a brisk walking pace, 5-8 knots",
          "15-20 knots",
          "Whatever feels comfortable"
        ],
        correctIndex: 1,
        explanation: "A brisk walking pace (5-8 knots) is the rule of thumb — slower in turns. Faster risks nosewheel damage, ground-loops, and makes it hard to stop if a hazard appears."
      },
      {
        question: "What do the runway hold-short lines look like?",
        options: [
          "Two solid yellow lines only",
          "Four yellow lines: two solid on the taxiway side, two dashed on the runway side",
          "A single dashed white line",
          "A red stop bar across the taxiway"
        ],
        correctIndex: 1,
        explanation: "Hold-short lines are four yellow lines — two solid, two dashed. The solid lines are on the side you approach from. You stop with the solid lines in front of you. Only cross after ATC clearance (towered) or a careful scan (uncontrolled)."
      },
      {
        question: "You're taxiing and the airplane keeps weaving side-to-side. What's the most likely cause and fix?",
        options: [
          "Broken nosewheel; return to parking",
          "Over-controlling the rudder pedals; make smaller, smoother inputs and let the airplane settle",
          "The brakes are failing; reduce speed immediately",
          "The wind is too strong; wait it out"
        ],
        correctIndex: 1,
        explanation: "Over-controlling is the classic taxi problem. The fix is to make smaller inputs, give each one a second to take effect, and resist the urge to 'correct' instantly. Smoothness beats reactivity."
      },
      {
        question: "Before crossing any runway, even at an uncontrolled airport with no visible traffic, what should you do?",
        options: [
          "Speed up to clear the runway quickly",
          "Stop at the hold-short line and do a clearing scan: left, right, left",
          "Taxi straight across; you have right of way on the ground",
          "Call ATC on any frequency"
        ],
        correctIndex: 1,
        explanation: "Always stop at the hold-short line and scan left, right, left before crossing a runway. At a towered airport, you also need to hear 'cleared to cross' from ATC. Never assume no one is there — another aircraft on approach may be hard to see."
      }
    ]
  },

  // ============================================================
  // MODULE 7 — Takeoff Procedures
  // ============================================================
  {
    id: 7,
    title: "Takeoff Procedures",
    shortTitle: "Takeoff",
    category: "Procedures",
    estimatedMinutes: 25,
    difficulty: "Intermediate",
    xpReward: 14,
    prerequisites: [5, 6],
    tagline: "Pre-takeoff checklist, the takeoff roll, rotation, and the initial climb — make it boring.",
    whyItMatters:
      "Every flight begins with a takeoff, and a sloppy takeoff sets the tone for everything after. A good takeoff is boring — the airplane accelerates smoothly, you rotate at the right speed, you climb away at the right pitch and airspeed. A bad takeoff is exciting, and exciting is bad. This module teaches you the Cessna 172 normal takeoff: pre-takeoff checklist, takeoff roll, rotation, initial climb. Get this right and the rest of the flight starts well.",
    sections: [
      {
        heading: "The pre-takeoff checklist and runup",
        blocks: [
          {
            type: "paragraph",
            text: "We covered most of this in Module 5, but let's put it together. By the time you're holding short of the runway, you should have already completed:"
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Pre-flight walkaround (sim: skip if your sim doesn't model it).",
              "Engine start and post-start checks.",
              "Taxi to the runup area (not on the runway — usually a parking pad near the runway approach end).",
              "Engine runup at 1,800 RPM: magneto check, carb heat check, vacuum and ammeter check, engine gauges in the green.",
              "Flight instruments set: AI erect, HI aligned with compass, altimeter set to local barometric pressure.",
              "Controls free and correct.",
              "Takeoff briefing: state the runway, wind direction, takeoff type, climb procedure, and abort plan out loud."
            ]
          },
          {
            type: "paragraph",
            text: "When you're holding short of the runway, do one final check: flaps up (for a normal takeoff), trim set to takeoff, mixture rich, fuel selector BOTH, parking brake released. Then do your clearing scan and taxi onto the runway."
          },
          {
            type: "callout",
            variant: "tip",
            title: "The takeoff briefing",
            body: "Real pilots say a takeoff briefing out loud before every takeoff. Example: 'Today I'll use runway 27, wind 250 at 8, normal takeoff, climb straight out to 500 feet, then turn crosswind. If I lose an engine before rotation, I'll brake straight ahead. If I lose an engine after rotation with runway remaining, I'll land straight ahead. If I lose an engine after rotation with no runway remaining, I'll lower the nose, maintain best glide speed, and pick a landing spot ahead.' It sounds morbid. It saves lives."
          }
        ]
      },
      {
        heading: "Lining up and the takeoff roll",
        blocks: [
          {
            type: "paragraph",
            text: "Taxi onto the runway and align the nosewheel with the centerline. Push the throttle smoothly to full — over 3-5 seconds, not instantly. Slamming the throttle open can shock-cool the engine or cause the airplane to veer left (engine torque at high RPM pushes the nose left)."
          },
          {
            type: "paragraph",
            text: "As the airplane accelerates, you'll feel the rudder become effective around 20-30 knots. The nose will want to pull left — that's 'left-turning tendency,' caused by engine torque, spiral propeller slipstream (P-factor), and gyroscopic precession. Apply a touch of right rudder to stay on the centerline."
          },
          {
            type: "diagram",
            diagramKey: "takeoff-roll",
            caption: "The takeoff roll: align nosewheel with centerline, smoothly apply full throttle, steer with rudder as it becomes effective, accelerate to rotation speed."
          },
          {
            type: "callout",
            variant: "info",
            title: "Why does the airplane pull left?",
            body: "Four effects combine to make single-engine propeller planes turn left under power: (1) torque reaction from the engine spinning the prop clockwise (seen from the cockpit), (2) spiral slipstream from the prop hitting the rudder on the left side, (3) P-factor (the descending prop blade has a higher AoA and produces more thrust, on the right side, pulling the nose left), and (4) gyroscopic precession. We won't test you on all four — just remember: full power means right rudder."
          }
        ]
      },
      {
        heading: "Rotation: when the airplane leaves the ground",
        blocks: [
          {
            type: "paragraph",
            text: "Rotation speed (Vr) for a Cessna 172 at typical training weight is about 55 knots. As you accelerate through this speed, smoothly pull back on the yoke — about 1-2 inches. The nose rises, the wing's AoA increases, lift exceeds weight, and the airplane leaves the ground."
          },
          {
            type: "paragraph",
            text: "Don't yank the yoke. A smooth rotation to a pitch attitude of about 7-10 degrees nose-up is what you want. The airplane will lift off, and the stall warning horn may chirp briefly — that's normal, it's telling you you're close to stall AoA during the rotation. As you accelerate, the horn goes silent."
          },
          {
            type: "callout",
            variant: "warning",
            title: "Rotating too early or too hard",
            body: "If you rotate before Vr, the airplane will lift off at a higher AoA, fly slower, and be very close to a stall — possibly even settle back onto the runway. If you rotate too hard, you'll pop into the air, then drag the tail (in a tailwheel) or stall the wing. Rotate smoothly through Vr to a fixed pitch attitude, then hold that attitude and let the airplane fly itself off."
          }
        ]
      },
      {
        heading: "Initial climb: Vy and the climb-out",
        blocks: [
          {
            type: "paragraph",
            text: "Once you're airborne, your goal is to climb at the best rate of climb speed, called Vy (pronounced 'Vee-why'). For a Cessna 172, Vy is about 74 knots. Hold this airspeed by adjusting pitch — if the airspeed is too high, raise the nose a touch; if too low, lower the nose."
          },
          {
            type: "diagram",
            diagramKey: "initial-climb",
            caption: "After liftoff, hold a pitch attitude that gives Vy (74 knots in a C172). Climb straight ahead until at least 500 feet AGL before turning. Apply right rudder to compensate for left-turning tendency."
          },
          {
            type: "paragraph",
            text: "Continue straight ahead until at least 500 feet above ground level (AGL) before starting any turns — this gives you room to maneuver if the engine fails. During the climb, keep applying right rudder to compensate for the left-turning tendency, and re-trim the airplane as the speed and configuration change. The Cessna 172 will need several nose-up trim adjustments during the climb."
          },
          {
            type: "paragraph",
            text: "At about 1,000 feet AGL, you can transition to a cruise climb — slightly lower the nose, accelerate to 80-85 knots, and continue climbing. This improves engine cooling and visibility over the nose."
          },
          {
            type: "callout",
            variant: "tip",
            title: "Airspeed, not pitch, is your reference",
            body: "During climb, don't fixate on the pitch attitude — fixate on the airspeed indicator. The pitch that gives Vy changes with weight, density altitude, and configuration. The airspeed that gives Vy is fixed (74 knots at sea level for a C172). Hold the airspeed, whatever pitch that takes."
          }
        ]
      },
      {
        heading: "Abort: what if something goes wrong?",
        blocks: [
          {
            type: "paragraph",
            text: "Takeoffs are optional; landings are mandatory. If something goes wrong before rotation, the answer is simple: close the throttle, brake, stop on the runway. Engine roughness, a door opening, a strange vibration, a warning horn — all reasons to abort."
          },
          {
            type: "paragraph",
            text: "If the engine fails after rotation with runway remaining, lower the nose slightly (to maintain flying speed), close the throttle, land straight ahead on the runway, and brake. If the engine fails after rotation with no runway remaining, lower the nose to best glide speed (about 65 knots in a C172), don't turn back (the temptation will be strong — resist it), and pick a landing spot within 30 degrees of your nose. We'll cover engine failures in a later module."
          },
          {
            type: "callout",
            variant: "warning",
            title: "Never turn back to the runway",
            body: "If the engine fails at low altitude after takeoff, the temptation to turn back to the runway is overwhelming — and fatal. You don't have the altitude, the speed, or the energy to reverse course without stalling. Land straight ahead, slightly left or right of your nose, in whatever field or road is available. The runway behind you is not an option."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Forgetting the right rudder",
      body: "On takeoff and climb-out, the left-turning tendency is strong and constant. New pilots forget the right rudder, the nose drifts left of centerline, they correct with aileron (which doesn't really work at low speed and creates adverse yaw), and they end up in a wobbly, uncoordinated climb that drifts off the runway heading. The fix: as the throttle goes to full, preemptively add a touch of right rudder. As the speed builds, you'll need a bit less. Keep the ball centered in the turn coordinator."
    },
    tryItInSim: {
      title: "Do a clean normal takeoff in the Cessna 172",
      steps: [
        "Position the Cessna 172 on the runway centerline, engine running, flaps up, trim set to takeoff, mixture rich, fuel selector BOTH.",
        "Do a quick takeoff briefing out loud: runway, wind, abort plan. Release the parking brake.",
        "Smoothly push the throttle to full over 3-5 seconds. As the speed builds past 20 knots, add right rudder to keep the nose on the centerline.",
        "At about 55 knots, smoothly rotate by pulling the yoke back about 1-2 inches. Hold the pitch and let the airplane lift off.",
        "Once airborne, hold the pitch that gives 74 knots (Vy) on the airspeed indicator. Add right rudder as needed to keep the ball centered. Climb straight ahead to at least 500 feet before turning. Re-trim the airplane as needed."
      ]
    },
    keyTakeaways: [
      "A good takeoff starts with a good briefing and a complete pre-takeoff checklist. Always do the runup, always set the instruments, always brief the abort plan.",
      "Push the throttle smoothly to full over 3-5 seconds. As the rudder becomes effective (around 20-30 knots), add right rudder to stay on the centerline against the left-turning tendency.",
      "Rotate at about 55 knots (Vr) in a Cessna 172 by smoothly pulling the yoke back 1-2 inches to a 7-10 degree nose-up pitch. Let the airplane fly itself off — don't yank.",
      "After liftoff, hold the pitch that gives Vy (74 knots at sea level). Climb straight ahead to at least 500 feet AGL before turning.",
      "If anything goes wrong before rotation: close throttle, brake, stop. After rotation with no runway: lower the nose to best glide and land straight ahead. Never turn back to the runway at low altitude."
    ],
    quiz: [
      {
        question: "Approximately what is the rotation speed (Vr) of a Cessna 172 at typical training weight?",
        options: [
          "35 knots",
          "55 knots",
          "75 knots",
          "95 knots"
        ],
        correctIndex: 1,
        explanation: "Vr for a Cessna 172 at typical training weight is about 55 knots. At this speed, smoothly rotating to a climb pitch attitude will lift the airplane off the runway with adequate margin above stall."
      },
      {
        question: "Why does the airplane tend to pull left during the takeoff roll and climb?",
        options: [
          "Crosswind from the left",
          "Combined effects of engine torque, spiral slipstream, P-factor, and gyroscopic precession",
          "Asymmetric fuel loading",
          "The nosewheel is misaligned"
        ],
        correctIndex: 1,
        explanation: "Four effects combine to produce left-turning tendency in single-engine propeller planes. The pilot counters with right rudder. None of these have to do with crosswind (a separate issue) or fuel loading."
      },
      {
        question: "What is Vy, and approximately what is it for a Cessna 172 at sea level?",
        options: [
          "Best angle of climb speed; about 62 knots",
          "Best rate of climb speed; about 74 knots",
          "Never-exceed speed; 163 knots",
          "Rotation speed; 55 knots"
        ],
        correctIndex: 1,
        explanation: "Vy is the best rate of climb speed — the airspeed that gives the most altitude gain per unit of time. For a C172 at sea level, Vy is about 74 knots. (Vx, best angle, is about 62 knots and gives the most altitude per unit of distance.)"
      },
      {
        question: "After rotation, you notice the airspeed is reading 65 knots and dropping. What should you do?",
        options: [
          "Add full throttle and pull back harder",
          "Lower the nose slightly to let the airspeed build back to 74 knots",
          "Raise the flaps",
          "Nothing — airspeed always drops after takeoff"
        ],
        correctIndex: 1,
        explanation: "If airspeed is below Vy and dropping, your pitch is too high. Lower the nose slightly to trade altitude for speed. Pulling back harder would slow you further and risk a stall. Always honor the airspeed, not the pitch."
      },
      {
        question: "The engine fails at 300 feet AGL shortly after takeoff, with no runway remaining ahead. What's the correct response?",
        options: [
          "Immediately turn back to the runway",
          "Lower the nose to best glide speed (about 65 knots) and land straight ahead, choosing a landing spot within 30 degrees of your nose",
          "Pitch up to slow the descent",
          "Declare an emergency and wait for guidance"
        ],
        correctIndex: 1,
        explanation: "At 300 feet you don't have the altitude, speed, or energy to turn back — attempting it will result in a stall and a fatal spin. Lower the nose to best glide (so you don't stall), pick a spot ahead of you, and land straight ahead. Never turn back below ~1,000 feet AGL."
      }
    ]
  },

  // ============================================================
  // MODULE 8 — Basic Maneuvers
  // ============================================================
  {
    id: 8,
    title: "Basic Maneuvers",
    shortTitle: "Basic Maneuvers",
    category: "Flight Maneuvers",
    estimatedMinutes: 28,
    difficulty: "Intermediate",
    xpReward: 15,
    prerequisites: [7],
    tagline: "Straight-and-level, climbs, descents, standard-rate turns, and the gateway to landing: slow flight.",
    whyItMatters:
      "Takeoff gets you in the air. Basic maneuvers keep you there. This module teaches the four core maneuvers that everything else is built on: straight-and-level flight, climbs, descents, and standard-rate turns. Master these, and you can fly from point A to point B. We'll also introduce slow flight, the gateway to landing.",
    sections: [
      {
        heading: "Straight and level: the baseline",
        blocks: [
          {
            type: "paragraph",
            text: "Straight-and-level flight is the baseline of all flying. Wings level, altitude constant, heading constant, airspeed constant. It sounds simple — and it is, once you've done it for a few hours. At first, it will feel like juggling."
          },
          {
            type: "paragraph",
            text: "The challenge: every input you make affects everything else. Pitch up to correct altitude, and airspeed drops. Add power to correct airspeed, and altitude climbs. Bank to correct heading, and you lose lift. The airplane is a system, and you have to control the system, not just individual gauges."
          },
          {
            type: "diagram",
            diagramKey: "straight-level",
            caption: "Straight-and-level flight: wings level on the AI, altimeter holding steady, heading indicator holding steady, airspeed steady. Trim set so the airplane wants to stay here."
          },
          {
            type: "paragraph",
            text: "The trick is trim. Set the pitch for the airspeed you want, then trim until the airplane holds that pitch hands-off. Once trimmed, the airplane will hold altitude and airspeed with only tiny corrections. The yoke is for changing things; trim is for holding them."
          },
          {
            type: "callout",
            variant: "tip",
            title: "The scan",
            body: "Develop a scan: eyes moving across the instruments in a pattern — AI, altimeter, AI, heading, AI, airspeed, AI, VSI. Always returning to the AI as the anchor. Never rest on any one instrument for more than a second. The scan is what keeps you ahead of the airplane."
          }
        ]
      },
      {
        heading: "Climbs and descents",
        blocks: [
          {
            type: "paragraph",
            text: "A climb is straight-and-level flight with more power. A descent is straight-and-level flight with less. That's the simple version. Let's add the nuance."
          },
          {
            type: "paragraph",
            text: "To enter a climb from straight-and-level:"
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Add power to full (or to your climb power setting).",
              "As the airplane accelerates, smoothly pitch up to hold Vy (74 knots) on the airspeed indicator.",
              "Add right rudder to compensate for the increased left-turning tendency at high power.",
              "Trim nose-up as the airplane settles into the climb — you'll need several turns of trim.",
              "To level off, start leveling 10% of your climb rate before target altitude. (Climbing at 500 fpm? Start leveling 50 feet before target.) Reduce power to cruise, lower the nose to level, and re-trim."
            ]
          },
          {
            type: "paragraph",
            text: "To enter a descent from straight-and-level:"
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Reduce power to your descent setting (often 1,500-2,000 RPM for a C172).",
              "Hold the pitch attitude (or pitch up slightly) as the airplane slows — don't let the nose drop on its own.",
              "When you reach your descent airspeed (say, 80 knots), lower the nose to hold that airspeed.",
              "Trim nose-down to hold the descent hands-off.",
              "To level off, add power back to cruise about 50 feet before target altitude (so you don't decelerate too much), level the nose, and re-trim."
            ]
          },
          {
            type: "callout",
            variant: "info",
            title: "Pitch + Power, revisited",
            body: "Notice the pattern: pitch controls airspeed, power controls altitude. In a climb, you add power (altitude) and pitch for the climb airspeed. In a descent, you reduce power (altitude) and pitch for the descent airspeed. Same model, every maneuver."
          }
        ]
      },
      {
        heading: "Standard-rate turns",
        blocks: [
          {
            type: "paragraph",
            text: "A standard-rate turn is 3 degrees per second — also called a 'two-minute turn' because a full 360 takes two minutes. It's the standard turn rate used in instrument flying and a useful reference in visual flying. The Cessna 172 at cruise will bank about 15 degrees for a standard-rate turn."
          },
          {
            type: "diagram",
            diagramKey: "standard-rate-turn",
            caption: "A standard-rate turn: bank about 15 degrees at cruise in a C172, the turn coordinator's miniature airplane aligned with the L or R standard-rate marks. Add rudder to keep the ball centered."
          },
          {
            type: "paragraph",
            text: "To enter a standard-rate turn:"
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Pick a reference point ahead (or a target heading on the HI).",
              "Smoothly roll into a 15-degree bank with the ailerons. As you roll, add a touch of rudder in the same direction to coordinate.",
              "Once in the bank, neutralize the ailerons (or hold a tiny bit of aileron into the turn to prevent over-banking).",
              "Verify the turn coordinator's miniature airplane is on the standard-rate mark. Verify the ball is centered.",
              "To exit, roll out on the target heading. Start the rollout about half your bank angle before the target (i.e., for a 15-degree bank, start rolling out 7-8 degrees before your target heading). The airplane takes time to respond."
            ]
          },
          {
            type: "callout",
            variant: "warning",
            title: "Lose lift in a turn",
            body: "In a bank, the lift vector tilts. Less of it points up. To maintain altitude in a turn, you need either more lift (a bit of back pressure on the yoke) or more speed. If you don't add back pressure, the airplane will descend in the turn. New pilots often miss this and lose altitude in every turn."
          }
        ]
      },
      {
        heading: "Slow flight: the gateway to landing",
        blocks: [
          {
            type: "paragraph",
            text: "Slow flight is flying at airspeeds just above the stall — typically 1.2 to 1.3 times the stall speed, often around 50-60 knots in a Cessna 172 with flaps. This is the regime you'll be in during approach and landing, so it's worth getting comfortable with."
          },
          {
            type: "paragraph",
            text: "In slow flight, the airplane behaves differently than in cruise:"
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Controls feel mushy — there's less airflow over the surfaces, so a given input produces less response.",
              "The nose is higher than in cruise — you need more AoA to make enough lift at low speed.",
              "Power changes affect pitch dramatically — adding power pitches the nose up (you'll need forward pressure); reducing power pitches it down.",
              "Stall is always nearby — small pitch increases can stall the wing, and the stall warning horn may chirp."
            ]
          },
          {
            type: "paragraph",
            text: "To enter slow flight: reduce power to about 1,500 RPM, hold altitude as the airplane slows (raise the nose), and add flaps in stages (10, 20, then 30 degrees) as the speed bleeds off. Once you're at your target slow speed (say 55 knots), add just enough power to maintain altitude. The airplane is now in slow flight — high nose, low speed, mushy controls, stall horn possibly intermittent."
          },
          {
            type: "callout",
            variant: "warning",
            title: "Stay ahead of the airplane",
            body: "Slow flight is where pilots get into trouble. The airplane is close to stall, controls are sluggish, and a distraction can quickly become a stall. Keep your scan tight, keep your hand on the throttle, and recover to cruise immediately if anything feels wrong. Slow flight is a training maneuver — practice it at a safe altitude (3,000+ feet AGL)."
          }
        ]
      },
      {
        heading: "Putting it together: the constant-speed cruise",
        blocks: [
          {
            type: "paragraph",
            text: "Real flying isn't a series of isolated maneuvers — it's a constant flow. You climb, level off, turn to a new heading, descend a bit to maintain altitude in a thermal, turn again, slow down to enter the pattern, descend again. Each maneuver blends into the next."
          },
          {
            type: "paragraph",
            text: "The unifying principle: pitch + power = performance. Set the pitch for the airspeed you want; set the power for the altitude profile you want; trim so the airplane wants to hold it; correct small deviations with small inputs. That's it. Every maneuver in flying is some combination of these four things."
          },
          {
            type: "callout",
            variant: "tip",
            title: "Anticipate, don't react",
            body: "Good pilots think 30 seconds ahead. If you're 50 feet high, you don't fix it by yanking the nose down — you make a tiny pitch adjustment and wait. The airplane takes time to respond. Anticipate the change you'll need, make a small input, watch the trend, adjust. Smoothness is the goal."
          }
        ]
      }
    ],
    commonMistake: {
      title: "Chasing the instruments",
      body: "New pilots look at the altimeter, see they're 50 feet high, push the nose down, see they're now 50 feet low, pull the nose up, see they're 100 feet high... This is called 'chasing' and it produces a wobbly, unpleasant ride. The fix: look at the trend, not the value. If the altimeter is moving up slowly, make a tiny pitch adjustment to stop the trend. Don't try to nail the exact altitude instantly — let the airplane settle. Small inputs, patient waits."
    },
    tryItInSim: {
      title: "Practice the four core maneuvers",
      steps: [
        "Get the Cessna 172 stable in straight-and-level cruise at 3,000 feet. Trim for hands-off flight. Watch the altimeter for one minute — it shouldn't move more than ±50 feet.",
        "Enter a climb: full power, pitch for 74 knots (Vy), add right rudder, trim nose-up. Climb to 4,000 feet. Then level off: reduce power to cruise, lower the nose, re-trim, 50 feet before target.",
        "Enter a descent: reduce power to 1,800 RPM, hold altitude briefly to slow, then lower the nose to hold 80 knots on the way down. Descend to 3,500 feet, then level off with power and pitch.",
        "Practice standard-rate turns: roll into a 15-degree bank to the left, hold for 30 seconds (90 degrees of turn), roll out. Repeat to the right. Watch the ball — keep it centered with rudder.",
        "Enter slow flight: reduce to 1,500 RPM, hold altitude as the airplane slows, add flaps in stages. Get to 55 knots with full flaps, holding altitude. Feel the mushy controls. Then recover: full power, flaps up in stages, level cruise."
      ]
    },
    keyTakeaways: [
      "Straight-and-level is the baseline. The key is trim: set the pitch for the airspeed you want, then trim to hold it hands-off.",
      "Climb = level flight + more power. Descent = level flight + less power. Pitch for airspeed, power for altitude, trim to hold.",
      "A standard-rate turn is 3 degrees per second, about a 15-degree bank at C172 cruise. Add rudder to coordinate; add a touch of back pressure to maintain altitude.",
      "Slow flight (1.2-1.3x stall speed) is the regime of approach and landing. Controls feel mushy, stall is always nearby — practice at safe altitude.",
      "Don't chase the instruments. Watch trends, make small inputs, let the airplane settle. Anticipate, don't react."
    ],
    quiz: [
      {
        question: "You're in straight-and-level flight and notice you've drifted 100 feet below your target altitude. What's the best correction?",
        options: [
          "Pull the nose up sharply to regain altitude",
          "Add a small amount of power and let the altitude build, then re-trim",
          "Drop the nose to gain speed",
          "Add full flaps"
        ],
        correctIndex: 1,
        explanation: "A small altitude correction is best made with a small power change, not a pitch change. Adding a touch of power will bring the altitude back without sacrificing airspeed. Once back at target, re-trim. Sharp pitch changes disrupt the trim and start the 'chasing' cycle."
      },
      {
        question: "In a steady climb, what should the airspeed be in a Cessna 172 at sea level, and how do you maintain it?",
        options: [
          "65 knots; by adjusting throttle",
          "74 knots (Vy); by adjusting pitch",
          "90 knots; by adjusting flaps",
          "55 knots; by adjusting trim only"
        ],
        correctIndex: 1,
        explanation: "Vy for a C172 at sea level is 74 knots. You maintain it by adjusting pitch — raise the nose if airspeed is too high, lower it if too low. Power stays at full for the climb."
      },
      {
        question: "Why do you need to add a slight back pressure on the yoke during a turn?",
        options: [
          "To increase the bank angle",
          "Because banking tilts the lift vector, so less lift acts upward; you need more total lift to maintain altitude",
          "To compensate for adverse yaw",
          "To keep the turn coordinated"
        ],
        correctIndex: 1,
        explanation: "In a bank, the lift vector tilts toward the inside of the turn. Only the vertical component holds the airplane up. To maintain altitude, you need either more lift (back pressure) or more speed. Without back pressure, the airplane descends in the turn."
      },
      {
        question: "What is a standard-rate turn, and approximately what bank angle produces one at Cessna 172 cruise speed?",
        options: [
          "6 degrees per second; about 30 degrees of bank",
          "3 degrees per second (a 'two-minute turn'); about 15 degrees of bank",
          "1 degree per second; about 5 degrees of bank",
          "10 degrees per second; about 45 degrees of bank"
        ],
        correctIndex: 1,
        explanation: "A standard-rate turn is 3 degrees per second — a full 360 in two minutes. At C172 cruise speed, that requires about 15 degrees of bank. The turn coordinator's standard-rate marks help you verify it."
      },
      {
        question: "In slow flight, why do the controls feel 'mushy'?",
        options: [
          "The control linkages are looser at low speed",
          "There's less airflow over the control surfaces, so a given input produces less response",
          "The trim is set wrong",
          "The flaps interfere with the ailerons"
        ],
        correctIndex: 1,
        explanation: "Control authority depends on airflow. At low airspeed, less air hits the ailerons, elevator, and rudder, so they're less effective. Inputs need to be larger and the airplane responds more slowly. This is normal in slow flight and one reason it requires extra attention."
      }
    ]
  }
];
