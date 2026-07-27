// Simulator setup guide for FlightCourse Academy.
// Honest, beginner-first guidance. No upselling, no aspirational mush.

export interface SimPlatform {
  name: string;
  price: string;
  learningCurve: "Gentle" | "Moderate" | "Steep";
  realism: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface HardwareItem {
  tier: "Essential" | "Nice-to-Have" | "Enthusiast";
  name: string;
  description: string;
  approxPrice: string;
}

export interface GraphicsPreset {
  setting: string;
  recommendation: string;
  why: string;
}

export interface SetupGuide {
  intro: string;
  platforms: SimPlatform[];
  minimumHardware: string;
  hardwareRanking: HardwareItem[];
  graphicsGuidance: GraphicsPreset[];
  recommendedFirstFlight: {
    aircraft: string;
    airport: string;
    icao: string;
    reason: string;
    steps: string[];
  };
}

export const setupGuide: SetupGuide = {
  intro:
    "Welcome to the part where most new pilots overspend. The honest truth: you can start this entire course with a mouse, a keyboard, and any computer that can run a modern flight simulator at all. The sim and the course do the heavy lifting — fancy hardware is a reward for sticking with it, not a cover charge to begin. This guide walks you through picking a simulator, understanding the hardware tiers (so you buy in the right order if you do buy), setting graphics for learning rather than screenshots, and getting a real first flight on the books. Take it slow. The airplane doesn't care how much your yoke cost.",
  platforms: [
    {
      name: "Microsoft Flight Simulator 2024",
      price: "$69.99 Standard Edition (also on Xbox Game Pass)",
      learningCurve: "Gentle",
      realism:
        "Excellent scenery, very good flight models on default aircraft, strong avionics. The default Cessna 172 is well-modeled and is what this course targets.",
      pros: [
        "Best-in-class global scenery streamed over the internet",
        "Built-in flight training with CFI-style lessons",
        "Outstanding default Cessna 172 suitable for real-world-style training",
        "Runs on Xbox Series X|S as well as PC",
        "Active marketplace of third-party aircraft and scenery",
      ],
      cons: [
        "Always-online terrain streaming chews bandwidth and stutters on slow connections",
        "Launch period had server issues; some still linger",
        "High-end visuals need a serious PC",
        "DLC aircraft can get expensive",
      ],
      bestFor:
        "Most beginners. If you have no strong reason to pick something else, pick this.",
    },
    {
      name: "Microsoft Flight Simulator 2020",
      price: "$59.99 Standard Edition (frequently discounted)",
      learningCurve: "Gentle",
      realism:
        "Excellent scenery, good default aircraft, slightly older flight models than 2024 but more than adequate for training. Same default C172 lineage.",
      pros: [
        "More mature and stable than 2024's early releases",
        "Runs on more modest hardware than 2024",
        "Massive library of third-party add-ons, often on sale",
        "Cheaper than 2024, sometimes dramatically so in sales",
      ],
      cons: [
        "Superseded by 2024 — the developer's attention has moved on",
        "Still requires online terrain streaming",
        "Default C172 is decent but not as refined as 2024's",
      ],
      bestFor:
        "Beginners on a budget or with older hardware, or anyone who finds MSFS 2024 still buggy on their system.",
    },
    {
      name: "X-Plane 12",
      price: "$79.99 (one-time purchase, no subscription)",
      learningCurve: "Moderate",
      realism:
        "Arguably the most accurate flight model in the consumer market, thanks to blade-element theory. Default C172 is a credible trainer. Stronger physics than visuals.",
      pros: [
        "Best flight-model accuracy in the consumer space",
        "Runs on Windows, macOS, and Linux",
        "No online streaming required — works fully offline",
        "Zink/Vulkan renderer is solid and predictable",
        "Favored by many real-world pilots for procedural practice",
      ],
      cons: [
        "Default scenery is noticeably weaker than MSFS",
        "UI is less polished and less beginner-friendly",
        "Learning curve for setting up and tuning is steeper",
        "Smaller add-on marketplace than MSFS",
      ],
      bestFor:
        "Pilots who prioritize flight-model realism, Mac/Linux users, and anyone who wants to fly fully offline.",
    },
    {
      name: "DCS World",
      price: "Free base game (includes TF-51D and Su-25T). Paid modules $40-80 each.",
      learningCurve: "Steep",
      realism:
        "Study-level simulation of military aircraft — systems depth is unmatched. But the aircraft are military, not trainers, and the focus is combat systems more than basic airmanship.",
      pros: [
        "Free base game lets you try before you buy",
        "Most realistic systems modeling of any consumer sim",
        "Stunning terrain in paid maps like the Caucasus",
        "Active multiplayer community",
      ],
      cons: [
        "Not a Cessna in sight without paid modules (and even then, not the focus)",
        "Combat systems depth distracts from basic flying fundamentals",
        "Steep learning curve even to start the engines",
        "Hardware-hungry, especially in multiplayer",
      ],
      bestFor:
        "Pilots who already have the basics down and want to fly military aircraft. Not the right starting point for this course.",
    },
  ],
  minimumHardware:
    "A mouse and keyboard. Seriously. The course is designed to be fully completable with them — every module, every checklist, every quiz. What you do need is a computer that can run your chosen simulator at a playable frame rate (30 FPS minimum, 60 preferred for the sake of your eyes and your reflexes). For MSFS 2024/2020 and X-Plane 12, that means: a modern quad-core CPU (Intel i5-10400 / AMD Ryzen 5 3600 or better), 16 GB of RAM (8 is technically supported but you'll suffer), a solid-state drive (NVMe preferred, SATA acceptable, a spinning hard drive is not), and a dedicated GPU in the range of an NVIDIA RTX 2060 / AMD RX 5600 XT or better. The single biggest upgrade you can make for sim performance is moving from a hard drive to an SSD — do that before buying a fancier graphics card. Below that tier, MSFS 2020 on Xbox Series S is a perfectly legitimate way to start; DCS will run on slightly less because its free modules are older. The course content itself runs in any modern browser.",
  hardwareRanking: [
    {
      tier: "Essential",
      name: "Mouse and keyboard",
      description:
        "The starting point. The simulator supports them fully — you'll fly with the mouse controlling pitch and roll, keyboard for throttle, flaps, and view. Not ideal for fine control, but perfectly usable for the entire course and absolutely fine for learning procedures, navigation, and radio calls.",
      approxPrice: "$0 (you have them)",
    },
    {
      tier: "Nice-to-Have",
      name: "Entry joystick (e.g., Logitech Extreme 3D Pro)",
      description:
        "A single stick with a twist-grip rudder and a throttle wheel. The leap from mouse-and-keyboard to a basic joystick is the biggest single upgrade in feel you'll ever make. The Extreme 3D Pro has been the default recommendation for new sim pilots for over a decade because it's cheap, reliable, and good enough to last you through the first half of the course.",
      approxPrice: "~$35",
    },
    {
      tier: "Nice-to-Have",
      name: "Aviation headset",
      description:
        "A real aviation-style headset (Bose A30, David Clark, Lightspeed) connected to your PC lets you hear radio calls and engine sounds clearly, and most importantly gets you used to the feel of a headset before you fly for real. Any decent gaming headset works for the course — an aviation headset is a 'nice to feel like a pilot' upgrade, not a learning requirement.",
      approxPrice: "$100-1100 (a $60 gaming headset is fine)",
    },
    {
      tier: "Enthusiast",
      name: "Yoke + throttle quadrant (e.g., Honeycomb Alpha)",
      description:
        "A proper yoke with a throttle quadrant replicates the controls of a real C172. The Honeycomb Alpha yoke has become the de-facto standard for sim-C172 students because it's well-built, has a realistic feel, and the matching Bravo throttle quadrant gives you real levers for throttle, mixture, and prop. This is when your sim setup starts to look like a training device.",
      approxPrice: "~$250 for the yoke; ~$250 for the Bravo quadrant",
    },
    {
      tier: "Enthusiast",
      name: "Rudder pedals",
      description:
        "Rudder pedals with toe brakes let you steer on the ground properly and coordinate your turns in the air — something a twist-grip joystick only approximates. Once you have a yoke, pedals are the natural next step. Crosswind landings in particular require real rudder control to practice correctly.",
      approxPrice: "~$130-300 (Logitech, Thrustmaster, Honeycomb)",
    },
    {
      tier: "Enthusiast",
      name: "Multi-monitor setup",
      description:
        "A second or third monitor lets you see the cockpit instruments and the outside view at the same time, or gives you peripheral vision for traffic patterns. Doesn't change what you can learn, but it makes the experience dramatically more immersive and reduces the temptation to fly head-down on the gauges.",
      approxPrice: "~$200-500 per monitor",
    },
    {
      tier: "Enthusiast",
      name: "VR headset",
      description:
        "A VR headset (Meta Quest 3, HP Reverb, etc.) gives you true depth perception and the ability to look around the cockpit naturally — a genuine upgrade for traffic scanning and pattern work. But it's not required for any module, can cause motion sickness, and adds significant GPU load. Try before you commit.",
      approxPrice: "~$300-600",
    },
  ],
  graphicsGuidance: [
    {
      setting: "Overall graphics preset",
      recommendation: "Start at Medium. Drop to Low if frame rate is below 30 FPS.",
      why:
        "Learning requires a smooth, predictable picture. Visual splendor is nice; a stable 30+ FPS is essential. You're training your eye to read the runway picture during flare — frame drops during landing will teach you the wrong visual cues.",
    },
    {
      setting: "Frame rate limit",
      recommendation: "30 FPS minimum, 60 FPS if your system can hold it.",
      why:
        "Below 30 FPS the controls feel laggy and your brain starts compensating for the wrong delay. For traffic patterns and landings in particular, you want a frame rate you can rely on. Lock the limit rather than leaving it unlocked so the sim doesn't stutter.",
    },
    {
      setting: "Render scaling / resolution",
      recommendation: "100% or lower. Do not push this above 100% until FPS is comfortable.",
      why:
        "Render scaling is the single most expensive setting per frame. Dropping it to 80-90% is the cheapest way to recover frame rate when you need it, and the visual hit is far smaller than turning off shadows or reflections.",
    },
    {
      setting: "Clouds and weather",
      recommendation: "Medium or Low for the first flights. Set weather to clear/calm in the menu.",
      why:
        "Cloud rendering is GPU-expensive and not relevant to your early modules. Real-weather mode is also more to think about when you should be looking at the runway. Pick calm clear conditions in the weather panel until you're ready for the weather modules.",
    },
    {
      setting: "Live traffic / AI traffic",
      recommendation: "Off for the first several modules.",
      why:
        "Other aircraft are distractions when you're still learning to hold altitude. Turn live traffic on once you reach the traffic-pattern and airspace modules — that's when learning to see and avoid becomes the lesson.",
    },
    {
      setting: "Photogrammetry cities",
      recommendation: "On if your system handles it; off if you're chasing frame rate.",
      why:
        "Photogrammetry makes the world look like the real world, which helps with visual navigation checkpoints. But it's heavy. If you have to choose between photogrammetry and a smooth frame rate, choose the frame rate.",
    },
    {
      setting: "VSync",
      recommendation: "On, if you're hitting your frame rate target. Off, if you're below target.",
      why:
        "VSync prevents screen tearing but caps your frame rate at the monitor's refresh and adds a small input lag. When you're chasing FPS, turn it off; once you're comfortable, turn it back on for visual smoothness.",
    },
    {
      setting: "Cockpit instrument refresh rate",
      recommendation: "High (or unlimited) if your system allows.",
      why:
        "Laggy instruments teach you bad scan habits. The gauges need to respond immediately to your inputs so your brain links cause and effect. If something has to give, give on scenery, not instruments.",
    },
  ],
  recommendedFirstFlight: {
    aircraft: "Cessna 172 Skyhawk (default)",
    airport: "Renton Municipal Airport",
    icao: "KRNT",
    reason:
      "Renton is a quiet, single-runway airport on Lake Washington just southeast of Seattle. Runway 34 gives you a long, wide, flat stretch of water off the departure end — which means if everything goes sideways you're not pointed at buildings. The surrounding airspace is busy enough to feel real but quiet enough at KRNT itself that you won't be holding short behind a 737. The Seattle area is scenic, the terrain is forgiving, and the default weather preset is usually calm. It's a textbook first-flight airport.",
    steps: [
      "Spawn the C172 at the KRNT ramp in the daytime, clear skies, winds calm (set this in the weather panel before loading in).",
      "Run the C172 Before Start checklist from this site — verify fuel selector BOTH, mixture RICH, flaps up, trim for takeoff, avionics off.",
      "Start the engine: prime 1-2 strokes if cold, key to START, release to BOTH when it fires, throttle back to 1000 RPM.",
      "Taxi to runway 34 using the mouse or rudder pedals. Keep speed at a fast walk. Test brakes as you go.",
      "On the runway, throttle full smoothly, watch the RPM reach ~2400, rotate at 55 KIAS, and pitch for 75 KIAS on the climb. Climb straight ahead over the lake to 1000 ft before turning. That's your first flight — land straight ahead on the lake if anything fails below that altitude.",
    ],
  },
};
