RAW = {
    "React": [
        ("theory", "What does useEffect with an empty dependency array do?", ["Runs after every render", "Runs once after the first render", "Runs before every render", "Never runs"], 1),
        ("practice", "A list is rendered with map and React warns about missing keys. What is the best key?", ["The array index, always", "A stable unique id from the data", "A random number on each render", "The length of the item text"], 1),
    ],
    "JavaScript": [
        ("theory", "How does === differ from ==?", ["It compares value and type without coercion", "It compares only the type", "It compares references only", "There is no difference"], 0),
        ("practice", "What does console.log(typeof null) print?", ["null", "undefined", "object", "number"], 2),
    ],
    "TypeScript": [
        ("theory", "What is the main benefit of TypeScript over JavaScript?", ["Faster runtime", "Static type checking at compile time", "Smaller bundles", "Built-in UI components"], 1),
        ("practice", "Which type is safer than any when a value type is truly unknown?", ["unknown", "object", "never", "void"], 0),
    ],
    "Node.js": [
        ("theory", "Node.js handles many concurrent connections mainly because of:", ["One thread per request", "A non-blocking event loop", "A new process for every request", "Compiling to C++"], 1),
        ("practice", "In Express, what must a middleware call to pass control to the next handler?", ["next()", "return()", "done()", "continue()"], 0),
    ],
    "SQL": [
        ("theory", "Which join returns all rows from the left table even with no match on the right?", ["INNER JOIN", "LEFT JOIN", "CROSS JOIN", "Only a SELF JOIN"], 1),
        ("practice", "Which clause filters groups after aggregation?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], 1),
    ],
    "REST APIs": [
        ("theory", "Which HTTP method is idempotent and typically replaces a whole resource?", ["POST", "PUT", "CONNECT", "None of them"], 1),
        ("practice", "Which status code should an API return when a resource is created?", ["200", "201", "204", "302"], 1),
    ],
    "Git": [
        ("theory", "What does git rebase do?", ["Deletes a branch", "Replays commits onto a new base", "Pushes to the remote", "Reverts a commit"], 1),
        ("practice", "Which command shows unstaged changes?", ["git diff", "git log", "git push", "git stash list"], 0),
    ],
    "Python": [
        ("theory", "What is the key difference between a list and a tuple?", ["Tuples are mutable, lists are not", "Lists are mutable, tuples are not", "They are identical", "Tuples can only hold numbers"], 1),
        ("practice", "What does [x*2 for x in range(3)] produce?", ["[0, 2, 4]", "[2, 4, 6]", "[0, 1, 2]", "[0, 2, 4, 6]"], 0),
    ],
    "Machine Learning": [
        ("theory", "What is overfitting?", ["Good on training data but poor on new data", "Poor on all data", "Training that takes too long", "A model with too few parameters"], 0),
        ("practice", "Which split should you use to tune hyperparameters without touching the final test set?", ["Validation set", "Training set only", "Test set", "None of them"], 0),
    ],
    "Statistics": [
        ("theory", "A p-value of 0.03 means:", ["There is a 3 percent chance the null hypothesis is true", "Data this extreme would occur 3 percent of the time if the null were true", "The effect is 97 percent likely to be real", "The sample size is 3 percent"], 1),
        ("practice", "Which measure of center is least affected by outliers?", ["Mean", "Median", "Range", "Variance"], 1),
    ],
    "Pandas/NumPy": [
        ("theory", "What is NumPy broadcasting?", ["Sending arrays over a network", "Applying operations to arrays of different shapes by stretching dimensions", "Sorting arrays", "Copying arrays"], 1),
        ("practice", "Which pandas call gives the count of missing values per column?", ["df.isna().sum()", "df.count_na()", "df.missing()", "df.null()"], 0),
    ],
    "Figma": [
        ("theory", "What is Auto Layout in Figma used for?", ["Frames that resize and reflow with their content", "Exporting code", "Version history", "Pixel snapping only"], 0),
        ("practice", "Which Figma feature lets you reuse an element and update every copy at once?", ["Components", "Groups", "Flatten", "Masks"], 0),
    ],
    "User Research": [
        ("theory", "Which is a leading interview question you should avoid?", ["Tell me about the last time you booked a trip", "Do you agree this checkout is confusing?", "What did you do next?", "How do you usually decide?"], 1),
        ("practice", "Roughly how many users uncover most usability issues in one round of qualitative testing?", ["1", "5", "50", "500"], 1),
    ],
    "Wireframing & Prototyping": [
        ("theory", "What is the main purpose of a low-fidelity wireframe?", ["Final visual polish", "Agree on structure and flow before visual design", "Developer handoff specs", "Brand guidelines"], 1),
        ("practice", "Which usually comes first in a design process?", ["High-fidelity mockup", "Low-fidelity wireframe", "Developer handoff", "Launch review"], 1),
    ],
    "Visual Design": [
        ("theory", "What contrast ratio does WCAG AA require for normal body text?", ["2 to 1", "3 to 1", "4.5 to 1", "10 to 1"], 2),
        ("practice", "Which principle groups related items by placing them close together?", ["Proximity", "Symmetry", "Repetition", "Emphasis"], 0),
    ],
    "Interaction Design": [
        ("theory", "Fitts Law says the time to reach a target depends on:", ["Its color", "Its distance and size", "Its label length", "Its position in the DOM"], 1),
        ("practice", "What should a good error message do?", ["Blame the user", "Explain what went wrong and how to fix it", "Show only an error code", "Disappear instantly"], 1),
    ],
}

BANK = {
    skill: [dict(dim=d, prompt=p, options=o, answer=a) for d, p, o, a in qs]
    for skill, qs in RAW.items()
}
