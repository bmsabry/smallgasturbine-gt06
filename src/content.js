// Course content for GT-06 — Evaporative Tube Combustor.
// All learning outcomes use measurable action verbs. Every section has at
// least one formative probe. Mirrors the GT-05 shape so App.jsx renders both.

export const COURSE_META = {
  id: "gt-06",
  code: "GT-06",
  title: "Evaporative Tube Combustor — Design Principles & Fuel Delivery",
  subtitle: "Small Jet Engine Design Training | Bassam Track | 3.5 hr session",
  org: "ProReadyEngineer",
  durationMin: 210,
  prerequisites: [
    "GT-02 — Brayton cycle fundamentals",
    "GT-05 — centrifugal compressor (P3, T3, ṁ_air)",
  ],
  topLevelOutcomes: [
    { verb: "Define", text: "Define equivalence ratio φ, FAR, and stoichiometric FAR for Jet-A1 (0.0667), and state the regimes (lean, rich, stoichiometric)." },
    { verb: "Compare", text: "Compare evaporative-tube and pressure-jet atomization on pump pressure, reliability, fuel choice, and crossover thrust scale." },
    { verb: "Explain", text: "Explain walking-stick vaporization as a closed thermal-feedback loop: flame heats tube → tube vaporises fuel → vapour feeds flame." },
    { verb: "Calculate", text: "Calculate Jet-A1 fuel flow from primary-zone equivalence ratio, FAR_st, and compressor mass flow." },
    { verb: "Allocate", text: "Allocate compressor discharge air across primary, secondary, dilution, and liner-cooling functions without double-counting." },
    { verb: "Size", text: "Size first-pass liner holes from target ΔP, discharge coefficient, density, and zone mass flow; check pattern factor." },
    { verb: "Select", text: "Select glow / spark / propane-start architecture and place ignition in the vapor-rich recirculation zone." },
    { verb: "Diagnose", text: "Diagnose hot starts, blowout, coking, clogged sticks, cold-ΔP errors, and combustion instabilities from test symptoms." },
  ],
};

// Reference engine — same 700 N small turbojet as GT-05, with combustor-specific outputs added.
export const REFERENCE_ENGINE = {
  label: "700 N small turbojet (reference design)",
  thrust_N: 700,
  mDot_kgs: 0.85,
  PR_target: 3.5,
  N_rpm: 80000,
  // Combustor-specific
  T03_K: 447,
  P3_kPa: 294,
  T4_target_C: 950,
  FAR_st_JetA1: 0.0667,
  cp_gas_JkgK: 1150,
  LHV_JetA1_MJkg: 43,
  eta_b: 0.98,
  dP_liner_frac: 0.04,
  f_dome: 0.35,
};

