// rest.get(url, callback)
// rest.post(url, body, callback)
// rest.put(url, body, callback)
// rest.delete(url, callback)
// function callback(estado, respuesta) {...}

document.getElementById("screenMedico").style.display = "none";

//Variables globales
var idMedico;
var variables = [];
var muestrasGlobal = [];

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
    document.getElementById("screenFormNuevoPaciente").style.display = "none";
    document.getElementById("screenFormEditarPaciente").style.display = "none";

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
                    listaPacientes.innerHTML += "<div>Paciente " + (i+1) + " con identificador: " + respuesta[i].id + " - " + 
                            respuesta[i].nombre + "<button onclick='verPaciente(" + respuesta[i].id + ")'>Ver</button>" +
                            //"<button onclick='duplicar(" + respuesta[i].id + ")'>Duplicar</button>" +
                            "</div>";
                }
            }
        });
}
function abrirNuevoPaciente() {
    document.getElementById("screenFormNuevoPaciente").style.display = "inline";
    document.getElementById("screenFormEditarPaciente").style.display = "none";
}
function nuevoPaciente() {
    var paciente = {
        nombre : document.getElementById("nombrePacienteNuevo").value,
        fecha : new Date(document.getElementById("fechaPacienteNuevo").value),
        genero : document.getElementById("generoPacienteNuevo").value,
        medico : idMedico,
        codigo_acceso : document.getElementById("codigoPacienteNuevo").value,
        observaciones : document.getElementById("observacionesPacienteNuevo").value
    }

    rest.post("http://localhost:8080/api/medico/" + idMedico + "/pacientes", paciente, function (estado, respuesta) {
        actualizaListaPacientes();        
    });

    var fechaNueva = new Date().toISOString().substring(0,10);
    document.getElementById("fechaPacienteNuevo").value = fechaNueva;
}
function verPaciente(idPaciente) {
    rest.get("http://localhost:8080/api/paciente/" + idPaciente, function (estado, pacienteRes) {

        document.getElementById("screenFormNuevoPaciente").style.display = "none";
        document.getElementById("screenFormEditarPaciente").style.display = "inline";

        document.getElementById("nombrePacienteVer").value = pacienteRes.nombre;
        document.getElementById("observacionesPacienteVer").value = pacienteRes.observaciones;
        var fechaPaciente = pacienteRes.fecha_nacimiento.substring(0,10);
        document.getElementById("fechaPacienteVer").value = fechaPaciente;
        document.getElementById("generoPacienteVer").value = pacienteRes.genero;
        document.getElementById("codigoPacienteVer").value = pacienteRes.codigo_acceso;
        document.getElementById("idPaciente").value = pacienteRes.id;
        rest.get("http://localhost:8080/api/paciente/" + idPaciente + "/muestras", 
            function (estadoMuestras, muestras) {
                var filtro = document.getElementById("filtradoMuestras");
                filtro.innerHTML = "";
                var listaMuestras = document.getElementById("muestras");
                listaMuestras.innerHTML = "";
                if(muestras.length > 0) {
                    muestrasGlobal = muestras;
                    //Construir el filtro
                    filtro.innerHTML = "<h3>Filtrar muestras por variable</h3>";
                    filtro.innerHTML += "<input type='radio' name='variables' onclick='filtrarMuestras(-60)'>Todas las variables</input>";
                    for(var i = 0; i < variables.length; i++) {
                        filtro.innerHTML += "<input type='radio' name='variables'" +
                                " onclick='filtrarMuestras(" + variables[i].id + ")'>"                       
                                + variables[i].nombre + "</input>";
                    }                 
                    
                    muestras.forEach(function(muestra) {
                        listaMuestras.innerHTML += "<li>" + new Date(muestra.fecha).toLocaleString() + " " + 
                                getNombreVariable(muestra.variable) + 
                                " = " + muestra.valor + "</li>";
                    });
                }
            });
    });
}
function getNombreVariable(idVariable) {
    for(var i = 0; i < variables.length;i++) {
        if(variables[i].id == idVariable) {
            return variables[i].nombre;
        }
    }
}
function filtrarMuestras(idVariable) {
    var listaMuestras = document.getElementById("muestras");
    listaMuestras.innerHTML = "";
    muestrasGlobal.forEach(function(muestra) {
        if(muestra.variable == idVariable || idVariable < 0) {
            listaMuestras.innerHTML += "<li>" + new Date(muestra.fecha).toLocaleString() + " " + 
                    getNombreVariable(muestra.variable) + 
                    " = " + muestra.valor + "</li>";
        }
    });
}



//Funcion para guardar el paciente una vez editado
function editarPaciente() {
    var paciente = { 
        nombre : document.getElementById("nombrePacienteVer").value,
        fecha : new Date(document.getElementById("fechaPacienteVer").value),
        genero : document.getElementById("generoPacienteVer").value,
        codigo_acceso : document.getElementById("codigoPacienteVer").value,
        observaciones : document.getElementById("observacionesPacienteVer").value
    };
    var idPaciente = document.getElementById("idPaciente").value; 
    rest.put("http://localhost:8080/api/paciente/" + idPaciente, paciente, function (estado, respuesta) {
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

