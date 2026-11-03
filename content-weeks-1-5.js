/* =====================================================================
   AI FUNDAMENTALS — INTERACTIVE BOOK
   Content file 1 of 3: chapters for Weeks 1–5.
   Every chapter is a plain JavaScript object. script.js turns these
   objects into pages. Main source: the course lecture slides.
   Anything not taken from the lectures is placed in "additional"
   blocks and rendered with an "Additional Material" label + source link.
   ===================================================================== */
window.BOOK = window.BOOK || { chapters: [] };

/* ------------------------------------------------------------------ */
/* WEEK 1 — Introduction to AI: agents and environments                */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-1",
  week: 1,
  station: "Station 1 · The Gate of Agents",
  title: "Introduction to AI: Agents and Environments",
  subtitle: "What does it mean for a machine to act intelligently?",
  source: "Lecture 1 — Introduction, Agents, and Environments",
  story:
    "Our journey begins at a gate. Before Qai, our guide, can travel anywhere, it has to answer a simple question: <em>who am I, what can I sense, and what can I do?</em> In AI, every intelligent system starts with exactly this description. Qai is an <strong>agent</strong>, and the world it travels through is its <strong>environment</strong>.",
  objectives: [
    "Describe the agent–environment loop: observations go in, actions come out.",
    "Specify any AI task with the PEAS framework (Performance, Environment, Actuators, Sensors).",
    "Explain what a rational agent is and why rational does not mean all-knowing.",
    "Classify environments by observability, uncertainty, time structure, number of agents and action space.",
    "Compare four agent architectures: reflex, model-based, goal-based and utility-based.",
    "Read and modify a simple reflex agent written in Python."
  ],
  sections: [
    {
      h: "The agent–environment loop",
      html:
        "<p>An <strong>agent</strong> is anything that receives observations from its surroundings and chooses actions. The <strong>environment</strong> is everything outside the agent that affects what it observes or what its actions do. The two are connected by a repeating loop: the environment sends a <em>percept</em> (an observation) to the agent, the agent picks an <em>action</em>, the action changes the environment, and a new percept arrives.</p>" +
        "<p>One important detail: sensors provide <em>evidence</em>, not the whole truth. A camera sees only what is in front of it. That is why an agent often does not know the full state of the world it lives in.</p>"
    },
    {
      h: "PEAS: describe the job before choosing an algorithm",
      html:
        "<p>Before writing any code, AI engineers describe the task with four letters. PEAS turns a vague wish (\"make a smart car\") into an operational specification.</p>" +
        "<div class='table-wrap'><table><caption>PEAS descriptions from the lecture</caption><thead><tr><th scope='col'></th><th scope='col'>Self-driving car</th><th scope='col'>Pac-Man</th><th scope='col'>Chess</th></tr></thead><tbody>" +
        "<tr><th scope='row'>P — Performance</th><td>Safety, travel time, comfort</td><td>Score, survival, level completion</td><td>Win, avoid loss, position</td></tr>" +
        "<tr><th scope='row'>E — Environment</th><td>Roads, traffic, weather, pedestrians</td><td>Maze, ghosts, pellets, power-ups</td><td>Board, legal moves, opponent, clock</td></tr>" +
        "<tr><th scope='row'>A — Actuators</th><td>Steering, throttle, brakes</td><td>Move up / down / left / right</td><td>Choose a legal move</td></tr>" +
        "<tr><th scope='row'>S — Sensors</th><td>Cameras, radar, lidar, GPS</td><td>Grid position, visible maze, events</td><td>Board, move history, clock</td></tr>" +
        "</tbody></table></div>"
    },
    {
      h: "Rationality: the best choice you can justify",
      html:
        "<p>A <strong>rational agent</strong> chooses the action that is expected to maximize its performance measure, given what it has perceived so far and what it knows. Four ingredients go into every rational choice: the <em>performance measure</em> (what counts as success), the agent's <em>beliefs</em> (what it expects), the available <em>actions</em>, and the <em>evidence</em> it has observed.</p>" +
        "<p class='callout'><strong>Rational ≠ omniscient.</strong> An omniscient agent would know the real outcome of every action. A rational agent only makes the best <em>expected</em> choice with the information it has. A rational decision can still turn out badly — we will meet this idea again in Week 8.</p>"
    },
    {
      h: "Environment dimensions",
      html:
        "<p>Environments differ in ways that strongly affect how an agent should be built. The lecture uses six dimensions:</p>" +
        "<ul class='dim-list'>" +
        "<li><strong>Observability:</strong> <em>fully observable</em> (all relevant state is visible), <em>partially observable</em> (sensors show only a slice) or <em>unobservable</em>.</li>" +
        "<li><strong>Agents:</strong> <em>single-agent</em> or <em>multi-agent</em>.</li>" +
        "<li><strong>Uncertainty:</strong> <em>deterministic</em> (same state + action → same next state), <em>stochastic</em> (one action, several possible outcomes) or <em>strategic</em> (other agents change outcomes).</li>" +
        "<li><strong>Structure in time:</strong> <em>episodic</em> (decisions are mostly independent) or <em>sequential</em> (today's choice changes tomorrow's options).</li>" +
        "<li><strong>Timing:</strong> <em>static</em> or <em>dynamic</em> (the world changes while the agent is still thinking).</li>" +
        "<li><strong>Actions:</strong> <em>discrete</em> (a chess move, a Pac-Man direction), <em>continuous</em> (steering angle, throttle, torque) or <em>hybrid</em>.</li></ul>" +
        "<p>The lecture's three case studies summarize it: <strong>Pac-Man</strong> is sequential and dynamic, so planning ahead helps; <strong>self-driving</strong> is partially observable and dynamic, so it needs prediction and planning; <strong>chess</strong> is fully observable but strategic, so it needs search plus evaluation.</p>"
    },
    {
      h: "Four agent architectures",
      html:
        "<div class='arch-grid'>" +
        "<div class='arch'><span class='arch-tag'>Reflex</span><p>Acts only on the <em>current</em> percept using IF–THEN rules. Fast and easy to understand, but brittle when the right action depends on history or the future.</p></div>" +
        "<div class='arch'><span class='arch-tag'>Model-based</span><p>Keeps an <em>internal state</em> that remembers what the sensors cannot show right now. It separates \"what I see\" from \"what I know happened\".</p></div>" +
        "<div class='arch'><span class='arch-tag'>Goal-based</span><p>Reasons about possible <em>futures</em>: it searches or plans for a sequence of actions that reaches a goal.</p></div>" +
        "<div class='arch'><span class='arch-tag'>Utility-based</span><p>Goals are not always enough. A <em>utility</em> scale lets the agent trade off competing outcomes (fast vs. safe) and pick the action with the best expected value.</p></div>" +
        "</div><p>Moving from reflex → model → goal → utility gives richer decisions, but usually costs more computation and design effort.</p>"
    },
    {
      h: "From rules to search: formal problem components",
      html:
        "<p>When reflex rules are not enough, a goal-based agent needs an explicit problem structure. The lecture lists five components that will drive the next chapter:</p>" +
        "<ol><li><strong>Initial state</strong> — where the problem starts.</li><li><strong>Actions</strong> — the legal moves available.</li><li><strong>Transition model</strong> — the result of an action.</li><li><strong>Goal test</strong> — has the desired condition been reached?</li><li><strong>Path cost</strong> — how expensive the solution is.</li></ol>" +
        "<p>The lecture also previews two later ideas: <em>Markov decision processes</em> (states, actions, transition probabilities T(s′|s,a), rewards R(s,a,s′) and policies — Week 5) and <em>evaluation metrics</em> such as precision, recall and F1 (Week 8). Task performance (score, reward, safety, time) and model metrics answer different questions.</p>"
    }
  ],
  terms: [
    { t: "Agent", d: "A system that perceives its environment through sensors and acts on it through actuators." },
    { t: "Environment", d: "Everything outside the agent that affects its observations or the results of its actions." },
    { t: "Percept", d: "A single observation received by the agent at one moment." },
    { t: "PEAS", d: "Performance measure, Environment, Actuators, Sensors — a template for specifying an AI task." },
    { t: "Rational agent", d: "An agent that chooses the action with the best expected performance given its evidence." },
    { t: "Partially observable", d: "The sensors reveal only part of the relevant state of the world." },
    { t: "Stochastic", d: "The same action in the same state can lead to different outcomes." },
    { t: "Sequential", d: "Current decisions change future situations and options." },
    { t: "Reflex agent", d: "Maps the current percept directly to an action with condition–action rules." },
    { t: "Utility", d: "A number that expresses how desirable an outcome is, allowing trade-offs." }
  ],
  algorithms: [
    {
      title: "A practical agent-design workflow (from the lecture)",
      steps: [
        "<strong>PEAS</strong> — define success and the agent's interface to the world.",
        "<strong>Taxonomy</strong> — classify observability, uncertainty, time, number of agents and action space.",
        "<strong>Represent</strong> — decide on percepts, state, goals and utility.",
        "<strong>Architect</strong> — choose reflex, model-based, planning, utility-based or learning.",
        "<strong>Evaluate</strong> — test the behavior and explain the results."
      ]
    },
    {
      title: "How a simple reflex agent decides",
      steps: [
        "Read the current percepts (e.g., temperature and CO₂).",
        "Check the first rule. If its condition is true, return its action and stop.",
        "Otherwise check the next rule (elif) — and so on.",
        "If no rule matches, return the default action (else).",
        "Important: when two conditions are true at once, <em>the first matching rule wins</em>, so rule order is part of the design."
      ],
      code:
        "def office_agent(temperature, co2, people):\n    if people == 0:\n        return \"Energy-saving mode\"\n    elif temperature &lt; 20:\n        return \"Heating ON\"\n    elif temperature &gt; 26:\n        return \"Cooling ON\"\n    elif co2 &gt; 1000:\n        return \"Fresh-air fan ON\"\n    else:\n        return \"No action\"\n\nprint(office_agent(23, 1200, 0))   # Energy-saving mode\nprint(office_agent(23, 1200, 8))   # Fresh-air fan ON"
    }
  ],
  formulas: [
    { name: "Rational action (general idea)", f: "a* = argmax<sub>a</sub> E[ performance | a, evidence ]", note: "Pick the action whose <em>expected</em> performance is highest given what has been observed. This formula is written out explicitly in Week 8 as a* = argmax<sub>a</sub> E[U | a, e]." },
    { name: "MDP preview (used in Week 5)", f: "T(s′ | s, a) &nbsp;and&nbsp; R(s, a, s′)", note: "Transition probability of reaching s′ from s with action a, and the reward received for that transition." }
  ],
  example: {
    title: "Practical example: a greenhouse reflex agent",
    html:
      "<p>The lecture's practical builds <code>greenhouse_agent(temperature, humidity)</code>: Heater ON below 18 °C, Fan ON above 28 °C, Dehumidifier ON if humidity is above 80 %, otherwise no action.</p>" +
      "<ul><li>Input (17 °C, 50 %) → <strong>Heater ON</strong>.</li><li>Input (24 °C, 85 %) → <strong>Dehumidifier ON</strong>.</li><li>Input (30 °C, 85 %) → <strong>Fan ON</strong> — both the temperature rule and the humidity rule are true, but the temperature rule is checked first, so it wins.</li></ul>" +
      "<p>Try the same logic with the smart-office simulator in the diagram below.</p>"
  },
  application: {
    title: "Real-world application: a self-driving pipeline",
    html:
      "<p>In a self-driving car, perception is only the beginning. The lecture describes four interacting stages: <strong>perceive</strong> objects, lanes and signals → <strong>predict</strong> what nearby road users may do → <strong>plan</strong> a safe, useful trajectory → <strong>control</strong> steering and braking. Even though it looks like a pipeline, feedback loops run underneath: every new percept updates the plan.</p>"
  },
  diagram: {
    title: "Interactive: the agent loop and a smart-office reflex agent",
    widget: "reflexAgent",
    caption: "Move the sliders to change the percepts. The highlighted rule shows which branch fires. Notice how the order of the rules decides the action when several conditions are true."
  },
  keyIdea:
    "Intelligent behavior is an agent–environment story. PEAS defines the task, the environment's properties shape the architecture, and rationality means the best expected choice from the evidence available — not perfect knowledge.",
  quiz: [
    { q: "In PEAS, what does the letter A stand for?", o: ["Algorithms", "Actuators", "Accuracy", "Agents"], a: 1, e: "A = Actuators: the parts the agent uses to act on the world, such as steering, brakes or a Pac-Man move." },
    { q: "A rational agent is best described as one that…", o: ["always gets the best real outcome", "knows the future", "chooses the action with the best expected performance given its evidence", "follows the fewest possible rules"], a: 2, e: "Rationality is decision quality under limited information. It is not omniscience, so a rational choice can still have a bad outcome." },
    { q: "A self-driving car's environment is best classified as…", o: ["fully observable and static", "partially observable and dynamic", "episodic and deterministic", "unobservable and static"], a: 1, e: "Sensors see only part of the scene, and traffic keeps changing while the car decides — partially observable and dynamic." },
    { q: "In the office agent, temperature = 19 and people = 6. Rules are checked in the order: temperature &lt; 20 → Heating ON, then people &gt; 0 → Lights ON. What happens?", o: ["Lights ON", "Heating ON", "Both actions", "No action"], a: 1, e: "With if/elif, the first matching branch wins. Reordering the rules would change the behavior." },
    { q: "Which architecture can trade off competing outcomes such as speed versus safety?", o: ["Simple reflex agent", "Model-based reflex agent", "Utility-based agent", "Random agent"], a: 2, e: "A utility scale lets the agent compare and balance different outcomes, which a pure goal test cannot do." }
  ],
  check: [
    { q: "Write a PEAS description for a robot vacuum cleaner.", a: "P: area cleaned, time, energy used, no collisions. E: rooms, floor types, furniture, people, pets. A: wheels, brushes, suction motor. S: bump sensors, cliff sensors, camera or lidar, battery sensor. (Any sensible answer that separates the four parts is correct.)" },
    { q: "Why is chess called fully observable but still difficult?", a: "The whole board is visible, but the opponent is a strategic decision-maker. The difficulty comes from anticipating the opponent's best replies, not from hidden information." },
    { q: "Why might a reflex agent fail in Pac-Man?", a: "A good move depends on what happens after it: escape routes, ghost positions and power-up timing. Reacting only to the current percept ignores those future consequences." }
  ],
  connect: {
    prev: "This is the start of the journey: we defined the vocabulary — agent, environment, percept, action and rationality — that every later chapter uses.",
    next: "A goal-based agent needs to plan. In Week 2 we turn the five problem components (initial state, actions, transitions, goal test, path cost) into search algorithms: BFS, DFS, UCS and A*."
  },
  additional: []
});

