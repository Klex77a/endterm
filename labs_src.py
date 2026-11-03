# Source of every Python lab shown in the book. build_labs.py runs each
# snippet and stores its real output, so the book shows verified results.
LABS = {}

LABS[1] = [
("A greenhouse reflex agent", "The lecture's practical: two sensors, three actuators, rules checked top to bottom.", r'''
def greenhouse_agent(temperature, humidity):
    if temperature < 18:
        return "Heater ON"
    elif temperature > 28:
        return "Fan ON"
    elif humidity > 80:
        return "Dehumidifier ON"
    else:
        return "No action"

tests = [(17, 50), (23, 60), (24, 85), (30, 85)]
for t, h in tests:
    print(f"{t:>2} C, {h:>2}% -> {greenhouse_agent(t, h)}")
'''),
("Rule order changes behavior", "The same rules stored as data. Reversing their order changes the action when two conditions are true at once.", r'''
rules = [
    (lambda s: s["people"] == 0,     "Energy-saving mode"),
    (lambda s: s["temperature"] < 20, "Heating ON"),
    (lambda s: s["temperature"] > 26, "Cooling ON"),
    (lambda s: s["co2"] > 1000,       "Fresh-air fan ON"),
]

def reflex_agent(percept, rules):
    for condition, action in rules:       # the first matching rule wins
        if condition(percept):
            return action
    return "No action"

room = {"temperature": 19, "co2": 1200, "people": 6}
print("normal order: ", reflex_agent(room, rules))
print("reversed order:", reflex_agent(room, rules[::-1]))
'''),
("A model-based agent remembers", "A two-room vacuum robot. Its sensor sees only the current room, so it keeps an internal state of which rooms it has already cleaned.", r'''
world = {"A": "dirty", "B": "dirty"}
location = "A"
memory = {"A": None, "B": None}          # internal state: what the agent knows

for step in range(5):
    percept = (location, world[location])  # sees only its own room
    memory[location] = percept[1]
    if percept[1] == "dirty":
        action = "Suck"
        world[location] = "clean"
        memory[location] = "clean"
    elif all(v == "clean" for v in memory.values()):
        action = "Stop (everything is clean)"
    else:
        action = "Move to " + ("B" if location == "A" else "A")
    print(step, percept, "->", action)
    if action.startswith("Move"):
        location = "B" if location == "A" else "A"
    if action.startswith("Stop"):
        break
'''),
("PEAS and environment types as data", "Describing tasks in a structured way makes them easy to compare.", r'''
tasks = {
    "Self-driving car": {"observable": "partial", "agents": "multi",  "dynamic": True,  "actions": "continuous"},
    "Pac-Man":          {"observable": "full",    "agents": "multi",  "dynamic": True,  "actions": "discrete"},
    "Chess":            {"observable": "full",    "agents": "multi",  "dynamic": False, "actions": "discrete"},
    "Greenhouse":       {"observable": "partial", "agents": "single", "dynamic": True,  "actions": "discrete"},
}
print(f"{'task':<18}{'observable':<12}{'agents':<8}{'dynamic':<9}actions")
for name, p in tasks.items():
    print(f"{name:<18}{p['observable']:<12}{p['agents']:<8}{str(p['dynamic']):<9}{p['actions']}")
'''),
]

