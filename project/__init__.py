import os
from flask import Flask, render_template, request, redirect, url_for
from libxrandr import get_info, set_info

app = Flask(__name__)


@app.get("/")
def home():
    info = get_info()
    displays = [i["display"] for i in info]

    primary = str()
    for i in info:
        if i["primary"]:
            primary = i["display"]
            break
    return render_template("display.html", info=info, displays=displays, primary=primary)


@app.post("/update")
def update_screens():
    update = request.form.to_dict()
    set_info(update)
    return "POST site for Display Manager"


if __name__ == "__main__":
    os.environ["FLASK_ENV"] = "development"
    app.run(port=8000, debug=True,host="192.168.29.172")
