from flask import Flask, current_app, request, jsonify

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
	return current_app.send_static_file('index.html')

@app.route('/fetchcards', methods = ['POST'])
def update_text():
    data = request.json
    print(data)
    return r'''{
        "profile": "Avid Spender",
        "profileinfo": "You're gonna go broke",
        "cards": [
            {
                "name": "Cardy McCardfaceAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                "provider": "Some Bank",
                "apr": 42,
                "annual_fees": 99999,
                "extra_fees": "sell us your soul",
                "benefits": "lmao none",
                "secured": false,
                "misc_terms": "idk i forgor"
            }
        ]
    }'''

app.run(port=8080)