// 12 sections from the PDF.
export const SECTIONS = [
  // ─── 1 ────────────────────────────────────────────────────────────────
  {
    id: "s1",
    number: 1,
    title: "Where this session fits in the course",
    subtitle: "Heat-addition phase of the Brayton cycle.",
    outcomes: [
      { verb: "Locate", text: "Locate the combustor between Stations 3 and 4 of the gas-path and within the GT-XX curriculum." },
      { verb: "State", text: "State the design pressure drop budget across the liner (3–5% of P3) and why it is a 'necessary evil'." },
    ],
    cards: [
      {
        id: "s1-c1",
        heading: "The heat-addition phase",
        body: "The combustion chamber is the heat-addition phase of the Brayton cycle. The compressor raises pressure; the combustor converts that compressed air into a high-energy gas stream by adding chemical energy through controlled combustion. Without controlled heat addition, the high-pressure air leaving GT-05's diffuser is just inert pressurised gas with no thrust potential.",
      },
      {
        id: "s1-c2",
        heading: "Where this session sits",
        body: "GT-06 sits between GT-05 and GT-07 in the curriculum.",
        bullets: [
          "Prior — GT-05 fixes the discharge pressure P3 and temperature T3 from the centrifugal diffuser; these are the inlet conditions to the combustor.",
          "Current — transition from aerodynamics to thermal energy conversion via 'walking-stick' evaporative vaporisation.",
          "Next — GT-07 (Axial Turbine) takes the combustor exit gas (T4, uniformity, pattern factor) as its inlet boundary conditions.",
          "Every millibar of ΔP lost across the combustor is turbine work unavailable downstream — combustor design is a balance between mixing quality and pressure budget.",
        ],
      },
      {
        id: "s1-c3",
        heading: "Inputs from the compressor",
        body: "What the combustor receives at Station 3.",
        bullets: [
          "Radial-compressor exit: KJ-66-class plenum at PR = 2.0–4.0, T03 ≈ 447 K for the 700 N reference engine.",
          "Isobaric vs real-world heat addition — the ideal Brayton cycle assumes constant pressure; real engines need 3–5% ΔP to drive air through liner holes and create turbulent mixing.",
          "Fuel-Air Ratio (FAR) is mass fuel / mass air. We operate overall lean (FAR ≈ 0.02) even when the primary zone is locally near stoichiometric (FAR ≈ 0.067).",
          "The transition from compressor → combustor is the most thermally stressed region in the engine.",
        ],
      },
    ],
    probes: [
      {
        id: "s1-p1",
        type: "mcq",
        kind: "concept",
        stem: "The combustor sits between which two gas-path stations in this engine's numbering?",
        options: [
          "Stations 4 and 5 (turbine inlet and exit)",
          "Stations 1 and 2 (inlet and compressor inlet)",
          "Stations 2 and 3 (compressor inlet and exit)",
          "Stations 3 and 4 (compressor exit and turbine inlet)",
        ],
        correct: 3,
        explain: "Station 3 is the compressor exit / combustor inlet; Station 4 is the turbine NGV inlet, fed by the combustor exit. The combustor's job is to take Station-3 air, add fuel + heat, and deliver Station-4 gas at the design TET with acceptable pattern factor.",
      },
      {
        id: "s1-p2",
        type: "mcq",
        kind: "analysis",
        stem: "Why is the 3–5% combustor pressure drop described as a 'necessary evil'?",
        options: [
          "ΔP across the liner is what drives air through holes for mixing and zonation — but every millibar lost is turbine work unavailable downstream",
          "The pressure drop is needed to cool the turbine inlet",
          "It is required to prevent surge in the compressor",
          "Pressure drop wastes pump power; it serves no useful purpose",
        ],
        correct: 0,
        explain: "Mandatory because you need ΔP to push air through the primary, secondary, and dilution holes at the right penetration depth — that's how mixing happens. Costly because the turbine sees P4 = P3 − ΔP, so any combustor ΔP is potential turbine work you'll never recover. Designers balance the two.",
      },
    ],
  },

  // ─── 2 ────────────────────────────────────────────────────────────────
  {
    id: "s2",
    number: 2,
    title: "Basics of combustion",
    subtitle: "Fundamentals before we dive into hardware.",
    outcomes: [
      { verb: "Define", text: "Define equivalence ratio φ and classify a mixture as lean / stoichiometric / rich from a given value." },
      { verb: "Explain", text: "Explain why flame temperature peaks near φ = 1 and falls off in both lean and rich directions." },
      { verb: "Distinguish", text: "Distinguish non-premixed (diffusion) from premixed combustion by where the flame anchors and what controls reaction rate." },
    ],
    cards: [
      {
        id: "s2-c1",
        heading: "Non-premixed (diffusion) flames",
        body: "Fuel and oxidizer are separate streams that mix at the flame front. Combustion occurs along the stoichiometric contour where φ = 1 locally. There is no fixed flame speed — the reaction rate is controlled by the mixing/diffusion rate, not chemistry alone.",
        bullets: [
          "Produces very high local temperatures (≈ 2200 K for CH₄/air at φ = 1).",
          "High local temperature is the primary driver of thermal NOx (Zeldovich mechanism).",
          "Extremely stable — can operate across a wide fuel-air ratio range.",
          "Soot formation is possible in fuel-rich pockets.",
        ],
      },
      {
        id: "s2-c2",
        heading: "Equivalence ratio (φ)",
        body: "The single most important parameter governing combustion behaviour, emissions, and flame stability.",
        bullets: [
          "Definition: φ = (F/A)_actual / (F/A)_stoichiometric.",
          "φ = 1.0: stoichiometric — exact chemically correct proportion.",
          "φ < 1.0: lean — excess air; cooler flames; can blow out if too lean.",
          "φ > 1.0: rich — excess fuel; cooler flames; CO/soot/coking risk; can quench.",
          "DLE (Dry Low Emissions) systems target local φ ≈ 0.45–0.6 for NOx control.",
          "Small changes in φ have large effects on temperature, NOx, CO, and stability.",
        ],
      },
      {
        id: "s2-c3",
        heading: "Flame temperature — key concepts",
        body: "Adiabatic flame temperature is the maximum theoretical flame temperature with no heat loss.",
        bullets: [
          "For CH₄/air at 1 atm: T_ad ≈ 2230 K at φ = 1.0.",
          "At DLE operating conditions (φ ≈ 0.5): T_flame ≈ 1650–1750 K.",
          "NOx formation rate is exponential with temperature (Zeldovich). Reducing T_flame by ~55 °C drops NOx by 10–20 ppm — the entire basis of DLE.",
          "Flame temperature is not measured directly — inferred from exhaust T and emissions.",
          "Higher inlet air temperature (T3) raises flame temperature for a given φ.",
        ],
      },
      {
        id: "s2-c4",
        heading: "Lean Blowout (LBO) and stability",
        body: "LBO is the lower stability limit of lean premixed combustion — when the mixture is too lean to sustain a flame.",
        bullets: [
          "Maintaining a flame at high incoming air velocity (~150 m/s in the primary zone) is the hard part — this is static flame stability.",
          "Designers use swirlers to generate a Central Recirculation Zone (CRZ): low-velocity region that recirculates hot products back to fresh mixture, providing continuous ignition.",
          "Other stabilisation methods: flame jets, bluff bodies, sudden step changes in cross-section — all create low-velocity regions.",
        ],
      },
      {
        id: "s2-c5",
        heading: "Liquid fuel combustion challenges",
        body: "Liquid fuel must be vaporised before it can burn — diesel in a bucket will not ignite from a match.",
        bullets: [
          "Atomisation breaks the liquid sheet into ligaments and droplets; droplet size measured by Sauter Mean Diameter (SMD, D32), typically via PDPA laser diagnostics.",
          "Smaller droplets evaporate faster — but require either high pump pressure (pressure-jet) or pre-vaporisation (sticks).",
          "In a few-millisecond residence-time combustor, coarse droplets or cold liquid carryover survives into the dilution/turbine path and causes torching or hot starts.",
        ],
      },
    ],
    probes: [
      {
        id: "s2-p1",
        type: "mcq",
        kind: "concept",
        stem: "A combustion mixture has FAR = 0.05 and uses Jet-A1 (FAR_st = 0.0667). What is φ, and is the mixture lean, stoichiometric, or rich?",
        options: [
          "φ ≈ 0.75 — rich",
          "φ ≈ 1.0 — stoichiometric",
          "φ ≈ 1.33 — rich",
          "φ ≈ 0.75 — lean",
        ],
        correct: 3,
        explain: "φ = FAR_actual / FAR_st = 0.05 / 0.0667 ≈ 0.75. Since φ < 1, the mixture is lean (excess air). Lean flames burn cooler than stoichiometric — useful for NOx control but at risk of blowout if pushed too lean.",
      },
      {
        id: "s2-p2",
        type: "mcq",
        kind: "analysis",
        stem: "In a diffusion (non-premixed) flame, what controls the reaction rate?",
        options: [
          "Mixing / diffusion rate between fuel and oxidizer at the flame front",
          "The flame speed of the fuel-air premix",
          "Compressor exit temperature",
          "Pressure alone",
        ],
        correct: 0,
        explain: "Non-premixed flames anchor along the stoichiometric contour where fuel and air diffuse into each other. There's no fixed flame speed (that concept belongs to premixed flames). What sets reaction rate is how fast the two streams mix — chemistry is usually fast enough that mixing is the bottleneck.",
      },
      {
        id: "s2-p3",
        type: "mcq",
        kind: "application",
        stem: "A DLE combustor is operated at local φ = 0.5 to keep flame temperature low for NOx control. What is the dominant risk if φ drops further toward 0.3?",
        options: [
          "Soot formation increases",
          "Pattern factor degrades",
          "Thermal NOx rises sharply",
          "Lean blowout (LBO) — flame extinguishes",
        ],
        correct: 3,
        explain: "Drop φ below the lean stability limit and the mixture is too lean to sustain a flame — the flame goes out. NOx, soot, and pattern factor are all concerns elsewhere in the design space; LBO is the specific failure mode of going too lean.",
      },
    ],
  },

  // ─── 3 ────────────────────────────────────────────────────────────────
  {
    id: "s3",
    number: 3,
    title: "The residence-time problem",
    subtitle: "Why micro-combustion is hard.",
    outcomes: [
      { verb: "Estimate", text: "Estimate combustor residence time τ from volume, mass flow, and inlet conditions." },
      { verb: "Justify", text: "Justify pre-vaporisation as a way to fit vaporisation + mixing + reaction inside a few-millisecond budget." },
    ],
    cards: [
      {
        id: "s3-c1",
        heading: "A few milliseconds",
        body: "The real constraint is tight time, not a false 100× gap with industrial combustors.",
        bullets: [
          "Bulk estimate: τ ≈ V_liner / V̇_hot (liner volume divided by hot-flow volume rate).",
          "KJ-66 class: τ is a few milliseconds — about 2–5 ms is plausible, not a universal value.",
          "Aero and industrial gas-turbine combustors are also millisecond-scale; '100 ms' is not a compact-gas-turbine value.",
          "Design meaning: vaporisation + mixing + wall heat loss + pattern factor all share that millisecond budget.",
        ],
      },
      {
        id: "s3-c2",
        heading: "Why pre-vaporisation helps",
        body: "Fuel preparation is the bottleneck, not chemistry alone.",
        bullets: [
          "Liquid fuel must heat, evaporate, mix, then react — evaporation and mixing are usually the slow steps.",
          "Coarse droplets or cold liquid carryover survive into the dilution / turbine path → torching, hot starts, blade damage.",
          "Evaporative sticks deliver vapour + fine mist directly into the recirculation zone, taking evaporation out of the in-flame residence-time budget.",
          "Pressure-jet systems can work too, but require atomisation quality, pump pressure, fuel filtration, and enough chamber volume.",
        ],
      },
    ],
    probes: [
      {
        id: "s3-p1",
        type: "mcq",
        kind: "application",
        stem: "A KJ-66-class combustor has liner volume ≈ 1.5 × 10⁻⁴ m³ and a hot volumetric flow rate ≈ 0.05 m³/s. Estimate the residence time.",
        options: [
          "≈ 30 ms",
          "≈ 3 ms",
          "≈ 0.3 ms",
          "≈ 300 ms",
        ],
        correct: 1,
        explain: "τ ≈ V / V̇ = 1.5e-4 / 0.05 = 3 × 10⁻³ s = 3 ms. Sits squarely in the few-millisecond band typical of small gas-turbine combustors. All of vaporisation + mixing + reaction has to happen in that window.",
      },
      {
        id: "s3-p2",
        type: "mcq",
        kind: "analysis",
        stem: "In a few-millisecond combustor with cold liquid fuel injection (no pre-vaporisation), what is the MOST LIKELY failure mode?",
        options: [
          "Pump cavitation",
          "Surge in the upstream compressor",
          "NOx exceeds emissions targets",
          "Coarse droplets survive into the dilution and turbine path, causing torching and hot streaks",
        ],
        correct: 3,
        explain: "Liquid droplets need time to heat, evaporate, mix, and react. In a 3 ms budget you can't afford to spend most of that on vaporisation. Coarse-droplet carryover ignites late — past the primary zone — producing torching at the exhaust and hot streaks at the NGV. Pre-vaporisation (sticks) or fine atomisation (pressure-jet) is mandatory.",
      },
    ],
  },

  // ─── 4 ────────────────────────────────────────────────────────────────
  {
    id: "s4",
    number: 4,
    title: "Atomization comparison",
    subtitle: "Two architectures fight for dominance.",
    outcomes: [
      { verb: "Compare", text: "Compare evaporative-tube and pressure-jet atomisation on pump pressure, reliability, fuel choice, and complexity." },
      { verb: "Justify", text: "Justify the evaporative-tube choice for the 700 N class and identify the crossover thrust scale to pressure-jet." },
    ],
    cards: [
      {
        id: "s4-c1",
        heading: "Evaporative tubes (sticks)",
        body: "The micro-turbine standard.",
        bullets: [
          "Use radiant heat from the primary flame to gasify fuel inside the tube before it enters the flame.",
          "Simple and reliable: no high-pressure pump, no fine atomiser nozzles to clog.",
          "Require a gaseous pre-heat (propane) because cold tubes will not vaporise liquid kerosene.",
          "Mainstream choice for KJ-66, JetCat, AMT, and most hobbyist-class small turbojets.",
        ],
      },
      {
        id: "s4-c2",
        heading: "Pressure-jet atomisers",
        body: "The big-engine option.",
        bullets: [
          "Used in larger engines — the Sophia J-450 is the small-engine example.",
          "Require high-pressure fuel pumps (10+ bar) and fine nozzles to break liquid into a 30–50 μm spray.",
          "Allow 'kerosene-only' starts — no propane required.",
          "Trade-off: prone to clogging, increase system weight, higher complexity (pump, regulator, filter).",
        ],
      },
      {
        id: "s4-c3",
        heading: "Why sticks won the design war at small scale",
        body: "Simplicity beats sophistication at small scale.",
        bullets: [
          "Cost and weight: the high-pressure pump + atomiser hardware is a large penalty at 70 N scale.",
          "Time: the heated stick prepares kerosene inside a millisecond residence-time budget.",
          "Robustness: no fine spray nozzle, but stick exit holes still need filtration and coking checks.",
          "For the 700 N reference engine: evaporative tubes are the practical baseline.",
        ],
      },
      {
        id: "s4-c4",
        heading: "When to choose pressure-jet",
        body: "Roughly above 200 N, pressure-jet becomes worth evaluating because the hardware penalty becomes proportionally smaller.",
        bullets: [
          "Wins only when pump pressure, atomiser quality, fuel filtration, and control logic are all mature.",
          "Decision criterion: do combustion completeness and throttle response justify added pressure, mass, cost, and maintenance?",
          "For our 700 N reference: evaporative tubes still win.",
        ],
      },
    ],
    probes: [
      {
        id: "s4-p1",
        type: "mcq",
        kind: "concept",
        stem: "Which of these is a REQUIREMENT of evaporative-tube ('walking-stick') combustors but NOT of pressure-jet combustors?",
        options: [
          "Fine fuel filtration",
          "Fuel manifold around the casing",
          "High-pressure fuel pump",
          "Gaseous pre-heat (propane) for cold-start",
        ],
        correct: 3,
        explain: "Cold sticks cannot vaporise liquid kerosene — they need to be hot first. Propane lights easily as a gas, heats the sticks, and then kerosene takes over. Pressure-jet engines (Sophia J-450) atomise kerosene mechanically and can start on kerosene only.",
      },
      {
        id: "s4-p2",
        type: "mcq",
        kind: "evaluation",
        stem: "You're designing a new 700 N turbojet. Which atomisation architecture is the right default, and why?",
        options: [
          "Evaporative sticks — simpler, lighter, robust at this scale; pressure-jet hardware penalty too large below ~200 N",
          "Either — they perform identically",
          "Air-blast — combines the advantages of both",
          "Pressure-jet — better atomisation gives lower emissions",
        ],
        correct: 0,
        explain: "Below ~200 N, the pump + atomiser hardware mass and complexity dominate the design. Sticks are the practical baseline for hobby through 700 N class. The crossover to pressure-jet starts to make sense above ~200 N and is mature in the kN class.",
      },
    ],
  },

  // ─── 5 ────────────────────────────────────────────────────────────────
  {
    id: "s5",
    number: 5,
    title: "The walking-stick vaporisation mechanism",
    subtitle: "How sticks turn liquid kerosene into vapour.",
    outcomes: [
      { verb: "Explain", text: "Explain the four-step walking-stick process: cold liquid in → radiant heat absorbed → phase change → vapour into flame." },
      { verb: "Calculate", text: "Calculate the heat absorbed by the sticks from sensible + latent heat × fuel flow." },
      { verb: "Justify", text: "Justify the 'sweet spot' wall temperature (~600 °C) by the dual risks of cold liquid carryover vs thermal cracking / coking." },
    ],
    cards: [
      {
        id: "s5-c1",
        heading: "U- or S-shaped tubes",
        body: "Why the unusual geometry.",
        bullets: [
          "Fuel is pumped through 'U' or 'S' shaped tubes ('sticks') positioned inside the primary zone.",
          "Geometry chosen to maximise residence time inside the hot zone with minimum axial space.",
          "Hooked or S-shapes give 2–3× the path length of a straight tube of the same overall axial dimension.",
          "Tubes must be in radiative line-of-sight of the flame they feed.",
        ],
      },
      {
        id: "s5-c2",
        heading: "Step 1 — liquid injection",
        body: "Fuel enters the stick at the rear of the combustor at fuel-tank temperature (~30 °C), inlet pressure ~7 bar from the gear pump. Tube ID is typically 2–3 mm — enough flow area for ~6 g/s at full power, but small enough to maintain a hot wall. At this stage the fuel is purely liquid.",
      },
      {
        id: "s5-c3",
        heading: "Step 2 — radiant heating (the thermal feedback loop)",
        body: "The stick absorbs radiant heat from the existing primary flame.",
        bullets: [
          "Flame temperature ~1700 °C drives the tube wall to ~600 °C in steady state.",
          "Conduction through the wall transfers heat to the inner wall, then convection takes it to the fuel.",
          "The feedback loop is closed: flame heats tube → tube vaporises fuel → fuel feeds flame.",
        ],
      },
      {
        id: "s5-c4",
        heading: "Step 3 — phase change",
        body: "Liquid becomes vapour inside the tube. Fuel boils and expands, exiting the stick as vapour + fine mist rather than a cold liquid stream.",
        bullets: [
          "Sensible heat (30 → 200 °C): ~400 J/g.",
          "Latent heat (vaporisation at boiling): ~250 J/g.",
          "Total Q ≈ 650 J/g × ṁ_fuel. For KJ-66 (~3.8 g/s fuel): ≈ 2.5 kW absorbed by the tubes.",
        ],
      },
      {
        id: "s5-c5",
        heading: "Step 4 — the sweet spot",
        body: "Why stick design is hard. The sticks must absorb enough heat to maintain vaporisation, but not so much that fuel cracks or hardware overheats.",
        bullets: [
          "Too cold: liquid carryover → delayed burn → smoke, torching, hot-start risk.",
          "Too hot or too long residence: thermal cracking / coking forms carbon and blocks exit holes before the tube ever melts.",
          "Material: typically 316 stainless in simple engines; careful attention to wall temperature and duty cycle.",
          "Goal: a stable thermal window across start, idle, throttle transients, and shutdown soak.",
        ],
      },
    ],
    probes: [
      {
        id: "s5-p1",
        type: "mcq",
        kind: "application",
        stem: "Estimate total heat absorbed by the sticks for a 700 N engine running 18 g/s of Jet-A1, assuming ~650 J/g total enthalpy from cold liquid to vapour.",
        options: [
          "≈ 0.12 kW",
          "≈ 1.2 kW",
          "≈ 11.7 kW",
          "≈ 117 kW",
        ],
        correct: 2,
        explain: "Q = ṁ_f × ΔH = 0.018 kg/s × 650 kJ/kg ≈ 11.7 kW. About 5× the KJ-66 (3.8 g/s, 2.5 kW). The sticks have to absorb this from radiation alone, which sets their wall temperature and material requirements.",
      },
      {
        id: "s5-p2",
        type: "mcq",
        kind: "evaluation",
        stem: "A KJ-66 build has been run hard for 50 hours. Stick exit holes are partially blocked with black deposits and the engine struggles to throttle up. What is the MOST LIKELY cause?",
        options: [
          "Wall temperature too high — thermal cracking / coking is laying down carbon",
          "Bearing failure causing oil ingestion",
          "Pump output too low",
          "Wall temperature too low — liquid kerosene depositing inside the tube",
        ],
        correct: 0,
        explain: "Coking on the inside of the sticks is the classic 'too hot or too long residence' failure mode. Liquid kerosene crackes into carbon and tar when the wall is above the cracking threshold or the residence-time-in-tube is too long. Cure: shorter sticks, lower duty cycle, or more flow per tube to keep it cooler.",
      },
      {
        id: "s5-p3",
        type: "mcq",
        kind: "concept",
        stem: "Why are sticks shaped like U's or S's instead of straight tubes?",
        options: [
          "Reduces fuel pump pressure",
          "Required by FAA regulation",
          "It looks more aesthetic",
          "Maximises path length inside the hot primary zone within a short axial footprint",
        ],
        correct: 3,
        explain: "Sticks need radiative residence time in the hot zone — at minimum axial cost (combustors are short). A U- or S-shape gives 2–3× the path length of a straight tube of the same axial length, packing more vaporisation into the same chamber.",
      },
    ],
  },

  // ─── 6 ────────────────────────────────────────────────────────────────
  {
    id: "s6",
    number: 6,
    title: "Combustion zonation and stability",
    subtitle: "Three zones, three jobs.",
    outcomes: [
      { verb: "Distinguish", text: "Distinguish the primary, secondary, and dilution zones by purpose and target equivalence ratio." },
      { verb: "Explain", text: "Explain the toroidal recirculation vortex as the flame-stabilising mechanism." },
      { verb: "Calculate", text: "Calculate the dilution-to-hot mass-flow ratio needed to bring T_hot down to a target T4." },
    ],
    cards: [
      {
        id: "s6-c1",
        heading: "Why zone the combustor",
        body: "Without zonation, the flame blows out.",
        bullets: [
          "Compressor air enters the combustor at ~150 m/s — a free flame at this velocity is immediately blown out.",
          "We introduce a small amount of air in the primary zone, targeting local φ ≈ 1.",
          "Then we introduce the remainder of the air sequentially in the secondary and dilution zones downstream.",
          "Key stabilising mechanism: the central recirculation zone (CRZ), which holds hot products near fresh mixture.",
        ],
      },
      {
        id: "s6-c2",
        heading: "Primary zone — toroidal vortex",
        body: "Where the flame anchors.",
        bullets: [
          "Primary air holes create a toroidal vortex — a donut-shaped recirculation zone that traps hot, burning gas and feeds it back to fresh fuel vapour.",
          "Recirculated hot gas is the continuous ignition source — fresh mixture lights as it enters the vortex.",
          "Target local φ ≈ 1.0 at design point; adjust primary-hole area and stick distribution if it drifts rich or lean.",
        ],
      },
      {
        id: "s6-c3",
        heading: "Secondary zone — CO burnout",
        body: "Secondary air is added downstream of the primary vortex to complete CO and unburned-hydrocarbon burnout.",
        bullets: [
          "Provides the residence time and oxygen for clean-up after the primary flame is anchored.",
          "Brings local φ from rich/near-stoichiometric toward a leaner burnout mixture.",
        ],
      },
      {
        id: "s6-c4",
        heading: "Dilution zone — TET cooling",
        body: "The 'so what?' of the system — sets what the turbine actually sees.",
        bullets: [
          "First-pass mix temperature: T4 ≈ (ṁ_hot·T_hot + ṁ_dil·T3) / (ṁ_hot + ṁ_dil), assuming cp roughly constant.",
          "Equivalent dilution sizing: ṁ_dil/ṁ_hot ≈ (T_hot − T4) / (T4 − T3).",
          "Target TET: 870–950 °C continuous (uncooled IN713 limit on the 700 N reference). Higher peaks acceptable briefly.",
          "Without good mixing, the turbine can be damaged by hot streaks even when AVERAGE TET looks acceptable.",
        ],
      },
    ],
    probes: [
      {
        id: "s6-p1",
        type: "mcq",
        kind: "application",
        stem: "Hot-zone gas leaves the secondary at T_hot ≈ 2100 K. Compressor air is at T3 ≈ 450 K. You want T4 ≈ 1220 K (≈ 947 °C). What dilution-to-hot mass-flow ratio is needed?",
        options: [
          "≈ 0.3",
          "≈ 2.5",
          "≈ 0.5",
          "≈ 1.14",
        ],
        correct: 3,
        explain: "ṁ_dil/ṁ_hot ≈ (T_hot − T4) / (T4 − T3) = (2100 − 1220) / (1220 − 450) = 880 / 770 ≈ 1.14. You need slightly more dilution air than hot-zone air to bring the gas to a turbine-survivable temperature.",
      },
      {
        id: "s6-p2",
        type: "mcq",
        kind: "concept",
        stem: "What is the PRIMARY function of the central recirculation zone (CRZ)?",
        options: [
          "Cool the liner walls",
          "Recirculate hot combustion products back toward fresh fuel-air mixture, providing a continuous ignition source",
          "Atomise liquid fuel droplets",
          "Mix dilution air with the hot core",
        ],
        correct: 1,
        explain: "The CRZ is what keeps the flame anchored in the face of 150 m/s incoming air. By trapping hot products in a low-velocity recirculating donut, it gives fresh mixture entering the primary zone immediate ignition energy. Without it, the flame blows out. Cooling, mixing, atomisation are separate concerns handled elsewhere.",
      },
      {
        id: "s6-p3",
        type: "mcq",
        kind: "evaluation",
        stem: "An engine is measured with T_avg at the NGV ≈ 950 °C (within target), but turbine blades show localised burning on the same circumferential clock position every run. What is the MOST LIKELY cause?",
        options: [
          "Pattern factor is poor — average is fine but local hot streak from a specific stick / dilution-hole region exceeds turbine survivability",
          "Compressor surge",
          "Insufficient fuel flow",
          "Combustor overall TET is too high",
        ],
        correct: 0,
        explain: "Average temperature can look fine while a single streak from a stick that's running hot, or a clogged dilution hole, concentrates damage on one clock position. The fix is a pattern-factor (traverse) investigation: identify the streak's source, rebalance flow, possibly redistribute dilution holes.",
      },
    ],
  },

  // ─── 7 ────────────────────────────────────────────────────────────────
  {
    id: "s7",
    number: 7,
    title: "Ignition and fuel architecture",
    subtitle: "How we light the engine.",
    outcomes: [
      { verb: "Select", text: "Select glow-plug vs spark-plug ignition for a given engine class and justify the choice." },
      { verb: "Outline", text: "Outline the propane → kerosene start sequence and identify the safety hazards at each step." },
      { verb: "Apply", text: "Apply the manifold-sizing rule (4–10× sum of feed-circuit cross-sections) to a vaporiser ring design." },
    ],
    cards: [
      {
        id: "s7-c1",
        heading: "Fuel manifold",
        body: "How fuel reaches the sticks.",
        bullets: [
          "Annular fuel manifold runs around the combustor casing at the same axial station.",
          "Tap-offs branch from the manifold to each vaporiser tube. Typical count: 6–10 vaporisers around the circumference.",
          "Equal tube length = equal pressure drop = equal flow per tube. Critical for symmetric heat release and low pattern factor.",
          "Manifold sizing rule of thumb: manifold cross-section ≈ 4–10× the SUM of the cross-sections of all the feed circuits.",
        ],
      },
      {
        id: "s7-c2",
        heading: "Glow plug vs spark plug",
        body: "Two ignition philosophies.",
        bullets: [
          "Glow plug — incandescent resistance wire heated to ~1000 °C. Continuous hot-surface ignition source.",
          "Spark plug — high-voltage discharge across an electrode gap. Useful where atomised fuel or higher pressure makes a defined spark kernel valuable.",
          "Glow plugs are common for hobby-class vaporiser engines: robust, no high-voltage exciter, simpler wiring.",
          "Spark systems are justified on higher-PR or pressure-jet engines, IF the electronics and placement are reliable.",
        ],
      },
      {
        id: "s7-c3",
        heading: "Propane pre-heat — the cold-start phase",
        body: "Most vaporiser-stick systems use propane (C₃H₈) start to heat the sticks before the main kerosene ramp begins.",
        bullets: [
          "Propane enters as a gas and lights readily — useful for controlled preheat.",
          "Sequence: starter airflow → spark/glow → propane flame → stick heat-up → careful Jet-A1 ramp → propane off.",
          "Treat propane as safety-critical: purge before re-start, never allow unburned gas to pool. Re-light into a pool of propane vapour is one of the most damaging failure modes.",
        ],
      },
    ],
    probes: [
      {
        id: "s7-p1",
        type: "mcq",
        kind: "application",
        stem: "A glow plug is placed too far from the vapour stream during a build. What is the MOST LIKELY symptom?",
        options: [
          "Pattern factor degrades",
          "Compressor surge on light-off",
          "Plug overheats and fails after a few starts",
          "Hard starts — engine takes many attempts to light; vapour-air mixture is too lean at the plug for ignition",
        ],
        correct: 3,
        explain: "Too far → the local mixture at the plug is too lean to ignite. Too close (the opposite trap) → the plug bakes and dies. Goal: place the plug on the fringe of the vapour cone where local φ is in the flammable window.",
      },
      {
        id: "s7-p2",
        type: "mcq",
        kind: "evaluation",
        stem: "After a failed start, you smell propane and there is liquid kerosene pooled in the lower casing. What is the SAFE next action?",
        options: [
          "Switch to spark-plug ignition for the next attempt",
          "Try to light immediately — the warm engine will help",
          "Purge thoroughly (drain pool, force-air the chamber, wait), then re-attempt the start sequence from scratch",
          "Increase propane flow and try again",
        ],
        correct: 2,
        explain: "Lighting into a pool of fuel vapour is a textbook hot-start / explosion event. The drained pool is unburnt kerosene that can flash on re-light. The required action is purge → drain → fresh sequence. Manifold leaks should also be pressure-tested before any re-start.",
      },
    ],
  },

  // ─── 8 ────────────────────────────────────────────────────────────────
  {
    id: "s8",
    number: 8,
    title: "Governing equations",
    subtitle: "The math behind combustor design.",
    outcomes: [
      { verb: "Apply", text: "Apply ṁ_fuel = φ × FAR_st × ṁ_air,pz to size primary-zone fuel flow." },
      { verb: "Calculate", text: "Calculate pattern factor S = (T_max − T_avg) / (T_avg − T3) and judge whether it meets the < 0.15 target." },
      { verb: "Justify", text: "Justify the 3–5% ΔP/P3 design band by the dual penalty of insufficient mixing and lost turbine work." },
    ],
    cards: [
      {
        id: "s8-c1",
        heading: "Equivalence ratio φ",
        body: "The dimensionless mixture-richness number, used for design with PRIMARY-zone FAR, not overall engine FAR.",
        bullets: [
          "φ = FAR_actual / FAR_stoich. For Jet-A1: FAR_st ≈ 0.0667.",
          "Primary-zone FAR: FAR_pz = ṁ_fuel / ṁ_air,pz.",
          "Fuel sizing: ṁ_fuel = φ_target × FAR_st × ṁ_air,pz.",
          "φ > 1: rich — excess fuel cools the flame; CO, soot, coking risk rise.",
          "φ < 1: lean — cooler flame; can blow out if too lean.",
        ],
      },
      {
        id: "s8-c2",
        heading: "Pressure drop ΔP_total",
        body: "How much pressure we lose.",
        bullets: [
          "ΔP_total = cold-flow geometric loss + running combustion / mixing loss.",
          "Pressure-loss fraction: δ = ΔP_total / P3; first-pass target δ ≈ 0.03–0.05 (3–5%).",
          "Below 3%: poor mixing — primary air doesn't penetrate; dilution streaks form.",
          "Above 5%: cycle efficiency loss — turbine work no longer available.",
        ],
      },
      {
        id: "s8-c3",
        heading: "Pattern factor S",
        body: "The non-uniformity number at the NGV inlet plane.",
        bullets: [
          "S = (T_max − T_avg) / (T_avg − T3).",
          "T_max: peak gas temperature at NGV inlet (K).",
          "T_avg: average TET at NGV inlet plane (K).",
          "T3: combustor inlet (= diffuser exit) temperature (K).",
          "Design target: S < 0.15 preferred. S > 0.25 is a clear redesign flag for uncooled small turbines.",
          "Hot streaks aligned with rotor blades concentrate damage — each 50 °C above mean halves the local creep life.",
        ],
      },
      {
        id: "s8-c4",
        heading: "Pressure drop is a tax",
        body: "While ΔP is mandatory for mixing, every millibar lost is potential turbine work no longer available.",
        bullets: [
          "P4 = P3 − ΔP_combustor.",
          "For 4% ΔP across the combustor: turbine sees ~96% of compressor delivery pressure.",
          "Over-designing for mixing stability kills overall efficiency.",
        ],
      },
    ],
    probes: [
      {
        id: "s8-p1",
        type: "mcq",
        kind: "application",
        stem: "An engine has T_max = 1200 K, T_avg = 950 K, T3 = 500 K at the NGV inlet. What is the pattern factor, and does it meet the design target?",
        options: [
          "S = 0.56 — fails target (S < 0.15 desired)",
          "S = 1.20 — meets target",
          "S = 0.05 — fails target",
          "S = 0.20 — meets target",
        ],
        correct: 0,
        explain: "S = (1200 − 950) / (950 − 500) = 250 / 450 ≈ 0.56. Well above the 0.15 design target — this combustor has hot streaks roughly 250 K above mean. For uncooled small turbines that's a clear redesign flag.",
      },
      {
        id: "s8-p2",
        type: "mcq",
        kind: "application",
        stem: "Primary-zone air flow is 0.3 kg/s. Target primary-zone φ = 1.0. Jet-A1 FAR_st = 0.0667. What is the required primary-zone fuel flow?",
        options: [
          "≈ 20 g/s",
          "≈ 50 g/s",
          "≈ 200 g/s",
          "≈ 5 g/s",
        ],
        correct: 0,
        explain: "ṁ_fuel = φ × FAR_st × ṁ_air,pz = 1.0 × 0.0667 × 0.3 = 0.020 kg/s = 20 g/s. Note this is the PRIMARY-zone fuel; the OVERALL fuel flow is the same number (you only burn what the primary can stabilise), and overall engine FAR is much lower because most air bypasses the primary as secondary + dilution.",
      },
      {
        id: "s8-p3",
        type: "mcq",
        kind: "analysis",
        stem: "A new design targets δ = 0.025 (2.5% ΔP) to save turbine pressure. What design issue should the team expect?",
        options: [
          "Pump pressure will need to rise",
          "Compressor surge margin will fall",
          "Pattern factor will improve dramatically",
          "Mixing will suffer — primary jets won't penetrate adequately, leading to hot streaks and possible CO carryover",
        ],
        correct: 3,
        explain: "Below ~3% the holes don't have enough ΔP to drive jets into the hot core at the right penetration depth. Dilution becomes a 'sheet' rather than a 'jet,' streaks survive, and you trade saved pressure for thermal damage at the NGV. The 3–5% band exists because both extremes are bad.",
      },
    ],
  },

  // ─── 9 ────────────────────────────────────────────────────────────────
  {
    id: "s9",
    number: 9,
    title: "Design and analysis workflow",
    subtitle: "Six-step combustor design loop.",
    outcomes: [
      { verb: "Outline", text: "Outline the design sequence: inlet conditions → fuel flow → air split → reference area → liner geometry → hole sizing." },
      { verb: "Justify", text: "Justify why combustor design rarely closes on the first pass and plan for 3–5 iterations." },
    ],
    cards: [
      {
        id: "s9-c1",
        heading: "Air splits — the budget",
        body: "Total compressor delivery ṁ_air must be allocated without double-counting.",
        bullets: [
          "f_dome: fraction sent to the primary / dome (typically 0.30–0.40).",
          "f_secondary: fraction to secondary zone (typically 0.20–0.30).",
          "f_dilution: fraction to dilution (typically 0.30–0.40).",
          "f_cooling: fraction reserved for liner cooling (typically 0.10–0.20).",
          "Constraint: Σ fᵢ = 1.0 exactly.",
        ],
      },
      {
        id: "s9-c2",
        heading: "Dilution jets — design intent",
        body: "Big dilution holes set jet penetration into the hot core; small holes trim the residual non-uniformity.",
        bullets: [
          "Big holes (n_big) deliver the bulk of dilution mass; sized for target penetration Ymax ≈ 0.3 H_dome.",
          "Small holes (n_small ≈ 2× n_big) sit downstream and finish the traverse trim.",
          "Effective jet diameter dj separates from physical hole diameter dh via the discharge coefficient: dh = dj / √Cd.",
        ],
      },
      {
        id: "s9-c3",
        heading: "Why iteration is inevitable",
        body: "Combustor design rarely closes on the first pass.",
        bullets: [
          "Iter 1: assume stick count and air split. Calculate hole areas. Find pattern factor too high.",
          "Iter 2: increase dilution hole area. Pattern factor drops, but ΔP also drops below 3% target.",
          "Iter 3: tighten primary holes to compensate. Recheck φ in primary zone — now too rich.",
          "Each tweak ripples through. Plan for 3–5 iterations before convergence.",
        ],
      },
    ],
    probes: [
      {
        id: "s9-p1",
        type: "mcq",
        kind: "analysis",
        stem: "A combustor design has the air budget: 35% dome, 20% secondary, 40% dilution, 10% cooling. Does this allocation satisfy the conservation constraint?",
        options: [
          "Yes — sums to exactly 1.0",
          "No — sums to 1.05, double-counting 5% of the air",
          "No — sums to 0.95, missing 5% of the air",
          "Yes — small over-budgets are acceptable",
        ],
        correct: 1,
        explain: "0.35 + 0.20 + 0.40 + 0.10 = 1.05. That's 5% double-counting — air can only be allocated once. Either trim dilution to 35% or cooling to 5% to close the budget. Spreadsheets that don't enforce Σ = 1.0 hide this kind of error.",
      },
      {
        id: "s9-p2",
        type: "mcq",
        kind: "evaluation",
        stem: "After iteration 2, your pattern factor is now acceptable but ΔP has dropped to 2.5%. What is the correct next move?",
        options: [
          "Ship it — pattern factor matters more than ΔP",
          "Tighten the primary or cooling holes to bring ΔP back to 3.5–4%, then recheck primary-zone φ for drift",
          "Increase fuel flow to make up for the lost pressure",
          "Add a downstream throttling orifice",
        ],
        correct: 1,
        explain: "ΔP below 3% means the dilution jets won't penetrate properly — pattern factor will degrade over a few hours of running. Tighten upstream holes to rebuild pressure, then check that primary-zone φ hasn't drifted rich. This is the 'each tweak ripples through' iteration.",
      },
    ],
  },

  // ─── 10 ───────────────────────────────────────────────────────────────
  {
    id: "s10",
    number: 10,
    title: "Worked example — 700 N reference combustor",
    subtitle: "Concrete numbers from compressor exit to hole sizing.",
    outcomes: [
      { verb: "Calculate", text: "Calculate fuel flow from T4 target via energy balance with cp_gas and LHV." },
      { verb: "Calculate", text: "Calculate reference area Aref from dome air, density, and reference velocity Vref." },
      { verb: "Apply", text: "Apply the jet penetration equation to size big dilution holes for Ymax ≈ 0.3 H_dome." },
    ],
    cards: [
      {
        id: "s10-c1",
        heading: "Inputs from GT-05 (700 N reference)",
        body: "We carry forward the compressor exit conditions from GT-05's worked example.",
        bullets: [
          "ṁ_air = 0.850 kg/s (total).",
          "P02 = 354.6 kPa total; T02 = 447.1 K total.",
          "C2 = 382.8 m/s, k = 1.4, R = 287 J/kg·K, pressure-rise coefficient Cpr = 0.80.",
          "Target T4 (TIT) = 950 °C = 1223 K. Jet-A1 FAR_st = 0.0667.",
          "Assumed: cp_gas = 1150 J/kg·K, LHV = 43 MJ/kg, ηb = 0.98. f_dome = 0.35. ΔP_liner / P3 = 4%. Vref_cold = 5 m/s, Vpass = 40 m/s.",
        ],
      },
      {
        id: "s10-c2",
        heading: "Step 1 — Recover combustor inlet pressure P3",
        body: "Convert rotor-exit static pressure plus recoverable dynamic pressure into P3.",
        bullets: [
          "P2 = P02 / (T02/T2)^(k/(k−1)) = 190.2 kPa.",
          "ρ2 = P2 / (R T2) = 1.771 kg/m³.",
          "q2 = ½ ρ2 C2² = 129.8 kPa.",
          "ΔP_rec = Cpr · q2 = 103.8 kPa.",
          "P3 = P2 + ΔP_rec ≈ 294 kPa. P3/P02 ≈ 0.83 (so ~17% total-pressure loss in the diffuser stage).",
        ],
      },
      {
        id: "s10-c3",
        heading: "Step 2 — Fuel flow from the TIT target",
        body: "Energy balance, then check primary-zone φ.",
        bullets: [
          "ΔT = T4 − T03 = 1223 − 447 = 776 K.",
          "FAR = cp_g·ΔT / (ηb·LHV − cp_g·ΔT) = 0.0216 kg/kg.",
          "ṁ_fuel = FAR × ṁ_air = 0.0216 × 0.850 ≈ 0.0184 kg/s = 18.4 g/s.",
          "Primary φ = (ṁ_fuel / ṁ_dome) / FAR_st ≈ 0.93 — slightly lean of stoichiometric, stable.",
          "Lesson: close the thermal target FIRST, then check whether the dome split gives a stable primary zone.",
        ],
      },
      {
        id: "s10-c4",
        heading: "Step 3 — Dome split, reference area, dome height",
        body: "Combustor size starts with the dome air fraction and cold reference velocity.",
        bullets: [
          "ṁ_dome = 0.35 × 0.850 = 0.298 kg/s; ṁ_pass = 0.553 kg/s.",
          "P_dome = P3 × (1 − 0.04) = 282 kPa. T_air ≈ 419 K. ρ_dome ≈ 2.35 kg/m³.",
          "Aref = ṁ_dome / (ρ_dome · Vref_cold) = 0.298 / (2.35 × 5) = 0.0253 m².",
          "H_dome = Aref / (π D2) where D2 = 0.104 m → H_dome ≈ 78 mm.",
        ],
      },
      {
        id: "s10-c5",
        heading: "Step 4 — Liner geometry and residence time",
        body: "Once Aref is set, check liner length and residence-time budget.",
        bullets: [
          "L_liner via practical L/H = 3 rule: L ≈ 3 × H_dome ≈ 233 mm.",
          "ρ_gas at T4 ≈ 0.80 kg/m³; Vhot = (ṁ_air + ṁ_fuel) / (ρ_gas Aref) ≈ 42.6 m/s.",
          "τ = L_liner / Vhot ≈ 5.5 ms — sits in the few-millisecond band typical of small-turbojet combustors.",
        ],
      },
      {
        id: "s10-c6",
        heading: "Step 5 — Dilution budget and jet aerodynamics",
        body: "Use the passage inventory to size dilution flow, then compute jet velocity, Cd, angle, and momentum ratio.",
        bullets: [
          "Split ṁ_pass between liner cooling and dilution: with R_D/LC = 1.5 → ṁ_liner ≈ 0.22 kg/s, ṁ_dil ≈ 0.33 kg/s.",
          "ΔP across liner: dPL = P3 − P_dome ≈ 11.8 kPa. ρ_pass = P3/(R T_air) ≈ 2.45 kg/m³.",
          "Jet velocity Uj = √(2·dPL / ρ_pass) ≈ 98 m/s.",
          "Momentum ratio J = ρ_pass Uj² / (ρ_gas Vhot²) ≈ 16. Cd ≈ 0.54.",
          "Target big-hole penetration Ymax = 0.3 H_dome ≈ 23 mm.",
        ],
      },
      {
        id: "s10-c7",
        heading: "Step 6 — Hole sizing",
        body: "Big holes set the penetration; small holes trim the traverse.",
        bullets: [
          "Effective big-jet diameter dj_big ≈ 13.3 mm; physical drilled hole dh_big = dj_big/√Cd ≈ 18 mm. n_big = 7.",
          "Small holes (downstream): n_small = 2 × n_big = 14. dj_small ≈ 7.1 mm, dh_small ≈ 9.6 mm.",
          "Distinguish effective jet diameter dj (sets penetration) from drilled diameter dh (manufacturing) via Cd.",
        ],
      },
      {
        id: "s10-c8",
        heading: "Step 7 — Sanity checks before freezing CAD",
        body: "Spreadsheet sizing is preliminary. Must verify by rig test before flight.",
        bullets: [
          "Primary φ ≈ 0.93 — near rich primary target ✓",
          "P3/P02 ≈ 0.83 — pressure budget visible.",
          "ΔP_liner ≈ 4% of P3 — sets jet / cooling ΔP.",
          "Residence time ≈ 5.5 ms — small-engine scale.",
          "Pattern factor — input assumed 0.14, verify by traverse rig.",
          "Holes: 7 big + 14 small — reconcile with fuel-nozzle symmetry (6 sticks → maybe 6+12 or 12+24).",
          "Cold-flow test: pressure drop, jet penetration, liner cooling. Hot rig: light-off, stability, exit traverse, coking, material margin.",
        ],
      },
    ],
    probes: [
      {
        id: "s10-p1",
        type: "mcq",
        kind: "application",
        stem: "Using ṁ_air = 0.85 kg/s, T03 = 447 K, target T4 = 1223 K, cp_gas = 1150 J/kg·K, LHV = 43 MJ/kg, ηb = 0.98, compute the required fuel flow.",
        options: [
          "≈ 95 g/s",
          "≈ 4.5 g/s",
          "≈ 18.4 g/s",
          "≈ 50 g/s",
        ],
        correct: 2,
        explain: "ΔT = 776 K. FAR = cp·ΔT / (η·LHV − cp·ΔT) = (1150·776) / (0.98·43e6 − 1150·776) ≈ 0.0216 kg/kg. ṁ_fuel = 0.0216 × 0.85 ≈ 0.0184 kg/s = 18.4 g/s. Matches the worked example.",
      },
      {
        id: "s10-p2",
        type: "mcq",
        kind: "application",
        stem: "If Cd = 0.54 and your target effective jet diameter is dj = 13 mm, what physical drilled hole diameter does that require?",
        options: [
          "≈ 7 mm",
          "≈ 13 mm (Cd doesn't matter)",
          "≈ 18 mm",
          "≈ 24 mm",
        ],
        correct: 2,
        explain: "dh = dj / √Cd = 13 / √0.54 ≈ 13 / 0.735 ≈ 18 mm. The drilled hole has to be larger than the effective jet because the discharge coefficient reduces the effective area. Designing from dj and ignoring Cd undersizes the actual hole and starves dilution.",
      },
    ],
  },

  // ─── 11 ───────────────────────────────────────────────────────────────
  {
    id: "s11",
    number: 11,
    title: "Practical engineering checks",
    subtitle: "Symptoms and corrective actions.",
    outcomes: [
      { verb: "Diagnose", text: "Diagnose common combustion symptoms (white smoke, hot spots, high ΔP, torching) by symptom-to-cause mapping." },
      { verb: "Apply", text: "Apply the hot-start checklist (pool, manifold, vaporisation lag) before re-attempting a failed start." },
    ],
    cards: [
      {
        id: "s11-c1",
        heading: "Symptom diagnosis table",
        body: "Quick diagnostic lookup for common failure modes.",
        bullets: [
          "White smoke in exhaust → vaporisation failure or unburnt liquid / vapour. DANGER: explosion hazard. Increase pre-heat or check stick alignment.",
          "Hot spots / rising EGT → poor dilution, clogged stick, or coking. Inspect stick holes, fuel filter, and dilution-hole clocking.",
          "High pressure drop → liner holes too small or blockage. Enlarge / check dilution holes only after confirming cold-flow data.",
          "Torching / tailpipe fire → fuel pooling or late ignition. Verify ignition timing, purge sequence, and manifold leaks.",
        ],
      },
      {
        id: "s11-c2",
        heading: "Hot-start diagnostic checklist",
        body: "Three things to verify after a hot start before any re-attempt.",
        bullets: [
          "Fuel pooling — verify the case is drained. Pooled kerosene from a failed start causes massive over-temperature on the next attempt.",
          "Manifold integrity — internal leaks let fuel burn outside the intended primary zone. Pressure-test before re-start.",
          "Vaporisation lag — confirm propane pre-heat has raised stick temperature before kerosene transition; too much soak also promotes coking.",
        ],
      },
      {
        id: "s11-c3",
        heading: "Material sanity check",
        body: "When to upgrade beyond 316 stainless.",
        bullets: [
          "316 stainless can be acceptable for low-duty, film-cooled liners — but do not equate TET with liner wall temperature.",
          "High-performance hot sections need nickel alloys (Inconel / Nimonic-class) for creep and oxidation margin.",
          "Liner material may remain stainless ONLY if cooling keeps wall temperature below its practical limit.",
          "Upgrade decision needs: wall temperature + duty cycle + TET + pattern factor + NGV / turbine material — evaluated together.",
        ],
      },
    ],
    probes: [
      {
        id: "s11-p1",
        type: "mcq",
        kind: "error",
        stem: "A student reports 'high EGT but low thrust' on a 700 N test stand. The most likely cause is:",
        options: [
          "Fuel flow too low",
          "Poor dilution mixing — hot streaks raise EGT readings but don't translate to uniform turbine work",
          "Compressor surge",
          "Atmospheric humidity",
        ],
        correct: 1,
        explain: "EGT thermocouples can sit in a hot streak even when the average gas temperature is fine. Hot streaks at the NGV concentrate damage on specific blades and don't fully convert to turbine work. Fix: investigate pattern factor (traverse rig), check dilution-hole clocking and stick distribution.",
      },
      {
        id: "s11-p2",
        type: "mcq",
        kind: "evaluation",
        stem: "After a hot start, white smoke continues from the tailpipe for ~30 seconds. What is the IMMEDIATE risk and the right response?",
        options: [
          "No risk — let it clear naturally",
          "Explosion / re-ignition hazard from unburnt fuel vapour accumulating. Cut fuel, purge the chamber, do NOT attempt re-start until purged",
          "Bearing damage — schedule rebuild",
          "Turbine rub — schedule disassembly",
        ],
        correct: 1,
        explain: "White smoke = unburnt fuel vapour / droplet carryover. Pooled vapour can flash if a hot surface or attempted re-ignition catches it. The drilled response is: fuel off, generous purge with airflow, find root cause (stick coking, manifold leak, pre-heat too short) before re-starting.",
      },
    ],
  },

  // ─── 12 ───────────────────────────────────────────────────────────────
  {
    id: "s12",
    number: 12,
    title: "Common mistakes and misconceptions",
    subtitle: "Three traps that kill engines.",
    outcomes: [
      { verb: "Discriminate", text: "Discriminate myth from reality on rich-flame stability, igniter placement, and cold ΔP design." },
    ],
    cards: [
      {
        id: "s12-c1",
        heading: "Trap 1 — 'More fuel = more power'",
        body: "The rich-flameout fallacy.",
        bullets: [
          "Increasing fuel into the primary zone beyond the stable φ window leads to rich pockets, smoke, and possible flameout.",
          "Rich mixtures can cool the flame — excess fuel absorbs heat without fully releasing it.",
          "White smoke is unburnt fuel vapour / droplet carryover — explosion hazard if it accumulates in the test cell or exhaust.",
          "Correct response: more fuel needs more air AND more vaporisation capacity — not just more pump command.",
        ],
      },
      {
        id: "s12-c2",
        heading: "Trap 2 — Igniter position",
        body: "Why placement matters.",
        bullets: [
          "Placing the glow plug too far from the vapour stream causes 'hard starts' — engine takes many attempts to light.",
          "Plug must be on the fringe of the vapour cone where local φ is in the flammable window.",
          "Too close: plug overheats and fails after a few starts.",
          "Too far: vapour-air mixture is too lean at the plug for ignition.",
        ],
      },
      {
        id: "s12-c3",
        heading: "Trap 3 — Ignoring cold ΔP",
        body: "Why low-ΔP designs hang.",
        bullets: [
          "Excess cold ΔP steals pressure from the turbine and can contribute to hung starts.",
          "Too LOW cold ΔP is ALSO dangerous: air won't be driven through liner holes at the right penetration.",
          "Sweet spot: cold ΔP/P3 ≈ 3–4% first-pass target, then confirm hot running ΔP on the rig.",
          "Verify with cold-flow rig BEFORE the live fire test.",
        ],
      },
      {
        id: "s12-c4",
        heading: "Connection forward — GT-07",
        body: "What we hand to the turbine.",
        bullets: [
          "We've turned liquid fuel into a high-energy gas stream — but the gas is useless without controlled expansion.",
          "Pressure and temperature profiles shaped in the dilution zone become the direct inputs to GT-07 (Axial Turbine).",
          "GT-07 extracts the work that drives the compressor and generates thrust.",
        ],
      },
    ],
    probes: [
      {
        id: "s12-p1",
        type: "mcq",
        kind: "error",
        stem: "A student says: 'I'm getting hot streaks at the NGV. I'll just upgrade the liner to Inconel and that will fix it.' What is the BEST correction?",
        options: [
          "Upgrading the liner doesn't fix the streaks — the turbine still sees them. The fix is improving pattern factor (dilution-hole sizing/clocking, stick distribution)",
          "Streaks are normal — ignore them",
          "Cool the liner with more film cooling",
          "The student is right — material upgrade solves the streak problem",
        ],
        correct: 0,
        explain: "Inconel buys you margin for the LINER. The hot streaks still hit the NGV vanes and rotor blades downstream — those are what fail. The actual fix is improving mixing: dilution hole sizing, clocking, stick balance, possibly more primary recirculation. Material upgrade is a band-aid that doesn't address the root cause.",
      },
      {
        id: "s12-p2",
        type: "mcq",
        kind: "error",
        stem: "An engineer responds to a 'hung start' (engine lights but won't accelerate to idle) by INCREASING fuel flow. Why is this often the WRONG move?",
        options: [
          "Fuel flow has no effect on starting",
          "Hung starts are unrelated to fuel",
          "More fuel always solves hung starts",
          "More fuel can push the primary zone into the rich quench window or worsen pooling — adding fuel doesn't add the air or vaporisation capacity needed. Investigate cold ΔP, stick heat-up, and air budget first.",
        ],
        correct: 3,
        explain: "Hung starts usually mean: insufficient ΔP for mixing (cold-ΔP problem), incomplete stick pre-heat, or compressor still below sustain speed. Throwing fuel at it can pool unburnt liquid, push the primary rich, and turn a hung start into an explosive re-light hazard. Diagnose, don't dose.",
      },
    ],
  },
];

