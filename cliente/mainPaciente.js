var app = rpc("localhost", "MiGestionPacientes")
////////////////////////////////////////////////////////////
//Lista de funciones disponibles en el servidor RPC
////////////////////////////////////////////////////////////
var loginPaciente = app.procedure("login");
var datosMedico = app.procedure("datosMedico");
var obtenerMuestras = app.procedure("listadoMuestras");
var obtenerVariables = app.procedure("listadoVariables");
var anyadirMuestra = app.procedure("agregarMuestra");
var eliminarMuestra = app.procedure("eliminarMuestra");
var eliminarVariable = app.procedure("eliminarVariable");



//Variables globales
document.getElementById("screenPaciente").style.display = "none";
var variables = [];
obtenerVariables(undefined, function(response) {
    variables = response;
});
var muestras = [];
var pacientes = [];
document.getElementById('fechaMuestra').valueAsDate = new Date();
var paciente = {};
document.getElementById("screenCompartir").style.display = "none";

//------------------------------ PARTE LOGIN
function login() {
    var codigo = document.getElementById("codigo_acceso").value;
    loginPaciente(codigo, function(pacienteServidor) {
        if(pacienteServidor) {
            paciente = pacienteServidor;
            document.getElementById("screenPaciente").style.display = "inline";
            document.getElementById("screenLogin").style.display = "none";
            datosMedico(paciente.medico, function(medico) {
                document.getElementById("nombrePaciente").innerHTML = paciente.nombre;
                document.getElementById("nombreMedico").innerHTML = medico.nombre;
                document.getElementById("observaciones").innerHTML = paciente.observaciones;
                mostrarVariables();
                mostrarMuestras(paciente.id);
                conexionWebSocket();
            });
            
        } else {
            alert("Código de acceso incorrecto");
        }
    });
    
}
//LOGOUT
function salir(){
    document.getElementById("screenLogin").style.display = "inline";
    document.getElementById("screenPaciente").style.display = "none";
    document.getElementById("screenCompartir").style.display = "none";
    muestras = [];
    paciente = {};
    pacientes = [];
}
function mostrarVariables() {
    document.getElementById("filtroVariables").innerHTML = "<div>" + 
            "<label><input type='radio' name='variables'" + 
            "onclick = 'filtrarVariable(-1)' checked='true'/>" + 
            "Todas las variables</label></div>";
    document.getElementById("selectVariableNuevaMuestra").innerHTML = "";
    for(var i = 0; i < variables.length; i++) {
        document.getElementById("filtroVariables").innerHTML += "<div><label>" + 
            "<input type='radio' name='variables'" + 
            "onclick = 'filtrarVariable(" + variables[i].id + ")'/>" + 
            variables[i].nombre + 
            //"<button onclick='eliminarVariableYActualizar(" + variables[i].id + ")'>Eliminar variable</button>" + 
            "</label></div>";
        document.getElementById("selectVariableNuevaMuestra").innerHTML += 
            "<option value='" + variables[i].id + "')>" + variables[i].nombre +
            "</option>";
    }
}
function mostrarMuestras(idPaciente) {
    document.getElementById("variables").innerHTML = "";
    obtenerMuestras(idPaciente, function(muestrasServidor) {
        muestras = muestrasServidor;
        for(var i = 0; i < muestras.length; i++) {
            var muestra = muestras[i];
            var variable = buscaVariable(muestra.variable);
            document.getElementById("variables").innerHTML += "<li id='muestra" +
                    muestra.id + "'>" +  
                    new Date(muestra.fecha).toLocaleString() + 
                    " - " + variable.nombre + " = " + 
                    muestra.valor + "<button onclick='eliminar(" + 
                    muestra.id + ")'>" + 
                    "Eliminar</button>"+
                    "<button onclick='compartir(\"" + 
                    variable.nombre + "\"," + muestra.valor + ",\"" + 
                    muestra.fecha + 
                    "\")'>Compartir</button></li>";
        }
    });   
    
    
}
function buscaVariable(idVariable) {
    for(var i = 0; i < variables.length; i++) {
        if(variables[i].id == idVariable) {
            return variables[i];
        }
    }
}
//-------------------------------------------------------------------------
function filtrarVariable(idVariable) {
    document.getElementById("variables").innerHTML = "";
    for(var i = 0; i < muestras.length; i++) {
        if(idVariable == -1 || muestras[i].variable == idVariable) {
            var muestra = muestras[i];
            var variable = buscaVariable(muestra.variable);
            document.getElementById("variables").innerHTML += "<li>" + 
                    new Date(muestra.fecha).toLocaleString() + 
                    " - " + buscaVariable(muestra.variable).nombre + " = " + 
                    muestra.valor + "<button onclick='eliminar(" + 
                    muestra.id + ")'>" + 
                    "Eliminar</button>"+
                    "<button onclick='compartir(\"" + 
                    variable.nombre + "\"," + muestra.valor + ",\"" + 
                    muestra.fecha + 
                    "\")'>Compartir</button></li>";
        }
    }
}

