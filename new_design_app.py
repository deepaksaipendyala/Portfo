from pathlib import Path

from flask import Flask, render_template, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
NEW_DESIGN_DIR = BASE_DIR / "New_design"
NEW_DESIGN_STATIC_DIR = NEW_DESIGN_DIR / "static"
MAIN_STATIC_IMAGES_DIR = BASE_DIR / "static" / "images"

app = Flask(
    __name__,
    template_folder=str(NEW_DESIGN_DIR),
    static_folder=str(NEW_DESIGN_STATIC_DIR),
    static_url_path="/static",
)


@app.route("/")
def new_design_home():
    return render_template("index.html")


@app.route("/generic")
def new_design_generic():
    return render_template("generic.html")


@app.route("/thankyou")
def new_design_thankyou():
    return render_template("thankyou.html")


@app.route("/static/images/<path:filename>")
def new_design_images(filename: str):
    return send_from_directory(str(MAIN_STATIC_IMAGES_DIR), filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
