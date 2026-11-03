/* =====================================================================
   Content file 3 of 3: book-level sections (timeline, comparison table,
   real-world AI, risks, ethics, final quiz, sources, AI disclosure,
   course map). The glossary is assembled automatically in script.js
   from every chapter's "terms" list.
   ===================================================================== */
window.BOOK = window.BOOK || { chapters: [] };

/* -------- Book metadata (edit team names here) -------------------- */
window.BOOK.meta = {
  title: "The Thinking Machine Atlas",
  subtitle: "A ten-station journey from \"What is AI?\" to neural networks, generative AI and responsible intelligence",
  course: "AI Fundamentals (AIF1303) · QAIRU · 2026–2027, Trimester 1",
  team: ["Mukhammedzhan Kuanysh"],
  description:
    "An interactive companion to the AI Fundamentals course. Travel with Qai, a curious apprentice agent, through ten stations — agents, search, optimization, games, decisions over time, probability, hidden states, machine learning, neural networks and generative AI. Every chapter explains the ideas in plain language, walks through the algorithms step by step, lets you experiment with live diagrams and ends with a quiz."
};

/* -------- AI timeline -------------------------------------------- */
/* "course: true" = the event is mentioned in the lecture slides.      */
window.BOOK.timeline = [
  { year: "1950", title: "Turing asks \"Can machines think?\"", text: "Alan Turing's paper \"Computing Machinery and Intelligence\" proposes the imitation game.", course: false, src: { label: "Turing (1950), Mind 59(236)", url: "https://doi.org/10.1093/mind/LIX.236.433" } },
  { year: "1956", title: "The Dartmouth workshop", text: "McCarthy, Minsky, Rochester and Shannon propose a summer study; the term \"artificial intelligence\" enters use.", course: false, src: { label: "Dartmouth proposal (1955), Stanford archive", url: "http://jmc.stanford.edu/articles/dartmouth/dartmouth.pdf" } },
  { year: "1958", title: "The perceptron", text: "Frank Rosenblatt publishes the perceptron, a learning artificial neuron (Week 9).", course: false, src: { label: "Rosenblatt (1958), Psychological Review", url: "https://doi.org/10.1037/h0042519" } },
  { year: "1967", title: "Viterbi algorithm", text: "Andrew Viterbi publishes the decoding algorithm later used for HMMs (Week 7).", course: false, src: { label: "Viterbi (1967), IEEE Trans. Information Theory", url: "https://doi.org/10.1109/TIT.1967.1054010" } },
  { year: "1968", title: "A* search", text: "Hart, Nilsson and Raphael publish A*, combining path cost and a heuristic (Week 2).", course: false, src: { label: "Hart, Nilsson & Raphael (1968), IEEE Trans. SSC", url: "https://doi.org/10.1109/TSSC.1968.300136" } },
  { year: "1983", title: "Simulated annealing", text: "Kirkpatrick, Gelatt and Vecchi introduce simulated annealing for optimization (Week 3).", course: false, src: { label: "Kirkpatrick et al. (1983), Science 220", url: "https://doi.org/10.1126/science.220.4598.671" } },
  { year: "1986", title: "Backpropagation popularized", text: "Rumelhart, Hinton and Williams show how to train multilayer networks (Week 9).", course: false, src: { label: "Rumelhart et al. (1986), Nature 323", url: "https://doi.org/10.1038/323533a0" } },
  { year: "1988", title: "Bayesian networks", text: "Judea Pearl's book on probabilistic reasoning establishes Bayesian networks (Week 6).", course: false, src: { label: "Pearl (1988), Probabilistic Reasoning in Intelligent Systems", url: "https://doi.org/10.1016/C2009-0-27609-4" } },
  { year: "1989–1992", title: "Q-learning", text: "Christopher Watkins introduces Q-learning; the convergence proof is published with Dayan in 1992 (Week 5).", course: false, src: { label: "Watkins & Dayan (1992), Machine Learning 8", url: "https://doi.org/10.1007/BF00992698" } },
  { year: "1997", title: "Deep Blue defeats Kasparov", text: "IBM's chess computer beats the world champion — a milestone named in the Week 4 lecture.", course: true, src: { label: "IBM History — Deep Blue", url: "https://www.ibm.com/history/deep-blue" } },
  { year: "2007", title: "Checkers is solved", text: "The Week 4 lecture notes that computer checkers progressed to a solved game; the proof was published in 2007 (the year is Additional Material).", course: true, src: { label: "Schaeffer et al. (2007), Science 317", url: "https://doi.org/10.1126/science.1144079" } },
  { year: "2015", title: "Deep Q-Networks", text: "DQN — Q-learning with a neural network, replay buffers and target networks, introduced in Week 5 — learns to play Atari games (year is Additional Material).", course: true, src: { label: "Mnih et al. (2015), Nature 518", url: "https://doi.org/10.1038/nature14236" } },
  { year: "2016", title: "AlphaGo", text: "The Week 4 lecture describes AlphaGo as combining tree search with learned evaluation; it defeated Lee Sedol in 2016 (year is Additional Material).", course: true, src: { label: "Silver et al. (2016), Nature 529", url: "https://doi.org/10.1038/nature16961" } },
  { year: "2017", title: "The Transformer", text: "\"Attention Is All You Need\" introduces the architecture behind most LLMs (Week 10).", course: false, src: { label: "Vaswani et al. (2017)", url: "https://arxiv.org/abs/1706.03762" } },
  { year: "2022", title: "Chat assistants go mainstream", text: "Instruction-tuned LLMs trained with human feedback become widely available to the public (Week 10).", course: false, src: { label: "Ouyang et al. (2022), InstructGPT", url: "https://arxiv.org/abs/2203.02155" } }
];