function nuevaMuestra() {
    if(document.getElementById("valorMuestra").value != "") {
        var envioDatosMuestra = {
            idPaciente : paciente.id, 
            idVariable : parseInt(document.getElementById("selectVariableNuevaMuestra").value),
            fecha : new Date(document.getElementById("fechaMuestra").value),
            valor : parseInt(document.getElementById("valorMuestra").value)};
        anyadirMuestra(envioDatosMuestra, function(idMuestra) {
                mostrarMuestras(paciente.id);
            });
        
        
    } else {
        alert("Introduzca un valor para la muestra");
    }
}

function eliminar(idMuestra) {
    var retorno = eliminarMuestra(idMuestra);
    if(!retorno) {
        console.log("Error eliminando la muestra");
    }
    mostrarMuestras(paciente.id);
}
function compartir(nombre, valor, fecha) {
    document.getElementById("screenCompartir").style.display = "inline";
    document.getElementById("nombreCompartir").innerHTML = nombre;
    document.getElementById("valorCompartir").innerHTML = valor; 
    document.getElementById("fechaCompartir").innerHTML = fecha;
    document.getElementById("selectCompartir").style.display = "none";  
    if(pacientes.length == 0) { //Consulta los pacientes de mi medico
        rest.get("http://localhost:8080/api/medico/" + paciente.medico + "/pacientes", function(estado, respuesta) {
            if(estado == 200) {
                var pacientesRes = respuesta;
                pacientes = pacientesRes;
                document.getElementById("selectCompartir").innerHTML = "";
                for(var i = 0; i < pacientes.length; i++) {
                    document.getElementById("selectCompartir").innerHTML += 
                        "<option value='" + pacientes[i].id + "'>"
                        + pacientes[i].nombre + "</option>";
                }
            }
        });
    }
}
function mostrarPacientesCompartir() {
    if(document.getElementsByName("compartir")[2].checked) {
        document.getElementById("selectCompartir").style.display = "inline";
    } else {
        document.getElementById("selectCompartir").style.display = "none";
    }
}




/*function eliminarVariableYActualizar(idVariable) {
    eliminarVariable(idVariable);
    mostrarVariables();
    mostrarMuestras(paciente.id);
}*/
//PARTE 3. Websockets
var conexion = undefined;

function conexionWebSocket() {
    conexion = new WebSocket('ws://localhost:4444', "pacientes");
    // Connection opened
    conexion.addEventListener('open', function (event) {
        console.log("Cliente conectado!!!");
        var req = {
            id : paciente.id,
            clase : "paciente"
        }
        conexion.send(JSON.stringify({ operacion: "conectar", usuario: req }));
    });

    // Listen for messages
    conexion.addEventListener('message', function (event) {
        console.log("Mensaje del servidor:", event.data);
        var mensaje = JSON.parse(event.data);
        alert(mensaje);
    });
}

function enviarCompartir() {
    var inputs = document.getElementsByName("compartir");
    for(var i = 0; i < inputs.length; i++) {
        if(inputs[i].checked) {
            var infoRequest = {};
            infoRequest.mensaje = paciente.nombre + " ha compartido contigo que" +
                " el día " + document.getElementById("fechaCompartir").innerHTML + 
                " realizó la actividad '" + 
                document.getElementById("nombreCompartir").innerHTML + 
                "' y obtuvo un valor de " + 
                document.getElementById("valorCompartir").innerHTML;
            infoRequest.usuarios = [];
            switch(inputs[i].value) {
                case "todos":
                    for(var i = 0; i < pacientes.length; i++) {
                        infoRequest.usuarios.push({id : pacientes[i].id, clase : "paciente"});
                    }
                    conexion.send(JSON.stringify(
                        { operacion: "compartir", infoRequest: infoRequest }
                        ));
                    break;
                case "medico":
                    var usuariosReq = {id : paciente.medico, clase : "medico"};
                    infoRequest.usuarios.push(usuariosReq);
                    conexion.send(JSON.stringify(
                        { operacion: "compartir", infoRequest: infoRequest }
                        ));
                    break;
                case "paciente":
                    var pacienteIdSelected = document.getElementById("selectCompartir").value;
                    infoRequest.usuarios.push({id : pacienteIdSelected, clase : "paciente"});
                    conexion.send(JSON.stringify(
                        { operacion: "compartir", 
                        infoRequest: infoRequest }
                    ));                   
            }
        }
    }
}





