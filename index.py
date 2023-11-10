from flask import Flask, current_app, send_from_directory

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
	return current_app.send_static_file('index.html')

app.run(port=8080)