/* -------- Algorithm comparison table ------------------------------ */
window.BOOK.comparison = {
  columns: ["Algorithm", "Week", "Problem type", "Key data / idea", "Guarantee", "Main weakness"],
  rows: [
    ["Simple reflex agent", "1", "Act on current percept", "IF–THEN rules; first match wins", "Fast, interpretable", "Ignores history and future"],
    ["BFS", "2", "Path search", "FIFO queue; shallowest first", "Complete; optimal for equal step costs", "Large frontier; ignores costs"],
    ["DFS", "2", "Path search", "LIFO stack; deepest first", "Memory-light in tree search", "Not optimal; may return long paths"],
    ["Iterative deepening", "2", "Path search", "Depth-limited DFS with growing limit", "Prefers shallow solutions with DFS memory", "Repeats work"],
    ["UCS", "2", "Weighted path search", "Priority queue by g(n)", "Complete and optimal (positive costs)", "Explores in all directions"],
    ["A*", "2", "Weighted path search", "Priority queue by f = g + h", "Optimal with admissible h", "Needs a good heuristic; memory"],
    ["Hill climbing", "3", "Optimization", "Move to better neighbor", "Fast, constant memory", "Local maxima, plateaus, ridges"],
    ["Random-restart HC", "3", "Optimization", "Many starts, keep best", "Less dependent on start", "More computation"],
    ["Simulated annealing", "3", "Optimization", "Accept worse moves with e^(ΔE/T)", "Converges with slow enough cooling", "Schedule tuning"],
    ["Local beam search", "3", "Optimization", "Keep best K of pooled successors", "Shares information between candidates", "Candidates can crowd one region"],
    ["Genetic algorithm", "3", "Optimization", "Selection, crossover, mutation", "Explores with a population", "Many parameters; slow"],
    ["Gradient descent", "3, 9", "Continuous optimization", "x ← x − α∇f(x)", "Reaches a local minimum (suitable α)", "Step size; local minima"],
    ["Minimax", "4", "Two-player zero-sum games", "Back up max/min values", "Optimal vs. optimal opponent", "O(b^m) cost"],
    ["Alpha–Beta", "4", "Two-player zero-sum games", "Prune when α ≥ β", "Same value as Minimax", "Depends on move ordering"],
    ["Expectimax", "4", "Games with chance", "Chance nodes = expected value", "Optimal for the probability model", "Too optimistic vs. adversaries"],
    ["Value iteration", "5", "MDP, model known", "Repeated Bellman optimality backups", "Converges to optimal values", "Needs P and R; all states"],
    ["Policy iteration", "5", "MDP, model known", "Evaluate policy, then improve", "Converges to optimal policy", "Evaluation is costly"],
    ["Q-learning", "5", "RL, model unknown", "TD update with max Q(s′,a′)", "Learns optimal Q (off-policy)", "Tables don't scale"],
    ["SARSA", "5", "RL, model unknown", "TD update with actual next action", "Learns value of behavior (on-policy)", "Same scaling limits"],
    ["DQN", "5", "RL, large state spaces", "Neural network approximates Q", "Generalizes across states", "Needs stabilization tricks"],
    ["Enumeration / variable elimination", "6", "Bayesian network inference", "Sum out hidden variables, normalize", "Exact", "Can be exponential"],
    ["Rejection sampling / likelihood weighting / Gibbs", "6", "Approximate inference", "Count (weighted) samples", "Approach exact answer with many samples", "Rare evidence; uneven weights; slow mixing"],
    ["HMM filtering (forward)", "7", "Hidden state now", "Predict → correct → normalize (SUM)", "Exact posterior under model", "Needs correct T and O"],
    ["Viterbi", "7", "Best hidden path", "Dynamic programming with MAX", "Most probable full sequence", "One path only, no uncertainty"],
    ["Linear regression", "8", "Regression", "ŷ = wx + b, minimize MSE", "Simple, interpretable", "Only linear relations"],
    ["Logistic regression", "8", "Classification", "σ(wᵀx + b) + threshold", "Probability outputs", "Linear decision boundary"],
    ["Decision tree", "8", "Classification / regression", "Nested if–then splits", "Interpretable, nonlinear", "Overfits; high variance"],
    ["Random forest", "8", "Classification / regression", "Bootstrap + random features + vote", "Lower variance", "Less interpretable"],
    ["K-Means", "8", "Clustering (unsupervised)", "Assign to nearest centroid, update means", "Decreases J each step", "Needs K; scale-sensitive"],
    ["Perceptron *", "9", "Binary classification", "w ← w + α(y − ŷ)x", "Converges if linearly separable", "Cannot learn XOR"],
    ["Multilayer network *", "9", "Classification / regression", "Backpropagation + gradient descent", "Learns nonlinear representations", "Data-hungry; overfitting"],
    ["LLM *", "10", "Text generation", "Next-token prediction (Transformer)", "Fluent, general-purpose", "Hallucination, bias"]
  ],
  note: "Rows marked * are based on Additional Material, because the Week 9 and Week 10 lecture slides were not supplied."
};

