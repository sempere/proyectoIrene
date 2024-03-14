var rpc = require("./rpc.js");
var datos=require("./datos.js");
var pacientes = datos.pacientes;
var medicos = datos.medicos;
var muestras = datos.muestras;
var variables = datos.variables;
var siguienteMuestra = datos.siguienteMuestra;
var siguientePaciente = datos.siguientePaciente;

//////////////////////////////////////////////////////////
//PARTE 1. REST functions
var express = require("express");
var cors = require('cors')
var app = express();
app.use(cors());
app.use("/cliente", express.static("cliente"));
app.use(express.json()); // en el req.body tengamos el body JSON
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, 	X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-	Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, 	DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});


app.post("/api/medico/login", function (req, res) {
    var encontrado = false;
    medicos.forEach(function(medico) {
        if(medico.login == req.body.login && medico.password == req.body.password && !encontrado) {
            res.status(200).json(medico.id);           
            encontrado = true;
        }
    });
    if(!encontrado) {
        res.status(403).json("No existe el medico o la contraseña es incorrecta");
    }
});
app.get("/api/variable", function(req, res) {
    res.status(200).json(variables);
});

app.get("/api/medico/:id", function(req, res) {
    var id = req.params.id;
    var encontrado = false;
    medicos.forEach(function(medico) {
        if(medico.id == id && !encontrado) {
            var medicoRes = {id : medico.id, nombre : medico.nombre, login : medico.login};
            res.status(200).json(medicoRes);
            encontrado = true;
        }
    });
    if(!encontrado) {
        res.status(404).json("Medico no encontrado");
    }
});

app.get("/api/medico/:id/pacientes", function(req, res) {
    var id = req.params.id;
    var pacientesRes = [];
    for(var i = 0; i < pacientes.length; i++) {
        if(pacientes[i].medico == id) {            
            pacientesRes.push(pacientes[i]);
        }
    }
    res.status(200).json(pacientesRes);
});
app.post("/api/medico/:id/pacientes", function(req, res) {
    var paciente = {
        nombre : req.body.nombre,
        fecha_nacimiento : req.body.fecha,
        genero : req.body.genero,
        medico : req.params.id,
        codigo_acceso : req.body.codigo_acceso,
        observaciones : req.body.observaciones,
        id : siguientePaciente
    }
    siguientePaciente++;
    console.log("Paciente con id: " + paciente.id + " ha sido creado");
    pacientes.push(paciente);
    res.status(201).json(paciente);
});
app.get("/api/paciente/:id", function(req, res) {
    var id = req.params.id;
    var encontrado = false;
    pacientes.forEach(function(paciente) {
        if(paciente.id == id && !encontrado) {
            var pacienteRes = {
                id : paciente.id,
                nombre : paciente.nombre,
                medico : paciente.medico,
                observaciones : paciente.observaciones,
                fecha_nacimiento : paciente.fecha_nacimiento,
                genero : paciente.genero,
                codigo_acceso : paciente.codigo_acceso
            }
            res.status(200).json(pacienteRes);
            encontrado = true;
        }
    });
    if(!encontrado) {
        res.status(404).json("Paciente no encontrado");
    }
});
app.put("/api/paciente/:id", function(req, res) {
    var idPaciente = req.params.id;
    var nombrePacienteEdit = req.body.nombre;
    var observacionesPacienteEdit = req.body.observaciones;
    var encontrado = false;
    //reemplazo de los datos del paciente
    for(var i = 0; i < pacientes.length && !encontrado; i++) {
        if(pacientes[i].id == idPaciente) {
            encontrado = true;
            if(nombrePacienteEdit != "") {
                pacientes[i].nombre = nombrePacienteEdit;
            }
            if(observacionesPacienteEdit != "") {
                pacientes[i].observaciones = observacionesPacienteEdit;
            }
            console.log("Paciente con id: " + pacientes[i].id + " ha sido editado con nombre " + nombrePacienteEdit + 
                     " y observaciones: " + observacionesPacienteEdit);
        }
    }
    if(!encontrado) {
        res.status(404).json("Paciente no encontrado");
    } else {
        res.status(200).json(idPaciente);
    }   
});
app.get("/api/paciente/:id/muestras", function(req, res) {
    var idPaciente = req.params.id;
    var muestrasRes = [];
    muestras.forEach(function(muestra) {
        if(muestra.paciente == idPaciente) {
            muestrasRes.push(muestra);
        }
    });
    res.status(200).json(muestrasRes);
});
/*app.get("/api/paciente/:id/difundir/", function(req, res) {
    var idPaciente = req.params.id;
    var encontrado = false;
    for(var i = 0; i < pacientes.length; i++) {
        if(pacientes[i].id == idPaciente) {
            encontrado = true;
            var pacienteAux = pacientes[i];
            var pacienteNuevo = {
                nombre : pacienteAux.nombre,
                fecha_nacimiento : pacienteAux.fecha,
                genero : pacienteAux.genero,
                medico : pacienteAux.medico,
                codigo_acceso : pacienteAux.codigo_acceso,
                observaciones : pacienteAux.observaciones,
                id : siguientePaciente
            }
            siguientePaciente++;
            console.log("Paciente con id: " + pacienteNuevo.id + " ha sido duplicado");
            pacientes.push(pacienteNuevo);
            res.status(201).json(pacientes);
        }
    }
    if(!encontrado) {
        res.status(404).json("Paciente no encontrado");
    }
}); */  


