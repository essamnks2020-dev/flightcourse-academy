// The Cessna 172 instrument panel, described instrument by instrument.
// Written for simulator pilots: what it reads, how it lies to you, and the
// one habit that keeps you out of trouble.

export type InstrumentGroup =
  | "Six-pack"
  | "Engine & fuel"
  | "Avionics"
  | "Controls & switches"

export interface Instrument {
  id: string
  name: string
  abbreviation: string
  group: InstrumentGroup
  /** One-line summary shown on the panel tile. */
  reads: string
  howItWorks: string
  normalIndication: string
  /** The classic failure and what it looks like. */
  failure: string
  scanTip: string
  /** Module that teaches this instrument in depth. */
  moduleId: number
}

export const instruments: Instrument[] = [
  {
    id: "airspeed-indicator",
    name: "Airspeed Indicator",
    abbreviation: "ASI",
    group: "Six-pack",
    reads: "How fast the air is moving past the wing, in knots",
    howItWorks:
      "Compares ram air pressure from the pitot tube against static pressure from the static port. The difference is dynamic pressure, which the needle displays as indicated airspeed.",
    normalIndication:
      "Green arc in normal cruise, white arc with flaps out, 65 KIAS on final in a C172.",
    failure:
      "A blocked pitot tube freezes the needle or makes it behave like an altimeter — reading higher as you climb. A blocked static port makes it under-read in a climb.",
    scanTip:
      "Airspeed is controlled with pitch, not power. If the number is wrong, move the nose before you touch the throttle.",
    moduleId: 2,
  },
  {
    id: "attitude-indicator",
    name: "Attitude Indicator",
    abbreviation: "AI",
    group: "Six-pack",
    reads: "Where the nose and wings are relative to the horizon",
    howItWorks:
      "A gyroscope spun by engine-driven vacuum holds a rigid reference in space. The instrument case moves around it, so the miniature aircraft appears to pitch and bank.",
    normalIndication:
      "Wings level on the horizon line in cruise, roughly 10 degrees nose-up during a normal climb.",
    failure:
      "Vacuum pump failure makes the horizon slowly droop and lean — dangerously believable, because it moves slowly. Cross-check against the turn coordinator and altimeter.",
    scanTip:
      "This is the master instrument in instrument flight. Return your eyes to it between every other instrument you read.",
    moduleId: 2,
  },
  {
    id: "altimeter",
    name: "Altimeter",
    abbreviation: "ALT",
    group: "Six-pack",
    reads: "Height above a pressure datum, in feet",
    howItWorks:
      "A sealed aneroid capsule expands as static pressure falls with altitude. The Kollsman window lets you set the local pressure setting so the reading matches reality.",
    normalIndication:
      "Field elevation on the ground once the correct altimeter setting is entered.",
    failure:
      "A wrong pressure setting is the common one — one tenth of an inch is about 100 feet of error. Always low pressure to high, look out below.",
    scanTip:
      "Altitude is held with power in level cruise. Set the altimeter before taxi and again on descent through the transition level.",
    moduleId: 2,
  },
  {
    id: "turn-coordinator",
    name: "Turn Coordinator",
    abbreviation: "TC",
    group: "Six-pack",
    reads: "Rate of turn, plus whether the turn is coordinated",
    howItWorks:
      "A canted electric gyro senses both roll and yaw. The little ball is a plain inclinometer — gravity and centrifugal force decide where it sits.",
    normalIndication:
      "Wing tip on the index mark equals a standard rate turn, three degrees per second, a full 360 in two minutes.",
    failure:
      "Because it is usually electric, it survives a vacuum failure — which makes it your bank cross-check when the attitude indicator dies.",
    scanTip:
      "Step on the ball. If the ball slides left, add left rudder until it centres.",
    moduleId: 4,
  },
  {
    id: "heading-indicator",
    name: "Heading Indicator",
    abbreviation: "HI",
    group: "Six-pack",
    reads: "The magnetic heading the aircraft is pointing",
    howItWorks:
      "A vacuum gyro holds a compass card steady. It has no magnetic sense of its own, so it must be aligned with the magnetic compass.",
    normalIndication:
      "Matches the wet compass after alignment; runway heading when lined up for departure.",
    failure:
      "Gyroscopic drift of a few degrees every fifteen minutes. Realign it in straight and level flight, never in a turn.",
    scanTip:
      "Reset it against the magnetic compass every fifteen minutes and before any instrument approach.",
    moduleId: 10,
  },
  {
    id: "vertical-speed-indicator",
    name: "Vertical Speed Indicator",
    abbreviation: "VSI",
    group: "Six-pack",
    reads: "Rate of climb or descent, in feet per minute",
    howItWorks:
      "Measures how fast static pressure is changing through a calibrated leak, so the needle shows a trend before it shows an accurate number.",
    normalIndication:
      "Around 700 fpm up in a C172 climb, 500 fpm down on a stabilised approach.",
    failure:
      "It lags by six to nine seconds. Chasing the needle produces a rollercoaster; use it to confirm, not to control.",
    scanTip:
      "Trim for the vertical speed you want, then leave the controls alone and let it settle.",
    moduleId: 2,
  },
  {
    id: "tachometer",
    name: "Tachometer",
    abbreviation: "RPM",
    group: "Engine & fuel",
    reads: "Engine speed in revolutions per minute",
    howItWorks:
      "Driven mechanically or electrically from the engine. On a fixed-pitch propeller aircraft it is your primary power instrument.",
    normalIndication:
      "About 2400 RPM in cruise, 1700 RPM for the magneto check, 1000 RPM taxi.",
    failure:
      "A dead tachometer forces you to fly power settings by sound and airspeed — flyable, but a reason to land.",
    scanTip:
      "Set power by RPM, then verify the result on the airspeed indicator a few seconds later.",
    moduleId: 5,
  },
  {
    id: "oil-temperature-pressure",
    name: "Oil Temperature & Pressure",
    abbreviation: "OIL",
    group: "Engine & fuel",
    reads: "Whether the engine is being lubricated and cooled",
    howItWorks:
      "A pressure transducer in the oil gallery and a temperature probe in the sump feed a pair of gauges, usually stacked together.",
    normalIndication:
      "Pressure into the green within thirty seconds of start; temperature mid-green after a few minutes.",
    failure:
      "Falling pressure with rising temperature means an oil leak. Land at the nearest suitable airport, and expect the engine to seize if you press on.",
    scanTip:
      "Check oil pressure before you release the brakes. No pressure, no taxi.",
    moduleId: 5,
  },
  {
    id: "fuel-gauges",
    name: "Fuel Quantity Gauges",
    abbreviation: "FUEL",
    group: "Engine & fuel",
    reads: "Approximately how much fuel remains in each tank",
    howItWorks:
      "Floats in each wing tank move a variable resistor. Certification only requires them to be accurate when empty, which tells you how much to trust them.",
    normalIndication:
      "Both needles reading the same, decreasing evenly with the fuel selector on Both.",
    failure:
      "Sticking floats read full when the tank is not. Time your fuel using known burn rate — roughly 8 gph in a C172 — and treat the gauges as a cross-check.",
    scanTip:
      "Note the time at every power change. Fuel is a stopwatch problem, not a gauge problem.",
    moduleId: 14,
  },
  {
    id: "mixture-control",
    name: "Mixture Control",
    abbreviation: "MIX",
    group: "Controls & switches",
    reads: "The fuel-to-air ratio going into the cylinders",
    howItWorks:
      "The red knob meters fuel. Air thins with altitude, so without leaning, the mixture becomes progressively richer and the engine loses power and fouls plugs.",
    normalIndication:
      "Full rich for takeoff below 3000 feet, leaned for peak RPM in cruise, full lean to shut the engine down.",
    failure:
      "Forgetting to enrich the mixture before descent causes a rough engine or a stoppage when you add power for the go-around.",
    scanTip:
      "Mixture rich, carb heat cold, fuel pump on — say it out loud on every descent checklist.",
    moduleId: 5,
  },
  {
    id: "carburettor-heat",
    name: "Carburettor Heat",
    abbreviation: "CARB",
    group: "Controls & switches",
    reads: "Whether heated air is being fed to the carburettor",
    howItWorks:
      "Routes exhaust-warmed air into the induction system to melt ice that forms in the venturi when the air is humid and cool.",
    normalIndication:
      "A small RPM drop when pulled — that drop is proof it is working.",
    failure:
      "Carburettor ice creeps in during a long, low-power descent. Symptoms are a slow RPM decay and roughness with no other explanation.",
    scanTip:
      "Pull carb heat before you reduce power for descent, not after the engine gets rough.",
    moduleId: 13,
  },
  {
    id: "flap-selector",
    name: "Flap Selector",
    abbreviation: "FLAP",
    group: "Controls & switches",
    reads: "How much flap is extended, in degrees",
    howItWorks:
      "Electrically driven Fowler flaps increase lift and drag. Ten degrees mostly adds lift, thirty degrees mostly adds drag and steepens the approach.",
    normalIndication:
      "Zero for takeoff in a C172, ten on downwind, twenty on base, thirty on final.",
    failure:
      "Asymmetric or stuck flaps produce a roll tendency. Fly the aircraft, hold the wing down with aileron, and plan a faster, flatter approach.",
    scanTip:
      "Never extend flaps above the white arc, and never retract them on the runway roll while still fast.",
    moduleId: 9,
  },
  {
    id: "vor-indicator",
    name: "VOR / Course Deviation Indicator",
    abbreviation: "CDI",
    group: "Avionics",
    reads: "Your position left or right of a selected radio course",
    howItWorks:
      "Compares the phase of two signals from a ground VOR station. The omni-bearing selector picks the course; the needle shows displacement from it, not the way to turn the wheel.",
    normalIndication:
      "Needle centred with the TO/FROM flag showing TO when tracking inbound.",
    failure:
      "An unreliable station drives the red flag into view. A reversed sensing needle usually means you selected a reciprocal course.",
    scanTip:
      "Turn towards the needle. If that increases the deflection, your selected course is backwards.",
    moduleId: 10,
  },
  {
    id: "transponder",
    name: "Transponder",
    abbreviation: "XPDR",
    group: "Avionics",
    reads: "The code and altitude ATC radar sees for you",
    howItWorks:
      "Replies to radar interrogations with your assigned squawk code and, in Mode C, your pressure altitude.",
    normalIndication:
      "1200 for VFR in the United States, ALT mode selected, assigned code when in contact with ATC.",
    failure:
      "Left in standby, you become invisible to radar services. Squawk 7700 for emergency, 7600 for radio failure, 7500 for hijack.",
    scanTip:
      "Set the code before you take off and switch to ALT with the landing lights, as one flow.",
    moduleId: 11,
  },
  {
    id: "comm-radio",
    name: "COM Radio",
    abbreviation: "COM",
    group: "Avionics",
    reads: "The frequencies you are transmitting and listening on",
    howItWorks:
      "Two independent VHF transceivers with active and standby frequencies. Tune the standby, then flip it across when you are ready to talk.",
    normalIndication:
      "Ground frequency active before taxi, tower standby ready to swap for departure.",
    failure:
      "A stuck microphone blocks the whole frequency. If you hear nothing at all, check the volume, the squelch and that you are on the right side.",
    scanTip:
      "Listen before you transmit, then say who you are, where you are, and what you want — in that order.",
    moduleId: 11,
  },
]

export const instrumentGroups: InstrumentGroup[] = [
  "Six-pack",
  "Engine & fuel",
  "Avionics",
  "Controls & switches",
]

export const instrumentById = new Map(instruments.map((i) => [i.id, i]))