/* -------- AI in the Real World ------------------------------------ */
window.BOOK.realWorld = [
  { icon: "route", title: "Navigation and logistics", weeks: "Weeks 2–3", text: "Route planners search road graphs with UCS/A*; courier tours and drone inspection routes are improved with local search (the Astana delivery and drone cases from Lecture 3)." },
  { icon: "calendar", title: "Scheduling", weeks: "Week 3", text: "University timetables are constraint problems: minimize instructor, room and student clashes plus idle gaps (Cost = 100T + 100R + 20S + 5W)." },
  { icon: "game", title: "Games", weeks: "Week 4", text: "Deep Blue, checkers programs and AlphaGo show how search, pruning and evaluation functions produce strategic play." },
  { icon: "battery", title: "Energy management", weeks: "Week 5", text: "A battery controller is an MDP: state = charge, price, demand, solar, hour; actions = charge, hold, discharge; reward = − cost − degradation." },
  { icon: "gear", title: "Predictive maintenance", weeks: "Weeks 5–8", text: "Bayesian updating (2 % → 15.52 % failure risk), HMM tracking of machine condition, classifiers for P(failure) and cost thresholds for the maintain-or-continue decision." },
  { icon: "medical", title: "Medical testing", weeks: "Week 6", text: "Bayes' theorem explains why a positive test for a rare disease (1 % prevalence) means only about 8.76 % probability of disease." },
  { icon: "robot", title: "Robotics and self-driving", weeks: "Weeks 1, 7", text: "Perceive → predict → plan → control; robot localization tracks a hidden position from noisy distance sensors." },
  { icon: "voice", title: "Speech and language", weeks: "Weeks 7, 10", text: "HMMs model hidden phonetic states behind acoustic features; large language models generate and translate text." },
  { icon: "cluster", title: "Customer segmentation", weeks: "Week 8", text: "K-Means groups customers by purchase frequency and spending — after scaling, and with people interpreting what each group means." },
  { icon: "edge", title: "Edge AI and smart cities", weeks: "Week 3", text: "Deciding whether camera tasks run on a Raspberry Pi, an edge server or the cloud balances latency, energy, cost and security risk." }
];

