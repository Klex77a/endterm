/* =====================================================================
   Content file 2 of 3: chapters for Weeks 6–10.
   IMPORTANT: lecture slides for Weeks 9 and 10 were not part of the
   materials supplied to the authors. Those two chapters follow the
   topic list in the course syllabus (Sections 2, 4 and 13), and their
   explanations are marked as "Additional Material" with sources.
   ===================================================================== */
window.BOOK = window.BOOK || { chapters: [] };

/* ------------------------------------------------------------------ */
/* WEEK 6 — Probability and Bayesian networks                          */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-6",
  week: 6,
  station: "Station 6 · The Valley of Fog",
  title: "Probability and Bayesian Networks",
  subtitle: "Reasoning under uncertainty",
  source: "Lecture 6 — Probability & Bayesian Networks",
  story:
    "A thick fog falls. Qai's sensors still work, but every reading is uncertain: the grass is wet — did it rain, or was the sprinkler on? An alarm rings — is the machine really failing? Instead of yes/no answers, Qai learns to hold <em>degrees of belief</em> and to update them as evidence arrives.",
  objectives: [
    "Explain why AI needs probability to handle incomplete, noisy evidence.",
    "Work with random variables, distributions, joint and conditional probability.",
    "Apply Bayes' theorem and avoid confusing P(+|D) with P(D|+).",
    "Define a Bayesian network (DAG + CPTs) and read its factorization.",
    "Explain conditional independence, chains, forks, colliders and explaining away.",
    "Perform exact inference by enumeration and approximate inference by sampling.",
    "Implement these calculations in Python."
  ],
  sections: [
    {
      h: "Why AI needs probability",
      html:
        "<p>Real observations are incomplete, noisy and sometimes contradictory. A fever does not prove a particular disease; a hot motor does not guarantee failure. Probabilistic reasoning assigns <strong>degrees of belief</strong> to competing explanations. Whether an industrial alarm means a real failure depends on the <em>base failure rate</em> and on the <em>sensor's accuracy</em>.</p>"
    },
    {
      h: "Random variables and distributions",
      html:
        "<p>A <strong>random variable</strong> maps uncertain outcomes to values. It can be discrete — Rain ∈ {True, False}, Weather ∈ {Sunny, Cloudy, Rainy} — or continuous — temperature, pressure, power demand. A complete <strong>distribution</strong> gives a probability to every outcome, and the probabilities of mutually exclusive outcomes sum to 1: P(Sunny) = 0.50, P(Cloudy) = 0.30, P(Rainy) = 0.20.</p>" +
        "<p>Under an equally likely model, a probability is a fraction of possible outcomes: 30 highlighted outcomes out of 100 = 30 %.</p>"
    },
    {
      h: "Joint and conditional probability",
      html:
        "<p>The <strong>joint</strong> probability P(A, B) is the probability that A and B happen together. The <strong>conditional</strong> probability P(A | B) is the probability of A once we know B is true:</p>" +
        "<div class='formula'>P(A | B) = P(A, B) / P(B), &nbsp; provided P(B) &gt; 0</div>" +
        "<div class='table-wrap'><table><caption>Traffic and weather (lecture table)</caption><thead><tr><th scope='col'>Traffic</th><th scope='col'>Rain</th><th scope='col'>No rain</th><th scope='col'>Total</th></tr></thead><tbody>" +
        "<tr class='hl'><td>Heavy</td><td>0.24</td><td>0.21</td><td>0.45</td></tr><tr><td>Medium</td><td>0.04</td><td>0.25</td><td>0.29</td></tr><tr><td>Light</td><td>0.02</td><td>0.24</td><td>0.26</td></tr><tr><th scope='row'>Total</th><td>0.30</td><td>0.70</td><td>1.00</td></tr></tbody></table></div>" +
        "<p>Without knowing the weather, P(Heavy) = 0.45. Knowing it rains: P(Heavy | Rain) = 0.24 / 0.30 = <strong>0.80</strong>. In a 100-day picture: of the 30 rainy days, 24 have heavy traffic. <em>Conditioning filters the sample space</em> — the denominator changes from 100 days to 30 rainy days.</p>"
    },
    {
      h: "Bayes' theorem",
      html:
        "<div class='formula'>P(H | E) = P(E | H) · P(H) / P(E)</div>" +
        "<ul><li><strong>Prior</strong> P(H): belief in the hypothesis before the evidence.</li><li><strong>Likelihood</strong> P(E | H): how likely the evidence is if the hypothesis is true.</li><li><strong>Evidence</strong> P(E): total probability of observing the evidence — P(E) = P(E|H)P(H) + P(E|¬H)P(¬H).</li><li><strong>Posterior</strong> P(H | E): the updated belief.</li></ul>" +
        "<p><strong>Medical test (lecture):</strong> prevalence P(D) = 0.01, sensitivity P(+|D) = 0.95, false-positive rate P(+|¬D) = 0.10. Then P(+) = 0.95·0.01 + 0.10·0.99 = 0.1085 and P(D|+) = 0.0095 / 0.1085 ≈ <strong>8.76 %</strong>. In natural frequencies: of 10,000 people, 100 are ill (95 test positive) and 9,900 are healthy (990 test positive), so only 95 of 1,085 positives are ill. A positive test raises the probability from 1 % to about 8.76 % — it is not a diagnosis. <em>Do not confuse P(+|D) with P(D|+).</em></p>"
    },
    {
      h: "Conditional independence and Bayesian networks",
      html:
        "<p>A ⟂ B | C means A and B become independent once C is known: P(A | B, C) = P(A | C). This property lets us store small local tables instead of one enormous joint table.</p>" +
        "<p>A <strong>Bayesian network</strong> is a <strong>directed acyclic graph (DAG)</strong> plus a <strong>conditional probability table (CPT)</strong> for every node. Nodes are random variables; arrows are direct probabilistic dependencies; CPTs give the numerical strengths. <em>Directed</em> = arrows have a direction; <em>acyclic</em> = no directed loop returns to its start.</p>" +
        "<p>The network encodes a <strong>factorization</strong>: P(X₁,…,Xₙ) = ∏ P(Xᵢ | Parents(Xᵢ)). For the lecture's network Rain → Sprinkler, Rain → Wet grass, Sprinkler → Wet grass: P(R, S, W) = P(R)·P(S | R)·P(W | R, S). A full joint table for n binary variables has 2ⁿ entries; sparse parent sets greatly reduce the number of parameters.</p>" +
        "<div class='table-wrap'><table><caption>CPT: P(Wet grass = True | Rain, Sprinkler)</caption><thead><tr><th scope='col'>Rain</th><th scope='col'>Sprinkler</th><th scope='col'>P(Wet = True)</th></tr></thead><tbody><tr><td>True</td><td>True</td><td>0.99</td></tr><tr class='hl'><td>True</td><td>False</td><td>0.80</td></tr><tr><td>False</td><td>True</td><td>0.90</td></tr><tr><td>False</td><td>False</td><td>0.00</td></tr></tbody></table></div>" +
        "<p>Two binary parents give 2² = 4 rows; each row is a separate distribution (the False probability is 1 minus the True one). The other CPTs: P(Rain) = 0.20; P(Sprinkler | Rain) = 0.01, P(Sprinkler | ¬Rain) = 0.40.</p>"
    },
    {
      h: "Chains, forks, colliders and explaining away",
      html:
        "<ul><li><strong>Chain</strong> A → B → C: A ⟂ C | B (knowing B blocks the path).</li><li><strong>Fork</strong> A ← B → C: A ⟂ C | B (a common cause, once known, separates its effects).</li><li><strong>Collider</strong> A → B ← C: conditioning on B <em>opens</em> the path between A and C.</li></ul>" +
        "<p><strong>Explaining away</strong> is the collider effect: wet grass can be caused by rain or by the sprinkler. Observing wet grass makes both causes more plausible. If we then learn the sprinkler was on, rain becomes less necessary as an explanation, and its probability drops. Alternative explanations compete for the observed effect — this is not a paradox. (The lecture notes that the full network also has the arrow Rain → Sprinkler, so the pure collider story is a simplification.)</p>"
    },
    {
      h: "Inference: exact and approximate",
      html:
        "<p><strong>Exact inference by enumeration</strong> sums the joint over the hidden variables and then normalizes. <strong>Variable elimination</strong> avoids repeated work by building factors, multiplying compatible factors and summing out one hidden variable at a time; the elimination order affects the size of the intermediate factors and the runtime.</p>" +
        "<p><strong>Sampling</strong> estimates probabilities by counting simulated worlds:</p>" +
        "<ul><li><strong>Prior sampling:</strong> draw variables in topological order (Rain, then Sprinkler | Rain, then Wet | Rain, Sprinkler). Samples are not conditioned on evidence.</li><li><strong>Rejection sampling:</strong> generate prior samples and keep only those matching the evidence (Wet = True). Simple, but rare evidence wastes many samples.</li><li><strong>Likelihood weighting:</strong> fix the evidence variables and weight each sample by the probability of the evidence given its sampled parents. No samples are thrown away, but with much evidence the weights can become very unequal.</li><li><strong>Gibbs sampling:</strong> keep evidence fixed and repeatedly resample one non-evidence variable from its conditional distribution given the others. Convergence and mixing can be slow, and consecutive samples are dependent.</li></ul>"
    },
    {
      h: "Limitations and validation",
      html:
        "<p>CPTs may be estimated from scarce or biased data. Arrows are not automatically proven causal relationships. Missing variables can invalidate independence assumptions. Good practice: document assumptions, validate with held-out data, update parameters as conditions change, and evaluate calibration, sensitivity, robustness and predictive performance. In Python the same models can be built with libraries such as <code>pgmpy</code> (BayesianNetwork, VariableElimination).</p>"
    }
  ],
  terms: [
    { t: "Random variable", d: "A variable whose value is an uncertain outcome, e.g., Rain ∈ {True, False}." },
    { t: "Probability distribution", d: "An assignment of probabilities to all outcomes, summing to 1." },
    { t: "Joint probability", d: "P(A, B): the probability that A and B both occur." },
    { t: "Conditional probability", d: "P(A | B): the probability of A given that B is known to be true." },
    { t: "Prior", d: "Belief in a hypothesis before seeing new evidence." },
    { t: "Likelihood", d: "P(E | H): how compatible the evidence is with the hypothesis." },
    { t: "Posterior", d: "P(H | E): belief after taking the evidence into account." },
    { t: "Base rate", d: "How common something is in the population (prior prevalence)." },
    { t: "Conditional independence", d: "A ⟂ B | C: once C is known, B gives no extra information about A." },
    { t: "Bayesian network", d: "A DAG of random variables with a conditional probability table for each node." },
    { t: "CPT", d: "Conditional probability table: P(node | each combination of its parents)." },
    { t: "Explaining away", d: "Evidence for one cause of an effect lowers belief in a competing cause." },
    { t: "Enumeration", d: "Exact inference by summing the joint over hidden variables and normalizing." },
    { t: "Rejection sampling", d: "Approximate inference keeping only simulated samples that agree with the evidence." },
    { t: "Likelihood weighting", d: "Sampling with evidence fixed, weighting each sample by the evidence's probability." }
  ],
  algorithms: [
    {
      title: "Exact inference by enumeration: P(Rain | Wet)",
      steps: [
        "Define the CPTs: P(R) = 0.20; P(S|R) = 0.01, P(S|¬R) = 0.40; P(W|R,S) from the table.",
        "For Rain = True, sum over the hidden Sprinkler: 0.20 × [0.01·0.99 + 0.99·0.80] = 0.00198 + 0.15840 = <strong>0.16038</strong>.",
        "For Rain = False: 0.80 × [0.40·0.90 + 0.60·0] = <strong>0.288</strong>.",
        "Normalize: 0.16038 / (0.16038 + 0.288) = <strong>0.3577 ≈ 35.8 %</strong>.",
        "Compare with the prior 20 %: wet grass is evidence for rain, not proof."
      ],
      code:
        "P_RAIN = 0.20\n\ndef p_sprinkler(rain):\n    return 0.01 if rain else 0.40\n\ndef p_wet(rain, sprinkler):\n    table = {(True, True): 0.99, (True, False): 0.80,\n             (False, True): 0.90, (False, False): 0.00}\n    return table[(rain, sprinkler)]\n\ndef joint_rain_wet(rain):\n    pr = P_RAIN if rain else 1 - P_RAIN\n    total = 0.0\n    for sprinkler in [True, False]:          # sum out the hidden variable\n        ps = p_sprinkler(rain)\n        ps = ps if sprinkler else 1 - ps\n        total += pr * ps * p_wet(rain, sprinkler)\n    return total\n\nnum = joint_rain_wet(True)\nposterior = num / (num + joint_rain_wet(False))\nprint(round(posterior, 4))   # 0.3577"
    },
    {
      title: "Rejection sampling: P(Rain | Wet)",
      steps: [
        "Simulate the network in topological order: <code>rain = random.random() &lt; 0.20</code>, then sprinkler, then wet.",
        "Repeat N times (e.g., 100,000).",
        "Keep only the samples with wet = True (accepted).",
        "Estimate P(Rain | Wet) = (accepted samples with rain) / (accepted samples).",
        "As N grows, the estimate approaches the exact 0.3577."
      ]
    }
  ],
  formulas: [
    { name: "Conditional probability", f: "P(A | B) = P(A, B) / P(B)", note: "Defined only when P(B) > 0." },
    { name: "Bayes' theorem", f: "P(H | E) = P(E | H) · P(H) / P(E)", note: "Posterior = likelihood × prior / evidence." },
    { name: "Total probability (evidence)", f: "P(E) = P(E | H)P(H) + P(E | ¬H)P(¬H)", note: "Evidence can arise whether H is true or false; ignoring false positives overestimates risk." },
    { name: "Bayesian network factorization", f: "P(X₁,…,Xₙ) = ∏<sub>i</sub> P(Xᵢ | Parents(Xᵢ))", note: "Sprinkler example: P(R,S,W) = P(R)·P(S|R)·P(W|R,S)." },
    { name: "Enumeration", f: "P(R, W) = Σ<sub>s</sub> P(R)·P(S=s | R)·P(W | R, S=s)", note: "Sum out the hidden variable, then normalize." }
  ],
  example: {
    title: "Practical example: predictive maintenance diagnosis",
    html:
      "<p>Prior P(Failure) = 0.02. The temperature sensor reads HIGH with P(Hot | Failure) = 0.90 and P(Hot | No failure) = 0.10.</p>" +
      "<div class='formula'>P(Failure | Hot) = (0.90 × 0.02) / [(0.90 × 0.02) + (0.10 × 0.98)] = 0.018 / 0.116 ≈ 0.1552</div>" +
      "<p>A high reading raises the estimated failure risk from <strong>2 % to 15.52 %</strong>. That is a big increase — but it is a model-based estimate, not proof of a fault. Week 8 shows how to turn such a probability into a maintenance decision.</p>"
  },
  application: {
    title: "Real-world application: medical testing and sensor diagnosis",
    html:
      "<p>Bayesian reasoning explains why screening tests for rare conditions produce many false alarms, and why doctors combine several tests. In industry, a Bayesian network with nodes such as <em>Machine failure → High temperature</em> and <em>Machine failure → Abnormal vibration</em> lets engineers combine sensor readings into one updated fault probability.</p>"
  },
  diagram: {
    title: "Interactive: Bayes calculator and the sprinkler network",
    widget: "bayes",
    caption: "Top: change the prior, sensitivity and false-positive rate and watch the posterior and the 10,000-person picture. Bottom: run rejection sampling on the sprinkler network and see the estimate approach the exact answer, 35.77 %."
  },
  keyIdea:
    "Probability turns uncertainty into numbers that can be updated. Bayes' theorem combines a prior with a likelihood; base rates matter enormously. Bayesian networks store local conditional tables on a DAG, and inference — exact by enumeration or approximate by sampling — answers questions such as P(Rain | Wet grass).",
  quiz: [
    { q: "P(Heavy, Rain) = 0.24 and P(Rain) = 0.30. What is P(Heavy | Rain)?", o: ["0.24", "0.45", "0.80", "0.072"], a: 2, e: "P(Heavy | Rain) = 0.24 / 0.30 = 0.80." },
    { q: "Prevalence 1 %, sensitivity 95 %, false-positive rate 10 %. A patient tests positive. P(Disease | +) is about…", o: ["95 %", "10 %", "8.76 %", "1 %"], a: 2, e: "0.0095 / 0.1085 ≈ 8.76 %. Most positives come from the much larger healthy group." },
    { q: "A Bayesian network must be a…", o: ["undirected graph", "directed acyclic graph with a CPT per node", "complete graph", "tree with one root"], a: 1, e: "DAG structure + conditional probability tables define the network." },
    { q: "Wet grass is observed, then we learn the sprinkler was on. What happens to P(Rain)?", o: ["It increases", "It decreases — explaining away", "It stays at 20 %", "It becomes 0"], a: 1, e: "The sprinkler already explains the wet grass, so rain is less needed as an explanation." },
    { q: "What is the main weakness of rejection sampling?", o: ["It is always biased", "With rare evidence, most samples are discarded", "It cannot handle binary variables", "It needs gradients"], a: 1, e: "Only samples matching the evidence are kept, so rare evidence wastes computation. Likelihood weighting avoids this." }
  ],
  check: [
    { q: "Why are P(+|D) and P(D|+) different?", a: "P(+|D) describes the test among sick people (sensitivity). P(D|+) describes sickness among people who tested positive, which also depends on how rare the disease is and on false positives from the healthy group." },
    { q: "How many rows does a CPT need for a binary node with three binary parents?", a: "2³ = 8 parent configurations, each giving P(node = True | parents)." },
    { q: "Name one reason a Bayesian network's conclusions might be wrong in practice.", a: "CPTs estimated from scarce or biased data; missing variables that break independence assumptions; arrows mistaken for causal claims; or conditions that changed since the data was collected." }
  ],
  connect: {
    prev: "Week 5 used probabilities inside transition models. Week 6 studied probability itself: how evidence updates belief.",
    next: "Bayesian networks reason about one moment. But a machine's condition changes over time and we see only noisy readings. Week 7 adds time: hidden Markov models and sequential inference."
  },
  additional: []
});

