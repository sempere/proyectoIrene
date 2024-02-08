// rest.get(url, callback)
// rest.post(url, body, callback)
// rest.put(url, body, callback)
// rest.delete(url, callback)
// function callback(estado, respuesta) {...}

document.getElementById("screenMedico").style.display = "none";

//Variables globales
var idMedico;
var variables = [];

function login(login, password) {
    var credentials = { login : login, password : password};
    rest.post("http://localhost:8080/api/medico/login", credentials, function (estado, respuesta) {
        if (estado == 200) {
            console.log("Login correcto");
            idMedico = respuesta;
            conexionWebSocket();
            rest.get("http://localhost:8080/api/variable", function(estado, variablesRes) {
                if(estado == 200) {
                    variables = variablesRes;
                }
            });
            goToScreenMedico();
        } else {
            console.log(respuesta);
        }
    });
}

function goToScreenMedico() {
    document.getElementById("screenMedico").style.display = "inline";
    document.getElementById("screenLogin").style.display = "none";

    rest.get("http://localhost:8080/api/medico/" + idMedico, function (estado, respuesta) {
        if (estado != 200) {
            console.log(respuesta);
            return;
        }
        document.getElementById("nombreMedico").innerHTML = respuesta.nombre;
        actualizaListaPacientes();
    });
}
function actualizaListaPacientes() {
    rest.get("http://localhost:8080/api/medico/" + idMedico + "/pacientes", function(estado, respuesta) {
            if(estado == 200) {
                var listaPacientes = document.getElementById("pacientes");
                listaPacientes.innerHTML="";
                for (var i = 0; i < respuesta.length; i++) {
                    listaPacientes.innerHTML += "<div>Paciente " + respuesta[i].id + " - " + 
                            respuesta[i].nombre + "<button onclick='verPaciente(" + respuesta[i].id + ")'>Ver</button>" +
                            //"<button onclick='duplicar(" + respuesta[i].id + ")'>Duplicar</button>" +
                            "</div>";
                }
            }
        });
}
function nuevoPaciente() {
    var paciente = {
        nombre : document.getElementById("nombrePaciente").value,
        fecha : new Date(document.getElementById("fechaPaciente").value),
        genero : document.getElementById("generoPaciente").value,
        medico : idMedico,
        codigo_acceso : document.getElementById("codigoPaciente").value,
        observaciones : document.getElementById("observacionesPaciente").value
    }

    rest.post("http://localhost:8080/api/medico/" + idMedico + "/pacientes", paciente, function (estado, respuesta) {
        actualizaListaPacientes();        
    });

    var fechaNueva = new Date().toISOString().substring(0,10);
    document.getElementById("fechaPaciente").value = fechaNueva;
}
function verPaciente(idPaciente) {
    rest.get("http://localhost:8080/api/paciente/" + idPaciente, function (estado, pacienteRes) {
        document.getElementById("nombrePacienteVer").value = pacienteRes.nombre;
        document.getElementById("observacionesPacienteVer").value = pacienteRes.observaciones;
        document.getElementById("idPaciente").value = pacienteRes.id;
        rest.get("http://localhost:8080/api/paciente/" + idPaciente + "/muestras", 
            function (estadoMuestras, muestras) {
                var listaMuestras = document.getElementById("muestras");
                listaMuestras.innerHTML = "";
                muestras.forEach(function(muestra) {
                    listaMuestras.innerHTML += "<div>" + getNombreMuestra(muestra.variable) + 
                            " - " + muestra.valor + "</div>";
                });
                listaMuestras.innerHTML += "<button onclick='guardarPaciente()'>Guardar</button>";
            });
    });
}
function getNombreMuestra(idVariable) {
    for(var i = 0; i < variables.length;i++) {
        if(variables[i].id == idVariable) {
            return variables[i].nombre;
        }
    }
}

//Funcion para guardar el paciente una vez editado
function guardarPaciente() {
    var nombrePacienteEdit = document.getElementById("nombrePacienteVer").value;
    var obsPacienteEdit = document.getElementById("observacionesPacienteVer").value;
    var request = { nombre : nombrePacienteEdit, observaciones : obsPacienteEdit};
    var idPaciente = document.getElementById("idPaciente").value; 
    rest.put("http://localhost:8080/api/paciente/" + idPaciente, request, function (estado, respuesta) {
        if(estado == 200) {
            alert("Paciente modificado con éxito!!");
            actualizaListaPacientes();
        }
    });
}

/*function duplicar(idPaciente) {
    rest.get("http://localhost:8080/api/paciente/" + idPaciente + "/difundir/", function (estado, pacienteRes) {
        if(estado == 200) {
            alert("Paciente duplicado con éxito!");
            actualizaListaPacientes();
        }
    });
}*/
////////////////////////////////////////////////
//PARTE 3 - Websockets de la parte de médico
var conexion = undefined;

function conexionWebSocket() {
    conexion = new WebSocket('ws://localhost:4444', "pacientes");
    // Connection opened
    conexion.addEventListener('open', function (event) {
        console.log("Cliente conectado!!!");
        var req = {
            id : idMedico,
            clase : "medico"
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

