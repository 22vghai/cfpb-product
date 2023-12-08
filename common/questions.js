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
        /*
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
                { text: "I don't like the idea of debt", deltas: { "Cautious": 1 } },
                { text: "I applied and was rejected" },
                { text: "N/A" },
            ],
            requires: { dependsOn: "ownedBefore", choices: [1], defaultChoice: 3 }
        },
        {
            friendlyName: "impulseBuying",
            question: "You're on Amazon and an item catches your eye. There's only 1 left in stock. What would you do?",
            answers: [
                { text: "Buy it before anybody else gets it", deltas: { "Avid": 1 } },
                { text: "Check the price and see if it's in your budget", deltas: { "Balanced": 1 } },
                { text: "Put it on a wishlist to think about later", deltas: {"Cautious": 1 } },
            ],
        },
        {
            friendlyName: "onlineShoppingFreq",
            question: "How often do you shop online?",
            answers: [
                { text: "I live on Amazon", deltas: { "Avid": 2 } },
                { text: "Frequently", deltas: { "Avid": 1 } },
                { text: "Sometimes", deltas: { "Balanced": 1 } },
                { text: "Rarely", deltas: { "Cautious": 1 } },
                { text: "Never", deltas: { "Cautious": 2 } },
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
        */
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
    exports.get_question_by_name = function(name) {
        for (const question of exports.questions) {
            if (question.friendlyName == name) {
                return question;
            }
        }
        return undefined;
    }
    exports.persona_descriptions = {
        "Avid": "You tend to spend often and in large amounts. Make sure to stick to a budget!",
        "Balanced": "You tend to be moderate in your spending decisions. Good job!",
        "Cautious": "You tend to err on the side of caution"
    };
})(export_table);