/* -------- AI Limitations and Risks -------------------------------- */
window.BOOK.risks = [
  { title: "Wrong problem formulation", week: "Weeks 1, 5", text: "If the performance measure or the state leaves out what matters (e.g., battery state without the electricity price), no algorithm can make up for it." },
  { title: "Combinatorial explosion", week: "Weeks 2, 4, 5", text: "Search trees grow as O(b^m); Q-tables reach millions of entries. Real systems need heuristics, pruning, depth limits and function approximation." },
  { title: "Local optima", week: "Week 3", text: "Greedy methods can get stuck on a local maximum, plateau or ridge and report a mediocre solution as final." },
  { title: "Wrong opponent model", week: "Week 4", text: "Assuming chance in an adversarial world is dangerously optimistic; assuming an adversary in a random world is needlessly pessimistic." },
  { title: "The horizon effect", week: "Week 4", text: "A depth-limited agent can walk into a disaster that lies just beyond what it searched." },
  { title: "Reward misspecification", week: "Week 5", text: "An agent can maximize the number while missing the real objective. Hard safety limits should be separate from the reward." },
  { title: "Base-rate neglect", week: "Week 6", text: "Confusing P(+|D) with P(D|+) makes rare events look far more likely than they are." },
  { title: "Biased or scarce data", week: "Weeks 6, 8", text: "CPTs and models estimated from biased data reproduce that bias; network arrows are not proof of causation." },
  { title: "Fixed model assumptions", week: "Week 7", text: "HMMs assume the Markov property and fixed probabilities; if the real system changes, estimates degrade." },
  { title: "Overfitting, leakage, distribution shift, miscalibration", week: "Week 8", text: "A model that looks excellent on old data can fail on new conditions or give untrustworthy probabilities." },
  { title: "Misleading accuracy", week: "Week 8", text: "With 2 % failures, 98 % accuracy can mean 0 % recall. Choose metrics that reflect the cost of errors." },
  { title: "Hallucination", week: "Week 10 *", text: "Generative models can produce confident, fluent, false statements and invented references." }
];