/* ------------------------------------------------------------------ */
/* WEEK 7 — Hidden Markov models and sequential inference               */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-7",
  week: 7,
  station: "Station 7 · The Hidden Valley",
  title: "Hidden Markov Models and Sequential Inference",
  subtitle: "How AI reasons about states it cannot directly observe",
  source: "Lecture 7 — Hidden Markov Models",
  story:
    "In the Hidden Valley, Qai monitors an old engine. It can never open the engine to look inside — it only sees a temperature light that says NORMAL or HIGH, minute after minute. Is the engine Healthy or Faulty? Each reading is a clue, and the engine's condition changes over time. Qai must combine clues across time.",
  objectives: [
    "Explain why hidden states require probabilistic reasoning.",
    "Read transition and emission probability tables.",
    "State the Markov assumption and predict future states with p<sub>t+1</sub> = p<sub>t</sub> × T.",
    "Update beliefs step by step with filtering (predict → observe → correct → normalize).",
    "Distinguish filtering, prediction, smoothing and Viterbi decoding.",
    "Run a simple HMM in Python."
  ],
  sections: [
    {
      h: "Why hidden states?",
      html:
        "<p>A sensor reports a measurement, not the full truth. A machine has an internal condition — Healthy, Degrading or Faulty — that we cannot observe directly; sensors give clues such as temperature, vibration and alarm status, and those readings are noisy. A HIGH temperature does not prove a fault: sensors produce false alarms, a fault can exist before an alarm appears, and the same reading can have different causes. Past observations help interpret a new reading, so we combine noisy evidence with a model of how the system changes.</p>"
    },
    {
      h: "Markov chains and the Markov assumption",
      html:
        "<p>A <strong>Markov chain</strong> describes how a system moves between states over time. The <strong>Markov assumption</strong>: the next state depends only on the current state, which summarizes all the history needed.</p>" +
        "<div class='formula'>P(X<sub>t+1</sub> | X<sub>t</sub>, X<sub>t−1</sub>, …) = P(X<sub>t+1</sub> | X<sub>t</sub>)</div>" +
        "<div class='table-wrap'><table><caption>Transition matrix T (current state → next state)</caption><thead><tr><th scope='col'>Current \\ Next</th><th scope='col'>Healthy</th><th scope='col'>Faulty</th></tr></thead><tbody><tr><th scope='row'>Healthy</th><td>0.90</td><td>0.10</td></tr><tr><th scope='row'>Faulty</th><td>0.20</td><td>0.80</td></tr></tbody></table></div>" +
        "<p>Each row sums to 1. <strong>One-step prediction</strong> multiplies the belief row-vector by the matrix: p<sub>t+1</sub> = p<sub>t</sub> × T. Starting from [0.80, 0.20]: P(Healthy next) = 0.80·0.90 + 0.20·0.20 = 0.76; P(Faulty next) = 0.80·0.10 + 0.20·0.80 = 0.24. In NumPy: <code>p @ T</code>.</p>"
    },
    {
      h: "Building a hidden Markov model",
      html:
        "<p>In an <strong>HMM</strong> the true state X<sub>t</sub> is hidden, but each state produces an observation E<sub>t</sub>. Two connected sequences: horizontal arrows are <em>transitions</em> between hidden states; vertical arrows are <em>emissions</em> from states to observations. Three ingredients:</p>" +
        "<ol><li><strong>Initial probabilities π</strong> — e.g., 80 % Healthy, 20 % Faulty.</li><li><strong>Transition probabilities T</strong> — e.g., Healthy → Faulty = 10 %.</li><li><strong>Emission probabilities O</strong> — which readings are likely in each state.</li></ol>" +
        "<div class='table-wrap'><table><caption>Emission table O (state → sensor reading)</caption><thead><tr><th scope='col'>Machine state</th><th scope='col'>Normal</th><th scope='col'>High</th></tr></thead><tbody><tr><th scope='row'>Healthy</th><td>0.80</td><td>0.20</td></tr><tr><th scope='row'>Faulty</th><td>0.30</td><td>0.70</td></tr></tbody></table></div>" +
        "<p>P(High | Faulty) = 0.70 is <em>not</em> P(Faulty | High). To reverse the condition we need Bayes' rule (Week 6).</p>"
    },
    {
      h: "Filtering: predict, observe, correct, normalize",
      html:
        "<p><strong>Filtering</strong> estimates the current hidden state from all observations so far. Each step: (1) <em>predict</em> — move the belief forward with T; (2) <em>observe</em> — receive the new reading; (3) <em>correct</em> — multiply by the emission likelihood; (4) <em>normalize</em> so the probabilities sum to 1. Prediction first, Bayes correction second.</p>" +
        "<p><strong>Time 1, reading HIGH</strong> (no transition needed yet): Healthy score 0.80·0.20 = 0.16; Faulty score 0.20·0.70 = 0.14; total 0.30 → belief [<strong>53.3 %</strong>, <strong>46.7 %</strong>]. The fault estimate rose from 20 % to 46.7 % — the machine has not necessarily changed; <em>our information</em> has.</p>" +
        "<p><strong>Time 2, HIGH again:</strong> predict: Healthy 0.5333·0.90 + 0.4667·0.20 ≈ 0.5733, Faulty ≈ 0.4267. Correct: [0.5733·0.20, 0.4267·0.70] = [0.1147, 0.2987]. Normalize by 0.4133 → [<strong>27.7 %</strong>, <strong>72.3 %</strong>]. Two HIGH readings are more informative than one.</p>"
    },
    {
      h: "Prediction, smoothing and Viterbi",
      html:
        "<p><strong>Prediction</strong> looks into the future with no new readings: p<sub>t+k</sub> = p<sub>t</sub> × T<sup>k</sup>. From [0.277, 0.723], one step ahead gives Healthy ≈ 0.277·0.90 + 0.723·0.20 = 0.394, Faulty ≈ <strong>60.6 %</strong>.</p>" +
        "<p><strong>Smoothing</strong> uses later evidence to re-estimate a <em>past</em> state: P(X<sub>t</sub> | e₁,…,e<sub>T</sub>) ∝ forward<sub>t</sub> × backward<sub>t</sub> — the <em>forward–backward</em> method. Filtering asks \"what is happening now?\"; smoothing asks \"what was happening then?\" (e.g., reassessing yesterday's warning after today's critical alarm).</p>" +
        "<p><strong>Viterbi</strong> finds the single most probable <em>complete path</em> of hidden states. It uses MAX where filtering uses SUM: for each state it keeps the best path ending there and remembers the winning predecessor, then backtracks. Choosing the largest filtered probability at each time separately is <em>not</em> the same as Viterbi.</p>"
    },
    {
      h: "Assumptions and limitations",
      html:
        "<p>The model's probabilities must be supplied or estimated from data. The next state depends only on the current state. Given the current state, its observation is independent of other times. The basic model uses fixed transition and emission probabilities. A useful model must represent the system well enough for the task.</p>"
    }
  ],
  terms: [
    { t: "Hidden state", d: "The true condition of a system that cannot be observed directly." },
    { t: "Observation / evidence", d: "The measurable reading produced by a hidden state, e.g., HIGH temperature." },
    { t: "Markov chain", d: "A model of state changes over time where the next state depends only on the current one." },
    { t: "Markov assumption", d: "P(X<sub>t+1</sub> | X<sub>t</sub>, X<sub>t−1</sub>, …) = P(X<sub>t+1</sub> | X<sub>t</sub>)." },
    { t: "Transition matrix T", d: "Probabilities of moving from each state to each next state; rows sum to 1." },
    { t: "Emission probability", d: "P(reading | state): how likely each observation is in each hidden state." },
    { t: "Hidden Markov model (HMM)", d: "A Markov chain of hidden states plus emission probabilities for observations." },
    { t: "Filtering", d: "Estimating the current hidden state from all observations so far." },
    { t: "Prediction", d: "Estimating future states with no new observations: p × T<sup>k</sup>." },
    { t: "Smoothing", d: "Re-estimating a past state using later observations too (forward–backward)." },
    { t: "Viterbi algorithm", d: "Dynamic programming with MAX that finds the most probable sequence of hidden states." }
  ],
  algorithms: [
    {
      title: "Filtering (forward algorithm) step by step",
      steps: [
        "Start with the initial belief π (here [0.80, 0.20]).",
        "For the first reading, multiply by the emission column of that reading and normalize.",
        "For every later reading: predict with belief ← belief @ T.",
        "Correct: belief ← belief × O[reading] (element-wise).",
        "Normalize: belief ← belief / sum(belief)."
      ],
      code:
        "import numpy as np\nT = np.array([[.9, .1], [.2, .8]])\nO = {'High': np.array([.2, .7]), 'Normal': np.array([.8, .3])}\nbelief = np.array([.8, .2])\n\nfor t, reading in enumerate(['High', 'High']):\n    if t &gt; 0:\n        belief = belief @ T          # predict\n    belief *= O[reading]             # correct with emission likelihood\n    belief /= belief.sum()           # normalize\n    print(t + 1, belief.round(3))    # 1 [0.533 0.467]  2 [0.277 0.723]"
    },
    {
      title: "Viterbi decoding for HIGH, HIGH",
      steps: [
        "Initialize: δ₁(j) = π(j) × O<sub>j</sub>(High). δ₁(H) = 0.80·0.20 = 0.16; δ₁(F) = 0.20·0.70 = 0.14.",
        "Best path ending in Healthy₂: max(0.16·0.90, 0.14·0.20) = 0.144 (from H) → ×0.20 = 0.0288.",
        "Best path ending in Faulty₂: max(0.16·0.10, 0.14·0.80) = 0.112 (from F) → ×0.70 = 0.0784.",
        "Pick the largest final score: Faulty₂ = 0.0784.",
        "Backtrack through the saved predecessor: Faulty₁. Best path = [Faulty, Faulty]."
      ],
      code:
        "# In Google Colab run once: !pip install hmmlearn\nimport numpy as np\nfrom hmmlearn.hmm import CategoricalHMM\n\nmodel = CategoricalHMM(n_components=2, init_params='', params='', algorithm='viterbi')\nmodel.startprob_ = np.array([.8, .2])\nmodel.transmat_ = np.array([[.9, .1], [.2, .8]])\nmodel.emissionprob_ = np.array([[.8, .2], [.3, .7]])\nobs = np.array([[1], [1]])        # 0 = Normal, 1 = High\nprint(model.predict(obs))         # [1 1] -&gt; Faulty, Faulty"
    }
  ],
  formulas: [
    { name: "One-step and k-step prediction", f: "p<sub>t+1</sub> = p<sub>t</sub> × T &nbsp;·&nbsp; p<sub>t+k</sub> = p<sub>t</sub> × T<sup>k</sup>", note: "No new readings are used during prediction." },
    { name: "Bayes' rule for a reading", f: "P(State | Reading) = P(Reading | State) · P(State) / P(Reading)", note: "Posterior = likelihood × prior / total." },
    { name: "Filtering update", f: "belief<sub>t</sub>(j) ∝ O<sub>j</sub>(e<sub>t</sub>) × Σ<sub>i</sub> belief<sub>t−1</sub>(i) · T<sub>ij</sub>", note: "Σ adds over previous states; ∝ means normalize at the end." },
    { name: "Smoothing", f: "P(X<sub>t</sub> | e₁,…,e<sub>T</sub>) ∝ forward<sub>t</sub> × backward<sub>t</sub>", note: "Forward = evidence up to t; backward = how well later readings fit each state at t." },
    { name: "Path probability", f: "P(H₁, F₂, High₁, High₂) = π(H)·O(High|H)·T(H,F)·O(High|F) = 0.80·0.20·0.10·0.70 = 0.0112", note: "A joint score, not a normalized posterior." },
    { name: "Viterbi recursion", f: "δ₁(j) = π(j)·O<sub>j</sub>(e₁); &nbsp; δ<sub>t</sub>(j) = O<sub>j</sub>(e<sub>t</sub>) · max<sub>i</sub>[δ<sub>t−1</sub>(i) · T<sub>ij</sub>]", note: "Store the winning i for each j, then backtrack." }
  ],
  example: {
    title: "Practical example: smoothing — did the fault already exist at time 1?",
    html:
      "<p>Filtering at time 1 gave P(F₁ | High₁) = 46.7 %. After the second HIGH, we can reconsider time 1.</p>" +
      "<ol><li>Backward likelihood if Healthy₁: P(High₂ | H₁) = 0.90·0.20 + 0.10·0.70 = 0.25.</li><li>If Faulty₁: P(High₂ | F₁) = 0.20·0.20 + 0.80·0.70 = 0.60.</li><li>Combine with the time-1 filtered belief: Healthy 0.5333·0.25 = 0.1333; Faulty 0.4667·0.60 = 0.28.</li><li>Normalize by 0.4133: P(F₁ | High₁, High₂) ≈ <strong>67.7 %</strong>.</li></ol>" +
      "<div class='table-wrap'><table><caption>Which HMM task answers which question? (HIGH, HIGH)</caption><thead><tr><th scope='col'>Task</th><th scope='col'>Question</th><th scope='col'>Result</th></tr></thead><tbody><tr><td>Filtering</td><td>What is the state now?</td><td>Faulty₂: 72.3 %</td></tr><tr><td>Prediction</td><td>What may the next state be?</td><td>Faulty₃: 60.6 %</td></tr><tr><td>Smoothing</td><td>What was the earlier state?</td><td>Faulty₁: 67.7 %</td></tr><tr><td>Viterbi</td><td>Which whole path is best?</td><td>Faulty₁, Faulty₂</td></tr></tbody></table></div>"
  },
  application: {
    title: "Real-world applications of hidden-state models",
    html:
      "<div class='table-wrap'><table><thead><tr><th scope='col'>Application</th><th scope='col'>Hidden state</th><th scope='col'>Observed evidence</th></tr></thead><tbody><tr><td>Machine monitoring</td><td>Equipment condition</td><td>Temperature, vibration, alarms</td></tr><tr><td>Robot localization</td><td>Robot position</td><td>Noisy distance measurements</td></tr><tr><td>Speech recognition</td><td>Phonetic state</td><td>Acoustic features</td></tr></tbody></table></div>" +
      "<p>In every case the HMM combines evidence over time to estimate something the sensors cannot see directly.</p>"
  },
  diagram: {
    title: "Interactive: a live HMM filter",
    widget: "hmm",
    caption: "Add NORMAL or HIGH readings and watch the belief update through predict → correct → normalize. The panel also shows the one-step prediction and the Viterbi path for the whole sequence. Model: the lecture's T, O and π."
  },
  keyIdea:
    "An HMM links hidden states (changing by transition probabilities) to observations (produced by emission probabilities). Filtering uses SUM to track the present, prediction projects forward with T, smoothing uses later evidence to revise the past, and Viterbi uses MAX to recover one best path. A reading changes our estimate — not necessarily the real state.",
  quiz: [
    { q: "Belief [0.80, 0.20], T = [[0.9, 0.1], [0.2, 0.8]]. After one prediction step, P(Faulty) is…", o: ["0.20", "0.24", "0.16", "0.80"], a: 1, e: "0.80·0.10 + 0.20·0.80 = 0.08 + 0.16 = 0.24." },
    { q: "Prior [Healthy 0.8, Faulty 0.2], P(High|H) = 0.2, P(High|F) = 0.7. After one HIGH reading, P(Faulty) is…", o: ["70 %", "46.7 %", "20 %", "53.3 %"], a: 1, e: "Scores 0.16 and 0.14, total 0.30, so P(F) = 0.14 / 0.30 ≈ 46.7 %." },
    { q: "Which task uses later readings to re-estimate an earlier state?", o: ["Filtering", "Prediction", "Smoothing", "Viterbi"], a: 2, e: "Smoothing (forward–backward) revises the past with future evidence." },
    { q: "How does Viterbi differ from filtering?", o: ["Viterbi uses MAX over predecessors and returns one best path; filtering uses SUM and returns current-state probabilities", "Viterbi does not use transition probabilities", "They are identical", "Viterbi predicts the future"], a: 0, e: "Same model, different goals: SUM vs. MAX." },
    { q: "With prior P(H) = 0.6, P(F) = 0.4 and a HIGH reading, the posterior P(Faulty) is…", o: ["40 %", "60 %", "70 %", "28 %"], a: 2, e: "Scores 0.6·0.2 = 0.12 and 0.4·0.7 = 0.28; total 0.40; P(F) = 0.28/0.40 = 70 %." }
  ],
  check: [
    { q: "Why must each row of a transition matrix sum to 1?", a: "Each row is a probability distribution over the possible next states from one current state; the system must move to some state (possibly the same one)." },
    { q: "Why is choosing the most likely state at each time not the same as Viterbi?", a: "The individually most likely states may form a sequence with a low joint probability or even an impossible transition. Viterbi maximizes the probability of the whole sequence." },
    { q: "Give an example of an HMM outside industry.", a: "Speech recognition (hidden phonetic states, observed acoustic features) or robot localization (hidden position, noisy distance sensors)." }
  ],
  connect: {
    prev: "Week 6 updated beliefs about one moment with Bayes' theorem. Week 7 repeats that update over time, adding a transition model between steps.",
    next: "Knowing the probability of a fault is not the same as knowing what to do. Week 8 combines probability with utility to choose actions — and shows how machine learning can learn those probabilities from data."
  },
  additional: []
});

