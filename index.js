const questions = require('./common/questions.js');
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./cards.db');

const states = [ 'PLEASE SELECT', 'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
           'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
           'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
           'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

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

    let state = states[req.body.state];
    let credit_level = req.body.creditScore;
    if (credit_level < 1) { credit_level = 1; }
    credit_level = 'APR Credit ' + credit_level;

    let sql = `SELECT Provider, "Product Name", "${credit_level}", "Annualized Periodic Fees", "Services", "Other Services", Rewards FROM cards WHERE State IS NULL OR State = "" OR State LIKE "%${state}%" ORDER BY "${credit_level}"`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.json({
                "profile": "Error",
                "profileinfo": "An error has occured",
            });
            return;
        }
        let json = {
            profile: persona_name,
            profileinfo: persona_desc,
            cards: [],
        };
        let n = 0;
        rows.forEach((row) => {
            if (row['Provider'].toLowerCase().includes('vermont')) { return; }
            if (row['Provider'].toLowerCase().includes('credit union')) { return; }
            if (row['Provider'].toLowerCase().includes('county')) { return; }
            if (row['Provider'].toLowerCase().includes('student')) { return; }
            if (n > 3) { return; }
            n += 1;
            json.cards.push({
                name: row['Product Name'],
                provider: row['Provider'],
                apr: '' + row[credit_level] + '%',
                annual_fees: '$' + row["Annualized Periodic Fees"] + '/year',
                extra_fees: "unimplemented!()",
                benefits: row['Services'] || row['Other Services'] || row['Rewards'],
                is_secured: false,
                misc_terms: "unimplemented!()"
            });
        });
        res.json(json);
    });
});

app.get('/', function(req, res) {
    res.sendFile(path.join(static_path, 'index.html'));
});
app.use('/', express.static(static_path));
app.use('/common/', express.static(common_path));


app.listen(8080);