app.listen(8080);
//////////////////////////////////////////////////////////
//Parte 2. RPC functions

function login(codigo) {
    for(var i = 0; i < pacientes.length; i++) {
        if(pacientes[i].codigo_acceso == codigo) {
            return pacientes[i];
        }
    }
}
function datosMedico(idMedico) {
    var medicoRes = undefined;
    for(var i = 0; i < medicos.length && !medicoRes; i++) {
        if(medicos[i].id == idMedico) {
            medicoRes = {
                id : medicos[i].id,
                nombre : medicos[i].nombre
            }
        }
    }
    return medicoRes;
}
function listadoMuestras(idPaciente) {
    var muestrasRes = [];
    for(var i = 0; i < muestras.length; i++) {
        if(muestras[i].paciente == idPaciente) {
            muestrasRes.push(muestras[i]);
        }
    }
    return muestrasRes;
}
function listadoVariables() {
    return variables;
}
function agregarMuestra(idPaciente, idVariable, fecha, valor) {
    var muestraNueva = {
        id : siguienteMuestra++,
        paciente : idPaciente,
        variable : idVariable,
        fecha : fecha,
        valor : valor
    }
    muestras.push(muestraNueva);
    return muestraNueva.id;
}
function eliminarMuestra(idMuestra) {
    for(var i=0; i<muestras.length; i++){
        if(muestras[i].id==idMuestra){
            //Borrar el paciente
            muestras.splice(i,1);
            console.log("Muestra borrada con identificador", idMuestra);
            return true;
        }
    }
    return false;
}

var servidor = rpc.server();
var appRPC = servidor.createApp("MiGestionPacientes");

appRPC.register(login);
appRPC.register(datosMedico);
appRPC.register(listadoMuestras);
appRPC.register(listadoVariables);
appRPC.register(agregarMuestra);
appRPC.register(eliminarMuestra);

//////////////////////////////////////////////////////////
//PARTE 3. Websockets

// Crear un servidor HTTP
var http = require("http");
var httpServer = http.createServer();

// Crear servidor WS
var WebSocketServer = require("websocket").server; // instalar previamente: npm install websocket
var wsServer = new WebSocketServer({
	httpServer: httpServer
});

// Iniciar el servidor HTTP en un puerto
var puerto = 4444;
httpServer.listen(puerto, function () {
	console.log("Servidor de WebSocket iniciado en puerto:", puerto);
});

var usuariosConectados = []; // Aqui se almacena la info de los conectados
var conexiones = []; // Todas las conexiones (clientes) de mi servidor

wsServer.on("request", function (request) { // este callback se ejecuta cuando llega una nueva conexión de un cliente
	var connection = request.accept("pacientes", request.origin); // aceptar conexión
	conexiones.push(connection); // guardar la conexión
	console.log("Cliente conectado. Ahora hay", conexiones.length);
	connection.on("message", function (message) { // mensaje recibido del cliente
		if (message.type === "utf8") {
			console.log("Mensaje recibido de cliente: " + message.utf8Data);
			var msg = JSON.parse(message.utf8Data);
			switch (msg.operacion) {	
				case "compartir":
					for (var i = 0; i < msg.infoRequest.usuarios.length; i++) {
                        //Recorrido de la info recibida, y luego las conexiones
                        var usuario = msg.infoRequest.usuarios[i];
                        console.log("Usuarios enviados:" + usuario.id);
                        for(var j = 0; j < conexiones.length; j++) {
                            if(usuariosConectados[j].clase == usuario.clase &&
                                usuariosConectados[j].id == usuario.id) { 
                                    conexiones[j].
                                        sendUTF(JSON.stringify(msg.infoRequest.mensaje));
                                }
                        }
                    }
					break;
				case "conectar":
					usuariosConectados.push(msg.usuario);
                    console.log("Usuarios conectados: " + usuariosConectados);
					break;
			}			
		}
	});
	connection.on("close", function (reasonCode, description) { // conexión cerrada
        var indexConnection = conexiones.indexOf(connection);
		conexiones.splice(indexConnection, 1);
        usuariosConectados.splice(indexConnection, 1);
		console.log("Cliente desconectado. Ahora hay", conexiones.length);
	});
});
