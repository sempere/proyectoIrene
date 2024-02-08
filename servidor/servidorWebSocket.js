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
					pacientes.push(msg.nombre);
					break;
				case "conectar":
					usuariosConectados
					break;
			}
			console.log("Ahora los pacientes son:", pacientes);
			for (var i = 0; i < conexiones.length; i++) {
				conexiones[i].sendUTF(JSON.stringify(pacientes));
			}
		}
	});
	connection.on("close", function (reasonCode, description) { // conexión cerrada
		conexiones.splice(conexiones.indexOf(connection), 1);
		console.log("Cliente desconectado. Ahora hay", conexiones.length);
	});
});