LABS[2] = [
("BFS on the lecture graph", "Exactly the lecture's graph and code. Notice the true solution: G is a child of E.", r'''
from collections import deque

graph = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"],
         "D": [], "E": ["G"], "F": [], "G": []}

def bfs(graph, start, goal):
    queue = deque([(start, [start])])
    while queue:
        state, path = queue.popleft()
        print("Exploring:", state)
        if state == goal:
            return path
        for next_state in graph[state]:
            queue.append((next_state, path + [next_state]))
    return None

print("Solution:", bfs(graph, "A", "G"))
'''),
("DFS with a visited set", "The only real change from BFS: pop() from the end of a list instead of popleft().", r'''
graph = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"],
         "D": [], "E": ["G"], "F": [], "G": []}

def dfs(graph, start, goal):
    stack = [(start, [start])]
    visited = set()
    while stack:
        state, path = stack.pop()          # newest plan first
        print("Exploring:", state)
        if state == goal:
            return path
        if state not in visited:
            visited.add(state)
            for next_state in graph[state]:
                if next_state not in visited:
                    stack.append((next_state, path + [next_state]))
    return None

print("Solution:", dfs(graph, "A", "G"))
'''),
("UCS finds the cheaper route", "Both routes to F use two actions, so BFS cannot tell them apart. UCS compares total cost.", r'''
import heapq

graph = {"A": [("B", 2), ("C", 8)], "B": [("F", 10)], "C": [("F", 1)], "F": []}

def ucs(graph, start, goal):
    pq = [(0, start, [start])]
    best = {start: 0}
    while pq:
        cost, node, path = heapq.heappop(pq)
        print(f"pop {node} with g = {cost}")
        if node == goal:
            return cost, path
        for nxt, step in graph[node]:
            new_cost = cost + step
            if new_cost < best.get(nxt, float("inf")):
                best[nxt] = new_cost
                heapq.heappush(pq, (new_cost, nxt, path + [nxt]))
    return None

print(ucs(graph, "A", "F"))
'''),
("A* versus UCS on a grid", "Same grid, same costs. The Manhattan heuristic lets A* expand far fewer cells while returning a path of the same cost.", r'''
import heapq

grid = ["..............#.....",
        "..............#.....",
        "....S.........#.....",
        "..............#..G..",
        "..............#.....",
        ".....................",
        "....................."]
grid = [row[:20] for row in grid]
R, C = len(grid), len(grid[0])
find = lambda ch: next((r, c) for r in range(R) for c in range(C) if grid[r][c] == ch)
start, goal = find("S"), find("G")

def neighbors(r, c):
    for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != "#":
            yield nr, nc

def search(use_heuristic):
    h = lambda p: abs(p[0] - goal[0]) + abs(p[1] - goal[1]) if use_heuristic else 0
    frontier = [(h(start), 0, start)]
    g = {start: 0}
    expanded = 0
    while frontier:
        f, cost, node = heapq.heappop(frontier)
        if cost > g[node]:
            continue                      # outdated entry
        expanded += 1
        if node == goal:
            return cost, expanded
        for nb in neighbors(*node):
            new_g = cost + 1
            if new_g < g.get(nb, float("inf")):
                g[nb] = new_g
                heapq.heappush(frontier, (new_g + h(nb), new_g, nb))

print("UCS: cost %d, expanded %d" % search(False))
print("A* : cost %d, expanded %d" % search(True))
'''),
]

LABS[3] = [
("Hill climbing, traced", "Prints every state visited on the lecture landscape.", r'''
values = [1, 3, 5, 8, 6, 4, 2]

def hill_climbing(values, start):
    current = start
    print("start at index", current, "value", values[current])
    while True:
        neighbors = [i for i in (current - 1, current + 1) if 0 <= i < len(values)]
        best = max(neighbors, key=lambda i: values[i])
        if values[best] <= values[current]:
            print("no better neighbor -> stop")
            return current
        current = best
        print("move to index", current, "value", values[current])

hill_climbing(values, 0)
'''),
("Random restarts escape a local maximum", "A landscape with a local peak (9) and a global peak (15). A single climb from index 0 gets stuck; restarts find the top.", r'''
import random
random.seed(1)
values = [2, 4, 7, 9, 7, 5, 3, 4, 6, 9, 12, 15, 12, 8, 5, 3, 6, 8, 6, 4]

def climb(start):
    cur = start
    while True:
        nbs = [i for i in (cur - 1, cur + 1) if 0 <= i < len(values)]
        best = max(nbs, key=lambda i: values[i])
        if values[best] <= values[cur]:
            return cur
        cur = best

print("single climb from 0 ->", values[climb(0)])
results = []
for attempt in range(5):
    s = random.randint(0, len(values) - 1)
    end = climb(s)
    results.append(values[end])
    print(f"restart {attempt + 1}: start {s:>2} -> peak {values[end]}")
print("best of 5 restarts:", max(results))
'''),
("Simulated annealing", "Worse moves are accepted with probability exp(dE / T). We count how many were accepted while the temperature cooled.", r'''
import math, random
random.seed(3)
values = [2, 4, 7, 9, 7, 5, 3, 4, 6, 9, 12, 15, 12, 8, 5, 3, 6, 8, 6, 4]

def anneal(start, T=10.0, cooling=0.95):
    cur, worse_accepted, steps = start, 0, 0
    while T > 0.1:
        nxt = min(len(values) - 1, max(0, cur + random.choice([-1, 1])))
        dE = values[nxt] - values[cur]
        if dE > 0 or random.random() < math.exp(dE / T):
            if dE < 0:
                worse_accepted += 1
            cur = nxt
        T *= cooling
        steps += 1
    return cur, steps, worse_accepted

end, steps, worse = anneal(0)
print(f"{steps} steps, accepted {worse} worse moves")
print("final value:", values[end])
'''),
("TSP: improving a delivery tour with 2-opt", "Eight stops with fixed coordinates (km). Reversing a segment is the neighbor move; we keep any change that shortens the tour.", r'''
import math
stops = {"Campus": (0, 0), "Baiterek": (4, 3), "EXPO": (7, -2), "Botanical": (2, 5),
         "Khan Shatyr": (5, 6), "Museum": (8, 4), "Station": (-3, 4), "Airport": (9, -6)}
names = list(stops)

def tour_length(route):
    return sum(math.dist(stops[route[i]], stops[route[(i + 1) % len(route)]])
               for i in range(len(route)))

route = names[:]                     # start with the order the stops were listed
print("initial:", round(tour_length(route), 2), "km")
improved = True
while improved:
    improved = False
    for i in range(1, len(route) - 1):
        for j in range(i + 1, len(route)):
            candidate = route[:i] + route[i:j + 1][::-1] + route[j + 1:]
            if tour_length(candidate) < tour_length(route) - 1e-9:
                route, improved = candidate, True
print("2-opt  :", round(tour_length(route), 2), "km")
print(" -> ".join(route))
'''),
("8-Queens with min-conflicts", "Constraint satisfaction as local search: move the most-conflicted queen to its least-conflicted row until there are zero conflicts.", r'''
import random
random.seed(7)
N = 8
board = [random.randrange(N) for _ in range(N)]    # board[col] = row

def conflicts(board, col, row):
    return sum(1 for c in range(N) if c != col and
               (board[c] == row or abs(board[c] - row) == abs(c - col)))

def total(board):
    return sum(conflicts(board, c, board[c]) for c in range(N)) // 2

print("start conflicts:", total(board))
for step in range(200):
    bad = [c for c in range(N) if conflicts(board, c, board[c]) > 0]
    if not bad:
        break
    col = random.choice(bad)
    scores = [conflicts(board, col, r) for r in range(N)]
    best = min(scores)
    board[col] = random.choice([r for r in range(N) if scores[r] == best])
print("steps:", step, " conflicts:", total(board))
for r in range(N):
    print(" ".join("Q" if board[c] == r else "." for c in range(N)))
'''),
]

