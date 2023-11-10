from flask import Flask, current_app, request, jsonify

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
	return current_app.send_static_file('index.html')

@app.route('/fetchcards', methods = ['POST'])
def update_text():
    data = request.json
    print(data)
    return r'{val: "will fill in picker later"}'

app.run(port=8080)