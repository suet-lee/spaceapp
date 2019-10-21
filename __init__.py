from flask import Flask, render_template

app = Flask(__name__, static_url_path="/static", static_folder='/var/www/spaceapp/static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/universe')
def universe():
    return render_template('space.html')

if __name__ == "__main__":
    app.run()