LABS[4] = [
("Minimax on the lecture tree", "A tree is a nested list: a number is a leaf, a list is a node.", r'''
tree = [[3, 12, 8], [2, 4, 6], [14, 5, 2]]

def minimax(node, maximizing):
    if isinstance(node, (int, float)):
        return node
    values = [minimax(child, not maximizing) for child in node]
    return max(values) if maximizing else min(values)

print("MIN values:", [minimax(child, False) for child in tree])
print("root value:", minimax(tree, True))
'''),
("Alpha-Beta counts fewer leaves", "Same answer, less work. We count how many leaves each method looks at.", r'''
tree = [[3, 12, 8], [2, 4, 6], [14, 5, 2]]
seen = []

def alphabeta(node, alpha, beta, maximizing):
    if isinstance(node, (int, float)):
        seen.append(node)
        return node
    if maximizing:
        v = float("-inf")
        for child in node:
            v = max(v, alphabeta(child, alpha, beta, False))
            if v >= beta:
                return v
            alpha = max(alpha, v)
        return v
    v = float("inf")
    for child in node:
        v = min(v, alphabeta(child, alpha, beta, True))
        if v <= alpha:
            return v                   # prune the remaining children
        beta = min(beta, v)
    return v

print("root value:", alphabeta(tree, float("-inf"), float("inf"), True))
print("leaves evaluated:", seen, f"({len(seen)} of 9)")
'''),
("Expectimax", "Chance nodes average their children by probability.", r'''
from fractions import Fraction as F

def expectimax(node, kind):
    if isinstance(node, (int, float)):
        return node
    if kind == "max":
        return max(expectimax(child, "chance") for child in node)
    return sum(p * expectimax(child, "max") for p, child in node)

chance = [(F(1, 2), 8), (F(1, 3), 24), (F(1, 6), -12)]
print("lecture chance node:", expectimax(chance, "chance"))
game = [[(0.5, 1), (0.5, 0)], [(0.25, 9), (0.75, 0)]]
print("MAX over two chance nodes:", expectimax(game, "max"))
'''),
("Perfect tic-tac-toe", "Minimax over the full game (memoized). With perfect play by both sides the game is a draw, value 0.", r'''
from functools import lru_cache
LINES = [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]

def winner(b):
    for a, c, d in LINES:
        if b[a] != "." and b[a] == b[c] == b[d]:
            return b[a]
    return None

@lru_cache(maxsize=None)
def value(b, player):          # X maximizes (+1), O minimizes (-1)
    w = winner(b)
    if w: return 1 if w == "X" else -1
    if "." not in b: return 0
    nxt = "O" if player == "X" else "X"
    vals = [value(b[:i] + player + b[i+1:], nxt) for i in range(9) if b[i] == "."]
    return max(vals) if player == "X" else min(vals)

print("value of the empty board:", value("." * 9, "X"))
print("positions evaluated:", value.cache_info().currsize)
b = "XX.OO...."                 # X to move: can X win?
print("X to move in XX.OO.... ->", value(b, "X"))
'''),
]