// Summative quiz — mixes the PDF Q1-Q10 with novel transfer items.
export const SUMMATIVE = [
  {
    id: "q1",
    kind: "application",
    stem: "What is the order-of-magnitude residence time τ for air in a KJ-66-class combustor?",
    options: ["≈ 0.3 ms", "≈ A few milliseconds (2–5 ms)", "≈ 30 ms", "≈ 100 ms"],
    correct: 1,
    explain: "τ ≈ V·P / (ṁ·R·T) ≈ V_liner / V̇_hot — a few milliseconds at small-engine scale. Aero and industrial gas-turbine combustors are also millisecond-scale; the '100 ms' value sometimes cited as 'industrial' is not a compact-engine target.",
  },
  {
    id: "q2",
    kind: "concept",
    stem: "Why does a toroidal recirculation vortex improve flame stability?",
    options: [
      "It cools the liner walls",
      "It recirculates hot combustion products back to incoming fresh fuel-air mixture, providing a continuous ignition source",
      "It atomises liquid fuel droplets",
      "It mixes dilution air with the hot core",
    ],
    correct: 1,
    explain: "The CRZ anchors the flame against ~150 m/s incoming air. By trapping hot products in a low-velocity recirculation, it keeps a continuous heat source available to fresh mixture entering the primary zone. Without it, the flame blows out.",
  },
  {
    id: "q3",
    kind: "concept",
    stem: "Why is propane pre-heat used for evaporative-stick combustors?",
    options: [
      "Cold sticks cannot vaporise liquid kerosene — propane heats the sticks first as a gas, then the kerosene transition follows",
      "Propane has lower NOx emissions",
      "Propane reduces compressor surge",
      "Propane is cheaper than kerosene",
    ],
    correct: 0,
    explain: "Liquid kerosene won't vaporise inside cold (room-temperature) sticks. Propane is gaseous, lights readily, and brings the tubes up to the ~600 °C wall temperature needed before the kerosene ramp can begin without pooling.",
  },
  {
    id: "q4",
    kind: "analysis",
    stem: "If the primary zone runs at φ ≈ 1.0, why is OVERALL engine FAR much lower (~0.02)?",
    options: [
      "Combustion is incomplete",
      "Most compressor air bypasses the primary as secondary + dilution + cooling — so the engine-wide FAR is much leaner than the local primary-zone FAR",
      "Fuel evaporates and re-condenses",
      "Pumps cannot deliver enough fuel",
    ],
    correct: 1,
    explain: "Only ~30–40% of compressor air enters the primary zone (the 'dome' fraction). The rest is secondary, dilution, and cooling. So engine-wide FAR ≈ ṁ_fuel / ṁ_air,total ≈ 0.02 while local primary FAR ≈ 0.067 (the stoichiometric value for Jet-A1).",
  },
  {
    id: "q5",
    kind: "concept",
    stem: "White smoke at the exhaust during start — what is the physical state of the fuel?",
    options: [
      "Carbon dioxide and water vapour (normal exhaust)",
      "Unburnt fuel vapour and/or liquid droplets that did not fully react in the primary zone",
      "Soot particulates",
      "Cooling air condensation",
    ],
    correct: 1,
    explain: "White smoke = unburnt fuel carryover. Cold sticks, blocked sticks, or rich-quench in the primary zone all produce this. CO/CO₂ would not be visible; soot would be black, not white; cooling air condensation is exhaust-temperature-dependent and rare at start.",
  },
  {
    id: "q6",
    kind: "application",
    stem: "If FAR_actual = 0.05, what is φ for a Jet-A1 / air combustor?",
    options: ["φ ≈ 0.50", "φ ≈ 0.067", "φ ≈ 1.33", "φ ≈ 0.75"],
    correct: 3,
    explain: "φ = FAR_actual / FAR_st = 0.05 / 0.0667 ≈ 0.75. Mixture is LEAN (φ < 1). Typical of an overall-engine FAR diluted by the secondary + dilution air budget.",
  },
  {
    id: "q7",
    kind: "application",
    stem: "Air flow ṁ_air = 0.20 kg/s. Overall FAR = 0.02. What is the engine's fuel flow in g/min?",
    options: ["≈ 4 g/min", "≈ 24 g/min", "≈ 240 g/min", "≈ 2400 g/min"],
    correct: 2,
    explain: "ṁ_fuel = FAR × ṁ_air = 0.02 × 0.20 = 0.004 kg/s = 4 g/s × 60 = 240 g/min. At ρ_fuel ≈ 0.8 kg/L that's about 300 mL/min.",
  },
  {
    id: "q8",
    kind: "evaluation",
    stem: "Pattern factor measurement: T_max = 1200 K, T_avg = 950 K, T3 = 500 K. What is S, and does it meet the design target?",
    options: [
      "S = 1.20 — close enough",
      "S = 0.05 — meets target",
      "S = 0.20 — meets target (S < 0.15 desired) — wait, no",
      "S = 0.56 — FAILS the < 0.15 target; redesign needed",
    ],
    correct: 3,
    explain: "S = (T_max − T_avg) / (T_avg − T3) = (1200 − 950) / (950 − 500) = 250 / 450 ≈ 0.56. Well above the 0.15 design target. Hot streaks 250 K above mean are catastrophic for uncooled turbines — redesign dilution-hole sizing and clocking.",
  },
  {
    id: "q9",
    kind: "evaluation",
    stem: "An engine has high EGT but low thrust. Most likely the issue is in which zone, and why?",
    options: [
      "Diffuser — pressure recovery loss",
      "Primary zone — too lean",
      "Dilution zone — poor mixing producing hot streaks that lift EGT readings without translating to uniform turbine work",
      "Secondary zone — over-burning",
    ],
    correct: 2,
    explain: "EGT thermocouples can sit in a localised hot streak; turbine work is set by the AVERAGE T and the pressure ratio. Bad pattern factor = high EGT readings + reduced turbine extraction = low thrust. Fix: dilution-hole sizing, clocking, stick balance.",
  },
  {
    id: "q10",
    kind: "evaluation",
    stem: "Upgrading the LINER alone to Inconel does NOT allow you to reduce dilution air. Why?",
    options: [
      "Inconel costs too much",
      "Liner material protects the liner, but the NGV and rotor TET and pattern factor still limit what gas the turbine can survive — dilution air is set by turbine survival, not liner survival",
      "Inconel doesn't conduct heat",
      "Liner upgrade doesn't change anything",
    ],
    correct: 1,
    explain: "The dilution budget is sized to bring gas temperature down to what the TURBINE can tolerate (uncooled blade creep limit). Liner upgrade buys margin for the liner only. The turbine inlet temperature is still the binding constraint, so dilution air doesn't change.",
  },
  {
    id: "q11",
    kind: "application",
    stem: "A combustor has ΔP_liner / P3 = 5.5%. What is the LIKELY effect on overall engine performance?",
    options: [
      "No effect — ΔP doesn't matter at this scale",
      "Improved pattern factor and clean mixing — all benefits",
      "Slightly worse cycle efficiency: turbine sees ~94.5% of compressor delivery pressure instead of ~96% — that's lost turbine work",
      "Compressor surge",
    ],
    correct: 2,
    explain: "P4 = P3 − ΔP. At 5.5% the turbine sees 94.5% of P3 instead of the ~96% you'd see at 4%. That's 1.5 percentage points of pressure ratio gone, which translates to a few percent of turbine work and ultimately thrust. Mixing benefit must justify the cycle hit.",
  },
  {
    id: "q12",
    kind: "analysis",
    stem: "You measure cold-flow ΔP/P3 at 2% on a new combustor build. Hot-flow ΔP/P3 measures 3.5%. Why are they different and what do you do?",
    options: [
      "Cold and hot ΔP should match exactly — the sensor is broken",
      "Heat release expands the gas and adds momentum-change loss → running ΔP is always higher than cold; 3.5% is fine but 2% cold is on the low edge — verify primary jet penetration is adequate on rig",
      "Run the engine at full power — they'll converge",
      "Add an orifice downstream",
    ],
    correct: 1,
    explain: "Running ΔP includes the momentum / density-change loss from heat release on top of cold geometric loss. Hot is always higher. Cold ΔP at 2% is borderline — primary jets may not penetrate well in cold tests. Inspect on the rig before flight.",
  },
];

// Concept-to-section index for spaced-repetition reporting.
export const CONCEPT_INDEX = SECTIONS.flatMap(s => [
  ...s.cards.map(c => ({ id: c.id, sectionId: s.id, label: c.heading })),
  { id: `section::${s.id}`, sectionId: s.id, label: `Section ${s.number}: ${s.title}` },
]);

export function findConcept(conceptId) {
  return CONCEPT_INDEX.find(c => c.id === conceptId) || { id: conceptId, label: conceptId };
}