/* ------------------------------------------------------------------ */
/* WEEK 2 — Uninformed search, A* and heuristics                       */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-2",
  week: 2,
  station: "Station 2 · The Crossroads of Search",
  title: "Uninformed Search, A* Search and Heuristics",
  subtitle: "From search trees and frontiers to a working route planner",
  source: "Lecture 2 — Uninformed Search, A* Search & Heuristics",
  story:
    "Qai now stands at a crossroads with a map of Kazakhstan. The goal: travel from <strong>Astana</strong> to <strong>Almaty</strong>. There are many roads, and every road has a cost. Qai is now a <em>planning agent</em> — it asks \"What if I take this action?\" before moving at all.",
  objectives: [
    "Model a problem with states, actions, successors, a start state, a goal test and costs.",
    "Explain the difference between a state-space graph and a search tree.",
    "Trace and implement BFS, DFS, UCS and A*.",
    "Explain g(n), h(n) and f(n) = g(n) + h(n).",
    "Define an admissible heuristic and explain why it makes A* optimal.",
    "Measure and compare how much each algorithm explores."
  ],
  sections: [
    {
      h: "What is a search problem?",
      html:
        "<p>A <strong>search problem</strong> has four parts: a <em>state space</em>, a <em>successor function</em> (actions with their costs), a <em>start state</em> and a <em>goal test</em>. A <strong>solution</strong> is a sequence of actions that turns the start state into a goal state.</p>" +
        "<p><strong>Example from the lecture:</strong> states = cities; successors = roads to adjacent cities with cost = distance; start = Astana; goal test = \"is the state Almaty?\"</p>" +
        "<p>A search <em>state</em> is an <strong>abstraction</strong>: the real world contains every detail, but the search state keeps only what planning needs. For path-finding on a grid, the state is just the (x, y) location, the actions are N, S, E, W, and the successor function only updates the location.</p>" +
        "<p>Search is everywhere: map routes, Pac-Man finding food, robot navigation, puzzle solving, game AI, scheduling and network routing.</p>"
    },
    {
      h: "State-space graphs and search trees",
      html:
        "<p>A <strong>state-space graph</strong> is a mathematical picture of the problem: nodes are world configurations, arcs are action results, and each state appears <em>only once</em>. It is usually far too big to build in memory, but it is a useful idea.</p>" +
        "<p>A <strong>search tree</strong> is a \"what-if\" tree of plans. The start state is the root, and children are successors. Each node in the tree stands for a whole <em>path</em> (a plan) in the graph — so the same state can appear many times in the tree.</p>" +
        "<p>The algorithm keeps a <strong>frontier</strong> (also called the fringe): the partial plans waiting to be explored. Taking a node from the frontier and adding its children is called <em>expansion</em>. The main question of every search algorithm is: <strong>which frontier node do we expand next?</strong></p>" +
        "<div class='strategy-row'><span><b>DFS</b> → deepest</span><span><b>BFS</b> → shallowest</span><span><b>UCS</b> → lowest g(n)</span><span><b>A*</b> → lowest g(n) + h(n)</span></div>"
    },
    {
      h: "Uninformed search: BFS, DFS and iterative deepening",
      html:
        "<p><strong>Breadth-First Search (BFS)</strong> explores everything at the current depth before going deeper. Its frontier is a <em>FIFO queue</em> (first in, first out). It is complete under standard finite assumptions and finds the path with the <em>fewest actions</em> — which is optimal only when every step costs the same. Its weaknesses are a large frontier and ignoring different costs.</p>" +
        "<p><strong>Depth-First Search (DFS)</strong> goes as deep as possible, hits a dead end, backs up and tries another branch. Its frontier is a <em>LIFO stack</em> (last in, first out). It can save memory, but it is not generally optimal and may return a long solution. A <code>visited</code> set prevents repeatedly exploring the same states. The only code change from BFS: BFS uses <code>popleft()</code>, DFS uses <code>pop()</code>.</p>" +
        "<p><strong>Iterative deepening</strong> runs depth-limited DFS with limit 1, then 2, then 3… It combines DFS-like memory use with BFS-like preference for shallow solutions. Some work is repeated, but most of the work is at the deepest level.</p>"
    },
    {
      h: "When costs differ: Uniform-Cost Search (UCS)",
      html:
        "<p>Consider A→B (cost 2), A→C (8), B→F (10), C→F (1). Both routes to F use two actions, so BFS sees them as equal. But the total costs differ: A-B-F = 12, A-C-F = <strong>9</strong>. UCS finds the cheaper one.</p>" +
        "<p><strong>UCS</strong> always expands the frontier node with the smallest <strong>g(n)</strong> — the exact cost from the start to n. Its frontier is a <em>priority queue</em> (Python's <code>heapq</code>: <code>heappush</code> inserts, <code>heappop</code> removes the smallest). Under standard positive-cost assumptions, UCS is complete and optimal.</p>"
    },
    {
      h: "Informed search: A* and heuristics",
      html:
        "<p>UCS asks, \"What have I paid so far?\" A* also asks, \"How much farther do I probably have to go?\" It ranks nodes by</p>" +
        "<div class='formula'>f(n) = g(n) + h(n)</div>" +
        "<p>where g(n) is the actual cost so far, h(n) is a <strong>heuristic</strong> — an estimate of the remaining cost to the goal that tells the search which direction looks promising — and f(n) is the estimated total cost of a solution through n.</p>" +
        "<p><strong>Shortest or cheapest?</strong> A* looks for the cheapest total path cost. If every step costs the same, cheapest = fewest steps. If edges have different costs, A* chooses by total cost, not by number of edges.</p>" +
        "<p>A heuristic is <strong>admissible</strong> (optimistic) if it never overestimates: 0 ≤ h(n) ≤ h*(n), where h*(n) is the true cost to the nearest goal. With an admissible heuristic, <strong>A* tree search is optimal</strong>. An overestimating heuristic may be faster but can lose this guarantee. If h(n) = 0 for all n, then f(n) = g(n) and A* behaves exactly like UCS.</p>"
    },
    {
      h: "Why A* with an admissible heuristic is optimal (proof sketch)",
      html:
        "<p>Let A be an optimal goal and B a suboptimal goal on the frontier, and let n be an ancestor of A that is also on the frontier (possibly A itself).</p>" +
        "<ol><li>f(n) = g(n) + h(n) ≤ g(A) because h is admissible (it does not overestimate the cost from n to A).</li><li>g(A) = f(A) because h = 0 at a goal. So <strong>f(n) ≤ f(A)</strong>.</li><li>g(A) &lt; g(B) because B is suboptimal, and h = 0 at goals, so <strong>f(A) &lt; f(B)</strong>.</li><li>Therefore f(n) ≤ f(A) &lt; f(B): every ancestor of A — and A itself — is expanded before B. A* returns A, the optimal goal.</li></ol>"
    }
  ],
  terms: [
    { t: "State space", d: "The set of all states the search can be in." },
    { t: "Successor function", d: "Gives, for a state, the possible actions, the resulting states and their costs." },
    { t: "Frontier (fringe)", d: "The collection of partial plans that have been generated but not yet expanded." },
    { t: "Expansion", d: "Removing a node from the frontier and generating its children." },
    { t: "FIFO queue", d: "First in, first out — the frontier used by BFS." },
    { t: "LIFO stack", d: "Last in, first out — the frontier used by DFS." },
    { t: "Priority queue", d: "A frontier that always returns the item with the smallest priority (cost)." },
    { t: "g(n)", d: "The exact cost of the path from the start to node n." },
    { t: "h(n) — heuristic", d: "An estimate of the remaining cost from n to a goal." },
    { t: "Admissible heuristic", d: "A heuristic that never overestimates the true remaining cost: 0 ≤ h(n) ≤ h*(n)." },
    { t: "Complete", d: "An algorithm is complete if it is guaranteed to find a solution when one exists." },
    { t: "Optimal", d: "An algorithm is optimal if the solution it returns has the lowest possible cost." }
  ],
  algorithms: [
    {
      title: "Breadth-First Search (BFS)",
      steps: [
        "Put the start state (with path [start]) into a FIFO queue.",
        "While the queue is not empty, remove the <em>oldest</em> plan with <code>popleft()</code>.",
        "If its state is the goal, return the path.",
        "Otherwise, for each successor, append the new plan <code>path + [next_state]</code> to the right of the queue.",
        "If the queue empties, return None (no solution)."
      ],
      code:
        "from collections import deque\n\ndef bfs(graph, start, goal):\n    queue = deque([(start, [start])])\n    while queue:\n        state, path = queue.popleft()      # oldest plan first\n        if state == goal:\n            return path\n        for next_state in graph[state]:\n            queue.append((next_state, path + [next_state]))\n    return None"
    },
    {
      title: "Depth-First Search (DFS)",
      steps: [
        "Put the start plan on a stack (a Python list) and create an empty <code>visited</code> set.",
        "Remove the <em>newest</em> plan with <code>pop()</code>.",
        "If it is the goal, return the path.",
        "If the state was not visited, mark it visited and push every unvisited successor.",
        "Repeat until the stack is empty."
      ]
    },
    {
      title: "Uniform-Cost Search (UCS)",
      steps: [
        "Push (0, start, [start]) into a priority queue; record best = {start: 0}.",
        "Pop the plan with the <em>lowest cost</em> g.",
        "If it is the goal, return (cost, path).",
        "For each neighbor, compute new_cost = cost + step.",
        "If new_cost is better than the best known cost for that neighbor, record it and push the new plan."
      ],
      code:
        "import heapq\n\ndef ucs(graph, start, goal):\n    pq = [(0, start, [start])]\n    best = {start: 0}\n    while pq:\n        cost, node, path = heapq.heappop(pq)   # smallest cost first\n        if node == goal:\n            return cost, path\n        for nxt, step in graph[node]:\n            new_cost = cost + step\n            if new_cost &lt; best.get(nxt, float('inf')):\n                best[nxt] = new_cost\n                heapq.heappush(pq, (new_cost, nxt, path + [nxt]))\n    return None"
    },
    {
      title: "A* search — one iteration (from the lecture)",
      steps: [
        "Pop the frontier item with the smallest f.",
        "Check whether it is the goal.",
        "Generate its neighbors (on a grid: up, down, left, right — skipping walls and cells outside the grid).",
        "Compute the tentative g for each neighbor.",
        "If the new g is better than the known one, update it (and remember the parent in <code>came_from</code>).",
        "Compute f = g + h.",
        "Push the neighbor into the frontier."
      ]
    }
  ],
  formulas: [
    { name: "A* evaluation function", f: "f(n) = g(n) + h(n)", note: "Actual cost so far + estimated cost still to go = estimated total cost." },
    { name: "Admissibility", f: "0 ≤ h(n) ≤ h*(n)", note: "h*(n) is the true cost from n to the nearest goal. Admissible heuristics are optimistic." },
    { name: "UCS cost example", f: "g(C) = cost(A→B) + cost(B→C) = 2 + 4 = 6", note: "g accumulates exact step costs along the path." }
  ],
  example: {
    title: "Practical example: which node does A* expand?",
    html:
      "<div class='table-wrap'><table><caption>Three candidate nodes on the frontier</caption><thead><tr><th scope='col'>Node</th><th scope='col'>g(n)</th><th scope='col'>h(n)</th><th scope='col'>f(n)</th></tr></thead><tbody><tr><td>A</td><td>2</td><td>10</td><td>12</td></tr><tr class='hl'><td>B</td><td>5</td><td>4</td><td><strong>9</strong></td></tr><tr><td>C</td><td>7</td><td>3</td><td>10</td></tr></tbody></table></div>" +
      "<p>A* chooses <strong>B</strong> because f(B) = 9 is the smallest. B has already cost more than A, but its estimated total is better — A* is willing to pay more now if the whole route looks cheaper.</p>" +
      "<p class='note'><strong>Note on the lecture's BFS trace.</strong> In the BFS slide the graph is A→{B, C}, B→{D, E}, C→{F}, E→{G} with goal G. Tracing the code carefully, BFS dequeues A, B, C, D, E, F and then finds G, returning the path <strong>A → B → E → G</strong> (G is a child of E, not of F). The slide's text \"A → C → F\" looks like a typing slip; the code itself returns A-B-E-G.</p>"
  },
  application: {
    title: "Real-world application: route planning",
    html:
      "<p>A navigation app is a search agent: road junctions are states, road segments are actions with costs (distance or time), and a heuristic such as the straight-line distance to the destination helps the search focus on promising roads. Because a straight line is never longer than any road route, that heuristic is admissible for distance. The same ideas power robot motion planning, puzzle solvers and network routing.</p>"
  },
  diagram: {
    title: "Interactive: watch BFS, DFS, UCS and A* explore a grid",
    widget: "searchGrid",
    caption: "Pick an algorithm and press Run or Step. Expanded cells are shaded, frontier cells are outlined, and the final path is drawn. Click cells to add or remove walls. Tan 'mud' cells cost 5 instead of 1, so BFS and UCS behave differently. A* uses the Manhattan distance heuristic."
  },
  keyIdea:
    "All four algorithms share the same loop — take a node from the frontier, test it, expand it. They differ only in which node they take: deepest (DFS), shallowest (BFS), cheapest so far (UCS) or cheapest estimated total, g + h (A*).",
  quiz: [
    { q: "Which data structure does BFS use for its frontier?", o: ["LIFO stack", "FIFO queue", "Priority queue ordered by h", "A set"], a: 1, e: "BFS removes the oldest plan first (popleft), which is a FIFO queue. DFS uses a LIFO stack." },
    { q: "With costs A→B = 2, A→C = 8, B→F = 10, C→F = 1, which path does UCS return to F?", o: ["A-B-F with cost 12", "A-C-F with cost 9", "Either, they have the same depth", "None"], a: 1, e: "UCS compares total costs: 9 < 12. BFS would treat both as equal because both use two actions." },
    { q: "A frontier node has g = 4 and h = 8; another has g = 7 and h = 2. Which does A* expand first?", o: ["The first (f = 12)", "The second (f = 9)", "Whichever was added first", "The one with smaller g"], a: 1, e: "A* expands the smallest f = g + h. 9 < 12, so the second node goes first." },
    { q: "A heuristic is admissible when…", o: ["h(n) ≥ h*(n) for all n", "h(n) = g(n)", "0 ≤ h(n) ≤ h*(n) for all n", "h(n) is always zero"], a: 2, e: "Admissible = never overestimates the true remaining cost. (h = 0 is admissible too, but it is only a special case.)" },
    { q: "If h(n) = 0 everywhere, A* behaves like…", o: ["DFS", "BFS", "UCS", "Hill climbing"], a: 2, e: "f(n) = g(n) + 0 = g(n), which is exactly the UCS priority." }
  ],
  check: [
    { q: "Why is each node of a search tree described as a \"plan\" rather than a state?", a: "A tree node records the whole path from the root to it. Two different paths that reach the same state are two different tree nodes, although they are the same graph node." },
    { q: "When would you choose BFS over UCS?", a: "When all actions cost the same and the objective is the fewest actions. Then BFS is optimal and simpler; UCS is needed when step costs differ." },
    { q: "What might happen if a heuristic overestimates the remaining cost?", a: "A* may expand fewer nodes and run faster, but it can skip the truly cheapest path, so the optimality guarantee is lost." }
  ],
  connect: {
    prev: "Week 1 defined goal-based agents and the formal problem components. Week 2 turns those components into concrete search algorithms.",
    next: "Search returns a path. But in many problems — N-Queens, a timetable, a delivery tour — the path does not matter, only the final configuration. Week 3 introduces local search, which improves complete solutions instead of building paths."
  },
  additional: []
});