LABS[5] = [
("Expected value, return and discounting", "Three small calculations from the lecture.", r'''
print("E[R] =", 0.9 * 10 + 0.1 * (-50))

rewards, gamma = [5, 10, 20], 0.9
G = sum(gamma**t * r for t, r in enumerate(rewards))
print("G =", round(G, 2))

for g in [0.5, 0.8, 0.9, 0.99]:
    print(f"gamma = {g:<4}: reward 100 ten steps away is worth {g**10 * 100:6.2f}")
'''),
("Value iteration on a chain", "The lecture's code. Values start at zero, so the step cost of -1 shows up first; after three sweeps they match the lecture slide: 4.58, 6.2, 8, 10.", r'''
import numpy as np
gamma, goal_value = 0.9, 10
V = np.zeros(4)
V[3] = goal_value
for k in range(4):
    new_V = V.copy()
    new_V[2] = -1 + gamma * V[3]
    new_V[1] = -1 + gamma * V[2]
    new_V[0] = -1 + gamma * V[1]
    V = new_V
    print(k + 1, np.round(V, 2))
'''),
("Value iteration on a slippery gridworld", "The lecture's 4x3 gridworld: the intended move succeeds with 0.8 and slips sideways with 0.1 each. Terminal rewards +1 and -1, step reward -0.04.", r'''
import numpy as np
ROWS, COLS, WALL = 3, 4, (1, 1)
TERM = {(0, 3): 1.0, (1, 3): -1.0}
ACTIONS = {"^": (-1, 0), "v": (1, 0), "<": (0, -1), ">": (0, 1)}
SIDE = {"^": "<>", "v": "<>", "<": "^v", ">": "^v"}
gamma, step_r = 0.9, -0.04

def move(s, a):
    r, c = s[0] + ACTIONS[a][0], s[1] + ACTIONS[a][1]
    if not (0 <= r < ROWS and 0 <= c < COLS) or (r, c) == WALL:
        return s                       # bump into a wall: stay
    return (r, c)

states = [(r, c) for r in range(ROWS) for c in range(COLS) if (r, c) != WALL]
V = {s: 0.0 for s in states}
for it in range(100):
    newV = {}
    for s in states:
        if s in TERM:
            newV[s] = TERM[s]; continue
        q = {a: sum(p * (step_r + gamma * V[move(s, b)])
                    for p, b in [(0.8, a), (0.1, SIDE[a][0]), (0.1, SIDE[a][1])])
             for a in ACTIONS}
        newV[s] = max(q.values())
    if max(abs(newV[s] - V[s]) for s in states) < 1e-6:
        break
    V = newV
print("converged after", it, "sweeps")
for r in range(ROWS):
    row = []
    for c in range(COLS):
        s = (r, c)
        if s == WALL: row.append("  ##  "); continue
        if s in TERM: row.append(f"{TERM[s]:+6.2f}"); continue
        best = max(ACTIONS, key=lambda a: sum(p * V[move(s, b)] for p, b in
                   [(0.8, a), (0.1, SIDE[a][0]), (0.1, SIDE[a][1])]))
        row.append(f"{V[s]:5.2f}{best}")
    print(" ".join(row))
'''),
("Q-learning on the five-state chain", "The lecture's complete program. After training, the greedy policy goes RIGHT in every state.", r'''
import numpy as np
rng = np.random.default_rng(0)
N_STATES, N_ACTIONS, GOAL = 5, 2, 4
LEFT, RIGHT = 0, 1
alpha, gamma, epsilon = 0.5, 0.9, 0.1
Q = np.zeros((N_STATES, N_ACTIONS))

def step(state, action):
    next_state = max(0, state - 1) if action == LEFT else min(GOAL, state + 1)
    return next_state, (10 if next_state == GOAL else -1)

def choose_action(state):
    if rng.random() < epsilon:
        return int(rng.integers(N_ACTIONS))
    return int(np.argmax(Q[state]))

for episode in range(200):
    state = 0
    while state != GOAL:
        action = choose_action(state)
        next_state, reward = step(state, action)
        target = reward + gamma * np.max(Q[next_state])
        Q[state, action] += alpha * (target - Q[state, action])
        state = next_state

print(np.round(Q, 2))
names = ["LEFT", "RIGHT"]
for s in range(GOAL):
    print("state", s, "->", names[int(np.argmax(Q[s]))])
'''),
]

