const ENUM_CARD_PROPERTIES = {
    "apr": "APR", 
    "annual_fees": "Annual Fees", 
    "extra_fees": "Extra Fees", 
    "benefits": "Benefits", 
    "misc_terms": "Misc. Terms"
};
const states = [ 'PLEASE SELECT', 'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
           'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
           'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
           'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
let state_options = []
for (const state of states) {
    state_options.push({ text: state });
}
const questions = [
    {
        friendlyName: "state",
        question: "What state do you live in?",
        answers: state_options,
        dropdown: true,
    },
    {
        friendlyName: "ownedBefore",
        question: "Have you owned a credit card before?",
        answers: [
            { text: "Yes" },
            { text: "No" },
        ]
    },
    {
        friendlyName: "whyNoCard",
        question: "Why do you not own a credit card?",
        answers: [
            { text: "Never felt the need to get one" },
            { text: "I don't like the idea of debt" },
            { text: "I applied and was rejected" },
            { text: "N/A" },
        ],
        requires: { dependsOn: "ownedBefore", choices: [1], defaultChoice: 3 }
    },
    {
        friendlyName: "impulseBuying",
        question: "You're on Amazon and an item catches your eye. There's only 1 left in stock. What would you do?",
        answers: [
            { text: "Buy it before anybody else gets it" },
            { text: "Check the price and see if it's in your budget" },
            { text: "Put it on a wishlist to think about later" },
        ],
    },
    {
        friendlyName: "onlineShoppingFreq",
        question: "How often do you shop online?",
        answers: [
            { text: "I live on Amazon" },
            { text: "Frequently" },
            { text: "Sometimes" },
            { text: "Rarely" },
            { text: "Never" },
        ]
    },
    {
        friendlyName: "usageFreq",
        question: "How often do you use/intend to use your credit card?",
        answers: [
            { text: "As little as possible" },
            { text: "Rarely" },
            { text: "Sometimes" },
            { text: "Often" },
            { text: "Whenever possible" },
        ],
    },
    {
        friendlyName: "creditScore",
        question: "What is your credit score?",
        answers: [
            { text: "Not sure" },
            { text: "Less than or equal to 619" },
            { text: "Between 620 and 719 (inclusive)" },
            { text: "Greater than or equal to 720" },
        ],
        requires: { dependsOn: "ownedBefore", choices: [0], defaultChoice: 0 }
    },
    {
        friendlyName: "pastDebt",
        question: "Do you have any pre-existing credit card debt?",
        answers: [
            { text: "None" },
            { text: "Very little (less than 100)" },
            { text: "Some amount (between 100 and 500)" },
            { text: "A lot (more than 500)" },
        ],
        requires: { dependsOn: "ownedBefore", choices: [0], defaultChoice: 0 }
    },
    {
        friendlyName: "annualFees",
        question: "Are you comfortable paying an annual fee for premium benefits?",
        answers: [
            { text: "It's my card, I shouldn't have to pay extra ($0)" },
            { text: "A small amount (less than $50 per year)" },
            { text: "A decent amount (less than $100 per year)" },
            { text: "I don't mind an annual fee" },
        ],
    },
    {
        friendlyName: "creditLimit",
        question: "How important is a large credit limit for you?",
        answers: [
            { text: "Very important" },
            { text: "Somewhat important" },
            { text: "Not very important" },
            { text: "I'm not sure" },
        ],
    },
];
let responses = {};

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    responses = {};
    nextButton.innerHTML = "Next";
    showQuestion();
};

function showQuestion() {
    resetState();
    let question = questions[currentQuestionIndex];
    if (typeof question.requires != 'undefined') {
        let req = question.requires;
        let allowed = false;
        for (const opt of req.choices) {
            allowed = allowed || responses[req.dependsOn] == opt;
        }
        if (!allowed) {
            submit_answer(currentQuestionIndex, req.defaultChoice);
            handleNextButton();
            return;
        }
    }
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
        let option_num_copy = option_num;
        option_num += 1;
        if (question.dropdown != true) { button.classList.add("btn"); }
        append_to.appendChild(button);
        if (question.dropdown == true) { continue; }
        button.addEventListener("click", function() {
            submit_answer(currentQuestionIndex, option_num_copy);
            for (choice of append_to.children) {
                choice.classList.remove('optionselected');
            }
            button.classList.add('optionselected');
        });
    }
    if (question.dropdown == true) {
        append_to.addEventListener('change', function() {
            submit_answer(currentQuestionIndex, append_to.selectedIndex);
        });
    }
    window.scrollTo(0, document.body.scrollHeight);
}

function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function submit_answer(question_indx, answer_indx) {
    responses[questions[question_indx].friendlyName] = answer_indx;
    nextButton.style.display = "block";
    window.scrollTo(0, document.body.scrollHeight);
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
        card_name_label.style.fontSize = "25px";
        card_div.appendChild(card_name_container);

        let [provider_name_container, ] = make_tooltip(card.provider, card.provider);
        card_div.appendChild(provider_name_container);

        let info_grid = document.createElement('DIV');
        info_grid.classList.add('carddata');
        for (const prop in ENUM_CARD_PROPERTIES) {
            let prop_div = document.createElement('DIV');
            let val_div = document.createElement('DIV'); 
            prop_div.innerText = ENUM_CARD_PROPERTIES[prop];
            val_div.innerText = card[prop];
            info_grid.appendChild(prop_div);
            info_grid.appendChild(val_div);
        }
        card_div.appendChild(info_grid);

        document.querySelector('#cardresults').appendChild(card_div);
    }

    document.querySelector("#quizpane").style.display = "none";
    document.querySelector("#resultspane").style.display = "block";
    
    window.scrollTo(0, document.body.scrollHeight);
}
function make_tooltip(main_text, tooltip_text) {
    let container = document.createElement('DIV');
    container.classList.add('hovertip');
    let label = document.createElement('DIV');
    label.style.whiteSpace = "nowrap";
    label.style.overflow = "hidden";
    label.style.maxWidth = "100%";
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