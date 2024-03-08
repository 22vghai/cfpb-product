const CARD_COLORS = ["#e8bcbc", "#e8e7bc", "#c4e8bc", "#bce8e2", "#bcd2e8", "#d5bce8", "#e8bcc6"];

const ENUM_CARD_PROPERTIES = {
    "apr": "APR", 
    "annual_fees": "Annual Fees", 
    "extra_fees": "Extra Fees", 
    "benefits": "Benefits", 
    "misc_terms": "Misc. Terms"
};
const questions = window.moduleExports.questions;
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

    document.querySelector('#quizpane').style.maxWidth = "100%";

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
        let color = CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
        card_div.style.backgroundColor = color;
        card_div.style.borderColor = color;
            let card_inner = document.createElement('DIV');
            card_inner.classList.add('cardcontainerinner');
                let card_header = document.createElement('DIV');
                    card_header.classList.add('cardheader');
                    let [card_name_container, card_name_label] = make_tooltip(card.name, card.name);
                    card_name_label.style.fontSize = "25px";
                    card_header.appendChild(card_name_container);
                    let [provider_name_container, ] = make_tooltip(card.provider, card.provider);
                    card_header.appendChild(provider_name_container);
                card_inner.appendChild(card_header);

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
                card_inner.appendChild(info_grid);
            card_div.appendChild(card_inner);
        document.querySelector('#cardresults').appendChild(card_div);
    }

    document.querySelector("#quizpane").style.display = "none";
    document.querySelector("#resultspane").style.display = "block";
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