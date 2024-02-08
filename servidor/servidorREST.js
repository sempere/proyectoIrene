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

/*var datos = require("./datos.js");  
var medicos = datos.medicos;
var pacientes = datos.pacientes;
var muestras = datos.muestras;
var variables = datos.variables;*/

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
    pacientes.forEach(function(paciente) {
        if(paciente.medico == id) {
            pacientesRes.push(paciente);
        }
    });
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
        id : datos.siguientePaciente
    }
    siguientePaciente++;
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
                fecha_nacimiento : paciente.fecha_nacimiento,
                genero : paciente.genero,
                medico : paciente.medico,
                observaciones : paciente.observaciones
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
    var paciente = {
        nombre : req.body.nombre,
        fecha_nacimiento : req.body.fecha,
        genero : req.body.genero,
        medico : req.params.id,
        codigo_acceso : req.body.codigo_acceso,
        observaciones : req.body.observaciones,
        id : datos.siguientePaciente
    }
    //reemplazo
    res.status(200).json(paciente);
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
    


app.listen(8080);