LABS[6] = [
("Conditional probability from a table", "The lecture's traffic-and-weather joint table.", r'''
joint = {("Heavy", "Rain"): 0.24, ("Heavy", "No rain"): 0.21,
         ("Medium", "Rain"): 0.04, ("Medium", "No rain"): 0.25,
         ("Light", "Rain"): 0.02, ("Light", "No rain"): 0.24}

p_rain = sum(p for (t, w), p in joint.items() if w == "Rain")
p_heavy = sum(p for (t, w), p in joint.items() if t == "Heavy")
print("P(Rain)          =", round(p_rain, 2))
print("P(Heavy)         =", round(p_heavy, 2))
print("P(Heavy | Rain)  =", round(joint[("Heavy", "Rain")] / p_rain, 2))
'''),
("Bayes' theorem: the medical test", "Change the prior and see how strongly the base rate controls the answer.", r'''
def posterior(prior, sensitivity=0.95, false_positive=0.10):
    p_positive = sensitivity * prior + false_positive * (1 - prior)
    return sensitivity * prior / p_positive

for prior in [0.001, 0.01, 0.1, 0.5]:
    print(f"prevalence {prior:>6.1%} -> P(disease | +) = {posterior(prior):.2%}")
'''),
("Exact inference by enumeration", "P(Rain | Wet grass) in the sprinkler network, plus explaining away.", r'''
P_RAIN = 0.20
def p_sprinkler(rain): return 0.01 if rain else 0.40
def p_wet(rain, sprinkler):
    return {(True, True): 0.99, (True, False): 0.80,
            (False, True): 0.90, (False, False): 0.00}[(rain, sprinkler)]

def joint(rain, sprinkler, wet=True):
    pr = P_RAIN if rain else 1 - P_RAIN
    ps = p_sprinkler(rain) if sprinkler else 1 - p_sprinkler(rain)
    pw = p_wet(rain, sprinkler) if wet else 1 - p_wet(rain, sprinkler)
    return pr * ps * pw

rain_wet = sum(joint(True, s) for s in (True, False))
dry_wet = sum(joint(False, s) for s in (True, False))
print("P(Rain | Wet)            =", round(rain_wet / (rain_wet + dry_wet), 4))
a, b = joint(True, True), joint(False, True)
print("P(Rain | Wet, Sprinkler) =", round(a / (a + b), 4), " <- explaining away")
'''),
("Rejection sampling vs likelihood weighting", "Two approximate methods, same network, same number of samples.", r'''
import random
random.seed(42)
P_RAIN = 0.20
def p_sprinkler(rain): return 0.01 if rain else 0.40
def p_wet(rain, s): return {(True, True): .99, (True, False): .80,
                            (False, True): .90, (False, False): 0}[(rain, s)]
N = 100_000

accepted = rain_and_wet = 0
for _ in range(N):
    rain = random.random() < P_RAIN
    spr = random.random() < p_sprinkler(rain)
    wet = random.random() < p_wet(rain, spr)
    if wet:
        accepted += 1
        rain_and_wet += rain
print(f"rejection sampling : {rain_and_wet / accepted:.4f}  (kept {accepted} of {N})")

w_rain = w_total = 0.0
for _ in range(N):
    rain = random.random() < P_RAIN
    spr = random.random() < p_sprinkler(rain)
    w = p_wet(rain, spr)          # evidence Wet=True is fixed, not sampled
    w_total += w
    w_rain += w * rain
print(f"likelihood weighting: {w_rain / w_total:.4f}  (no samples discarded)")
print("exact answer        : 0.3577")
'''),
]

