let export_table = null;
if (typeof window !== 'undefined') {
    window.moduleExports = {};
    export_table = window.moduleExports;
}
else {
    export_table = module.exports;
}

(function(exports) { 
    const states = [ 'PLEASE SELECT', 'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA',
            'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
            'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM',
            'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
            'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'];
    let state_options = []
    for (const state of states) {
        state_options.push({ text: state });
    }
    exports.questions = [
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
                { text: "No" },
                { text: "Yes" },
            ]
        },
        {
            friendlyName: "whyNoCard",
            question: "Why do you not own a credit card?",
            answers: [
                { text: "Never felt the need to get one", deltas: { "Credit": 1 } },
                { text: "I don't like the idea of debt", deltas: { "Credit": 2 } },
                { text: "I applied and was rejected", deltas: { "Credit": -1 } },
                { text: "N/A" },
            ],
            requires: { dependsOn: "ownedBefore", choices: [0], defaultChoice: 3 }
        },
        {
            friendlyName: "onlineShoppingFreq",
            question: "How often do you shop online?",
            answers: [
                { text: "I live on Amazon", deltas: { "Spending": 2 } },
                { text: "Frequently", deltas: { "Spending": 1 } },
                { text: "Sometimes", deltas: { "Spending": 0 } },
                { text: "Rarely", deltas: { "Spending": -1 } },
                { text: "Never", deltas: { "Spending": -2 } },
            ]
        },
        {
            friendlyName: "impulseBuying",
            question: "You're on Amazon and an item catches your eye. There's only 1 left in stock. What would you do?",
            answers: [
                { text: "Buy it before anybody else gets it", deltas: { "Spending": 2 } },
                { text: "Check the price and see if it's in your budget", deltas: { "Spending": 1 } },
                { text: "Put it on a wishlist to think about later", deltas: {"Spending": -1 } },
            ],
        },
        {
            friendlyName: "laptopScenario",
            question: "You just broke your laptop and the repairman quotes you $700 dollars to fix it. What do you do?",
            answers: [
                { text: "Ask a friend or daily member to borrow their laptop for the time being", deltas: { "Spending": -1} },
                { text: "Dip into my savings to pay it off" },
                { text: "Ask for my parents to pay for it", deltas: { "Spending": -1 } },
                { text: "Use my credit card to pay for it", deltas: { "Credit": 1 } },
            ]
        },
        {
            friendlyName: "usageFreq",
            question: "How often do you use/intend to use your credit card?",
            answers: [
                { text: "As little as possible", deltas: { "Credit": -2 } },
                { text: "Rarely", deltas: { "Credit": -1 } },
                { text: "Sometimes", deltas: { "Credit": 0 } },
                { text: "Often", deltas: { "Credit": 1 } },
                { text: "Whenever possible", deltas: { "Credit": 2 } },
            ],
        },
        {
            friendlyName: "creditScore",
            question: "What is your credit score?",
            answers: [
                { text: "Not sure" },
                { text: "Less than or equal to 619", deltas: { "Credit": 2 } },
                { text: "Between 620 and 719 (inclusive)" },
                { text: "Greater than or equal to 720" },
            ],
            requires: { dependsOn: "ownedBefore", choices: [1], defaultChoice: 0 }
        },
        {
            friendlyName: "pastDebt",
            question: "Do you have any pre-existing credit card debt?",
            answers: [
                { text: "None" },
                { text: "Very little (less than 100)" },
                { text: "Some amount (between 100 and 500)" },
                { text: "A lot (more than 500)", deltas: { "Credit": 2 } },
            ],
            requires: { dependsOn: "ownedBefore", choices: [1], defaultChoice: 0 }
        },
        {
            friendlyName: "annualFees",
            question: "Are you comfortable paying an annual fee for premium benefits?",
            answers: [
                { text: "It's my card, I shouldn't have to pay extra ($0)" },
                { text: "A small amount (less than $25 per year)" },
                { text: "A decent amount (less than $50 per year)" },
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
    exports.get_question_by_name = function(name) {
        for (const question of exports.questions) {
            if (question.friendlyName == name) {
                return question;
            }
        }
        return undefined;
    }
    exports.score_bounds = function(category) {
        let max = 0;
        let min = 0;
        for (const question of exports.questions) {
            let q_max_delta = 0;
            let q_min_delta = 0;
            for (const answer of question.answers) {
                if (typeof answer.deltas == 'undefined') { continue; }
                let delta = answer.deltas[category];
                if (typeof delta == 'undefined') { continue; }
                if (delta > q_max_delta) { q_max_delta = delta; }
                if (delta < q_min_delta) { q_min_delta = delta; }
            }
            max += q_max_delta;
            min += q_min_delta;
        }
        return [min, max];
    }
    exports.credit_description = function(score) {
        let bounds = exports.score_bounds("Credit");
        let range = bounds[1] - bounds[0];
        let min = bounds[0];
        if (score >= min + range * 0.8) {
            return ["Credit-Eager", "You are very comfortable with using a credit card. Make sure to only spend what you can pay off to keep building that credit score!", 3];
        }
        if (score >= min + range * 0.4) {
            return ["Credit-Neutral", "You are comfortable with using a credit card. Use it responsibly to build a good credit score!", 2];
        }
        else {
            return ["Credit-Fearing", "You are quite cautious about a credit card. Keep in mind that building a credit score requires using your card, and is necessary for future loans like mortages", 1];
        }
    };
    exports.spending_description = function(score) {
        let bounds = exports.score_bounds("Spending");
        let range = bounds[1] - bounds[0];
        let min = bounds[0];
        if (score >= min + range * 0.66) {
            return ["Avid Spender", "You are an avid spender. Make sure you stick to a budget!", 3];
        }
        if (score >= min + range * 0.33) {
            return ["Balanced Spender", "You are a balanced spender. Good job with moderation!", 2];
        }
        else {
            return ["Cautious Spender", "You are a cautious spender. Make sure to use those savings once in a while!", 1];
        }
    };
})(export_table);