/* ------------------------------------------------------------------ */
/* WEEK 8 — Rational decisions and classical machine learning          */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-8",
  week: 8,
  station: "Station 8 · The Workshop of Learning",
  title: "Rational Decisions and Classical Machine Learning",
  subtitle: "Data → prediction → utility → action",
  source: "Lecture 8 — Rational Decisions and Classical Machine Learning",
  story:
    "Qai arrives at a busy workshop full of machines and logbooks. Engineers no longer want to write every rule by hand — they want Qai to <em>learn</em> patterns from past data. But a prediction alone does not fix a machine. Qai must also decide: given this risk and these costs, should we stop for maintenance?",
  objectives: [
    "Define rational action and distinguish it from a guaranteed good outcome.",
    "Compute expected utility, apply the MEU principle and derive cost-based decision thresholds.",
    "Use Bayesian updating as input to decisions.",
    "Contrast traditional programming with machine learning; describe the ML workflow.",
    "Distinguish supervised, unsupervised and reinforcement learning.",
    "Explain linear regression, logistic regression, decision trees, random forests and K-Means.",
    "Evaluate classifiers with accuracy, precision, recall and F1, and recognize overfitting, leakage and distribution shift."
  ],
  sections: [
    {
      h: "Rationality and expected utility",
      html:
        "<p>A rational choice maximizes <em>expected</em> performance using the information available <strong>before</strong> acting. An unfavorable outcome does not prove the choice was irrational — rationality is judged without hindsight. An omniscient agent would know the actual future; that is not realistic in most AI tasks.</p>" +
        "<p>Probabilities alone are not enough: a 90 % success rate says nothing about how bad the 10 % failure is. <strong>Utility</strong> assigns a preference score to outcomes, and rational choice combines probability <em>and</em> utility through <strong>expected utility</strong>.</p>" +
        "<p><strong>Project A:</strong> EU = 0.9·100 + 0.1·(−20) = <strong>88</strong>. <strong>Project B:</strong> EU = 0.6·200 + 0.4·(−50) = <strong>100</strong>. Under the <strong>Maximum Expected Utility (MEU)</strong> principle, B wins despite a lower success probability. If safety rules restrict actions, maximize only over the feasible ones.</p>" +
        "<p><strong>Risk preferences:</strong> a <em>risk-neutral</em> agent has utility linear in money and maximizes expected monetary value; a <em>risk-averse</em> agent dislikes large losses, typically has a concave utility, and may prefer lower-variance outcomes.</p>"
    },
    {
      h: "From belief to action: decision thresholds",
      html:
        "<p>The pipeline: <em>prior</em> → <em>observation</em> (a vibration alarm) → <em>posterior</em> (Bayes) → <em>utility</em> (compare costs) → <em>action</em> (maintain or continue). \"Bayesian inference tells us what to believe; decision theory tells us what to do.\"</p>" +
        "<p>If continuing risks a failure costing C<sub>failure</sub>, its expected cost is p·C<sub>failure</sub> (p = 0.30, $10,000 → $3,000). Preventive maintenance costs C<sub>maint</sub> (assume it fully prevents failure). Maintain when p·C<sub>failure</sub> &gt; C<sub>maint</sub>, i.e., when <strong>p &gt; C<sub>maint</sub> / C<sub>failure</sub></strong>. With $2,000 / $10,000 the threshold is <strong>20 %</strong>. This threshold follows from <em>costs</em>, not from model accuracy; if failure becomes more expensive, the threshold falls.</p>"
    },
    {
      h: "Why machine learning?",
      html:
        "<p>In <strong>traditional programming</strong>, humans write explicit rules (IF temperature &gt; 80 THEN alarm): data + rules → output. That is easy to audit in simple cases, but real data are noisy, thresholds overlap and patterns can be nonlinear. In <strong>machine learning</strong>, data + known outcomes → an algorithm fits a model, which then predicts new cases. Instead of programming every decision rule, we learn useful rules from data.</p>" +
        "<p>A predictive model is written ŷ = f<sub>θ</sub>(x): x are input features (e.g., [temperature, vibration]), θ are learned parameters, ŷ is the prediction (a number or a class).</p>" +
        "<p><strong>ML workflow:</strong> collect labeled examples → split into training and test data → fit parameters → evaluate on unseen data → deploy. Prevent <em>leakage</em>: test information must never influence fitting.</p>"
    },
    {
      h: "Three learning paradigms",
      html:
        "<div class='table-wrap'><table><caption>Supervised vs. unsupervised vs. reinforcement learning</caption><thead><tr><th scope='col'>Dimension</th><th scope='col'>Supervised</th><th scope='col'>Unsupervised</th><th scope='col'>Reinforcement</th></tr></thead><tbody>" +
        "<tr><th scope='row'>Training signal</th><td>Correct labels</td><td>No labels</td><td>Rewards / penalties</td></tr>" +
        "<tr><th scope='row'>Objective</th><td>Predict a target</td><td>Discover structure</td><td>Maximize total reward</td></tr>" +
        "<tr><th scope='row'>Output</th><td>Class or number</td><td>Clusters / components</td><td>Action policy</td></tr>" +
        "<tr><th scope='row'>Example</th><td>Failure detection</td><td>Customer groups</td><td>Robot control</td></tr>" +
        "<tr><th scope='row'>Algorithms</th><td>Regression, trees</td><td>K-Means, PCA</td><td>Q-learning, DQN</td></tr></tbody></table></div>" +
        "<p>One machine dataset, three tasks: with failure labels → <em>predict</em> whether it will fail; without labels → <em>discover</em> operating modes; with states, actions and rewards → <em>decide</em> when to maintain. Reinforcement learning is not unsupervised learning — rewards guide behavior.</p>"
    },
    {
      h: "Regression: predicting numbers",
      html:
        "<p><strong>Regression</strong> predicts a continuous number (energy demand, price, lifetime; metrics MAE, RMSE, R²). <strong>Classification</strong> predicts a class or probability (failure, fraud, spam; metrics precision, recall, F1).</p>" +
        "<p><strong>Linear regression:</strong> ŷ = wx + b, with w the learned weight (slope) and b the intercept. Example: consumption = 5·temperature + 100, so at 30 °C the prediction is 250 kWh. Training minimizes the <strong>mean squared error</strong>; squaring penalizes large errors more (an error of 10 contributes 100, an error of 2 only 4).</p>"
    },
    {
      h: "Classification: logistic regression, trees and forests",
      html:
        "<p><strong>Logistic regression</strong> computes a linear score z = wᵀx + b and passes it through the <strong>sigmoid</strong> σ(z) = 1 / (1 + e<sup>−z</sup>) to get a probability in (0, 1). σ(0) = 0.5, σ(2) ≈ 0.881, σ(−2) ≈ 0.119. A decision still needs a <strong>threshold τ</strong>: predict failure if P(failure | x) ≥ τ. The default 0.5 is not always optimal — in high-cost failure scenarios τ may be 0.2 or lower. The threshold is a decision policy, not a property of the model.</p>" +
        "<p><strong>Decision trees</strong> are transparent if–then logic (e.g., Temperature &gt; 70 °C? → Vibration &gt; 3? → Failure). Strengths: interpretable, model nonlinear relationships, little preprocessing. Limitations: deep trees overfit, are sensitive to small data changes and have high variance.</p>" +
        "<p><strong>Random forests</strong> train many diverse trees: bootstrap-sample the rows, consider random feature subsets, train the trees, then vote or average. Ensembling usually reduces variance and generalizes better, at the cost of direct interpretability.</p>"
    },
    {
      h: "Unsupervised learning: K-Means",
      html:
        "<p>With no target labels, the algorithm searches for structure or similarity: clustering, dimensionality reduction, anomaly detection. <strong>K-Means</strong>: choose K centroids → assign each point to the nearest centroid → recompute each centroid as the mean of its points → repeat until stable. It minimizes within-cluster squared distances. Scale the features first when their units differ (otherwise spending in tenge dominates purchase frequency). K-Means discovers groups; people still have to interpret what they mean — cluster numbers have no inherent order.</p>"
    },
    {
      h: "Evaluation: high accuracy ≠ good decisions",
      html:
        "<p>From the <strong>confusion matrix</strong>: TP = correctly detected failures, TN = correctly detected normal cases, FP = false alarms, FN = missed failures.</p>" +
        "<ul><li><strong>Accuracy</strong> = (TP + TN) / N. If only 2 % of cases are failures, a model that always says \"normal\" scores 98 % accuracy but 0 % recall.</li><li><strong>Recall</strong> = TP / (TP + FN): how many failures are detected — critical when misses are dangerous.</li><li><strong>Precision</strong> = TP / (TP + FP): how many alarms are correct — critical when false alarms are expensive.</li><li><strong>F1</strong> = 2PR / (P + R): the harmonic mean, balancing both (but not explicit costs).</li></ul>" +
        "<p>Model A (accuracy 95 %, recall 60 %) misses more failures than Model B (accuracy 92 %, recall 90 %). <strong>Reliable evaluation:</strong> train split → validation split (tune the model and threshold) → test split (final estimate) → calibrate (a well-calibrated 70 % prediction should come true about 70 % of the time). <strong>Risks:</strong> overfitting, data leakage, distribution shift and calibration error.</p>"
    }
  ],
  terms: [
    { t: "Expected utility", d: "EU(a) = Σ P(outcome | a) × U(outcome): the probability-weighted value of an action." },
    { t: "MEU principle", d: "Choose the action with the maximum expected utility." },
    { t: "Risk averse", d: "Preferring lower-variance outcomes; utility is typically concave." },
    { t: "Decision threshold", d: "The probability above which an action is taken, e.g., maintain if p > C<sub>maint</sub>/C<sub>failure</sub>." },
    { t: "Feature", d: "An input variable x used by a model, such as temperature." },
    { t: "Label / target", d: "The known correct answer y for a training example." },
    { t: "Supervised learning", d: "Learning a mapping from inputs to known labels." },
    { t: "Unsupervised learning", d: "Finding structure in data without labels." },
    { t: "Linear regression", d: "Predicts a number with ŷ = wx + b, trained by minimizing squared error." },
    { t: "Logistic regression", d: "Classification model that maps a linear score to a probability with the sigmoid." },
    { t: "Sigmoid", d: "σ(z) = 1/(1 + e<sup>−z</sup>), an S-shaped function from any number to (0, 1)." },
    { t: "Decision tree", d: "A model of nested if–then splits on features." },
    { t: "Random forest", d: "An ensemble of diverse trees whose votes or averages are combined." },
    { t: "K-Means", d: "Clustering that alternates assigning points to the nearest centroid and recomputing centroids." },
    { t: "Precision / Recall", d: "Share of alarms that are correct / share of real positives that are detected." },
    { t: "Overfitting", d: "Learning noise in the training data so performance on new data suffers." },
    { t: "Data leakage", d: "Using information during training that would not be available at prediction time." },
    { t: "Distribution shift", d: "New data differ from the training data, so the model may fail." }
  ],
  algorithms: [
    {
      title: "Choosing an action with expected utility (Python from the lecture)",
      steps: ["List each action's outcome probabilities and utilities.", "Multiply each probability by its utility.", "Sum the products to get EU for each action.", "Select the action with the maximum EU (Project B: 100 > 88)."],
      code:
        "actions = {\n    'A': ([0.9, 0.1], [100, -20]),\n    'B': ([0.6, 0.4], [200, -50])\n}\n\ndef EU(probs, utilities):\n    return sum(p * u for p, u in zip(probs, utilities))\n\nscores = {name: EU(*values) for name, values in actions.items()}\nprint(scores)                          # {'A': 88.0, 'B': 100.0}\nprint(max(scores, key=scores.get))     # B"
    },
    {
      title: "K-Means clustering",
      steps: ["Choose K and initialize K centroids.", "Assign every point to its nearest centroid.", "Recompute each centroid as the mean of its assigned points.", "Repeat steps 2–3 until the assignments stop changing.", "Interpret the clusters with domain knowledge."]
    },
    {
      title: "ML-driven maintenance decision (from the lecture)",
      steps: ["Measure temperature and vibration.", "Predict p = P(failure | sensors) with a trained classifier.", "Compute the expected cost of continuing = p × failure cost.", "Compare with the maintenance cost.", "Maintain if it is cheaper; otherwise continue."],
      code:
        "p_failure = model.predict_proba([[78, 4.2]])[0, 1]\nmaintenance_cost = 2000\nfailure_cost = 10000\ncost_continue = p_failure * failure_cost\ncost_maintain = maintenance_cost\nchoice = 'Maintain' if cost_maintain &lt; cost_continue else 'Continue'\nprint(p_failure, choice)"
    }
  ],
  formulas: [
    { name: "Rational action", f: "a* = argmax<sub>a</sub> E[ U | a, e ]", note: "e = evidence available now." },
    { name: "Expected utility", f: "EU(a) = Σ<sub>i</sub> P(o<sub>i</sub> | a) × U(o<sub>i</sub>)", note: "Sum over mutually exclusive outcomes." },
    { name: "Bayes' theorem (decision context)", f: "P(H | D) = P(D | H) P(H) / P(D), &nbsp; P(D) = P(D|H)P(H) + P(D|¬H)P(¬H)", note: "H = hypothesis (failure), D = data (alarm)." },
    { name: "Maintenance threshold", f: "Maintain if p<sub>failure</sub> &gt; C<sub>maint</sub> / C<sub>failure</sub>", note: "2,000 / 10,000 = 0.20." },
    { name: "Minimum expected cost", f: "a* = argmin<sub>a</sub> Σ<sub>o</sub> P(o | x, a) · C(o, a)", note: "Integrated rational ML decision." },
    { name: "Linear regression and MSE", f: "ŷ = wx + b &nbsp;·&nbsp; MSE = (1/n) Σ<sub>i</sub> (y<sub>i</sub> − ŷ<sub>i</sub>)²", note: "Fit w and b to minimize MSE." },
    { name: "Logistic regression", f: "P(y = 1 | x) = σ(wᵀx + b), &nbsp; σ(z) = 1 / (1 + e<sup>−z</sup>)", note: "Then predict positive if P ≥ τ." },
    { name: "K-Means objective", f: "J = Σ<sub>k</sub> Σ<sub>x∈C<sub>k</sub></sub> ‖x − μ<sub>k</sub>‖²", note: "μ<sub>k</sub> = centroid of cluster k." },
    { name: "Classification metrics", f: "Accuracy = (TP+TN)/N · Recall = TP/(TP+FN) · Precision = TP/(TP+FP) · F1 = 2PR/(P+R)", note: "Pick the metric that matches the cost of errors." }
  ],
  example: {
    title: "Practical examples: robot route and maintenance",
    html:
      "<p><strong>Robot route.</strong> Route A: 80 % success, +100 / −50 → EU(A) = 0.8·100 + 0.2·(−50) = 70. Route B: 95 % success, +80 / −20 → EU(B) = 0.95·80 + 0.05·(−20) = <strong>75</strong>. Route B is rational despite the smaller success reward. Shortest path ≠ best decision when safety and uncertainty matter.</p>" +
      "<p><strong>Maintenance.</strong> Failure probability 15 %, failure loss $20,000, maintenance $2,000 (fully preventive). Expected cost of continuing = 0.15·20,000 = $3,000 &gt; $2,000, so maintain — it saves $1,000 in expected cost.</p>" +
      "<p><strong>Linear regression in scikit-learn.</strong> For temperatures [15, 20, 25, 30, 35] and consumption [174, 201, 224, 251, 278], <code>LinearRegression().fit(X, y)</code> learns a slope of 5.16 and an intercept of 96.6, so <code>predict([[32]])</code> ≈ 261.7. (Values computed by the authors from the lecture's data.)</p>"
  },
  application: {
    title: "Real-world application: predictive maintenance in a factory",
    html:
      "<p>A classifier trained on temperature and vibration logs outputs P(failure). The plant does <em>not</em> use the default 0.5 threshold; it uses the cost ratio (e.g., 0.20) because a missed failure costs five times more than a maintenance stop. The model is judged mainly on recall and calibration, because trustworthy probabilities matter more for decisions than raw accuracy.</p>"
  },
  diagram: {
    title: "Interactive: from probability to decision, sigmoid and metrics",
    widget: "decisionML",
    caption: "Three linked tools: (1) change the failure and maintenance costs to see the optimal threshold move; (2) slide z through the sigmoid; (3) edit a confusion matrix and see accuracy, precision, recall and F1 — including the 98 %-accuracy trap."
  },
  keyIdea:
    "Prediction ≠ decision. Machine learning estimates probabilities from data; decision theory multiplies them by utilities or costs to choose an action. A good AI system needs both — and must be evaluated with metrics that match the real cost of its mistakes.",
  quiz: [
    { q: "EU(A) = 0.9·100 + 0.1·(−20) and EU(B) = 0.6·200 + 0.4·(−50). Which is rational under MEU?", o: ["A, because its success probability is higher", "B, because EU(B) = 100 > EU(A) = 88", "They are equal", "Neither"], a: 1, e: "MEU compares expected utilities, not success probabilities." },
    { q: "Maintenance costs $2,000 and a failure costs $10,000. Above which failure probability should you maintain?", o: ["50 %", "20 %", "10 %", "80 %"], a: 1, e: "Threshold = C<sub>maint</sub> / C<sub>failure</sub> = 0.20." },
    { q: "Only 2 % of cases are failures. A model always predicts 'normal'. Its accuracy and recall are…", o: ["98 % and 98 %", "98 % and 0 %", "2 % and 100 %", "50 % and 50 %"], a: 1, e: "It is right on all normal cases (98 %) but detects no failures (recall 0)." },
    { q: "What is σ(0) for the sigmoid function?", o: ["0", "1", "0.5", "e"], a: 2, e: "σ(0) = 1 / (1 + e⁰) = 1/2." },
    { q: "Grouping customers by purchase frequency and spending without labels is…", o: ["Supervised classification", "Regression", "Unsupervised clustering (e.g., K-Means)", "Reinforcement learning"], a: 2, e: "No labels → unsupervised learning." }
  ],
  check: [
    { q: "Can a rational decision have a bad outcome? Explain.", a: "Yes. Rationality is judged by expected utility with the information available before acting. A 95 %-safe route can still fail; that bad luck does not make the choice irrational." },
    { q: "Why does a random forest usually generalize better than one deep tree?", a: "Each tree is trained on a bootstrap sample with random feature subsets, so the trees make different errors. Voting or averaging cancels much of that variance." },
    { q: "When would you prefer high precision over high recall?", a: "When false alarms are expensive or harmful — e.g., stopping a production line for every alert, or flagging honest customers as fraudsters — and occasional misses are tolerable." }
  ],
  connect: {
    prev: "Weeks 6–7 told us what to believe. Week 8 adds utilities to decide what to do, and introduces models that learn probabilities from data.",
    next: "Logistic regression is a single weighted sum followed by a squashing function — that is almost exactly an artificial neuron. Week 9 connects many such units into perceptrons and neural networks."
  },
  additional: [
    {
      title: "Additional Material: Naive Bayes (listed in the syllabus for Week 8)",
      html:
        "<p>The syllabus lists <em>Naive Bayes</em> among the Week 8 activities, but the Week 8 lecture slides do not cover it, so we summarize it here. A Naive Bayes classifier applies Bayes' theorem (Week 6) with the \"naive\" assumption that the features are conditionally independent given the class: P(class | x₁,…,xₙ) ∝ P(class) · ∏ P(xᵢ | class). It picks the class with the largest posterior. It is fast, needs little data and works well for tasks like spam filtering, even though the independence assumption is rarely exactly true.</p>",
      src: [
        { label: "scikit-learn User Guide — 1.9 Naive Bayes", url: "https://scikit-learn.org/stable/modules/naive_bayes.html" },
        { label: "Russell & Norvig, AIMA (course textbook), section on naive Bayes models", url: "https://aima.cs.berkeley.edu/" }
      ]
    }
  ]
});

