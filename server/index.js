const http = require('http').createServer();
const express = require('express');
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require('cors');
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors())
const io = require('socket.io')(http, {cors: {origin: "*"}});
//const router = express.Router();

////////////////////////////////////////////:
//          COMMENTS INFOS
/*//////////////////////////////////////////:
TODO LIST:
   - Map
   - Login
   - inGameData
       - Save inGameData
   ?- disconnect with -> window.sessionStorage["aysao-token"] = "";

Express:
-[x] register: post{id, password} -> {status: int, message: string} // Add data[id] = {id, password}
- login: post{sock_id, id, password} -> {status: int, message: string} // Add in_Game_Data[sock_id] = {id, sock_id, ...x, ...y}
- map: post{sock_id, x, y} -> {map:string}
- pos_all_player: post{sock_id} -> [{sock_id, skin: char}, ...]
- inventaire: post{sock_id} -> [{pos_in_inv, item_id, nb_of_item}]

Websocket:
SERVEUR:
-

Debug:

CLIENT:
JS CLIENT:
- settings: {} -> Si posible avec les cookies

data = {
    id: {
        "id": req.body.id,
        "password": req.body.password,
        "x": null,
        "y": null,
        "z": null,
        "inv": {},
        "health": null,
        "skills": null
    },
    ...
}

inGameData = {
    id:{
        "id": body.id,
        "socket_id": body.socket_id,
        "x": 0,
        "y": 0,
        "z": 0,
        "inv": {},
        "health": 100,
        "skills": {}
    },
    ...
}

*///////////////////////////////////////////:
//          BOTH
////////////////////////////////////////////:
let changement = false  //debug
let data = JSON.parse(fs.readFileSync('data.json', 'utf8'))
let inGameData = {}
let logged_user = []

////////////////////////////////////////////:
//          FONCTION
////////////////////////////////////////////:
function writeData() {
    fs.writeFile('data.json', JSON.stringify(data), function (err) {
        if (err) return console.log(err);
        console.log("Save Data in data.json")
    });
}

function AddUserToInGameData(body) {
    inGameData[body.id] = {
        "id": body.id,
        "password": body.password,
        "socket_id": body.socket_id,
    }
    changement = true // debug
}
////////////////////////////////////////////:
//          EXPRESS
////////////////////////////////////////////:
// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello world')
})

app.post('/login', function (req, res) {
    // VERIFIER SI IL EST PAS DEJA DANS LE inGameData, SI OUI DIRE QUE IL PEUX SE CONNECTER AVEC UN SEUL COMPTE
    // TOKEN DEJA UTILISÉ2
    let message
    let status // 0=fine, 1=id_requis, 2=pass_requis, 3=socket_id_requis, 4=id_inexistant, 5=mauvais_mdp, x=autres
    if (!req.body.id) {
        status = 1
        message = "Il faut l'identifiant"
    } else if (!req.body.password) {
        status = 2
        message = "Il faut le mot de passe"
    }  else if (!data.hasOwnProperty(req.body.id)) {
        status = 4
        message = "Identifiant inexistant"
    } else if (!(data[req.body.id].password === req.body.password)) {
        status = 5
        message = "Mot de passe invalide"
    } else {
        status = 0
        message = "Tout me semble bien"
        logged_user.push(req.body.id)
        changement = true; //debug
        // AddUserToInGameData(req.body)
    }
    res.send(JSON.stringify({id: req.body.id, status: status, msg: message}))
})

app.post('/app_login', function (req, res) {
    // VERIFIER SI IL EST PAS DEJA DANS LE inGameData, SI OUI DIRE QUE IL PEUX SE CONNECTER AVEC UN SEUL COMPTE
    // TOKEN DEJA UTILISÉ2
    let message
    let status // 0=fine, 1=id_requis, 2=pass_requis, 3=socket_id_requis, 4=id_inexistant, 5=mauvais_mdp, x=autres
    if (!req.body.id) {
        status = 1
        message = "Il faut l'identifiant"
    } else if (!req.body.password) {
        status = 2
        message = "Il faut le mot de passe"
    }  else if (!data.hasOwnProperty(req.body.id)) {
        status = 4
        message = "Identifiant inexistant"
    } else if (!data[req.body.id].password === req.body.password) {
        status = 5
        message = "Faux mot de passe"
    } else {
        status = 0
        message = "Tout me semble bien"
        logged_user.push(req.body.id)
        changement = true; //debug
        // AddUserToInGameData(req.body)
    }
    res.send(JSON.stringify({id: req.body.id, status: status, msg: message}))
})