/* -------- Ethics and Responsible AI -------------------------------- */
window.BOOK.ethics = {
  intro:
    "The lectures repeatedly stress that technical correctness is not enough: AI systems act in the real world, and their designers are responsible for the consequences. The course syllabus also lists ethics and responsible AI use among its learning outcomes (RO4) and assessment criteria.",
  principles: [
    { title: "Safety first", text: "Encode hard operational limits separately from the reward; test rare and unsafe conditions; keep human override (Lecture 5)." },
    { title: "Honest uncertainty", text: "Report probabilities, not certainties. A high sensor reading or a positive test is evidence, not proof (Lectures 6–7)." },
    { title: "Decisions reflect consequences", text: "Thresholds should come from the real costs of errors, and the feasible action set can be restricted by safety rules (Lecture 8)." },
    { title: "Validate and document", text: "Document assumptions, validate on held-out data, update models as conditions change, check calibration (Lectures 6, 8)." },
    { title: "Fairness and representation", text: "Data that under-represent a group can produce worse decisions for that group; clusters and labels still need human interpretation (Lecture 8)." },
    { title: "Transparency and integrity", text: "Declare substantive AI use (tool, purpose, prompts, contribution, verification), never fabricate sources, and never upload personal or confidential data to external AI services (Syllabus §8–9)." }
  ],
  dilemmas: [
    { q: "A maintenance model reaches 98 % accuracy, and the factory wants to deploy it tomorrow. What should you ask first?", a: "What is its recall on the rare failures, is it calibrated, and was it tested on data from current operating conditions? High accuracy on an imbalanced dataset can hide a useless failure detector." },
    { q: "An RL energy controller saves money by cycling the battery very aggressively. Is this a success?", a: "Not necessarily: if degradation and safety limits were not in the reward or the constraints, the agent may be optimizing the number while damaging the equipment — reward misspecification." },
    { q: "A classmate pastes a confidential company dataset into a public chatbot to speed up an assignment. What rule is broken?", a: "The syllabus treats uploading personal or confidential data to external AI services as an academic-integrity violation, regardless of the time saved." }
  ],
  src: [
    { label: "NIST AI Risk Management Framework (Additional Material)", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
    { label: "UNESCO Recommendation on the Ethics of AI (Additional Material)", url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics" }
  ]
};

/* -------- Final quiz (2 questions per week) ----------------------- */
window.BOOK.finalQuiz = [
  { w: 1, q: "Which list is the PEAS description's four parts?", o: ["Plan, Execute, Assess, Store", "Performance, Environment, Actuators, Sensors", "Percepts, Errors, Actions, States", "Policy, Evaluation, Agents, Search"], a: 1, e: "PEAS specifies the task before any algorithm is chosen." },
  { w: 1, q: "Which agent keeps an internal state to remember what its sensors cannot currently show?", o: ["Simple reflex agent", "Model-based agent", "Random agent", "Table agent"], a: 1, e: "Model-based agents separate 'what I see' from 'what I know happened'." },
  { w: 2, q: "Which algorithm expands the frontier node with the smallest g(n) + h(n)?", o: ["BFS", "DFS", "UCS", "A*"], a: 3, e: "A* uses f = g + h." },
  { w: 2, q: "BFS is guaranteed optimal when…", o: ["edge costs differ", "all step costs are equal", "the heuristic is admissible", "the graph has cycles"], a: 1, e: "BFS finds the fewest actions, which is cheapest only when every step costs the same." },
  { w: 3, q: "What does simulated annealing do at high temperature?", o: ["Accepts only better moves", "Accepts worse moves fairly often, exploring widely", "Stops immediately", "Restarts from random states"], a: 1, e: "High T → many worse moves accepted; low T → nearly greedy." },
  { w: 3, q: "Gradient descent updates x by…", o: ["x ← x + α∇f(x)", "x ← x − α∇f(x)", "x ← f(x)", "x ← random neighbor"], a: 1, e: "Step opposite the gradient to decrease f." },
  { w: 4, q: "In Alpha–Beta, pruning happens when…", o: ["α ≥ β", "α = 0", "β = +∞", "the tree is shallow"], a: 0, e: "When α ≥ β, the remaining siblings cannot affect the decision." },
  { w: 4, q: "Expectimax replaces MIN nodes with…", o: ["MAX nodes", "chance nodes computing expected values", "leaf nodes", "heuristic nodes"], a: 1, e: "V(chance) = Σ P(s′)V(s′)." },
  { w: 5, q: "A reward of 100 arrives 10 steps from now with γ = 0.9. Its discounted value is about…", o: ["90", "34.87", "10.74", "0.10"], a: 1, e: "0.9¹⁰ × 100 ≈ 34.87." },
  { w: 5, q: "Which method learns from experience when the transition model is unknown?", o: ["Value iteration", "Policy iteration", "Q-learning", "Minimax"], a: 2, e: "Q-learning is model-free; value and policy iteration need P and R." },
  { w: 6, q: "In the sprinkler network, observing wet grass raises P(Rain) from 20 % to about…", o: ["80 %", "35.8 %", "8.76 %", "99 %"], a: 1, e: "Exact enumeration gives 0.16038 / 0.44838 ≈ 35.77 %." },
  { w: 6, q: "A full joint table over n binary variables has how many entries?", o: ["n", "2n", "2ⁿ", "n²"], a: 2, e: "That exponential size is why Bayesian networks factorize into local CPTs." },
  { w: 7, q: "Which HMM task answers 'What is the most likely complete sequence of hidden states?'", o: ["Filtering", "Prediction", "Smoothing", "Viterbi"], a: 3, e: "Viterbi uses MAX to recover one best path." },
  { w: 7, q: "In filtering, the correct order of operations is…", o: ["normalize → predict → correct", "predict → observe/correct → normalize", "correct → predict → backtrack", "sample → reject → count"], a: 1, e: "Predict with T, multiply by the emission likelihood, then normalize." },
  { w: 8, q: "Maintenance costs $2,000 and failure costs $20,000. Failure probability is 15 %. What should you do?", o: ["Continue: 15 % is low", "Maintain: expected failure cost $3,000 > $2,000", "Continue: maintenance is expensive", "It depends on accuracy"], a: 1, e: "0.15 × 20,000 = 3,000 > 2,000." },
  { w: 8, q: "Which metric measures how many real failures a model detects?", o: ["Precision", "Recall", "Accuracy", "MSE"], a: 1, e: "Recall = TP / (TP + FN)." },
  { w: 9, q: "Which dataset can a single perceptron NOT learn?", o: ["AND", "OR", "XOR", "NOT"], a: 2, e: "XOR is not linearly separable. (Additional Material topic.)" },
  { w: 9, q: "Backpropagation is used to…", o: ["prune game trees", "compute gradients of the loss for every weight", "sample Bayesian networks", "cluster data"], a: 1, e: "Gradient descent then uses those gradients. (Additional Material topic.)" },
  { w: 10, q: "Why must LLM outputs be verified?", o: ["They are always outdated", "They are generated as plausible continuations and can be confidently wrong (hallucination)", "They cannot write English", "They never use probabilities"], a: 1, e: "Fluency is not evidence of truth. (Additional Material topic.)" },
  { w: 10, q: "According to the course AI-use policy, who is responsible for the accuracy of AI-assisted work?", o: ["The AI tool", "The instructor", "The student", "Nobody"], a: 2, e: "Syllabus §8: the student remains fully responsible for accuracy, originality, references, data security and copyright." }
];

/* -------- Sources -------------------------------------------------- */
window.BOOK.sources = {
  primary: [
    "AI Fundamentals (AIF1303) Course Syllabus, QAIRU, 2026–2027 academic year.",
    "Lecture 1 — Introduction, Agents, and Environments (slides).",
    "Lecture 2 — Uninformed Search, A* Search & Heuristics (slides).",
    "Lecture 3 — Local Search Algorithms, including the case slides on routing, timetabling, drones, emergency routing, edge AI and medical-point placement.",
    "Lecture 4 — Adversarial Search & Game Trees (slides).",
    "Lecture 5 — Markov Decision Processes + Reinforcement Learning (slides).",
    "Lecture 6 — Probability & Bayesian Networks (slides).",
    "Lecture 7 — Hidden Markov Models (slides).",
    "Lecture 8 — Rational Decisions and Classical Machine Learning (slides).",
    "EndTerm Assignment: AI Fundamentals — Creative Project \"Create Your Own AI Book\"."
  ],
  textbook: [
    { label: "Russell, S. J., & Norvig, P. Artificial Intelligence: A Modern Approach. Pearson (course textbook).", url: "https://aima.cs.berkeley.edu/" },
    { label: "Zerilli, J. A Citizen's Guide to Artificial Intelligence (syllabus additional literature)." },
    { label: "Louwerse, M. M. Understanding Artificial Minds through Human Minds (syllabus additional literature)." },
    { label: "scikit-learn documentation (syllabus open web resource).", url: "https://scikit-learn.org/stable/" },
    { label: "Hugging Face LLM Course (syllabus open web resource).", url: "https://huggingface.co/learn/llm-course" }
  ],
  additional: [
    { label: "Goodfellow, Bengio & Courville (2016). Deep Learning. MIT Press.", url: "https://www.deeplearningbook.org/" },
    { label: "Rosenblatt (1958). The perceptron. Psychological Review 65(6).", url: "https://doi.org/10.1037/h0042519" },
    { label: "Rumelhart, Hinton & Williams (1986). Learning representations by back-propagating errors. Nature 323.", url: "https://doi.org/10.1038/323533a0" },
    { label: "Vaswani et al. (2017). Attention Is All You Need.", url: "https://arxiv.org/abs/1706.03762" },
    { label: "Ouyang et al. (2022). Training language models to follow instructions with human feedback.", url: "https://arxiv.org/abs/2203.02155" },
    { label: "NIST AI Risk Management Framework (AI RMF 1.0).", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
    { label: "UNESCO Recommendation on the Ethics of Artificial Intelligence.", url: "https://www.unesco.org/en/artificial-intelligence/recommendation-ethics" },
    { label: "scikit-learn User Guide — Naive Bayes.", url: "https://scikit-learn.org/stable/modules/naive_bayes.html" },
    { label: "scikit-learn User Guide — Neural network models (supervised).", url: "https://scikit-learn.org/stable/modules/neural_networks_supervised.html" },
    { label: "Timeline sources: original papers and archives linked in the AI Timeline section.", url: "#timeline" }
  ]
};

/* -------- AI use disclosure (follows the syllabus declaration form) */
window.BOOK.disclosure = {
  rows: [
    ["Assignment", "EndTerm Assignment — Creative Project \"Create Your Own AI Book\", AI Fundamentals (AIF1303)."],
    ["AI tool", "Claude (Anthropic), model Claude Opus 5.5, used through the Claude app on 30 October 2026."],
    ["Purpose of use", "Analyzing the uploaded lecture slides and syllabus; building a topic map and checking coverage; drafting plain-language explanations, worked examples, quizzes and the glossary; designing and coding the website (HTML, CSS, JavaScript), its interactive figures and the 45 Python lab programs."],
    ["Key prompts", "\"Using the uploaded lectures and syllabus as the required source, create a complete interactive website-book about AI for a reader with no prior knowledge; label any external information as Additional Material with a reliable source; include objectives, key concepts, algorithms, formulas, examples, diagrams, quizzes and the required extra sections; English only.\""],
    ["AI contribution", "First drafts of all text, quiz questions and code. Content for Weeks 9–10 was drafted from the syllabus topic list and the listed external sources, because those lecture slides were not supplied."],
    ["Result verification", "Every numerical example from the lectures (Bayes 8.76 %, sprinkler 35.77 %, maintenance 15.52 %, HMM 46.7 % / 72.3 % / 60.6 % / 67.7 %, Viterbi 0.0784, discount factors, Q-learning 6.6, Expectimax 10, sigmoid values, perceptron training) was recomputed in Python. Explanations were checked against the slides; external facts were tied to the sources listed. Every Python lab was executed and its real output stored in the book. Two slide inconsistencies were found and documented (see Course Map)."],
    ["Student statement", "We confirm that we are responsible for the final work and have accurately disclosed AI use."]
  ],
  libraries: "The book is plain HTML, CSS and JavaScript and runs offline by opening index.html. Two optional online extras: (1) Google Fonts (Source Serif 4, Caveat, JetBrains Mono); without internet the browser falls back to Georgia, a system handwriting font and the system monospace font. (2) Pyodide 0.26.4 from cdn.jsdelivr.net, loaded only when a reader presses Run in a Python lab; if it cannot load, the lab shows its saved output, which was produced by running the same code with Python 3, NumPy 2.5 and scikit-learn 1.9."
};

/* -------- Course map: week → topic → section; analysis notes ------- */
window.BOOK.courseMap = {
  rows: [
    ["1", "Introduction to AI: agents and environments", "Lecture 1", "Station 1 · The Gate of Agents", "Fully covered"],
    ["2", "Uninformed search, A* search and heuristics", "Lecture 2", "Station 2 · The Crossroads of Search", "Fully covered"],
    ["3", "Local search and constraint satisfaction", "Lecture 3", "Station 3 · The Hills of Optimization", "Covered; formal CSP definition added as Additional Material"],
    ["4", "Adversarial search and game trees", "Lecture 4", "Station 4 · The Arena of Games", "Fully covered"],
    ["5", "Markov decision processes and reinforcement learning", "Lecture 5", "Station 5 · The Shifting Grid", "Fully covered"],
    ["6", "Probability and Bayesian networks", "Lecture 6", "Station 6 · The Valley of Fog", "Fully covered"],
    ["7", "Hidden Markov models and sequential inference", "Lecture 7", "Station 7 · The Hidden Valley", "Fully covered"],
    ["8", "Rational decisions and classical machine learning", "Lecture 8", "Station 8 · The Workshop of Learning", "Covered; Naive Bayes added as Additional Material"],
    ["9", "Perceptrons and neural networks", "Syllabus only", "Station 9 · Network City", "Additional Material (slides not supplied)"],
    ["10", "LLMs, generative AI, AI safety and Final Project", "Syllabus only", "Station 10 · The Frontier", "Additional Material + syllabus AI policy"]
  ],
  findings: [
    "<strong>Missing lectures:</strong> slides for Weeks 9 and 10 were not among the supplied files. These chapters follow the syllabus topic list and are labeled Additional Material with sources.",
    "<strong>Week 3 — CSP:</strong> the syllabus title is \"Local search and constraint satisfaction\", but the lecture treats constraint satisfaction only through the timetable case (as a cost to minimize). The formal CSP definition (variables, domains, constraints) is added as Additional Material.",
    "<strong>Week 8 — Naive Bayes:</strong> listed in the syllabus schedule but not in the Week 8 slides. A short Additional Material box covers it.",
    "<strong>Week 5 — beyond the syllabus:</strong> the lecture goes further than the syllabus (\"value iteration and basic Q-learning\") by also covering policy iteration, SARSA, DQN, policy gradients and actor–critic. All are included.",
    "<strong>Week 2 — BFS trace:</strong> the slide's text states the solution \"A → C → F\", but for the slide's own graph (goal G, child of E) the BFS code returns A → B → E → G. The book uses the code's result and explains the difference.",
    "<strong>Week 2 — DFS slide:</strong> the DFS code example ends with result = bfs(graph, \"A\", \"G\"); it should call dfs. The book's DFS steps are written correctly.",
    "<strong>Assessment timing:</strong> the syllabus table lists Assignment 2 in Week 4, while the text says it is completed during Weeks 4–5. The EndTerm brief schedules the book defense in Week 9 and the exhibition in Week 10, while the syllabus lists the Final Project in Week 10. These timing details do not affect the book's content.",
    "<strong>Lecture 3 case slides</strong> are written in Kazakh; their content (Astana delivery TSP, timetable CSP, drone route, flood routing, edge-AI placement, medical-point placement) is translated and explained in English."
  ]
};