LABS[7] = [
("Predicting the next state", "Belief times transition matrix, repeated.", r'''
import numpy as np
T = np.array([[0.90, 0.10],
              [0.20, 0.80]])
p = np.array([0.80, 0.20])
for step in range(1, 6):
    p = p @ T
    print(f"step {step}: Healthy {p[0]:.3f}  Faulty {p[1]:.3f}")
'''),
("Filtering a sequence of readings", "Predict, correct, normalize for every reading.", r'''
import numpy as np
T = np.array([[.9, .1], [.2, .8]])
O = {"High": np.array([.2, .7]), "Normal": np.array([.8, .3])}
belief = np.array([.8, .2])
readings = ["High", "High", "Normal", "High", "High", "High"]
for t, reading in enumerate(readings):
    if t > 0:
        belief = belief @ T          # predict
    belief = belief * O[reading]     # correct
    belief = belief / belief.sum()   # normalize
    print(f"t={t+1} {reading:<6} P(Faulty) = {belief[1]:.3f}")
'''),
("Smoothing with forward-backward", "Re-estimate time 1 after seeing both readings.", r'''
import numpy as np
T = np.array([[.9, .1], [.2, .8]])
E = np.array([[.8, .2], [.3, .7]])    # rows: Healthy, Faulty; cols: Normal, High
pi = np.array([.8, .2])
obs = [1, 1]                          # High, High

fwd = [pi * E[:, obs[0]]]
for o in obs[1:]:
    fwd.append((fwd[-1] @ T) * E[:, o])
bwd = [np.ones(2)]
for o in reversed(obs[1:]):
    bwd.insert(0, T @ (E[:, o] * bwd[0]))

for t in range(len(obs)):
    filt = fwd[t] / fwd[t].sum()
    smooth = fwd[t] * bwd[t] / (fwd[t] * bwd[t]).sum()
    print(f"time {t+1}: filtered P(F) = {filt[1]:.3f}   smoothed P(F) = {smooth[1]:.3f}")
'''),
("Viterbi from scratch", "Keep the best path into every state, then backtrack.", r'''
import numpy as np
states = ["Healthy", "Faulty"]
T = np.array([[.9, .1], [.2, .8]])
E = np.array([[.8, .2], [.3, .7]])
pi = np.array([.8, .2])

def viterbi(obs):
    delta = pi * E[:, obs[0]]
    back = []
    for o in obs[1:]:
        scores = delta[:, None] * T        # scores[i, j]: from i to j
        back.append(scores.argmax(axis=0))
        delta = scores.max(axis=0) * E[:, o]
    path = [int(delta.argmax())]
    for bp in reversed(back):
        path.insert(0, int(bp[path[0]]))
    return [states[s] for s in path], round(float(delta.max()), 6)

print(viterbi([1, 1]))
print(viterbi([0, 1, 1, 0, 1]))
'''),
]

LABS[8] = [
("Expected utility and the MEU choice", "The lecture's two projects and two robot routes.", r'''
def EU(probs, utilities):
    return sum(p * u for p, u in zip(probs, utilities))

options = {"Project A": ([0.9, 0.1], [100, -20]),
           "Project B": ([0.6, 0.4], [200, -50]),
           "Route A":   ([0.8, 0.2], [100, -50]),
           "Route B":   ([0.95, 0.05], [80, -20])}
for name, (p, u) in options.items():
    print(f"{name:<10} EU = {EU(p, u):6.1f}")
'''),
("Cost-based maintenance thresholds", "The threshold comes from the costs, not from the model.", r'''
maintenance_cost, failure_cost = 2000, 10000
threshold = maintenance_cost / failure_cost
print("threshold:", threshold)
for p in [0.10, 0.20, 0.30, 0.50]:
    cost_continue = p * failure_cost
    choice = "Maintain" if cost_continue > maintenance_cost else "Continue"
    print(f"p = {p:.2f}: continue costs {cost_continue:>6.0f} -> {choice}")
'''),
("Linear regression two ways", "By hand with least squares, and with scikit-learn. Both give the same line.", r'''
import numpy as np
from sklearn.linear_model import LinearRegression
X = np.array([15, 20, 25, 30, 35])
y = np.array([174, 201, 224, 251, 278])

w = ((X - X.mean()) * (y - y.mean())).sum() / ((X - X.mean())**2).sum()
b = y.mean() - w * X.mean()
print(f"by hand : y = {w:.2f} x + {b:.2f}")

model = LinearRegression().fit(X.reshape(-1, 1), y)
print(f"sklearn : y = {model.coef_[0]:.2f} x + {model.intercept_:.2f}")
pred = model.predict(X.reshape(-1, 1))
print("MSE     :", round(np.mean((y - pred)**2), 3))
print("predict 32 C ->", round(model.predict([[32]])[0], 2), "kWh")
'''),
("Logistic regression and the threshold", "Synthetic machine data with rare failures. Lowering the threshold from 0.5 to 0.2 catches more failures.", r'''
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import recall_score, precision_score

rng = np.random.default_rng(0)
n = 2000
temp = rng.normal(65, 8, n)
vib = rng.normal(2.5, 0.8, n)
risk = 0.25 * (temp - 75) + 1.8 * (vib - 3.5)
y = (rng.random(n) < 1 / (1 + np.exp(-risk))).astype(int)
X = np.column_stack([temp, vib])
print("failure rate:", round(y.mean(), 3))

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression()).fit(X_tr, y_tr)
p = model.predict_proba(X_te)[:, 1]
for tau in [0.5, 0.2]:
    alerts = (p >= tau).astype(int)
    print(f"tau = {tau}: recall {recall_score(y_te, alerts):.2f}, "
          f"precision {precision_score(y_te, alerts):.2f}, alerts {alerts.sum()}")
'''),
("Decision tree vs random forest", "Same split, two models. A depth-limited tree is readable; the forest usually generalizes better.", r'''
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier

X, y = make_moons(n_samples=600, noise=0.3, random_state=1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=1)
for model in [DecisionTreeClassifier(max_depth=2, random_state=0),
              DecisionTreeClassifier(random_state=0),
              RandomForestClassifier(n_estimators=100, random_state=0)]:
    model.fit(X_tr, y_tr)
    print(f"{type(model).__name__:<24} depth={getattr(model, 'max_depth', None)!s:<5}"
          f" train {model.score(X_tr, y_tr):.2f}  test {model.score(X_te, y_te):.2f}")
small = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_tr, y_tr)
print(export_text(small, feature_names=["x1", "x2"]))
'''),
("K-Means customer segments", "The lecture's data: [purchase frequency, spending]. Scaling first matters.", r'''
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
X = [[1, 120], [2, 150], [3, 190], [5, 480], [6, 530], [7, 810], [8, 850], [9, 920]]
X_scaled = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = km.fit_predict(X_scaled)
for row, lab in zip(X, labels):
    print(row, "-> cluster", lab)
print("within-cluster sum of squares J =", round(km.inertia_, 3))
'''),
("Metrics from a confusion matrix", "Why 98 % accuracy can be useless.", r'''
def metrics(tp, fn, fp, tn):
    n = tp + fn + fp + tn
    acc = (tp + tn) / n
    rec = tp / (tp + fn) if tp + fn else 0
    pre = tp / (tp + fp) if tp + fp else 0
    f1 = 2 * pre * rec / (pre + rec) if pre + rec else 0
    return acc, pre, rec, f1

for name, cm in {"always normal": (0, 20, 0, 980),
                 "model A": (60, 40, 10, 890),
                 "model B": (90, 10, 70, 830)}.items():
    a, p, r, f = metrics(*cm)
    print(f"{name:<14} accuracy {a:.2f}  precision {p:.2f}  recall {r:.2f}  F1 {f:.2f}")
'''),
]

