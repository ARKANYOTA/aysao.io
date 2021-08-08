if(window.sessionStorage["aysao-token"] === undefined){
    document.location.href="login.html"
}
let token = JSON.parse(window.sessionStorage["aysao-token"])
const socket = io('ws://localhost:8080');

socket.on('login', socket_id => {
    if(socket_id===socket.id){
        console.log("Login client side")
        token.socket_id = socket_id
        socket.emit('login_response', JSON.stringify(token))
    }
})
function key_event(event) {
    if (event.key === "e" && event.type === "keydown") {
        console.log(socket)
        console.log(socket.id)
    } else {
        console.log(event)
        socket.emit('message', event.key + event.type)
    }
}

window.addEventListener("keyup", (event) => key_event(event), true)
window.addEventListener("keydown", (event) => key_event(event), true);

socket.on('message', text => {
    const el = document.createElement('li');
    el.innerHTML = text;
    document.querySelector('ul').appendChild(el)
});

function sendMessage() {
    console.log("FONCTION SEND")
    const text = document.querySelector('input').value;
    socket.emit('message', text)
}

function Button(but) {
    console.log("Send :" + but)
    // const text = document.querySelector('input').value;
    socket.emit('message', but)
}

/*
document.getElementById("send").onclick = () => {
    console.log("SEND")
    const text = document.querySelector('input').value;
    socket.emit('message', text)
}
*/
/*
document.querySelector('button').onclick = () => {
    console.log("button")

}
*/
// Regular Websockets

// const socket = new WebSocket('ws://localhost:8080');

// // Listen for messages
// socket.onmessage = ({ data }) => {
//     console.log('Message from server ', data);
// };

// document.querySelector('button').onclick = () => {
//     socket.send('hello');
// }