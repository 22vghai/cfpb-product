const questions = require('./common/questions.js');
const express = require('express');
const path = require('path');
const picker = require('./credit_picker.js');

let app = express();
let static_path  = path.join(__dirname, 'static');
let common_path  = path.join(__dirname, 'common');

app.use(express.json());
app.post('/fetchcards', function(req, res) {
    let persona_scores = {"Spending": 0, "Credit": 0};
    for (const q_name in req.body) {
        let q_info = questions.get_question_by_name(q_name);
        if (typeof q_info == 'undefined') { continue; }
        let selection = req.body[q_name];
        let deltas = q_info.answers[selection].deltas;
        if (typeof deltas == 'undefined') { continue; }
        for (delta in deltas) {
            persona_scores[delta] = (persona_scores[delta] || 0) + deltas[delta];
        }
    }
    let credit_desc = questions.credit_description(persona_scores["Credit"]);
    let spending_desc = questions.spending_description(persona_scores["Spending"]);
    let persona_name = credit_desc[0] + " " + spending_desc[0];
    let persona_desc = spending_desc[1] + "\n" + credit_desc[1];

    let credit_selections = picker.pick_cards(spending_desc[2], credit_desc[2], req.body, 4);
    let json = {
        profile: persona_name,
        profileinfo: persona_desc,
        cards: credit_selections
    };
    res.json(json);
});

app.get('/', function(req, res) {
    res.sendFile(path.join(static_path, 'index.html'));
});
app.use('/', express.static(static_path));
app.use('/common/', express.static(common_path));


app.listen(8080);