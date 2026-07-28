import type { FAQItem } from "@/lib/content-types";

// Frequently Asked Questions for FlightPath Academy
// Categories in use: "Getting Started", "Simulators & Hardware", "Real Flying", "Course & Progress"

export const faqItems: FAQItem[] = [
  {
    question: "Will this prepare me for a real pilot's license?",
    answer:
      "Honestly: it will give you a serious head start, not a license. The course builds the same knowledge you'll meet in ground school — airspace, weather, aerodynamics, radio calls, procedures — and the simulator lets you rehearse flows until they're muscle memory. But real certification requires an actual Certified Flight Instructor (CFI), a flight school, an FAA medical certificate, the written knowledge test, and the practical checkride (oral + flight). Think of FlightPath as the book-and-chair phase done really well; the airwork still has to happen in a real airplane.",
    category: "Real Flying",
  },
  {
    question: "Which simulator should I start with?",
    answer:
      "For most beginners: Microsoft Flight Simulator 2024 (or 2020 if your hardware is older). It looks fantastic, the default Cessna 172 is solid for training, and the tutorials walk you in gently. X-Plane 12 is the choice if you care most about flight-model accuracy or you're on a Mac/Linux box — its blade-element physics are arguably truer to life, but the UI is rougher. DCS World is a different animal: deeply realistic military modules, free base game, but heavy on combat systems and not a great fit for learning basic VFR. Pick MSFS unless you have a specific reason not to.",
    category: "Simulators & Hardware",
  },
  {
    question: "Do I need an expensive joystick or yoke to start?",
    answer:
      "No. A mouse and keyboard will absolutely get you through the first several modules — that's why the course is built to work with them. Flight controls are a nice-to-have, not a cover charge. If you do want to spend money, a $35 entry joystick like the Logitech Extreme 3D Pro is the sweet spot to start; a full yoke and rudder pedal set ($250+) is something to graduate to once you know you're hooked. Don't buy gear to fix motivation you don't have yet.",
    category: "Simulators & Hardware",
  },
  {
    question: "Is flight simulation realistic enough to actually learn from?",
    answer:
      "Yes — for procedures, cockpit layout, radio calls, navigation, weather reading, and basic airmanship, modern sims are excellent. Where they fall short is feel: the seat of your pants, real turbulence, the actual sound of an engine rough-running, and the consequences of a bad landing. A sim won't teach you to fear a stall the way the real airplane will. Treat it as a procedures and knowledge trainer, not a perfect flying replica, and you'll get enormous value from it.",
    category: "Simulators & Hardware",
  },
  {
    question: "What computer do I need?",
    answer:
      "Minimum to run MSFS 2024 at low settings: a modern quad-core CPU, 16 GB RAM, an SSD (mandatory — a hard drive will choke), and a mid-range GPU like an RTX 2060 or better. X-Plane 12 has similar demands. If you're below that, MSFS 2020 still runs on surprisingly modest hardware, and the Xbox version is a perfectly legitimate option. The single biggest upgrade you can make for sim performance is moving from a hard drive to an SSD — do that before buying a fancier graphics card.",
    category: "Simulators & Hardware",
  },
  {
    question: "How long does the full course take?",
    answer:
      "The full curriculum is built to take roughly 40-60 hours of combined reading, sim practice, and quizzes, depending on how much you actually fly in the simulator versus just reading. Most students spread that over 6-12 weeks at a relaxed pace. There's no clock running — progress is saved locally, so you can take a month off and pick up where you left off. If you rush, you'll pass quizzes but your hands won't have caught up; flying rewards repetition over speed.",
    category: "Course & Progress",
  },
  {
    question: "Can I skip modules?",
    answer:
      "Only the ones you've unlocked. Modules have prerequisites — you can't open 'Traffic Patterns' until 'Straight and Level' is done, because each module assumes the vocabulary and skills of the ones before it. If you already hold a pilot certificate or have sim experience and want to test out, the first quiz in each module is open; pass it and the module is marked complete. We deliberately don't let you skip into advanced topics cold, because the gaps will bite you later and we'd rather you be bored for ten minutes than confused for ten hours.",
    category: "Course & Progress",
  },
  {
    question: "What's the difference between VFR and IFR?",
    answer:
      "VFR (Visual Flight Rules) means you fly by looking out the window — you navigate by landmarks, avoid other aircraft by seeing them, and stay clear of clouds. It's where every pilot starts. IFR (Instrument Flight Rules) means you fly primarily by reference to the instruments, on a filed flight plan, under air traffic control's positive guidance, and you can legally fly through clouds. IFR requires an instrument rating on top of a private certificate. This course is VFR-focused, which is exactly right for a beginner — instrument flying is a later chapter, not a starting point.",
    category: "Real Flying",
  },
  {
    question: "Will bad sim habits hurt me if I train for real later?",
    answer:
      "They can, but only the ones you let in. The classic traps are: staring at instruments instead of the horizon, over-controlling because the sim lacks physical feedback, and treating crashes as no-big-deal because you can just reset. This course is built to push against all three — we teach outside references, smooth inputs, and real checklists from day one. If you fly in the sim the way you'd want to fly in the airplane, your future CFI will be impressed; if you treat it like a video game, you'll have a few habits to unlearn. The choice is yours.",
    category: "Real Flying",
  },
  {
    question: "Do I need to know math or physics?",
    answer:
      "Middle-school math and a willingness to think about why things happen. You'll use basic arithmetic for weight-and-balance, time-speed-distance, and fuel planning — no calculus, no trig identities. On the physics side, you'll learn the handful of concepts that actually matter (the four forces, angle of attack, why a wing stalls) from scratch; nothing is assumed. If you can balance a checkbook and understand that air going faster over a curved surface makes lower pressure, you have all the background you need.",
    category: "Getting Started",
  },
  {
    question: "What aircraft does this course focus on?",
    answer:
      "The Cessna 172 Skyhawk, almost exclusively. It's the most-produced aircraft in history, the most common trainer in real flight schools, and a genuinely forgiving airplane to learn in. MSFS and X-Plane both ship with a decent default C172. Every checklist, every performance number, every procedure in this course is written for the 172, so what you learn here maps directly to what you'd fly at most real-world flight schools. Other aircraft are mentioned for context, but the 172 is the star of the show.",
    category: "Course & Progress",
  },
  {
    question: "Is the content applicable to both MSFS and X-Plane?",
    answer:
      "Yes. The aviation knowledge — airspace, weather, procedures, navigation, radio calls, aerodynamics — is simulator-agnostic because it's real-world knowledge. The C172 flies similarly enough in both platforms that you can follow every module in either. Where the platforms differ (menu locations, default key bindings, autopilot quirks), the course calls it out and gives instructions for both. If you switch platforms halfway through, you won't lose any progress and you won't need to re-learn anything aviation-related.",
    category: "Simulators & Hardware",
  },
  {
    question: "I get motion sick in VR. Can I still use the course?",
    answer:
      "Absolutely — VR isn't required, or even recommended, for the course. A standard monitor works perfectly and most students never touch a headset. If you do want to try VR, start with short sessions in calm weather and work up slowly; the C172's slow, predictable motion is one of the gentler VR experiences, but some people never get their legs for it. There's no learning advantage to VR for the early modules, so skip it until you're curious, not because you think you need it.",
    category: "Getting Started",
  },
  {
    question: "Do I need an internet connection to use the course?",
    answer:
      "You need internet to load the website and to download the simulator itself, plus the first time you launch a flight in MSFS (it streams terrain data). After that, the course pages and your saved progress work offline — progress is stored locally in your browser, not on our servers. The simulator is the part that wants to be online for scenery streaming; if your connection is spotty, X-Plane's offline world is more forgiving than MSFS's always-online terrain. Either way, plan to be online when you're actually setting up flights.",
    category: "Simulators & Hardware",
  },
];
