import os

from flask import Flask, render_template, session, request, jsonify, redirect
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []
chats = []
global channelCount
error = ""
channelCount = 0

@app.route("/")
def index():
    return render_template("index.html", error=error, channels=channels)

@app.route("/messages/<int:id>")
def messages(id):
    return jsonify({"messages": chats[id]})

@app.route("/channels")
def getChannels():
    return jsonify({"channels": channels})

@app.route("/addChannel", methods=["POST"])
def addChannel():
    global error
    error = ""
    channelName = request.form.get('channelName')
    if len(channelName) < 3 or len(channelName) > 12:
        error = "Your channel has to contain a minimum of 3 and a maximum of 12 letters."
        return redirect('/')
    for channel in channels:
        if channelName == channel["channelName"]:
            error = "Channel name is already taken."
            return redirect('/')
    channelCount = len(channels)
    channelElement = {"channelName": f"{channelName}", "id": channelCount}
    channels.append(channelElement)
    messageList = []
    chats.append(messageList)
    return redirect('/')