LABS[9] = [
("A perceptron learns AND", "Exact arithmetic (fractions) so every update is easy to check by hand.", r'''
from fractions import Fraction as F
X = [(0, 0), (0, 1), (1, 0), (1, 1)]
y = [0, 0, 0, 1]
w, b, alpha = [F(0), F(0)], F(0), F(1, 10)

for epoch in range(1, 20):
    errors = 0
    for (x1, x2), target in zip(X, y):
        pred = 1 if w[0] * x1 + w[1] * x2 + b > 0 else 0
        update = alpha * (target - pred)
        if update:
            w = [w[0] + update * x1, w[1] + update * x2]
            b += update
            errors += 1
    print(f"epoch {epoch}: w = ({float(w[0])}, {float(w[1])}), b = {float(b)}, errors = {errors}")
    if errors == 0:
        break
'''),
("XOR defeats one perceptron", "The same learning rule never reaches zero errors on XOR.", r'''
from fractions import Fraction as F
X = [(0, 0), (0, 1), (1, 0), (1, 1)]
y = [0, 1, 1, 0]
w, b, alpha = [F(0), F(0)], F(0), F(1, 10)
history = []
for epoch in range(1, 31):
    errors = 0
    for (x1, x2), target in zip(X, y):
        pred = 1 if w[0] * x1 + w[1] * x2 + b > 0 else 0
        u = alpha * (target - pred)
        w, b = [w[0] + u * x1, w[1] + u * x2], b + u
        errors += u != 0
    history.append(errors)
print("errors per epoch:", history)
print("never zero -> XOR is not linearly separable")
'''),
("Two layers solve XOR (hand-set weights)", "Hidden unit 1 computes OR, hidden unit 2 computes NAND, the output computes AND of them.", r'''
step = lambda z: 1 if z > 0 else 0

def network(x1, x2):
    h1 = step(1.0 * x1 + 1.0 * x2 - 0.5)     # OR
    h2 = step(-1.0 * x1 - 1.0 * x2 + 1.5)    # NAND
    return step(1.0 * h1 + 1.0 * h2 - 1.5), (h1, h2)   # AND

for x in [(0, 0), (0, 1), (1, 0), (1, 1)]:
    out, hidden = network(*x)
    print(x, "hidden", hidden, "-> output", out)
'''),
("Backpropagation from scratch", "A 2-4-1 network with sigmoid units learns XOR by gradient descent. Watch the loss fall.", r'''
import numpy as np
rng = np.random.default_rng(1)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)
sig = lambda z: 1 / (1 + np.exp(-z))

W1, b1 = rng.normal(0, 1, (2, 4)), np.zeros(4)
W2, b2 = rng.normal(0, 1, (4, 1)), np.zeros(1)
lr = 1.0
for epoch in range(5001):
    h = sig(X @ W1 + b1)                  # forward pass
    out = sig(h @ W2 + b2)
    loss = np.mean((out - y) ** 2)
    d_out = 2 * (out - y) / len(X) * out * (1 - out)     # backward pass
    d_h = d_out @ W2.T * h * (1 - h)
    W2 -= lr * h.T @ d_out;  b2 -= lr * d_out.sum(0)    # gradient descent
    W1 -= lr * X.T @ d_h;    b1 -= lr * d_h.sum(0)
    if epoch % 1000 == 0:
        print(f"epoch {epoch:>4}: loss {loss:.4f}")
print("predictions:", out.round(2).ravel())
'''),
("A neural network in scikit-learn", "MLPClassifier on a curved two-class dataset, compared with logistic regression.", r'''
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier

X, y = make_moons(n_samples=600, noise=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=0)
linear = LogisticRegression().fit(X_tr, y_tr)
net = MLPClassifier(hidden_layer_sizes=(16, 16), max_iter=2000, random_state=0).fit(X_tr, y_tr)
print("logistic regression test accuracy:", round(linear.score(X_te, y_te), 3))
print("neural network      test accuracy:", round(net.score(X_te, y_te), 3))
'''),
]

