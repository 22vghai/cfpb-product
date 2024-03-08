const dataForge = require('data-forge');
const dataForgeFs = require('data-forge-fs');

const states = [ 'PLEASE SELECT', 'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
           'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
           'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
           'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
           'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];

module.exports.pick_cards = function(spending_affinity, credit_affinity, responses, num_cards) {
    let credit_level = "Credit " + Math.max(1, responses.creditScore);
    let state = states[responses.state];
    let labels = [
        "APR " + credit_level, "Intro APR " + credit_level, "Balance Transfer APR " + credit_level,
        "Grace Period", "Annualized Periodic Fees",
        "Late Fee", "Very Late Fee"
    ];
    let weights = [
        -1.0, // APR
        (responses.ownedBefore == 0) ? -0.5 : 0.0, // intro APR
        responses.pastDebt * 0.15, // Balance transfer APR
        0.2 // Grace period
            + spending_affinity * 0.1 
            + (3 - credit_affinity) * 0.1 
            + (4 - responses.creditScore) * 0.15, 
        -0.05 - 0.15 * (4 - responses.annualFees), // Annualized fees
        -0.15 - 0.1 * (3 - credit_affinity) - 0.25 * (4 - responses.creditScore), // Late fees 
        (responses.creditScore == 1) ? (-0.2) : 0.0  // Very late fees
    ];
    for (let j = 0; j < labels.length; j++) {
        labels[j] = "Normalized " + labels[j];
    }

    let read_csv = dataForge.readFileSync('./dataset.csv')
        .parseCSV(); 
    let dataset = read_csv
        .parseInts(...labels)
        .where(row => row.State == "" || row.State.includes(state))
        .generateSeries({
            rankScore: (row) => {
                let score = 0.0;
                for (let j = 0; j < labels.length; j++) {
                    score += row[labels[j]] * weights[j];
                }
                return score;
            }
        })
        .orderByDescending(row => row.rankScore);
    let card_set = dataset.toArray();
    let cards = [];
    let has_secure = false;
    for (const card of card_set) {
        if (cards.length == num_cards) {
            break;
        }
        has_secure = has_secure || card["Secured Card"] != "Yes";
        if ((cards.length + 1 == num_cards) && (!has_secure)) {
            continue;
        }
        let misc_terms = '';
        misc_terms += (card['Secured Card'] == 'Yes') ? "Secure Card" : "No Security Deposit Required";
        misc_terms += ", Grace Period: " + card['Grace Period'] + " days";
        misc_terms += ", Late Fee (minimum): $" + card['Late Fee'];
        cards.push({
            name: card['Product Name'],
            provider: card['Provider'],
            apr: '' + card["APR " + credit_level] + '%',
            annual_fees: '$' + card["Annualized Periodic Fees"] + '/year',
            extra_fees: "-",
            benefits: card['Services'] || card['Other Services'] || card['Rewards'],
            is_secured: false,
            misc_terms: misc_terms
        });
    }
    console.log(cards);
    return cards;
}