/* ------------------------------------------------------------------ */
/* WEEK 3 — Local search (and constraint satisfaction)                 */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-3",
  week: 3,
  station: "Station 3 · The Hills of Optimization",
  title: "Local Search and Constraint Satisfaction",
  subtitle: "When the path is not the solution — improving configurations",
  source: "Lecture 3 — Local Search Algorithms (including the lecture's case slides)",
  story:
    "Beyond the crossroads lies a land of hills and valleys, covered in fog. Qai no longer needs a route — it needs the <em>best spot</em>: the highest peak. It cannot see the whole landscape, only the ground next to its feet. Can it reach the top by always stepping uphill?",
  objectives: [
    "Explain why local search treats the goal as a complete configuration.",
    "Define state, neighbor, objective (evaluation) function and local optimum.",
    "Trace hill climbing step by step and implement it in Python.",
    "Diagnose local maxima, plateaus and ridges.",
    "Explain why random restarts and simulated annealing help.",
    "Compare local beam search, genetic algorithms and continuous optimization (gradient descent).",
    "Formulate a constraint problem, such as a timetable, as a cost to be minimized."
  ],
  sections: [
    {
      h: "From paths to configurations",
      html:
        "<p>BFS, DFS, UCS and A* search for a <em>path</em>, and cost accumulates along the route. In many problems the path is irrelevant: the question is <strong>which configuration</strong> is best, for example how to place 8 queens or in what order to visit cities. <strong>Local search</strong> starts with one complete candidate solution and repeatedly tries to improve it by moving to a better neighboring solution.</p>" +
        "<p>The key shift: instead of storing a large frontier, local search keeps <strong>one or a few candidate states</strong> — it can run in constant memory. The guiding question is: <em>can I improve my current solution with a small change?</em></p>" +
        "<div class='strategy-row'><span><b>State</b> = one complete configuration</span><span><b>Neighbor</b> = a small change to it</span><span><b>Value</b> = how good it is</span></div>"
    },
    {
      h: "Objective functions and neighborhoods",
      html:
        "<p>An <strong>objective function</strong> (evaluation function) turns the quality of a configuration into one number. We either <em>maximize</em> it (throughput, fitness) or <em>minimize</em> it (route length, number of conflicts).</p>" +
        "<p>The <strong>neighborhood</strong> defines what counts as a one-step move, and it changes the algorithm's behavior: in the 8-puzzle, move the blank tile; in N-Queens, move one queen within its column; in the Travelling Salesperson Problem (TSP), swap two cities or reverse part of the route.</p>"
    },
    {
      h: "Hill climbing and its traps",
      html:
        "<p><strong>Hill climbing</strong> is the simplest iterative improvement: start somewhere, look at the neighbors, move to a better one, and stop when no neighbor is better. It is greedy and fast, but it can get stuck:</p>" +
        "<ul><li><strong>Local maximum</strong> — a peak higher than its neighbors but lower than another peak. \"Good nearby ≠ globally best.\"</li><li><strong>Plateau</strong> — many states share the same value, so the algorithm has no direction and may stop or wander.</li><li><strong>Ridge</strong> — the best direction needs a sequence of moves that is not available as a single improving neighbor.</li></ul>"
    },
    {
      h: "Escaping traps: random restarts and simulated annealing",
      html:
        "<p><strong>Random-restart hill climbing</strong> runs hill climbing from several random starting states and keeps the best result. Different starts fall into different basins, so at least one is likely to reach the global peak. Trade-off: more computation for less sensitivity to one unlucky start.</p>" +
        "<p><strong>Simulated annealing</strong> sometimes accepts a <em>worse</em> move. Acceptance is controlled by a <strong>temperature</strong> T that decreases over time: at high T the search explores and can cross valleys; at low T it becomes almost greedy. \"Explore early, exploit later.\" The <em>cooling schedule</em> matters: cooling too fast can freeze the search near a poor configuration; too slow wastes computation. The theoretical convergence result requires sufficiently slow cooling.</p>"
    },
    {
      h: "Many candidates at once: beam search and genetic algorithms",
      html:
        "<p><strong>Local beam search</strong> keeps K states. At every step it generates all successors of all K states and keeps the best K overall. This is <em>not</em> just K independent hill climbs: the searches communicate, so a promising region found by one candidate can attract the others. K = 1 is ordinary local search.</p>" +
        "<p><strong>Genetic algorithms</strong> maintain a <em>population</em>. Each generation: measure <em>fitness</em> → <em>select</em> good candidates → combine pairs with <em>crossover</em> → add variety with <em>mutation</em> → form the new population. Repeat until a stopping condition is met.</p>"
    },
    {
      h: "Continuous spaces and gradient descent",
      html:
        "<p>States can also be real numbers, such as coordinates. Three approaches: <em>discretize</em> the space into a grid with increment δ and reuse discrete methods; use <em>random perturbation</em> (x → x + δ) as in hill climbing or simulated annealing; or use <em>gradients</em>.</p>" +
        "<p>The gradient ∇f(x) points in the direction of greatest increase. To minimize, <strong>gradient descent</strong> moves the opposite way with step size (learning rate) α. At an extremum the gradient is zero. The lecture's example: choose coordinates for 3 airports so that the sum of squared distances from each city to its nearest airport is minimal. This same update rule is how neural networks are trained (Week 9).</p>"
    },
    {
      h: "Constraint satisfaction as optimization (lecture case)",
      html:
        "<p>The lecture's university-timetable case is a <strong>Constraint Satisfaction Problem (CSP)</strong>: 6 courses, 4 instructors, 3 rooms and 5 time slots must be arranged so that no constraint is broken. Treated as local search: the <em>state</em> is a complete weekly timetable; a <em>neighbor</em> swaps the time or room of two classes; the <em>objective</em> is to minimize conflicts and unnecessary gaps:</p>" +
        "<div class='formula'>Cost = 100·T + 100·R + 20·S + 5·W</div>" +
        "<p>T = instructor conflicts, R = room conflicts, S = student-group conflicts, W = idle time between classes. The large weights make hard constraints (clashes) far more important than soft preferences (gaps). Goal: go from 4 conflicts to 0.</p>" +
        "<p>N-Queens is the classic version: one queen per column, move one queen within its column, value = number of attacking pairs, goal = 0 conflicts.</p>"
    }
  ],
  terms: [
    { t: "Local search", d: "Optimization that keeps a current complete solution and improves it through small changes." },
    { t: "Objective function", d: "A function that scores a configuration so it can be maximized or minimized." },
    { t: "Neighbor", d: "A configuration reached from the current one by one small change." },
    { t: "Local maximum", d: "A state better than all of its neighbors but not the best overall." },
    { t: "Plateau", d: "A flat region where neighbors have the same value, giving no direction." },
    { t: "Ridge", d: "A region where improvement needs a sequence of moves not available as one step." },
    { t: "Simulated annealing", d: "Local search that accepts worse moves with a probability that falls as the temperature drops." },
    { t: "Temperature (T)", d: "Parameter controlling how often simulated annealing accepts worse moves." },
    { t: "Local beam search", d: "Keeps the best K states from the pooled successors of K current states." },
    { t: "Genetic algorithm", d: "Population-based search using fitness, selection, crossover and mutation." },
    { t: "Gradient descent", d: "Continuous optimization that steps opposite the gradient: x ← x − α∇f(x)." },
    { t: "Constraint Satisfaction Problem (CSP)", d: "A problem where values must be assigned so that a set of constraints holds, e.g., a clash-free timetable." }
  ],
  algorithms: [
    {
      title: "Hill climbing on a 1-D landscape (lecture trace)",
      steps: [
        "Landscape values = [1, 3, 5, 8, 6, 4, 2]; start at index 0 (value 1).",
        "Neighbors are index − 1 and index + 1. Move to the better neighbor: 1 → 3.",
        "Again: 3 → 5, then 5 → 8.",
        "At value 8 the neighbors are 5 and 6 — neither is better.",
        "Stop and return index 3 (value 8)."
      ],
      code:
        "def hill_climbing(values, start):\n    current = start\n    while True:\n        neighbors = []\n        if current &gt; 0:\n            neighbors.append(current - 1)\n        if current &lt; len(values) - 1:\n            neighbors.append(current + 1)\n        best = current\n        for n in neighbors:\n            if values[n] &gt; values[best]:\n                best = n\n        if best == current:      # no improving neighbor\n            break\n        current = best\n    return current"
    },
    {
      title: "Simulated annealing (maximization form)",
      steps: [
        "Start from a state and a temperature, e.g., T = 10.",
        "Pick a random neighbor and compute ΔE = value(next) − value(current).",
        "If ΔE &gt; 0 (better), accept the move.",
        "If ΔE ≤ 0 (worse), accept it only with probability e<sup>ΔE/T</sup>.",
        "Cool down: T ← 0.95·T. Repeat while T &gt; 0.1."
      ],
      code:
        "import random, math\n\ndef anneal(values, start, T=10):\n    current = start\n    while T &gt; 0.1:\n        next_state = random_neighbor(current)\n        dE = values[next_state] - values[current]\n        if dE &gt; 0 or random.random() &lt; math.exp(dE / T):\n            current = next_state\n        T *= 0.95                  # cooling schedule\n    return current"
    },
    {
      title: "Genetic algorithm pipeline",
      steps: ["Create a population of candidate states.", "Measure each candidate's fitness.", "Select (resample) candidates, favoring higher fitness.", "Recombine pairs with crossover.", "Mutate to add variety.", "Repeat with the new population until a stopping condition is met."]
    }
  ],
  formulas: [
    { name: "Simulated annealing acceptance", f: "P(accept worse move) = e<sup>ΔE / T</sup>, &nbsp; ΔE = value(next) − value(current) ≤ 0", note: "The worse the move (more negative ΔE) and the lower the temperature, the smaller the acceptance probability." },
    { name: "Gradient descent", f: "x ← x − α ∇f(x)", note: "α = step size (learning rate). Moving opposite the gradient decreases f." },
    { name: "TSP tour length (lecture case)", f: "f(route) = Σ<sub>i=1</sub><sup>n−1</sup> d(city<sub>i</sub>, city<sub>i+1</sub>) + d(city<sub>n</sub>, city<sub>1</sub>)", note: "Total distance of a closed tour, to be minimized." },
    { name: "Facility placement (lecture case)", f: "f(x₁,y₁,…,x₃,y₃) = Σ<sub>i</sub> min<sub>j</sub> d(city<sub>i</sub>, centre<sub>j</sub>)²", note: "Each village is assigned to its nearest centre; minimize the sum of squared distances." }
  ],
  example: {
    title: "Practical example: an Astana delivery route",
    html:
      "<p>The lecture's TSP case: a courier must visit 8 points in Astana — the university campus, Baiterek, EXPO, the Botanical Garden, Khan Shatyr, the National Museum, the railway station and the airport. The <em>state</em> is a complete tour, a <em>neighbor</em> swaps two stops or reverses a segment (2-opt), and the <em>objective</em> is total distance.</p>" +
      "<p><strong>Question:</strong> the original route was 76 km; after swapping two addresses it is 68 km. Does hill climbing accept it? <strong>Yes</strong> — we are minimizing, and 68 &lt; 76 is an improvement. Simulated annealing would accept it too, because better moves are always accepted.</p>"
  },
  application: {
    title: "Real-world applications from the lecture's case studies",
    html:
      "<ul><li><strong>Drone inspection route</strong> (Physical AI): a drone checks 12 points in a field with limited battery. Objective J = 0.6·D + 0.3·E + 0.1·R (distance, energy, risk of crossing dangerous zones).</li>" +
      "<li><strong>Emergency routing</strong> during a flood: Cost = TravelTime + RiskPenalty + UnservedPriority. Hill climbing can get stuck on a short but dangerous route; simulated annealing can accept a temporarily worse move and find a safe, efficient tour.</li>" +
      "<li><strong>Edge-AI task placement</strong>: decide whether each camera task runs on a Raspberry Pi, a university edge server or the cloud. J = 0.4·Latency + 0.3·Energy + 0.2·Cost + 0.1·SecurityRisk.</li>" +
      "<li><strong>Mobile medical points</strong>: place 3 centres to minimize squared distances to villages — continuous optimization with gradient descent.</li></ul>"
  },
  diagram: {
    title: "Interactive: climb the landscape",
    widget: "localSearch",
    caption: "A 1-D landscape with a local and a global peak. Choose a start position, then run hill climbing, random restarts or simulated annealing and compare where each one stops."
  },
  keyIdea:
    "Local search optimizes complete configurations when the path does not matter. Greedy hill climbing is fast but can be trapped by local maxima, plateaus and ridges; random restarts, simulated annealing, beam search and genetic algorithms trade extra computation for better exploration.",
  quiz: [
    { q: "On values [1, 3, 5, 8, 6, 4, 2], hill climbing starts at index 0. Where does it stop?", o: ["Index 6 (value 2)", "Index 3 (value 8)", "Index 4 (value 6)", "It never stops"], a: 1, e: "It moves 1 → 3 → 5 → 8. At 8 both neighbors (5 and 6) are worse, so it stops at index 3." },
    { q: "Why can simulated annealing escape a local maximum when hill climbing cannot?", o: ["It looks at the whole landscape", "It sometimes accepts worse moves, especially when the temperature is high", "It uses a heuristic h(n)", "It always restarts randomly"], a: 1, e: "Accepting occasional downhill moves lets it cross valleys; as T falls, it becomes greedy." },
    { q: "In simulated annealing, a move has ΔE = −2 and T = 2. What is the acceptance probability?", o: ["e<sup>−1</sup> ≈ 0.37", "e<sup>1</sup> ≈ 2.72", "0", "1"], a: 0, e: "P = e<sup>ΔE/T</sup> = e<sup>−2/2</sup> = e<sup>−1</sup> ≈ 0.37." },
    { q: "What makes local beam search different from K separate hill climbs?", o: ["It uses a priority queue of paths", "It pools all successors and keeps the best K, so the searches share information", "It never uses an objective function", "It only works in continuous spaces"], a: 1, e: "The top K are reselected from the combined pool, so a strong region attracts other candidates." },
    { q: "In the timetable cost 100T + 100R + 20S + 5W, why are T and R weighted by 100?", o: ["They are measured in minutes", "Instructor and room clashes are hard constraints that must matter much more than idle gaps", "To make the cost negative", "Weights do not matter"], a: 1, e: "Large weights make clashes dominate the objective, so the search removes them first." }
  ],
  check: [
    { q: "Give two problems where the path is irrelevant and only the final configuration matters.", a: "N-Queens (only the final queen placement matters), TSP (the final tour), a timetable, or choosing facility locations." },
    { q: "What happens if the cooling schedule of simulated annealing is too fast?", a: "The temperature drops before the search has explored enough, so it 'freezes' near a poor configuration, behaving like plain hill climbing." },
    { q: "How does gradient descent decide its next move?", a: "It computes the gradient ∇f(x) (direction of greatest increase) and steps the opposite way: x ← x − α∇f(x), with α the step size." }
  ],
  connect: {
    prev: "Week 2's algorithms built paths with a large frontier. Week 3 drops the path and keeps only one or a few complete candidates, which saves memory and fits optimization problems.",
    next: "So far Qai has been alone. In Week 4 another decision-maker appears — an opponent who tries to make Qai lose. Search must now anticipate the other agent's best reply."
  },
  additional: [
    {
      title: "Additional Material: the standard definition of a CSP",
      html:
        "<p>The lecture presents constraint satisfaction through the timetable case. In the course textbook a CSP is defined formally by three sets: <strong>variables</strong> X₁…Xₙ (e.g., each class), <strong>domains</strong> D₁…Dₙ (the possible values of each variable, e.g., (time slot, room) pairs) and <strong>constraints</strong> C (allowed combinations, e.g., \"one instructor cannot teach two classes in the same slot\"). A solution is a complete assignment that satisfies every constraint. Besides local search (min-conflicts), CSPs are often solved with backtracking search plus constraint propagation.</p>",
      src: [
        { label: "Russell & Norvig, Artificial Intelligence: A Modern Approach, Ch. 6 \"Constraint Satisfaction Problems\" (course textbook)", url: "https://aima.cs.berkeley.edu/" }
      ]
    }
  ]
});