LABS[10] = [
("Softmax with temperature", "How the temperature reshapes the same next-token scores.", r'''
import numpy as np
tokens = ["box", "cup", "tool", "sky"]
logits = np.log([0.45, 0.25, 0.20, 0.10])

def softmax(z, T):
    e = np.exp((z - z.max()) / T)
    return e / e.sum()

for T in [0.3, 1.0, 2.0]:
    p = softmax(logits, T)
    print(f"T = {T}: " + "  ".join(f"{t} {q:.2f}" for t, q in zip(tokens, p)))
'''),
("A tiny bigram language model", "Count which word follows which, then generate text one token at a time. Real LLMs replace the counts with a neural network.", r'''
import random
from collections import Counter, defaultdict
random.seed(4)
corpus = ("the agent observes the world . the agent chooses an action . "
          "the world changes . the agent learns from the reward . "
          "the robot observes the box . the robot picks up the box .").split()

counts = defaultdict(Counter)
for a, b in zip(corpus, corpus[1:]):
    counts[a][b] += 1

print("after 'the':", dict(counts["the"]))
word, text = "the", ["the"]
for _ in range(12):
    options, weights = zip(*counts[word].items())
    word = random.choices(options, weights)[0]
    text.append(word)
print(" ".join(text))
'''),
("Attention in a few lines", "Scaled dot-product attention: each token's output is a weighted average of all tokens' values.", r'''
import numpy as np
rng = np.random.default_rng(0)
tokens = ["the", "robot", "picked", "it"]
d = 4
X = rng.normal(size=(len(tokens), d))          # toy token embeddings
Wq, Wk, Wv = (rng.normal(size=(d, d)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv

scores = Q @ K.T / np.sqrt(d)
weights = np.exp(scores - scores.max(1, keepdims=True))
weights /= weights.sum(1, keepdims=True)       # softmax per row
print("attention weights (rows sum to 1):")
print("        " + "  ".join(f"{t:>6}" for t in tokens))
for t, row in zip(tokens, weights):
    print(f"{t:>6}  " + "  ".join(f"{w:6.2f}" for w in row))
output = weights @ V
print("output shape:", output.shape)
'''),
("Checking an AI answer against a source", "A habit, not an algorithm: compare generated numbers with values recomputed from the lecture. One claimed value below is deliberately wrong.", r'''
claimed = {"Bayes medical test": 0.0876, "Sprinkler P(Rain|Wet)": 0.3577, "HMM P(F) after 2 HIGH": 0.80}

recomputed = {
    "Bayes medical test": 0.95 * 0.01 / (0.95 * 0.01 + 0.10 * 0.99),
    "Sprinkler P(Rain|Wet)": 0.16038 / (0.16038 + 0.288),
    "HMM P(F) after 2 HIGH": 0.298667 / 0.413333,
}
for k in claimed:
    ok = abs(claimed[k] - recomputed[k]) < 0.001
    print(f"{k:<24} claimed {claimed[k]:.4f}  recomputed {recomputed[k]:.4f}  {'OK' if ok else 'WRONG'}")
'''),
]
