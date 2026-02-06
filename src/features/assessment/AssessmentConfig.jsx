// Assessment Configuration Template
// Replace the placeholder values with your actual course details

// Question type constants
export const QUESTION_TYPES = {
    MCQ: 'mcq',
    FILL_BLANK: 'fill_blank',
    MATCHING: 'matching',
    TRUE_FALSE: 'true_false'
};

export const ASSESSMENT_CONFIG = {
    // Replace {COURSE_NAME} with your actual course title
    courseName: "Introduction to React Development",

    // Replace {NUMBER_OF_TOPICS} with the actual number of topics
    numberOfTopics: 4,

    // Replace {LIST_OF_TOPICS} with your actual topic list
    topics: [
        "React Fundamentals",
        "Components and Props",
        "State Management",
        "Hooks and Effects"
    ],

    // Replace {QUESTIONS_PER_TOPIC} with desired number of questions per topic
    questionsPerTopic: 5,

    // Replace {OPTIONS_PER_QUESTION} with desired number of answer options
    optionsPerQuestion: 4
};

// Question bank for different topics - customize based on your course content
export const QUESTION_BANK = {
    "React Fundamentals": [
        // MCQ Questions
        {
            type: 'mcq',
            question: "What is React primarily used for?",
            options: [
                "Building user interfaces",
                "Database management",
                "Server configuration",
                "Network programming"
            ],
            correctAnswer: 0
        },
        {
            type: 'mcq',
            question: "Who created React?",
            options: [
                "Google",
                "Facebook (Meta)",
                "Microsoft",
                "Amazon"
            ],
            correctAnswer: 1
        },
        // Fill in the Blank
        {
            type: 'fill_blank',
            question: "JSX stands for _____ _____",
            answer: "JavaScript XML"
        },
        // Matching
        {
            type: 'matching',
            question: "Match the React concept to its description",
            pairs: [
                { left: "Props", right: "Data passed from parent to child" },
                { left: "State", right: "Component's internal data" },
                { left: "JSX", right: "HTML-like syntax for React" }
            ]
        },
        // True/False
        {
            type: 'true_false',
            question: "React can only be used with JavaScript",
            correctAnswer: false
        }
    ],

    "Components and Props": [
        {
            type: 'mcq',
            question: "What are the two main types of React components?",
            options: [
                "Static and Dynamic",
                "Class and Functional",
                "Simple and Complex",
                "Parent and Child"
            ],
            correctAnswer: 1
        },
        {
            type: 'fill_blank',
            question: "Props is short for _____",
            answer: "Properties"
        },
        {
            type: 'matching',
            question: "Match the component concept to its characteristic",
            pairs: [
                { left: "Functional Component", right: "Uses hooks" },
                { left: "Class Component", right: "Uses render()" },
                { left: "Props", right: "Read-only data" }
            ]
        },
        {
            type: 'true_false',
            question: "Props can be modified by the child component",
            correctAnswer: false
        },
        {
            type: 'mcq',
            question: "What is the purpose of the key prop?",
            options: [
                "To style components",
                "To uniquely identify elements in a list",
                "To pass data between components",
                "To control component visibility"
            ],
            correctAnswer: 1
        }
    ],

    "State Management": [
        {
            type: 'mcq',
            question: "What is the purpose of state in React?",
            options: [
                "To store component data that can change",
                "To store CSS styles",
                "To store API endpoints",
                "To store component props"
            ],
            correctAnswer: 0
        },
        {
            type: 'fill_blank',
            question: "The useState hook returns an array with the _____ value and a _____ function",
            answer: "current, setter"
        },
        {
            type: 'matching',
            question: "Match the state management concept to its description",
            pairs: [
                { left: "useState", right: "Manages local component state" },
                { left: "useContext", right: "Shares state across components" },
                { left: "useReducer", right: "Manages complex state logic" }
            ]
        },
        {
            type: 'true_false',
            question: "You should modify state directly in React",
            correctAnswer: false
        },
        {
            type: 'mcq',
            question: "Can state be shared between components?",
            options: [
                "No, never",
                "Yes, through props",
                "Yes, through lifting state up",
                "Only with context API"
            ],
            correctAnswer: 2
        }
    ],

    "Hooks and Effects": [
        {
            type: 'mcq',
            question: "What is the purpose of useEffect hook?",
            options: [
                "To handle side effects",
                "To manage state",
                "To pass props",
                "To create components"
            ],
            correctAnswer: 0
        },
        {
            type: 'fill_blank',
            question: "To make useEffect run only once on mount, pass an _____ array as the second argument",
            answer: "empty"
        },
        {
            type: 'matching',
            question: "Match the hook to its purpose",
            pairs: [
                { left: "useEffect", right: "Handle side effects" },
                { left: "useContext", right: "Access context values" },
                { left: "useCallback", right: "Memoize functions" }
            ]
        },
        {
            type: 'true_false',
            question: "useEffect runs before the component renders",
            correctAnswer: false
        },
        {
            type: 'mcq',
            question: "Which hook is used for context API?",
            options: [
                "useState",
                "useEffect",
                "useContext",
                "useReducer"
            ],
            correctAnswer: 2
        }
    ]
};

// Helper function to get random questions for a topic
export const getRandomQuestions = (topic, count) => {
    const questions = QUESTION_BANK[topic] || [];
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, questions.length));
};

// Helper function to shuffle options (only for MCQ questions)
export const shuffleOptions = (question) => {
    // Only shuffle options for MCQ questions
    if (question.type !== 'mcq' || !question.options) {
        return question;
    }

    const options = [...question.options];
    const correctAnswer = options[question.correctAnswer];

    // Shuffle options
    const shuffled = options.sort(() => 0.5 - Math.random());

    // Find new correct answer index
    const newCorrectAnswer = shuffled.indexOf(correctAnswer);

    return {
        ...question,
        options: shuffled,
        correctAnswer: newCorrectAnswer
    };
};