/* ------------------------------------------------------------------ */
/* WEEK 9 — Perceptrons and neural networks (Additional Material)       */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-9",
  week: 9,
  station: "Station 9 · Network City",
  title: "Perceptrons and Neural Networks",
  subtitle: "From one artificial neuron to learned representations",
  source: "Syllabus Week 9 topic (lecture slides not supplied) — explanations are Additional Material",
  sourceWarning:
    "The Week 9 lecture slides were not among the materials supplied for this book. This chapter covers the syllabus topic \"Perceptrons and neural networks\" and the syllabus activity \"Implement a basic perceptron or use a guided neural-network notebook; evaluate and analyze errors\". All explanations here are Additional Material based on the course textbook and the sources listed at the end of the chapter. Links back to earlier lectures (sigmoid, gradient descent, DQN) are taken from the course slides.",
  story:
    "Qai enters a city where millions of tiny lights blink on and off — each one a simple unit that adds up its inputs and decides whether to fire. Alone, each light is almost trivial. Connected in layers, they recognize faces, voices and handwriting. Qai has met this idea before: logistic regression in Week 8 was a single such unit.",
  objectives: [
    "Describe an artificial neuron: inputs, weights, bias, weighted sum and activation.",
    "Trace the perceptron learning rule on a small example.",
    "Explain linear separability and why one perceptron cannot learn XOR.",
    "Describe a multilayer network and a forward pass.",
    "Explain, at a high level, how loss, gradient descent and backpropagation train a network.",
    "Recognize overfitting and how to evaluate a network's errors."
  ],
  sections: [
    {
      h: "The artificial neuron",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>An artificial neuron takes inputs x₁…xₙ, multiplies each by a <strong>weight</strong> wᵢ, adds a <strong>bias</strong> b, and passes the sum through an <strong>activation function</strong>: output = g(w·x + b). The weights say how important each input is; the bias shifts the decision point.</p>" +
        "<p>You have already seen this pattern twice in the course: the weighted evaluation function Eval(s) = w₁f₁(s) + … + wₙfₙ(s) in Week 4, and logistic regression σ(wᵀx + b) in Week 8. A neuron with a sigmoid activation <em>is</em> logistic regression.</p>"
    },
    {
      h: "The perceptron and its learning rule",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>The <strong>perceptron</strong> (Rosenblatt, 1958) uses a <em>step</em> activation: it outputs 1 if w·x + b &gt; 0 and 0 otherwise. Geometrically, w·x + b = 0 is a straight line (a hyperplane in more dimensions) that splits the input space into two classes.</p>" +
        "<p>It learns from labeled examples (supervised learning, Week 8). For each example with true label y and prediction ŷ:</p>" +
        "<div class='formula'>wᵢ ← wᵢ + α (y − ŷ) xᵢ &nbsp;&nbsp;&nbsp; b ← b + α (y − ŷ)</div>" +
        "<p>If the prediction is right, (y − ŷ) = 0 and nothing changes. If it predicted 0 but the answer was 1, the weights move toward the input; if it predicted 1 but the answer was 0, they move away. α is the learning rate — the same role it plays in Q-learning (Week 5). If the classes are <strong>linearly separable</strong>, this rule is guaranteed to find a separating line after a finite number of updates.</p>"
    },
    {
      h: "The limit of one perceptron: XOR",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>AND and OR are linearly separable: one straight line separates the 1s from the 0s. <strong>XOR</strong> (output 1 when exactly one input is 1) is not — no single line can separate (0,1) and (1,0) from (0,0) and (1,1). Minsky and Papert highlighted this limitation in 1969. The fix is to stack neurons in layers: a hidden layer can compute OR and NAND, and an output neuron can combine them with AND, which yields XOR.</p>"
    },
    {
      h: "Multilayer neural networks",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>A <strong>multilayer perceptron</strong> (feed-forward network) has an <em>input layer</em>, one or more <em>hidden layers</em> and an <em>output layer</em>. Each neuron in a layer receives the outputs of the previous layer. Computing the output from the input layer by layer is called the <strong>forward pass</strong>.</p>" +
        "<p>Hidden layers need a <em>nonlinear</em> activation; otherwise the whole network collapses into one linear function. Common choices: <strong>sigmoid</strong> σ(z) (Week 8), <strong>tanh</strong>, and <strong>ReLU</strong>(z) = max(0, z), which is popular in deep networks because it is simple and trains well. With enough hidden units, networks can approximate very complex functions; a network with many layers is called <em>deep</em> (deep learning).</p>" +
        "<p>Networks learn their own internal <em>representations</em>: early layers may detect edges in an image, later layers combine them into shapes and objects. This is why the Week 5 lecture could replace the Q-table with a network in DQN — the network generalizes across similar states.</p>"
    },
    {
      h: "Training: loss, gradient descent and backpropagation",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>Training means finding weights that make predictions match the labels. We measure the mismatch with a <strong>loss function</strong> — for example the mean squared error from Week 8, or cross-entropy for classification. Then we use <strong>gradient descent</strong> from Week 3: w ← w − α ∇L(w), stepping each weight a little in the direction that reduces the loss.</p>" +
        "<p><strong>Backpropagation</strong> is the efficient way to compute all those gradients: after the forward pass, the error at the output is propagated backward through the layers with the chain rule of calculus, giving each weight its share of the blame. In practice, gradients are computed on small random batches of examples (stochastic gradient descent), and one full pass over the training data is called an <em>epoch</em>.</p>" +
        "<p>Large networks can <strong>overfit</strong> (Week 8). Standard defenses: a validation set with early stopping, more data, and regularization. Evaluation uses the same tools as Week 8 — a held-out test set, a confusion matrix, precision, recall and F1 — plus inspection of the specific examples the network gets wrong.</p>"
    }
  ],
  terms: [
    { t: "Artificial neuron", d: "A unit that computes an activation of a weighted sum: g(w·x + b)." },
    { t: "Weight", d: "A learned number that scales one input's influence on a neuron." },
    { t: "Bias", d: "A learned constant added to the weighted sum; shifts the decision boundary." },
    { t: "Activation function", d: "The function g applied to the weighted sum: step, sigmoid, tanh, ReLU…" },
    { t: "Perceptron", d: "A neuron with a step activation, trained with the perceptron learning rule." },
    { t: "Linearly separable", d: "Two classes that a single straight line (hyperplane) can separate." },
    { t: "Hidden layer", d: "A layer of neurons between the input and the output." },
    { t: "Forward pass", d: "Computing a network's output layer by layer from the input." },
    { t: "ReLU", d: "Rectified linear unit: ReLU(z) = max(0, z)." },
    { t: "Loss function", d: "A number measuring how wrong the predictions are, minimized during training." },
    { t: "Backpropagation", d: "Computing the gradient of the loss for every weight by propagating errors backward." },
    { t: "Epoch", d: "One complete pass through the training data." }
  ],
  algorithms: [
    {
      title: "Perceptron learning (Additional Material)",
      steps: [
        "Initialize weights and bias (e.g., all 0) and choose a learning rate α.",
        "For each training example, compute ŷ = step(w·x + b).",
        "Compute the error y − ŷ (it is −1, 0 or +1).",
        "Update every weight wᵢ ← wᵢ + α(y − ŷ)xᵢ and the bias b ← b + α(y − ŷ).",
        "Repeat over the data (epochs) until an epoch has no errors or a limit is reached."
      ],
      code:
        "import numpy as np\n\nX = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])\ny = np.array([0, 0, 0, 1])          # logical AND\nw = np.zeros(2); b = 0.0; alpha = 0.1\n\nfor epoch in range(10):\n    errors = 0\n    for xi, target in zip(X, y):\n        pred = 1 if xi @ w + b &gt; 0 else 0\n        update = alpha * (target - pred)\n        w += update * xi\n        b += update\n        errors += int(update != 0)\n    print(epoch, w, round(b, 2), errors)\n    if errors == 0:\n        break"
    },
    {
      title: "Training a neural network (Additional Material)",
      steps: [
        "Initialize the weights with small random values.",
        "Forward pass: compute predictions for a batch of examples.",
        "Compute the loss (e.g., MSE or cross-entropy).",
        "Backward pass: backpropagation computes the gradient of the loss for every weight.",
        "Update: w ← w − α·gradient (gradient descent, Week 3).",
        "Repeat for many batches and epochs; stop when validation performance stops improving."
      ],
      code:
        "# scikit-learn (listed in the syllabus) provides a ready multilayer perceptron\nfrom sklearn.neural_network import MLPClassifier\nfrom sklearn.metrics import classification_report\n\nmodel = MLPClassifier(hidden_layer_sizes=(16,), activation='relu',\n                      max_iter=1000, random_state=42)\nmodel.fit(X_train, y_train)\nprint(classification_report(y_test, model.predict(X_test)))"
    }
  ],
  formulas: [
    { name: "Neuron output", f: "ŷ = g( Σ<sub>i</sub> wᵢxᵢ + b ) = g(w·x + b)", note: "g = activation function. Additional Material." },
    { name: "Perceptron step activation", f: "step(z) = 1 if z &gt; 0, otherwise 0", note: "Additional Material." },
    { name: "Perceptron learning rule", f: "wᵢ ← wᵢ + α(y − ŷ)xᵢ, &nbsp; b ← b + α(y − ŷ)", note: "Weights change only when the prediction is wrong. Additional Material." },
    { name: "Common activations", f: "σ(z) = 1/(1+e<sup>−z</sup>) &nbsp;·&nbsp; ReLU(z) = max(0, z)", note: "The sigmoid appears in the Week 8 lecture; ReLU is Additional Material." },
    { name: "Gradient-descent weight update", f: "w ← w − α ∇L(w)", note: "Same rule as Week 3, applied to the loss L. Backpropagation supplies ∇L." }
  ],
  example: {
    title: "Practical example: a perceptron learns AND by hand",
    html:
      "<p class='am-inline'>Additional Material</p>" +
      "<p>Start with w = (0, 0), b = 0, α = 0.1. Data: (0,0)→0, (0,1)→0, (1,0)→0, (1,1)→1.</p>" +
      "<ol><li>(0,0): z = 0 → ŷ = 0 (step(0) = 0), y = 0 → correct, no change.</li><li>(0,1) and (1,0): z = 0 → ŷ = 0 → correct.</li><li>(1,1): z = 0 → ŷ = 0, but y = 1 → error +1 → w = (0.1, 0.1), b = 0.1.</li><li>Epoch 2 now makes mistakes on the other points, which push b down and w up.</li></ol>" +
      "<p>The epochs continue in the same way. After six epochs (checked with exact arithmetic) the perceptron reaches w = (0.2, 0.1), b = −0.2, which classify all four inputs correctly — a line that separates (1,1) from the other three points. Try it in the interactive diagram, and then try XOR to see the perceptron fail.</p>"
  },
  application: {
    title: "Real-world application: neural networks in practice",
    html:
      "<p class='am-inline'>Additional Material</p>" +
      "<p>Neural networks power image recognition (medical scans, quality inspection on production lines), speech recognition, translation and recommendation systems. In Physical AI they process camera and lidar data for robots and vehicles (the perception stage of the Week 1 self-driving pipeline), and in Deep RL (Week 5) they approximate Q-functions and policies when tables are too large.</p>"
  },
  diagram: {
    title: "Interactive: train a perceptron on AND, OR or XOR",
    widget: "perceptron",
    caption: "Choose a dataset and press Train step or Train epoch. The plot shows the four points and the current decision line w₁x₁ + w₂x₂ + b = 0. AND and OR are learned in a few epochs; XOR never converges because it is not linearly separable."
  },
  keyIdea:
    "A neuron is a weighted sum plus an activation — the same building block as logistic regression. One perceptron can only draw a straight line, so it cannot learn XOR; layers of nonlinear neurons trained by gradient descent and backpropagation can learn complex representations.",
  quiz: [
    { q: "A perceptron with w = (1, 1), b = −1.5 and a step activation receives x = (1, 1). Its output is…", o: ["0", "1", "0.5", "−1.5"], a: 1, e: "z = 1 + 1 − 1.5 = 0.5 &gt; 0, so the step function outputs 1. (This perceptron computes AND.)" },
    { q: "In the perceptron rule, when do the weights change?", o: ["After every example", "Only when the prediction is wrong", "Only at the end of training", "Never"], a: 1, e: "If y = ŷ, the update α(y − ŷ)x is zero." },
    { q: "Why can a single perceptron not learn XOR?", o: ["XOR has too many inputs", "XOR is not linearly separable", "The learning rate is too small", "XOR needs negative inputs"], a: 1, e: "No single straight line separates XOR's positive and negative points; a hidden layer is needed." },
    { q: "Which earlier course method is used to update a network's weights?", o: ["Alpha–Beta pruning", "Gradient descent (Week 3)", "Viterbi (Week 7)", "Rejection sampling (Week 6)"], a: 1, e: "w ← w − α∇L(w); backpropagation computes the gradient." },
    { q: "A neuron with a sigmoid activation is equivalent to…", o: ["K-Means", "a decision tree", "logistic regression", "UCS"], a: 2, e: "σ(wᵀx + b) is exactly the logistic regression model from Week 8." }
  ],
  check: [
    { q: "Why do hidden layers need nonlinear activation functions?", a: "A composition of linear functions is still linear, so without nonlinearity the whole network would be equivalent to one linear model and could not learn patterns like XOR." },
    { q: "What does backpropagation compute, and what uses its result?", a: "It computes the gradient of the loss with respect to every weight. Gradient descent then uses those gradients to update the weights." },
    { q: "How would you check whether a trained network is overfitting?", a: "Compare performance on the training set with a held-out validation/test set. Much better training performance than validation performance signals overfitting." }
  ],
  connect: {
    prev: "Week 8 introduced supervised learning, logistic regression and evaluation. Week 9 showed that a neuron generalizes logistic regression and that layers of neurons learn representations.",
    next: "Scale neural networks up to billions of weights, train them on huge amounts of text, and you get large language models. Week 10 explores generative AI — and the safety and ethical questions it raises."
  },
  additional: [
    {
      title: "Sources for this chapter (Additional Material)",
      html: "<p>Because the Week 9 slides were not available, every explanation in this chapter is based on the following reliable sources.</p>",
      src: [
        { label: "Russell & Norvig, Artificial Intelligence: A Modern Approach (course textbook) — chapters on deep learning / neural networks", url: "https://aima.cs.berkeley.edu/" },
        { label: "Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization in the brain. Psychological Review 65(6).", url: "https://doi.org/10.1037/h0042519" },
        { label: "Rumelhart, Hinton & Williams (1986). Learning representations by back-propagating errors. Nature 323.", url: "https://doi.org/10.1038/323533a0" },
        { label: "Goodfellow, Bengio & Courville (2016). Deep Learning. MIT Press (free online).", url: "https://www.deeplearningbook.org/" },
        { label: "scikit-learn User Guide — Neural network models (supervised)", url: "https://scikit-learn.org/stable/modules/neural_networks_supervised.html" }
      ]
    }
  ]
});

