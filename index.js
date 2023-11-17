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

app.use(express.json());
app.post('/fetchcards', function(req, res) {
    console.log(req.body);
    let state = states[req.body.state];
    let credit_level = req.body.creditScore;
    if (credit_level < 1) { credit_level = 1; }
    credit_level = 'APR Credit ' + credit_level;

    let sql = `SELECT Provider, "Product Name", "${credit_level}", "Annualized Periodic Fees" FROM cards WHERE State IS NULL OR State = "" OR State LIKE "%${state}%" ORDER BY "${credit_level}"`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.json({
                "profile": "Error",
                "profileinfo": "An error has occured",
            });
            return;
        }
        let json = {
            profile: "Avid Spender",
            profileinfo: "You like to spend a lot. TODO",
            cards: [],
        };
        let n = 0;
        rows.forEach((row) => {
            if (row['Provider'].toLowerCase().includes('vermont')) { return; }
            if (n > 3) { return; }
            n += 1;
            json.cards.push({
                name: row['Product Name'],
                provider: row['Provider'],
                apr: row[credit_level],
                annual_fees: row["Annualized Periodic Fees"],
                extra_fees: "unimplemented!()",
                benefits: "unimplemented!()",
                is_secured: false,
                misc_terms: "unimplemented!()"
            });
        });
        res.json(json);
    });
    /*
    res.json({
        "profile": "Avid Spender",
        "profileinfo": "You're gonna go broke",
        "cards": [
            {
                "name": "Cardy McCardfaceAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                "provider": "Some Bank",
                "apr": "42%",
                "annual_fees": "$99999",
                "extra_fees": "sell us your soul",
                "benefits": "lmao none",
                "is_secured": false,
                "misc_terms": "idk i forgor"
            },
            {
                "name": "Some card 2.0",
                "provider": "Another Bank",
                "apr": "99%",
                "annual_fees": "$0",
                "extra_fees": "???",
                "benefits": "???",
                "secured": true,
                "misc_terms": "none"
            }
        ]
    });
    */
})
app.get('/', function(req, res) {
    res.sendFile(path.join(static_path, 'index.html'));
});
app.use('/', express.static(static_path));

app.listen(8080);