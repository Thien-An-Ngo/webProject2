// to submit the for for a new channel by pressing enter
function submitByEnter(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13) {
        addChannel();
    }
}

// adding the new channel
function addChannel() {
    const channelName = document.querySelector('#channelName').value;
    const request = new XMLHttpRequest();                               // new XMLHttpRequest
    request.open('POST', '/addChannel');                                // defining the request
    request.onload = () => {                                            // when the request loads
        const error = JSON.parse(request.responseText);
        console.log(error)
        const channelError = document.getElementById('channelError');
        if (error.error) {                                              //checking if there was an error
            channelError.innerHTML = "";
            let div = document.createElement('div');
            div.classList.add('alert', 'alert-danger');
            div.setAttribute('role', 'alert');
            div.setAttribute('id', 'errorAlert');
            channelError.append(div);
            document.querySelector('#errorAlert').innerHTML = error.error;
        }
        else {                                                          // if there was no error then operate socket.io
            var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
            socket.on('connect', () => {
                socket.emit('newChannel', {'channelName': channelName})
            })
            channelError.innerHTML = "";
            const body = document.querySelector('body');
            const lastDiv = document.querySelector('.modal-backdrop');
            body.removeAttribute('class');
            body.removeChild(lastDiv);
            document.querySelector('.modal').removeAttribute('style', 'aria-modal');
            document.querySelector('.modal').classList.remove('show')
        }
    }
    const dataForm = new FormData;
    dataForm.append('channelName', channelName);

    request.send(dataForm);
    return false;
}

function newUsername() {
    while (!localStorage.getItem('username')) {
        let username = null;
        while (!username) { // warte so lange bis was eingegeben wird
            username = prompt("Welcome to the website! Please put in your name:");
            if (!username) {alert("Please type in your name!")}
        };
        username = username.trim();
        while (username.length < 3 || username.length > 14) {
            username = null
            alert("Your username has to contain a minimum of 3 and a maximum of 14 letters! Whitespace does not count!");
            while (!username) {
                username = prompt("Welcome to the website! Please put in your name:");
                if (!username) {alert("Please type in your name!")}
            };
            username = username.trim();
        };
        if (username.length >= 3 && username.length <= 14) {
            localStorage.setItem('username', username);
        };
    };
    
    const username = localStorage.getItem('username');
    const userNameEle = document.querySelectorAll('.username');
    userNameEle[0].innerHTML = username;
}

function changeUsername() {
    localStorage.removeItem('username');
    newUsername()
}

const loadMessages = (id) => {
    console.log('click on: ', id);
    // id = int(id)
    localStorage.setItem('currentChannelID', id);
    document.queryCommandEnabled('#chat').innerHTML = ""
    const request = new XMLHttpRequest();
    request.open('GET', `/messages/${id}`);
    request.onload = () => {
    const messages = JSON.parse(request.response);
    console.log(messages)
        if (!messages) {
            console.log("no messages")
            return chatroom.innerHTML = "";
        }
        else {
            messages.forEach(message => {
                buildMessage(message.user, message.time, message.text)
                console.log("message information sent")
            });
        };
        console.log(`messages: ${messages}`);
        console.log(typeof(messages))
    };
    request.send();
}

function buildMessage(user, time, content) {
    console.log(`enter building module of message ${user}, ${time}, ${content}`)
    const messageTemp = document.querySelector('#messageTemp'),
    userCon = messageTemp.content.querySelector('h6'),
    timeCon = messageTemp.content.querySelector('span'),
    contentCon = messageTemp.content.querySelector('p');

    userCon.innerHTML = user;
    timeCon.innerHTML = time;
    contentCon.innerHTML = content;

    let clone = document.importNode(messageTemp.content, true);
    document.querySelector('#chat').append(clone)

    userCon.innerHTML = "";
    timeCon.innerHTML = "";
    contentCon.innerHTML = "";
}

function sendMessage() {
    console.log("entering sending process")
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    let text = document.querySelector('#mText').value,
    date = new Date(),
    h = date.getHours(),
    min = date.getMinutes(),
    time = `${h}:${min}`,
    username = localStorage.getItem('username'),
    channelID = localStorage.getItem('currentChannelID');
    
    console.log(`recorded all necessary data ${channelID}, ${username}, ${time}, ${text}`)
    socket.on('connect', () => {
        socket.emit('newMessage', {"channelID": channelID, "user": username, "time": time, "text": text})
        console.log("emit sucessful")
    })
}

// wehn DOM finished loading
document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    newUsername();

    if (!localStorage.getItem('currentChannelID')) {
        localStorage.setItem('currentChannelID', 0);
    }

    loadMessages(localStorage.getItem('currentChannelID'))

    socket.on('announceNewChannel', data => {
        console.log(data)
        const channelListSB = document.querySelector('#channelListSB'),
        channelListDD = document.querySelector('#channelListDD');
        let template = document.querySelector('.template'),
        span = template.content.querySelector("span"),
        a = template.content.querySelector("a"),
        t = document.querySelector('#temp'),
        ts = t.content.querySelector("span"),
        ta = t.content.querySelector("a");

        a.removeAttribute('id');
        a.removeAttribute('onclick');
        span.innerHTML = "";
        ta.removeAttribute('id');
        ta.removeAttribute('onclick');
        ts.innerHTML = "";

        console.log("template in process")
        a.setAttribute('id', data.id);
        a.setAttribute('onclick', loadMessages(data.id));
        span.innerHTML = data.newChannel;
        ta.setAttribute('id', data.id);
        ta.setAttribute('onclick', loadMessages(data.id));
        ts.innerHTML = data.newChannel;

        let clone = document.importNode(template.content, true);
        let clone1 = document.importNode(t.content, true);

        channelListSB.append(clone);
        channelListDD.append(clone1)
    })


    socket.on('ADD_NEW_MESSAGE', data => {
        console.log(`emit received ${data}`)
        if (data.channelID===localStorage.getItem('currentChannelID')) {
            buildMessage(data.user, data.time, data.text)
        }
        else {
            return
        }
    })


})