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
        };
    }
    const dataForm = new FormData;
    dataForm.append('channelName', channelName);

    request.send(dataForm);
    return false;
}

const handleClickOnChannel = (id) => {
    console.log('click on: ', id);
    const chatroom = document.getElementById('chat');
    chatroom.innerHTML = ""
    const request = new XMLHttpRequest();
    request.open('GET', `/messages/${id}`);
    request.onload = () => {
        const messages = JSON.parse(request.response);
        if (!messages) {
            return chatroom.innerHTML = "";
        };    
        console.log(`messages: ${messages}`);
        messages.messages.forEach(message => {
            const content = document.createElement('div');
            content.classList.add('column' + 'my-5');
            let info = document.createElement('div');
            info.classList.add('d-flex' + 'row' + 'justify-content-between' + 'mx-1');
            let user = document.createElement('h6');
            let time = document.createElement('span');
            time.classList.add('text-muted');
            user.innerHTML = message.user;
            time.innerHTML = message.time;
            info.appendChild(user);
            info.appendChild(time);
            content.appendChild(info);

            let text = document.createElement('p');
            text.innerHTML = message.text;
            content.appendChild(text);
            chatroom.appendChild(content);
        })    
    };    
    request.send();
}    

document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

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

    socket.on('announce new channel', data => {
        const channelList = document.querySelector('#channelList');
        let template = document.querySelector('.template'),
        span = template.content.querySelector("span"),
        a = template.content.querySelector("a");
        a.setAttribute('id', data.id);
        a.setAttribute('onclick', handleClickOnChannel(data.id));
        span.innerHTML = data.newChannel;
        channelList.append(template)
    })
})