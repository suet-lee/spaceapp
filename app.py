from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index2.html')

@app.route('/universe')
def universe():
    return render_template('space.html')