app.post('/register', function (req, res) {
    // TODO: ANTI SPAM THIS COMMAND
    let message
    let status // 0=fine, 1=id_requis, 2=id_utilise, 3=id_invalide, 4=pass_requis, 5=pass_trop_court, 6=autres
    if (!req.body.id) {
        status = 1
        message = "Il faut un identifiant"
    } else if (data.hasOwnProperty(req.body.id)) { //if id existe
        status = 2
        message = "Cette identifiant deja utilisé"
    } else if (!(req.body.id.match("[a-z][.a-z0-9]{3,}") !== null && req.body.id.match("[a-z][.a-z0-9]{3,}")[0] === req.body.id)) {
        status = 3
        message = "L'identifiant n'est pas bon <br/> Il faut une longueur de 4 minimum commençant par un lettre minuscule et comportant que des lettres minuscules, caractère alphanumérique, ou des points" // longueur de 4 inclus minimum, et un match avec c.match("[a-z][a-z.0-9]{3,}")
    } else if (!req.body.password) {
        status = 4
        message = "Il faut un mot de passe"
    } else if (req.body.password.length <= 8) {
        status = 5
        message = "Mot de passe trop court <br/> Il faut une longueur d'au moins 8 caractères"
    } else {
        status = 0
        message = "Tout me semble bien"
        data[req.body.id] = {
            "id": req.body.id,
            "password": req.body.password,
            "x": null,
            "y": null,
            "z": null,
            "inv": {},
            "health": null,
            "skills": null
        }
        writeData()
        changement = true
    }
    res.send(JSON.stringify({id: req.body.id, status: status, msg: message}))
})

////////////////////////////////////////////:
//          WEBSOCKET
////////////////////////////////////////////:
io.on('connection', (socket) => {
    io.emit('login', socket.id);
    io_debug.emit('chat', JSON.stringify({id: socket.id, state: "connect"}));
    socket.on('message', (message) => {
        io.emit('message', `${socket.id} said ${message}`);
        io_debug.emit('chat', JSON.stringify({id: socket.id, state: "said", msg: message}));
    });
    socket.on('disconnect', () => {
        io_debug.emit('chat', JSON.stringify({id: socket.id, state: "disconnected"}));
    });
    socket.on('login_response', (socket) => {
        //VERIFIER SI SOCKEtID ou pass ou id est bonne
        AddUserToInGameData(JSON.parse(socket))
        changement = true //debug
    });
});

////////////////////////////////////////////:
//          DEBUGGER
////////////////////////////////////////////:
const http_debug = require('http').createServer();
const io_debug = require('socket.io')(http_debug, {cors: {origin: "*"}});

function debugSendData(){
    console.log("Reload debug")
    io_debug.emit('data', JSON.stringify(data));
    io_debug.emit('igdata', JSON.stringify(inGameData));
    io_debug.emit('logged', JSON.stringify(logged_user));
}

app.get('/debug_actualise', function (req, res) {
    debugSendData()
    res.send({status: 0});
})

function reload() {
    setTimeout(() => reload(), 1000);
    if (changement) {
        debugSendData()
        changement = false
    }
}
reload()
////////////////////////////////////////////:
//          END
////////////////////////////////////////////:
app.listen(3000, () => console.log(`Express http://localhost:3000`));  // Express
http.listen(8080, () => console.log('Websocket on ws://localhost:8080'));  // Websocket
http_debug.listen(9999, () => console.log('Websocket Debug on ws://localhost:9999'));  // DEBUG
console.log('Debug page file:///home/ay/aysao.io/server/debug.html')
console.log('Index file:///home/ay/aysao.io/app/index.html')

function AutoSave() {
    console.log("AutoSave")
    setTimeout(() => AutoSave(), 1000 * 60 * 3);
}

setTimeout(() => AutoSave(), 1000 * 60 * 3);
changement = true
