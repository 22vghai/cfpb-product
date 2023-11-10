states = [ 'PLEASE SELECT', 'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
           'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
           'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
           'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
state_options = []
for (const state of states) {
    state_options.push({ text: state });
}
const questions = [
    /*
    {
        question: "What state do you live in?",
        answers: state_options,
        dropdown: true,
    },
    {
        question: "How often do you eat out at a restaraunt?",
        answers: [
            { text: "daily" },
            { text: "weekly" },
            { text: "biweekly" },
            { text: "every weekend" },
        ]
    },
    {
        question: "How often do you order takeout?",
        answers: [
            { text: "daily" },
            { text: "weekly" },
            { text: "biweekly" },
            { text: "every weekend" },
        ]
    },
    {
        question: "How much income do you earn yearly?",
        answers: [
            { text: "<$30,000" },
            { text: "$30,000-$60,000" },
            { text: "$60,000-$80,000" },
            { text: "$80,000>" },
        ]
    },
    {
        question: "What year of college are you currently in",
        answers: [
            { text: "freshman" },
            { text: "sophmore" },
            { text: "junior" },
            { text: "senior" },
        ]
    },
    {
        question: "Have you had a credit card before?",
        answers: [
            { text: "yes" },
            { text: "no, never applied for one" },
            { text: "no, applied and was rejected" },
        ]
    },
    {
        question: "Do you have a credit score? If so, what range is it in?",
        answers: [
            { text: "less than or equal to 619" },
            { text: "between 620 and 719 (inclusive)" },
            { text: "greater than or equal to 720" },
        ]
    },
    */
    {
        question: "Do you have past credit card debt?",
        answers: [
            { text: "no" },
            { text: "yes, less than $1,000" },
            { text: "yes, between $1,001 and $5,000" },
            { text: "yes, more than $5,000" },
        ]
    }
];
let responses = [];

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    responses = [];
    nextButton.innerHTML = "Next";
    showQuestion();
};

function showQuestion() {
    resetState();
    let question = questions[currentQuestionIndex];
    questionElement.innerText = '' + (currentQuestionIndex + 1) + ". " + question.question;

    let append_to = answerButtons;
    if (question.dropdown) {
        append_to = document.createElement('SELECT');
        answerButtons.appendChild(append_to);
    }
    let option_num = 0;
    for (const answer of question.answers) {
        let button = document.createElement((question.dropdown == true) ? 'OPTION' : 'BUTTON');
        button.innerText = answer.text;
        button.classList.add("btn");
        option_num += 1;
        append_to.appendChild(button);
        button.addEventListener("click", function() {
            responses[currentQuestionIndex] = option_num;
            nextButton.style.display = "block";
            window.scrollTo(0, document.body.scrollHeight);
            if (question.dropdown == true) { return; }
            for (choice of append_to.children) {
                choice.classList.remove('optionselected');
            }
            button.classList.add('optionselected');
        });
    }
}

function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

async function showResults() {
    resetState();
    const response = await fetch('/fetchcards', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responses),
    });
    const recommends = await response.json();
    document.querySelector('#profilename').innerText = "You are a(n): " + recommends.profile;
    document.querySelector('#profileinfo').innerText = recommends.profileinfo;

    for (const card of recommends.cards) {
        let card_div = document.createElement('DIV');
        card_div.classList.add('cardinfo');

        let [card_name_container, card_name_label] = make_tooltip(card.name, card.name);
        card_name_label.style.fontSize = "20px";
        card_div.appendChild(card_name_container);

        let [provider_name_container, ] = make_tooltip(card.provider, card.provider);
        card_div.appendChild(provider_name_container);
        

        document.querySelector('#cardresults').appendChild(card_div);
    }

    document.querySelector("#quizpane").style.display = "none";
    document.querySelector("#resultspane").style.display = "block";
    /*
    nextButton.innerHTML = "Retake Quiz";
    nextButton.style.display = "block";
    */
}
function make_tooltip(main_text, tooltip_text) {
    let container = document.createElement('DIV');
    container.classList.add('hovertip');
    let label = document.createElement('DIV');
    label.style.whiteSpace = "nowrap";
    label.style.overflow = "hidden";
    label.innerText = main_text; container.dataset.text = tooltip_text;
    container.appendChild(label);
    return [container, label];
}

async function handleNextButton() {
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){
        showQuestion();
    } else {
        await showResults();
    }
}

nextButton.addEventListener("click", async () => {
    if(currentQuestionIndex < questions.length) {
        await handleNextButton();
    } else {
        startQuiz();
    }
});

startQuiz();