/* ------------------------------------------------------------------ */
/* WEEK 4 — Adversarial search and game trees                          */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-4",
  week: 4,
  station: "Station 4 · The Arena of Games",
  title: "Adversarial Search and Game Trees",
  subtitle: "Game trees, Minimax, Alpha–Beta pruning, evaluation functions and Expectimax",
  source: "Lecture 4 — Adversarial Search & Game Trees",
  story:
    "Qai enters an arena. For the first time, the environment contains <em>another decision-maker</em> — an opponent who wants Qai to lose. Planning a path is no longer enough. Before every move Qai must ask: \"What is the opponent's best reply, and what is my best answer to that?\"",
  objectives: [
    "Explain why adversarial search differs from single-agent search.",
    "Represent a game with states, players, actions, transitions, terminal tests and utilities.",
    "Construct and evaluate game trees; compute Minimax values by backing up utilities.",
    "Apply Alpha–Beta pruning correctly and explain why it does not change the answer.",
    "Use depth limits and weighted evaluation functions; recognize the horizon effect.",
    "Distinguish Minimax from Expectimax and choose the right model."
  ],
  sections: [
    {
      h: "From search to adversarial search",
      html:
        "<p>Ordinary search asks: \"Which sequence of <em>my</em> actions reaches the goal?\" Adversarial search asks: \"Which action is best <em>after accounting for the opponent's best response</em>?\" The opponent is part of the model, not a disturbance added later. Games are compact environments for studying rational decisions, and the same ideas extend to security, negotiation and multi-agent systems.</p>" +
        "<p><strong>Milestones mentioned in the lecture:</strong> computer checkers progressed to a <em>solved</em> game; IBM's Deep Blue defeated Garry Kasparov at chess in 1997; AlphaGo combined tree search with learned evaluation to play Go.</p>"
    },
    {
      h: "Types of games and the game model",
      html:
        "<p>Games vary along four axes: <em>deterministic vs. stochastic</em>, <em>two-player vs. multi-player</em>, <em>zero-sum vs. general-sum</em>, and <em>perfect vs. imperfect information</em>.</p>" +
        "<p>One formalization of a deterministic game: states S (starting at s₀); players P = {1…N} who usually take turns; actions A (may depend on player and state); a transition function S × A → S; a terminal test S → {true, false}; and terminal utilities S × P → ℝ. A solution for a player is a <strong>policy</strong> S → A.</p>" +
        "<p>In a <strong>zero-sum</strong> game the players have opposite utilities, so one value V(s) can be used: <strong>MAX</strong> tries to maximize it and <strong>MIN</strong> tries to minimize it. In <strong>general-sum</strong> games players have independent utilities, so cooperation and competition can coexist and leaf values may be tuples. This chapter focuses on deterministic two-player zero-sum games.</p>" +
        "<p><strong>Tic-tac-toe</strong> is a small example: X has 9 opening moves, O then has 8 replies, turns alternate until a win, loss or draw (utility +1 / 0 / −1). The tree is finite but already far larger than one board.</p>"
    },
    {
      h: "The Minimax principle",
      html:
        "<p>Minimax assumes both players act rationally. MAX picks the action with the highest <em>guaranteed</em> utility; MIN picks the action that is worst for MAX. The value of the root is the best outcome MAX can guarantee against optimal opposition.</p>" +
        "<p>Values are computed by <strong>backing up</strong>: expand the tree down to the leaves, evaluate the leaves, then propagate values upward — MIN nodes take the minimum of their children, MAX nodes the maximum. The root action is chosen only after the opponent's downstream responses have been considered.</p>" +
        "<p><strong>Properties:</strong> optimal against an optimal opponent; conservative (plans for the opponent's best reply); depends on a correct game model and utilities; may behave differently from methods that model imperfect or random opponents.</p>"
    },
    {
      h: "Alpha–Beta pruning",
      html:
        "<p>Minimax explores the whole tree: with branching factor b and depth m, that is O(b<sup>m</sup>) states — exponential. But many branches cannot change the final decision. <strong>Alpha–Beta pruning</strong> skips them.</p>" +
        "<ul><li><strong>α</strong> = the best value MAX can guarantee so far on the path to the root.</li><li><strong>β</strong> = the best value MIN can guarantee so far on the path to the root.</li><li>At a MAX node: α ← max(α, v). Cut off if v ≥ β.</li><li>At a MIN node: β ← min(β, v). Cut off if v ≤ α.</li><li>The first call uses α = −∞, β = +∞. Prune when α ≥ β.</li></ul>" +
        "<p>Pruning changes <em>how much is computed</em>, not the root Minimax value: the pruned branches are provably irrelevant to the decision (some intermediate node values may be incomplete). <strong>Move ordering matters:</strong> exploring promising moves first tightens α and β early, creating more cut-offs and allowing deeper search in the same time. Alpha–Beta is an optimization of Minimax, not a different objective.</p>"
    },
    {
      h: "Resource limits: depth limits and evaluation functions",
      html:
        "<p>Real games cannot be searched to the end. <strong>Depth-limited Minimax</strong> searches to depth d and calls an <strong>evaluation function</strong> Eval(s) at the cut-off, then backs up the estimates with MIN and MAX as usual. Deeper search gives more tactical information but costs exponentially more. Iterative deepening provides an \"anytime\" strategy.</p>" +
        "<p>A typical evaluation function is a weighted sum of features. For chess: material, mobility, king safety and center control. The weights express relative importance, and feature design strongly affects play.</p>" +
        "<p><strong>Evaluation vs. A* heuristic:</strong> an A* heuristic estimates the remaining path cost; a game evaluation estimates the strategic quality of a state. Both inject domain knowledge into search, and in games the evaluation also helps order moves for Alpha–Beta.</p>" +
        "<p><strong>Horizon effect:</strong> a depth limit can hide an important event just beyond the search frontier, so a position that looks good may become bad one move later. Deeper search helps but does not remove the problem; evaluation quality and selective extensions matter.</p>"
    },
    {
      h: "From adversary to chance: Expectimax",
      html:
        "<p>Minimax assumes every uncontrolled choice is made by an adversary. But some outcomes are random — dice rolls, action failures, a ghost that moves randomly. Then worst-case reasoning is too pessimistic.</p>" +
        "<p><strong>Expectimax</strong> replaces MIN nodes with <strong>chance nodes</strong> that compute the probability-weighted average of their children. MAX nodes still take the maximum. The tree must include probabilities for outcomes.</p>" +
        "<p><strong>Choosing the model:</strong> assuming chance in an adversarial world gives dangerous optimism; assuming an adversary in a mostly random world gives unnecessary pessimism. Modeling assumptions can matter as much as search depth.</p>"
    }
  ],
  terms: [
    { t: "Adversarial search", d: "Search in environments where other agents act strategically against you." },
    { t: "Zero-sum game", d: "A game where one player's gain is exactly the other's loss, so one value can describe both." },
    { t: "Game tree", d: "A tree of alternating moves by the players, ending in terminal states with utilities." },
    { t: "Utility (terminal)", d: "The value of a finished game for a player, e.g., +1 win, 0 draw, −1 loss." },
    { t: "Minimax", d: "Computes the best guaranteed value assuming the opponent always replies optimally." },
    { t: "Alpha (α)", d: "The best value MAX can guarantee so far on the current path." },
    { t: "Beta (β)", d: "The best value MIN can guarantee so far on the current path." },
    { t: "Pruning", d: "Skipping branches that cannot affect the final decision." },
    { t: "Evaluation function", d: "An estimate of how good a non-terminal state is, used at the depth cut-off." },
    { t: "Horizon effect", d: "A depth limit hides an important event just beyond the searched depth." },
    { t: "Chance node", d: "A node whose value is the expected (probability-weighted) value of its children." },
    { t: "Expectimax", d: "Game-tree search with MAX nodes and chance nodes instead of MIN nodes." }
  ],
  algorithms: [
    {
      title: "Minimax (recursive)",
      steps: [
        "If the state is terminal, return its utility.",
        "If it is MAX's turn: start with v = −∞ and set v = max(v, minimax(child)) for every child.",
        "If it is MIN's turn: start with v = +∞ and set v = min(v, minimax(child)) for every child.",
        "Return v. The recursion alternates turns automatically."
      ],
      code:
        "def minimax(state, maximizing):\n    if is_terminal(state):\n        return utility(state)\n    if maximizing:\n        value = float(\"-inf\")\n        for child in successors(state):\n            value = max(value, minimax(child, False))\n        return value\n    else:\n        value = float(\"inf\")\n        for child in successors(state):\n            value = min(value, minimax(child, True))\n        return value"
    },
    {
      title: "Alpha–Beta (from the lecture's implementation slide)",
      steps: [
        "<strong>max-value(state, α, β):</strong> v = −∞; for each successor: v = max(v, value(successor, α, β)); if v ≥ β return v; α = max(α, v). Return v.",
        "<strong>min-value(state, α, β):</strong> v = +∞; for each successor: v = min(v, value(successor, α, β)); if v ≤ α return v; β = min(β, v). Return v.",
        "Start at the root with α = −∞ and β = +∞."
      ],
      code:
        "def alphabeta(state, alpha, beta, maximizing):\n    if is_terminal(state):\n        return utility(state)\n    if maximizing:\n        v = float(\"-inf\")\n        for child in successors(state):\n            v = max(v, alphabeta(child, alpha, beta, False))\n            if v &gt;= beta:          # MIN will never allow this branch\n                return v\n            alpha = max(alpha, v)\n        return v\n    else:\n        v = float(\"inf\")\n        for child in successors(state):\n            v = min(v, alphabeta(child, alpha, beta, True))\n            if v &lt;= alpha:         # MAX already has something better\n                return v\n            beta = min(beta, v)\n        return v"
    }
  ],
  formulas: [
    { name: "Minimax recurrence", f: "V(s) = U(s) if terminal; &nbsp; V(s) = max<sub>s′</sub> V(s′) at MAX; &nbsp; V(s) = min<sub>s′</sub> V(s′) at MIN", note: "Defines the value of every node in the game tree." },
    { name: "Minimax cost", f: "O(b<sup>m</sup>)", note: "b = branching factor, m = maximum depth. Exponential growth motivates pruning." },
    { name: "Alpha–Beta update rules", f: "MAX: α ← max(α, v), stop if v ≥ β &nbsp;·&nbsp; MIN: β ← min(β, v), stop if v ≤ α", note: "Initial call: α = −∞, β = +∞." },
    { name: "Weighted evaluation function", f: "Eval(s) = w₁f₁(s) + w₂f₂(s) + … + wₙfₙ(s)", note: "f = features (material, mobility, …), w = their importance." },
    { name: "Chance node value", f: "V(chance) = Σ<sub>s′</sub> P(s′) · V(s′)", note: "Expected value of the outcomes." }
  ],
  example: {
    title: "Practical example: the lecture's worked Minimax tree",
    html:
      "<p>MAX chooses between three MIN nodes with leaves (3, 12, 8), (2, 4, 6) and (14, 5, 2).</p>" +
      "<ol><li>Left MIN = min(3, 12, 8) = <strong>3</strong>.</li><li>Middle MIN = min(2, 4, 6) = <strong>2</strong>.</li><li>Right MIN = min(14, 5, 2) = <strong>2</strong>.</li><li>Root MAX = max(3, 2, 2) = <strong>3</strong> → MAX plays the left move.</li></ol>" +
      "<p><strong>Why not aim for 14?</strong> 14 is in the right subtree, but MIN controls that decision and would choose 2. Minimax evaluates what MAX can <em>guarantee</em>, not the largest leaf in sight.</p>" +
      "<p><strong>With Alpha–Beta:</strong> after the left subtree, α = 3. In the middle subtree the first leaf is 2 ≤ α, so leaves 4 and 6 are pruned — they cannot make that subtree better than 2. The root value is still 3.</p>" +
      "<p><strong>Expectimax example:</strong> a chance node with outcomes 8 (p = 1/2), 24 (p = 1/3) and −12 (p = 1/6) has value ½·8 + ⅓·24 + ⅙·(−12) = 4 + 8 − 2 = <strong>10</strong>.</p>"
  },
  application: {
    title: "Real-world application: game engines and strategic systems",
    html:
      "<p>Chess engines combine Alpha–Beta search, good move ordering and weighted evaluation functions to look many moves ahead within a time limit. AlphaGo went further by combining tree search with <em>learned</em> evaluation. Beyond games, the same adversarial reasoning is used to model attackers in security, opponents in negotiation and other agents in multi-agent planning.</p>"
  },
  diagram: {
    title: "Interactive: Minimax and Alpha–Beta on the lecture tree",
    widget: "minimaxTree",
    caption: "Press Step to back up values one node at a time. Switch on Alpha–Beta to see which leaves are pruned. You can also edit leaf values to create your own tree. Below the tree, an Expectimax calculator lets you change the probabilities of a chance node."
  },
  keyIdea:
    "Minimax picks the move with the best guaranteed outcome against an optimal opponent. Alpha–Beta gives the same answer with less work. Real games need depth limits and evaluation functions, and when the other 'player' is chance rather than an adversary, Expectimax's averages replace Minimax's worst cases.",
  quiz: [
    { q: "MAX has MIN children with leaves (3, 12, 8), (2, 4, 6), (14, 5, 2). What is the root value?", o: ["14", "3", "2", "12"], a: 1, e: "The MIN values are 3, 2 and 2; MAX picks the largest, 3." },
    { q: "Does Alpha–Beta pruning change the Minimax value at the root?", o: ["Yes, it gives an approximation", "No, it only skips branches that cannot affect the decision", "Only if move ordering is bad", "Yes, it is more optimistic"], a: 1, e: "Alpha–Beta is an exact optimization of Minimax; pruned branches are provably irrelevant." },
    { q: "At a MIN node, when can the remaining children be pruned?", o: ["When v ≥ β", "When v ≤ α", "When v = 0", "Never"], a: 1, e: "If MIN can already force a value ≤ α, MAX (who has an alternative worth α) will never choose this node." },
    { q: "A chance node has outcomes 8 (½), 24 (⅓), −12 (⅙). Its Expectimax value is…", o: ["−12", "8", "10", "24"], a: 2, e: "4 + 8 − 2 = 10." },
    { q: "What is the horizon effect?", o: ["The tree has no leaves", "An important event just beyond the depth limit is not seen, so a state looks better than it is", "Alpha is larger than beta", "The opponent plays randomly"], a: 1, e: "Depth limits can hide threats one move beyond the frontier." }
  ],
  check: [
    { q: "Why is Minimax called 'conservative'?", a: "It always assumes the opponent picks the reply that is worst for MAX, so it plans for the worst case. Against a weak or random opponent it may miss opportunities." },
    { q: "Why does good move ordering make Alpha–Beta faster?", a: "If the best moves are explored first, α and β become tight early, so more later branches satisfy the cut-off condition and are pruned." },
    { q: "When should you use Expectimax instead of Minimax?", a: "When the uncontrolled outcomes are better described by probabilities (dice, random ghosts, action failure) than by a strategic opponent." }
  ],
  connect: {
    prev: "Week 2's search planned paths for one agent in a predictable world. Week 4 added an opponent and showed that chance (Expectimax) needs probability-weighted values.",
    next: "Chance nodes bring uncertainty into decisions. In Week 5, Qai faces a world where every action can slip, and decisions repeat over time: Markov decision processes and reinforcement learning."
  },
  additional: []
});