/* ------------------------------------------------------------------ */
/* WEEK 10 — LLMs, generative AI and AI safety (Additional Material)    */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-10",
  week: 10,
  station: "Station 10 · The Frontier",
  title: "LLMs, Generative AI and AI Safety",
  subtitle: "Generating new content — and keeping AI trustworthy",
  source: "Syllabus Week 10 topic and course AI-use policy (lecture slides not supplied) — explanations are Additional Material",
  sourceWarning:
    "The Week 10 lecture slides were not among the materials supplied for this book. This chapter covers the syllabus topic \"LLMs, generative AI, AI safety and Final Project\" and the course outcome RO4 (\"critically assess generative AI capabilities, limitations, safety, ethics and applicability to Physical AI tasks\"). Explanations of LLMs and generative AI are Additional Material with sources listed below. The AI-use rules are taken from the course syllabus (Section 8 and the AI Use Declaration Form); the safety lessons from earlier weeks are taken from the lecture slides.",
  story:
    "At the last station, Qai meets machines that do not just classify or decide — they <em>create</em>: essays, code, images, answers to any question. Qai is impressed, but by now it is also wise. It remembers every lesson of the journey: models can be miscalibrated, rewards can be misspecified, data can shift. Power without responsibility is not intelligence.",
  objectives: [
    "Explain what generative AI is and how it differs from the predictive models of Week 8.",
    "Describe how a large language model generates text one token at a time.",
    "Name the main training stages of an LLM: pretraining, fine-tuning and learning from human feedback.",
    "Explain the effect of sampling temperature on generated text.",
    "Critically assess LLM limitations: hallucination, bias, outdated knowledge and privacy.",
    "Connect AI-safety principles to lessons from Weeks 5–8 and apply the course AI-use policy."
  ],
  sections: [
    {
      h: "What is generative AI?",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>The classifiers of Week 8 map an input to a label or a number. <strong>Generative models</strong> learn the patterns of their training data well enough to produce <em>new</em> examples of it: text, images, audio, code. A <strong>large language model (LLM)</strong> is a very large neural network (Week 9) trained on enormous amounts of text to predict the next piece of text.</p>"
    },
    {
      h: "How an LLM generates text",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>Text is split into <strong>tokens</strong> — words or pieces of words. Given the tokens so far (the <em>context</em>), the model outputs a probability distribution over the next token: P(next token | previous tokens). One token is chosen, appended, and the process repeats. Writing an essay is thousands of these steps. This is a probabilistic model — the language of Week 6 — applied to sequences, as in Week 7.</p>" +
        "<p>Most modern LLMs use the <strong>Transformer</strong> architecture (Vaswani et al., 2017), whose key component, <em>attention</em>, lets every token weigh how relevant every other token in the context is. This is what lets the model connect a pronoun to a name many sentences earlier.</p>" +
        "<p><strong>Sampling temperature</strong> controls randomness: low temperature makes the most likely token dominate (focused, repetitive text); high temperature flattens the distribution (more varied, more error-prone text). The word mirrors the temperature in simulated annealing (Week 3): higher T means more exploration.</p>"
    },
    {
      h: "How LLMs are trained",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<ol><li><strong>Pretraining:</strong> predict the next token on a huge text collection. The loss is minimized with gradient descent and backpropagation (Weeks 3 and 9). This is self-supervised: the \"label\" is simply the next token in the text.</li><li><strong>Fine-tuning:</strong> continue training on smaller, curated datasets of instructions and good answers.</li><li><strong>Learning from human feedback (RLHF):</strong> people rank model answers; a reward model learns those preferences, and reinforcement learning (Week 5) adjusts the LLM to produce preferred answers.</li></ol>" +
        "<p>Users then steer the model with <strong>prompts</strong>. Clear instructions, context and examples usually improve results — but never guarantee correctness.</p>"
    },
    {
      h: "Capabilities and limitations",
      html:
        "<p class='am-inline'>Additional Material</p>" +
        "<p>LLMs can summarize, translate, explain, draft and write code. But they have well-documented limitations:</p>" +
        "<ul><li><strong>Hallucination:</strong> fluent, confident text that is false — invented facts, references or code functions. The model optimizes plausible continuations, not truth.</li><li><strong>Bias:</strong> patterns in training data, including social biases, can be reproduced.</li><li><strong>Knowledge cut-off:</strong> the model knows only what was in its training data, which may be outdated.</li><li><strong>Calibration:</strong> confidence in the wording does not equal probability of being right (compare calibration in Week 8).</li><li><strong>Privacy and security:</strong> anything typed into an external AI service may leave your control.</li></ul>"
    },
    {
      h: "AI safety: lessons from the whole course",
      html:
        "<p>Many safety principles already appeared in the lecture slides:</p>" +
        "<ul><li><strong>Reward misspecification</strong> (Week 5): an agent can optimize the number but not the real objective. Hard safety constraints should be encoded separately from reward, and systems need human override.</li><li><strong>Simulate before deploying</strong> (Week 5): training directly on physical equipment can be unsafe; use simulators and offline data, then deploy cautiously.</li><li><strong>Unverified models</strong> (Week 6): CPTs may be estimated from biased data, and arrows are not proven causal links — document assumptions and validate.</li><li><strong>Overfitting, leakage, distribution shift, calibration error</strong> (Week 8): a model that looked good on test data may fail in new conditions.</li><li><strong>Prediction ≠ decision</strong> (Week 8): actions should depend on consequences, and the feasible action set can be restricted by safety rules.</li></ul>" +
        "<p class='am-inline'>Additional Material</p>" +
        "<p>Frameworks such as the NIST AI Risk Management Framework organize this into an ongoing cycle — <em>govern, map, measure, manage</em> — and describe trustworthy AI as valid and reliable, safe, secure, accountable and transparent, explainable, privacy-enhanced and fair. <strong>Alignment</strong> research studies how to make AI systems pursue the goals their designers and users actually intend.</p>"
    },
    {
      h: "Responsible use of generative AI in this course",
      html:
        "<p>The course syllabus (Section 8) sets clear rules, which this book itself follows:</p>" +
        "<ul><li>GenAI use is regulated per assignment; if no level is specified, level A1 applies by default.</li><li>Any substantive AI use must be declared: <em>tool/model, purpose, key prompts, contribution received and verification method</em>.</li><li>The student remains fully responsible for accuracy, originality, references, data security and copyright.</li><li>Undeclared substantive AI use, AI-generated material where prohibited, fabricated sources or results, and uploading personal or confidential data to external AI services are academic-integrity violations.</li></ul>" +
        "<p>See this book's own <a href='#disclosure'>AI Use Disclosure</a> for an example.</p>"
    }
  ],
  terms: [
    { t: "Generative AI", d: "AI that produces new content (text, images, audio, code) resembling its training data." },
    { t: "Large language model (LLM)", d: "A very large neural network trained on text to predict the next token." },
    { t: "Token", d: "A unit of text (a word or part of a word) that an LLM reads and generates." },
    { t: "Context", d: "The tokens the model conditions on when predicting the next one." },
    { t: "Transformer", d: "A neural-network architecture built around attention; the basis of most LLMs." },
    { t: "Attention", d: "A mechanism that weighs how relevant each token is to every other token." },
    { t: "Sampling temperature", d: "A setting that makes generation more deterministic (low) or more random (high)." },
    { t: "Pretraining", d: "Training on huge unlabeled text to predict the next token." },
    { t: "Fine-tuning", d: "Further training on a smaller, task-specific dataset." },
    { t: "RLHF", d: "Reinforcement learning from human feedback: tuning a model toward answers people prefer." },
    { t: "Prompt", d: "The instructions and context a user gives to a generative model." },
    { t: "Hallucination", d: "Confident model output that is factually wrong or invented." },
    { t: "Alignment", d: "Making AI systems pursue the goals their designers and users actually intend." }
  ],
  algorithms: [
    {
      title: "Next-token generation loop (Additional Material)",
      steps: [
        "Split the prompt into tokens; this is the context.",
        "Run the model to get P(next token | context) for every token in the vocabulary.",
        "Adjust the distribution with the temperature (divide the scores by T before normalizing).",
        "Sample (or pick) one token and append it to the context.",
        "Repeat until an end token or a length limit is reached."
      ]
    },
    {
      title: "Verifying AI-assisted work (course AI-use policy)",
      steps: [
        "Record the tool/model, date and purpose of use.",
        "Keep the key prompts.",
        "Check every fact, formula and number against a primary source (for this course: the lecture slides).",
        "Run any generated code and test edge cases.",
        "Check that every cited source exists and says what is claimed.",
        "Declare the contribution and take responsibility for the final result."
      ]
    }
  ],
  formulas: [
    { name: "Language-model factorization", f: "P(w₁, …, wₙ) = ∏<sub>t</sub> P(w<sub>t</sub> | w₁, …, w<sub>t−1</sub>)", note: "A text's probability as a product of next-token probabilities (chain rule of probability). Additional Material." },
    { name: "Temperature-scaled softmax", f: "P(token i) = e<sup>zᵢ / T</sup> / Σ<sub>j</sub> e<sup>zⱼ / T</sup>", note: "zᵢ = the model's score for token i. Low T sharpens, high T flattens. Additional Material." }
  ],
  example: {
    title: "Practical example: one next-token step",
    html:
      "<p class='am-inline'>Additional Material (illustrative numbers)</p>" +
      "<p>Context: <em>\"The robot picked up the …\"</em>. Suppose a model assigns: <strong>box</strong> 0.45, <strong>cup</strong> 0.25, <strong>tool</strong> 0.20, <strong>sky</strong> 0.10. With low temperature it almost always says \"box\". With high temperature the four options become more equal, so even \"sky\" — an odd continuation — appears more often. Try it in the interactive diagram.</p>" +
      "<p>Notice that nothing in this process checks whether the sentence is <em>true</em>. That is the root of hallucination, and the reason verification is the user's job.</p>"
  },
  application: {
    title: "Real-world application: generative AI in Physical AI",
    html:
      "<p class='am-inline'>Additional Material</p>" +
      "<p>Generative models are increasingly used to let people instruct robots in natural language, to generate code for data analysis, to create synthetic training data for perception systems, and to summarize maintenance logs. In every case the course's lessons apply: keep hard safety constraints outside the model, validate in simulation, monitor for distribution shift, and keep a human able to override.</p>"
  },
  diagram: {
    title: "Interactive: next-token sampling and temperature",
    widget: "tokens",
    caption: "Move the temperature slider to reshape the next-token distribution, then sample 100 continuations. Illustrative probabilities, not output from a real model."
  },
  keyIdea:
    "Large language models generate text by repeatedly predicting a probability distribution over the next token — a giant neural network trained with the same gradient-descent and reinforcement-learning ideas from earlier weeks. They are powerful but can be confidently wrong, so safe use requires constraints, validation, human oversight and honest disclosure.",
  quiz: [
    { q: "What does an LLM produce at each generation step?", o: ["A complete answer at once", "A probability distribution over the next token", "A decision tree", "A cluster label"], a: 1, e: "It outputs P(next token | context), picks one token and repeats." },
    { q: "Raising the sampling temperature makes generated text…", o: ["more deterministic", "more varied and random", "always factually correct", "shorter"], a: 1, e: "High temperature flattens the distribution, so less likely tokens are chosen more often." },
    { q: "Which course method is used in RLHF to adjust a model toward preferred answers?", o: ["Alpha–Beta pruning", "Reinforcement learning (Week 5)", "K-Means (Week 8)", "Viterbi (Week 7)"], a: 1, e: "A reward model learned from human rankings guides reinforcement learning." },
    { q: "An LLM confidently cites a paper that does not exist. This is called…", o: ["overfitting", "hallucination", "explaining away", "the horizon effect"], a: 1, e: "Hallucination: fluent but false output." },
    { q: "Under the course AI-use policy, what must a substantive AI-use declaration include?", o: ["Only the tool name", "Tool/model, purpose, key prompts, contribution received and verification method", "Nothing if the text is edited", "The AI's opinion of the work"], a: 1, e: "These five items are required by Section 8 of the syllabus." }
  ],
  check: [
    { q: "Why can't an LLM's fluent wording be taken as evidence that an answer is correct?", a: "The model is trained to produce plausible continuations, not verified facts. Fluency reflects language patterns; correctness must be checked against reliable sources." },
    { q: "Connect reward misspecification (Week 5) to generative AI safety.", a: "In RLHF the model optimizes a learned reward. If that reward captures 'sounds helpful' rather than 'is true and safe', the model can learn to please rather than to be right — the same failure as optimizing the number instead of the real objective." },
    { q: "Name two things you should never paste into an external AI service under the course policy.", a: "Personal data (e.g., other students' information) and confidential data (e.g., unpublished company or university data)." }
  ],
  connect: {
    prev: "Week 9 built neural networks. Week 10 scaled them up into large language models and looked back at the whole course to collect its safety lessons.",
    next: "This is the end of the ten-week journey. Continue to the final sections — AI in the Real World, Limitations and Risks, Ethics, the Glossary and the Final Quiz — to tie everything together."
  },
  additional: [
    {
      title: "Sources for this chapter (Additional Material)",
      html: "<p>Because the Week 10 slides were not available, the explanations of LLMs, generative AI and safety frameworks are based on these sources.</p>",
      src: [
        { label: "Vaswani et al. (2017). Attention Is All You Need. NeurIPS.", url: "https://arxiv.org/abs/1706.03762" },
        { label: "Ouyang et al. (2022). Training language models to follow instructions with human feedback.", url: "https://arxiv.org/abs/2203.02155" },
        { label: "Hugging Face LLM Course (listed in the syllabus as additional literature)", url: "https://huggingface.co/learn/llm-course" },
        { label: "NIST AI Risk Management Framework (AI RMF 1.0)", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
        { label: "UNESCO Recommendation on the Ethics of Artificial Intelligence", url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics" },
        { label: "Russell & Norvig, AIMA (course textbook) — chapters on natural language processing and the ethics of AI", url: "https://aima.cs.berkeley.edu/" }
      ]
    }
  ]
});
