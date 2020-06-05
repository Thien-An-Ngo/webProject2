import os

from flask import Flask, render_template, session, request, jsonify, redirect
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = [{"channelName": "general", "id": 0}]
chats = [[]]
global channelCount
error = ""
channelCount = 0

@app.route("/")
def index():
    return render_template("index.html", error=error, channels=channels)

@app.route("/messages/<int:id>")
def messages(id):
    index = int(id)
    if not chats[index]:
        return jsonify({"messages": None})
    return jsonify({"messages": chats[index]})

@app.route("/channels")
def getChannels():
    return jsonify({"channels": channels})

@app.route("/addChannel", methods=["POST"])
def addChannel():
    error = ""
    channelName = request.form.get('channelName')
    if len(channelName) < 3 or len(channelName) > 12:
        error = "Your channel has to contain a minimum of 3 and a maximum of 12 letters."
        return jsonify({"error": error})
    for channel in channels:
        if channelName == channel["channelName"]:
            error = "Channel name is already taken."
            return jsonify({"error": error})
    return jsonify({"error": None})

@socketio.on("newChannel")
def newChannel(data):
    channelName = data['channelName']
    channelCount = len(channels)
    channelElement = {"channelName": f"{channelName}", "id": int(channelCount)}
    channels.append(channelElement)
    messageList = []
    chats.append(messageList)
    emit("announceNewChannel", {"newChannel": channelName, "id": int(channelCount)}, broadcast=True)

@socketio.on("newMessage")
def newMessage(data):
    print("new message received in back-end")
    print(data)
    index = int(data["channelID"])
    print(chats[index])
    chats[index].append({
        "user": data["user"],
        "time": data["time"],
        "text": data["text"]
        })
    print(f"appended new message {chats}")
    emit("ADD_NEW_MESSAGE", {"channelID": str(index),"user": data["user"],"time": data["time"],"text": data["text"]}, broadcast=True)