/* ------------------------------------------------------------------ */
/* WEEK 5 — MDPs and reinforcement learning                            */
/* ------------------------------------------------------------------ */
window.BOOK.chapters.push({
  id: "week-5",
  week: 5,
  station: "Station 5 · The Shifting Grid",
  title: "Markov Decision Processes and Reinforcement Learning",
  subtitle: "From MDP theory to Q-learning, real-world control and Deep RL",
  source: "Lecture 5 — Markov Decision Processes + Reinforcement Learning",
  story:
    "The next region is a slippery grid. When Qai tries to move RIGHT, it sometimes slides UP or DOWN instead. A fixed path is useless here — Qai needs a <em>policy</em>: an instruction for what to do in every square. And at first, nobody tells Qai the rules of the grid. It must learn them from experience.",
  objectives: [
    "Explain why sequential decisions require long-term thinking.",
    "Define an MDP: states, actions, transition model, reward function and discount factor.",
    "Compute expected values, discounted returns and simple Bellman backups.",
    "Distinguish reward from value, and V(s) from Q(s, a).",
    "Explain value iteration and policy iteration (model known).",
    "Explain TD learning and Q-learning, and perform a Q-learning update by hand (model unknown).",
    "Separate the roles of α, γ and ε; compare Q-learning with SARSA; describe DQN and actor–critic."
  ],
  sections: [
    {
      h: "Why sequential decisions?",
      html:
        "<p>An action changes the next state, which changes the actions and rewards available later. Outcomes are uncertain, so we optimize the <em>expected long-term return</em>, not just the immediate reward.</p>" +
        "<p><strong>Industrial-machine example:</strong> CONTINUE gives +10 production now, but repeated operation raises temperature and failure risk. MAINTENANCE costs −15 now but can prevent a future −200 failure. The action that looks best now can be poor in the long run.</p>" +
        "<p><strong>Search vs. MDP planning:</strong> classical search returns a path (START → RIGHT → RIGHT → UP → GOAL), which works when outcomes are predictable. An MDP solution is a <strong>policy</strong> — what to do in every possible state — so if RIGHT slips to DOWN, the agent still knows what to do next.</p>"
    },
    {
      h: "The MDP model",
      html:
        "<p>A <strong>Markov decision process</strong> is the tuple <strong>M = (S, A, P, R, γ)</strong>:</p>" +
        "<ul><li><strong>S</strong> — state space: the situations the agent can be in. A state should summarize what matters for future decisions: a grid position (row, column); a battery (state of charge, price, demand, solar, hour); a motor (temperature, vibration, load, health).</li>" +
        "<li><strong>A</strong> — actions: discrete (UP/DOWN/LEFT/RIGHT; CHARGE/HOLD/DISCHARGE), continuous (steering angle, torque) and sometimes state-dependent (you cannot discharge an empty battery).</li>" +
        "<li><strong>P(s′ | s, a)</strong> — transition model: the probability of reaching s′ after action a in s. In the lecture's gridworld the intended move succeeds with 0.8, and the agent slips to each side with 0.1. For every (s, a) the probabilities sum to 1.</li>" +
        "<li><strong>R(s, a, s′)</strong> — reward: immediate feedback, e.g., goal +10, danger −10, each move −1 (to encourage short routes).</li>" +
        "<li><strong>γ ∈ [0, 1]</strong> — discount factor: how much future rewards matter.</li></ul>" +
        "<p>The agent–environment cycle: observe S<sub>t</sub> → choose A<sub>t</sub> → environment responds → receive R<sub>t+1</sub> → observe S<sub>t+1</sub>. The agent controls its action, not the outcome. Experience arrives as transitions (s, a, r, s′).</p>"
    },
    {
      h: "Reward, return and discounting",
      html:
        "<p><strong>Reward is local; value summarizes the future.</strong> A state next to the goal may give reward 0 right now but be very valuable because it leads to +100.</p>" +
        "<p>The <strong>return</strong> is the discounted sum of future rewards: G<sub>t</sub> = R<sub>t+1</sub> + γR<sub>t+2</sub> + γ²R<sub>t+3</sub> + … For rewards 5, 10, 20 with γ = 0.9: G = 5 + 0.9·10 + 0.81·20 = <strong>30.2</strong>.</p>" +
        "<p>γ near 0 focuses on near-term reward; γ near 1 keeps distant outcomes important. Discounting also keeps infinite-horizon returns finite. A reward of 100 ten steps away is worth γ¹⁰·100: ≈ 0.10 (γ = 0.5), ≈ 10.74 (0.8), ≈ 34.87 (0.9), ≈ 90.44 (0.99). γ is a modeling choice about the decision horizon.</p>"
    },
    {
      h: "Policies and value functions",
      html:
        "<p>A <strong>policy</strong> π(a | s) gives the probability of choosing a in s. A deterministic policy gives one action per state, π(s) = a; a stochastic policy randomizes, e.g., π(RIGHT|B) = 0.8, π(UP|B) = 0.2. A battery-control policy might be: low price + low charge → CHARGE; high price + high charge → DISCHARGE; otherwise HOLD.</p>" +
        "<p>The <strong>state-value function</strong> V<sup>π</sup>(s) = E<sub>π</sub>[G<sub>t</sub> | S<sub>t</sub> = s] says how good it is to be in s while following π. The <strong>action-value function</strong> Q<sup>π</sup>(s, a) = E<sub>π</sub>[G<sub>t</sub> | S<sub>t</sub> = s, A<sub>t</sub> = a] says how good it is to take a in s and then follow π. V rates states; Q rates state–action pairs and makes action selection easy.</p>" +
        "<p>V*(s) = max<sub>a</sub> Q*(s, a). If Q(A, LEFT) = 2, Q(A, RIGHT) = 8, Q(A, UP) = 4, Q(A, DOWN) = −5, then V*(A) = 8 and the optimal action is RIGHT.</p>"
    },
    {
      h: "The Bellman principle",
      html:
        "<p><strong>Current value = immediate reward + discounted future value.</strong> The future after one step is itself another decision problem, so values can be computed recursively instead of enumerating the whole future.</p>" +
        "<p>Simple chain A → B → GOAL(10), step reward −1, γ = 0.9: V(B) = −1 + 0.9·10 = 8, then V(A) = −1 + 0.9·8 = 6.2. A state becomes valuable because it leads to valuable states.</p>" +
        "<p>The <strong>Bellman optimality equation</strong> adds a max over actions: evaluate each action → average its possible outcomes → add the discounted future value → choose the max.</p>"
    },
    {
      h: "Planning (model known) vs. learning (model unknown)",
      html:
        "<p>The MDP is the problem framework; there are two ways to solve it.</p>" +
        "<p><strong>Planning</strong> — we know P and R. <em>Value iteration</em> repeats Bellman optimality backups on all states until the values stabilize; goal information propagates backward (chain example: 0,0,0,10 → 0,0,8,10 → 0,6.2,8,10 → 4.58,6.2,8,10). <em>Policy iteration</em> alternates <em>policy evaluation</em> (compute V<sup>π</sup>) and <em>policy improvement</em> (choose the best one-step-lookahead action in every state).</p>" +
        "<p><strong>Learning</strong> — real systems rarely give exact probabilities (what is P(failure tomorrow | vibration = 6.5, load = 92 %, CONTINUE)?). <strong>Reinforcement learning</strong> estimates values or policies from interaction. There is no label saying \"the correct action\"; feedback can be delayed; and the agent's own behavior decides which data it sees. That is how RL differs from supervised learning, which learns input → label from independent examples.</p>"
    },
    {
      h: "Exploration, Monte Carlo and TD learning",
      html:
        "<p><strong>Exploit</strong> = choose the action currently believed best; <strong>explore</strong> = try alternatives to find out whether beliefs are wrong. Too little exploration locks in a mediocre policy; too much wastes reward. <strong>ε-greedy</strong>: with probability ε take a random action, otherwise argmax<sub>a</sub> Q(s, a). ε = 0.1 means about 10 % exploration; ε is often decayed during training.</p>" +
        "<p>Episodes (a game, a delivery) end at a terminal state; continuing tasks (HVAC, grid operation) may go on forever and rely on discounting.</p>" +
        "<p><strong>Monte Carlo</strong> waits for the complete return G<sub>t</sub> and moves V(s) toward it. <strong>Temporal-Difference (TD)</strong> learning updates after one step using a reward plus another estimate (<em>bootstrapping</em>). The TD error δ = R + γV(S′) − V(S) is the \"surprise\": δ &gt; 0 means better than expected, so increase the estimate; δ &lt; 0 means worse. Example: V(A) = 5, reward 2, V(B) = 8, γ = 0.9 → target 9.2, δ = 4.2.</p>"
    },
    {
      h: "Q-learning, SARSA and beyond",
      html:
        "<p><strong>Q-learning</strong> learns optimal action values without a model: current belief Q(s, a) is moved partway (α) toward new evidence r + γ max<sub>a′</sub> Q(s′, a′). It is incremental error correction. Because the target uses the <em>max</em>, Q-learning learns the greedy policy even while behaving exploratively — it is <strong>off-policy</strong>. <strong>SARSA</strong> uses the action a′ actually chosen next, so it learns the value of its exploratory behavior — it is <strong>on-policy</strong>.</p>" +
        "<p>Three parameters with three different jobs: <strong>α</strong> (learning rate — how strongly new experience changes knowledge; small = slow and stable, large = fast but noisy), <strong>γ</strong> (discount — how much the future matters), <strong>ε</strong> (exploration rate — how often to try alternatives).</p>" +
        "<p><strong>Model-based RL</strong> learns or uses a transition model and plans with it (data-efficient, but model errors matter); <strong>model-free RL</strong> such as Q-learning learns values directly.</p>" +
        "<p><strong>Why tables stop scaling:</strong> a discretized battery problem has 10·20·20·20·24 = 1,920,000 states and 5,760,000 Q-values with 3 actions. <strong>Deep Q-Networks (DQN)</strong> approximate Q(s, a; θ) with a neural network that generalizes across similar states, stabilized by replay buffers and target networks. <strong>Policy-gradient</strong> methods learn π<sub>θ</sub>(a|s) directly (natural for continuous actions). <strong>Actor–critic</strong> combines an actor (\"what should I do?\") with a critic (\"how good was that?\").</p>"
    },
    {
      h: "Safety in real deployments",
      html:
        "<p>A high reward is not permission to violate engineering constraints. Safety-critical systems should encode hard limits separately from the reward; training on physical equipment can be unsafe, so simulators and offline data are used first; distribution shift, sensor faults, model uncertainty and human override must be considered; and <strong>reward misspecification</strong> can produce behavior that optimizes the number but not the real objective. A good RL project starts with a good decision problem: define objective → design state/action → build simulator/data → choose algorithm → train and validate → deploy cautiously. Check whether RL is needed at all — optimization or supervised learning may be simpler.</p>"
    }
  ],
  terms: [
    { t: "Markov decision process (MDP)", d: "A model of sequential decisions under uncertainty: (S, A, P, R, γ)." },
    { t: "Transition model P(s′|s,a)", d: "The probability of each next state after action a in state s." },
    { t: "Reward", d: "Immediate numerical feedback received after a transition." },
    { t: "Return G", d: "The discounted sum of future rewards from a time step." },
    { t: "Discount factor γ", d: "A number in [0, 1] that sets how strongly future rewards count." },
    { t: "Policy π", d: "A rule that tells the agent what to do (or with what probability) in every state." },
    { t: "Value V(s)", d: "Expected return from state s when following a policy." },
    { t: "Q-value Q(s,a)", d: "Expected return from taking action a in state s and then following a policy." },
    { t: "Bellman equation", d: "Value = immediate reward + discounted value of the next state." },
    { t: "Value iteration", d: "Planning by repeatedly applying Bellman optimality backups until values converge." },
    { t: "Policy iteration", d: "Planning by alternating policy evaluation and policy improvement." },
    { t: "Reinforcement learning", d: "Learning a decision strategy from rewards gained through interaction." },
    { t: "ε-greedy", d: "Choose a random action with probability ε, otherwise the best-known action." },
    { t: "TD error δ", d: "The difference between the one-step target and the current estimate." },
    { t: "Q-learning", d: "Off-policy, model-free TD method that learns optimal Q-values using max Q(s′, a′)." },
    { t: "SARSA", d: "On-policy TD method that uses the next action actually taken." },
    { t: "DQN", d: "Deep Q-Network: Q-learning with a neural network approximating the Q-function." }
  ],
  algorithms: [
    {
      title: "Value iteration",
      steps: ["Initialize V₀(s) = 0 for all states.", "For every state, compute the Bellman optimality backup using the previous values.", "Update all states with the new values.", "Repeat until the values change less than a tolerance.", "Read the policy: in each state choose the action that achieved the max."]
    },
    {
      title: "Q-learning training loop (five-state chain from the lecture)",
      steps: [
        "Create a Q-table of zeros: rows = states 0–4, columns = LEFT, RIGHT.",
        "Start each episode at state 0.",
        "Choose an action with ε-greedy.",
        "Call <code>step</code>: move, observe the next state and the reward (+10 at the goal, −1 otherwise).",
        "Compute the target r + γ·max Q(s′, ·).",
        "Update Q(s, a) ← Q(s, a) + α·(target − Q(s, a)).",
        "Move to the next state; repeat until the goal; run many episodes.",
        "Extract the policy: π(s) = argmax<sub>a</sub> Q(s, a) → RIGHT in states 0–3."
      ],
      code:
        "for episode in range(1000):\n    state = 0\n    while state != GOAL:\n        action = choose_action(Q, state, epsilon)      # epsilon-greedy\n        next_state, reward = step(state, action)\n        target = reward + gamma * np.max(Q[next_state])\n        Q[state, action] += alpha * (target - Q[state, action])\n        state = next_state"
    }
  ],
  formulas: [
    { name: "Expected value", f: "E[R] = Σ<sub>i</sub> p<sub>i</sub> r<sub>i</sub>", note: "0.9·10 + 0.1·(−50) = 4. The expected reward is not the most likely reward." },
    { name: "Discounted return", f: "G<sub>t</sub> = R<sub>t+1</sub> + γR<sub>t+2</sub> + γ²R<sub>t+3</sub> + …", note: "Rewards 5, 10, 20 with γ = 0.9 give 30.2." },
    { name: "State value / action value", f: "V<sup>π</sup>(s) = E<sub>π</sub>[G<sub>t</sub> | S<sub>t</sub>=s] &nbsp;·&nbsp; Q<sup>π</sup>(s,a) = E<sub>π</sub>[G<sub>t</sub> | S<sub>t</sub>=s, A<sub>t</sub>=a]", note: "V*(s) = max<sub>a</sub> Q*(s, a)." },
    { name: "Bellman expectation equation", f: "V<sup>π</sup>(s) = Σ<sub>a</sub> π(a|s) Σ<sub>s′</sub> P(s′|s,a) [ R(s,a,s′) + γV<sup>π</sup>(s′) ]", note: "Value of a state under a fixed policy." },
    { name: "Bellman optimality equation", f: "V*(s) = max<sub>a</sub> Σ<sub>s′</sub> P(s′|s,a) [ R + γV*(s′) ]", note: "Value iteration repeats this as V<sub>k+1</sub>(s) = max<sub>a</sub> Σ P(s′|s,a)[R + γV<sub>k</sub>(s′)]." },
    { name: "Monte Carlo and TD updates", f: "V(s) ← V(s) + α[G<sub>t</sub> − V(s)] &nbsp;·&nbsp; δ<sub>t</sub> = R<sub>t+1</sub> + γV(S<sub>t+1</sub>) − V(S<sub>t</sub>)", note: "MC waits for the full return; TD bootstraps after one step." },
    { name: "Q-learning update", f: "Q(s,a) ← Q(s,a) + α[ r + γ max<sub>a′</sub> Q(s′,a′) − Q(s,a) ]", note: "Off-policy target uses the best next action." },
    { name: "SARSA update", f: "Q(s,a) ← Q(s,a) + α[ r + γQ(s′,a′) − Q(s,a) ]", note: "On-policy target uses the action actually chosen next." },
    { name: "Greedy policy extraction", f: "π(s) = argmax<sub>a</sub> Q(s,a)", note: "Read the best action straight from the Q-table." }
  ],
  example: {
    title: "Practical example: one Q-learning update and one stochastic Bellman backup",
    html:
      "<p><strong>Q-learning update.</strong> Given Q(A, RIGHT) = 4, r = 2, max Q(B, ·) = 8, γ = 0.9, α = 0.5:</p>" +
      "<ol><li>Target = 2 + 0.9·8 = <strong>9.2</strong>.</li><li>TD error = 9.2 − 4 = <strong>5.2</strong>.</li><li>New Q = 4 + 0.5·5.2 = <strong>6.6</strong>. The action became more valuable because experience was better than expected.</li></ol>" +
      "<p><strong>Stochastic Bellman backup.</strong> RIGHT reaches GOOD (V = 10) with 80 % and BAD (V = −5) with 20 %; step reward −1; γ = 0.9:</p>" +
      "<div class='formula'>Q(s, RIGHT) = 0.8[−1 + 0.9·10] + 0.2[−1 + 0.9·(−5)] = 6.4 − 1.1 = 5.3</div>"
  },
  application: {
    title: "Real-world applications: battery energy management and predictive maintenance",
    html:
      "<p><strong>Battery:</strong> state = (state of charge, electricity price, demand, solar output, hour/forecast); actions = charge, hold, discharge (or continuous power); reward = −energy cost − degradation − constraint penalties; policy = when and how strongly to charge. State design matters: with SOC alone, 50 % charge looks the same at $20/MWh and $200/MWh, so the agent cannot learn to use price. <em>If relevant information is missing from the state, no algorithm can learn to use it.</em></p>" +
      "<p><strong>Predictive maintenance:</strong> state = temperature, vibration, load, health; actions = continue, reduce load, inspect, maintain. CONTINUE looks attractive (+10) while MAINTAIN costs −15, but the long-term value must include avoided degradation and failures.</p>"
  },
  diagram: {
    title: "Interactive: train a Q-learning agent on the five-state chain",
    widget: "qLearning",
    caption: "States 0–4, actions LEFT/RIGHT, step reward −1, goal reward +10 (the lecture's environment). Adjust α, γ and ε, then train episode by episode and watch the Q-table and the greedy policy change. A discount calculator below shows γ¹⁰ × 100."
  },
  keyIdea:
    "An MDP formalizes sequential decisions under uncertainty, and its solution is a policy. Value summarizes expected long-term return; the Bellman equation links present and future. With a known model we plan (value/policy iteration); without one we learn from experience (TD, Q-learning) — and every advanced method still rests on states, actions, rewards, return and value.",
  quiz: [
    { q: "Rewards 5, 10, 20 are received with γ = 0.9. What is the return G?", o: ["35", "30.2", "31.5", "27.0"], a: 1, e: "5 + 0.9·10 + 0.81·20 = 5 + 9 + 16.2 = 30.2." },
    { q: "Q(A,RIGHT) = 4, r = 2, max Q(B,·) = 8, γ = 0.9, α = 0.5. The new Q(A,RIGHT) is…", o: ["9.2", "5.2", "6.6", "4.0"], a: 2, e: "Target 9.2, TD error 5.2, new Q = 4 + 0.5·5.2 = 6.6." },
    { q: "Which parameter controls how often the agent tries non-greedy actions?", o: ["α", "γ", "ε", "δ"], a: 2, e: "ε is the exploration rate in ε-greedy. α is the learning rate and γ the discount." },
    { q: "What is the key difference between Q-learning and SARSA?", o: ["Q-learning needs a model", "Q-learning's target uses max Q(s′,a′); SARSA uses the next action actually taken", "SARSA cannot use ε-greedy", "SARSA has no learning rate"], a: 1, e: "That single target difference makes Q-learning off-policy and SARSA on-policy." },
    { q: "Why can a state with reward 0 still have a high value?", o: ["Values are always higher than rewards", "Because it leads to high future rewards, which its value summarizes", "Because γ = 0", "It cannot"], a: 1, e: "Reward is local; value is the expected discounted future return." }
  ],
  check: [
    { q: "Explain the difference between planning and reinforcement learning for an MDP.", a: "Planning assumes the transition probabilities and rewards are known and computes values with dynamic programming (value or policy iteration). RL does not know them and estimates values or policies from observed transitions (s, a, r, s′)." },
    { q: "What goes wrong if the reward function is poorly designed for an industrial system?", a: "The agent optimizes the number rather than the real goal — for example maximizing short-term production while ignoring safety or failure risk. Hard safety limits should be encoded separately, and behavior must be validated." },
    { q: "Why does DQN use a neural network?", a: "Large or continuous state spaces make a Q-table impossible (millions of entries). A network Q(s, a; θ) generalizes across similar states with far fewer parameters." }
  ],
  connect: {
    prev: "Expectimax (Week 4) averaged over chance outcomes once. MDPs repeat that idea over many time steps and turn it into policies and value functions.",
    next: "MDPs assume the agent knows which state it is in. But sensors are noisy. Week 6 builds the language of uncertainty itself: probability, Bayes' theorem and Bayesian networks."
  },
  additional: []
});
