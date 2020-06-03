const handleClickAddChannel = () => {

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
    // Frage server nach Channel für user
    // Liste der  Channels durch gehen und darstellen

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
    
    
})