
var medicos = [
    { id: 1, nombre: "Irene", login: "irene10", password: "1"},
    { id: 2, nombre: "Irene", login: "irene11", password: "2"},
    { id: 3, nombre: "Irene", login: "irene12", password: "3"},
];
var siguienteMedico = 4;
var pacientes = [
    {id:1, nombre:"Álvaro", fecha_nacimiento:new Date(1987, 01, 27), 
    genero:'H', medico:1, codigo_acceso:"AL87", observaciones:"Problemas de ansiedad"},
    {id:2, nombre:"Pepe", fecha_nacimiento:new Date(1990, 03, 27), 
    genero:'M', medico:1, codigo_acceso:"PE90", observaciones:"Problemas de ansiedad"},
    {id:3, nombre:"Marta", fecha_nacimiento:new Date(1987, 02, 27), 
    genero:'M', medico:2, codigo_acceso:"MA87", observaciones:"Problemas de ansiedad"},
    {id:4, nombre:"Rocío", fecha_nacimiento:new Date(1994, 01, 10), 
    genero:'M', medico:3, codigo_acceso:"RO94", observaciones:"Problemas de ansiedad"},
];
var siguientePaciente = 5;
var variables = [
    {id:1 ,nombre:"Peso en kg"},
    {id:2 ,nombre:"Altura en cm"},
    {id:3 ,nombre:"distancia recorrida en metros"},
    {id:4 ,nombre:"tiempo de ejercicio en minutos"},
];
var siguienteVariable = 5;
var muestras = [
    {id:1, paciente:1, variable:1, fecha:new Date(2024, 1, 1, 13, 30, 00), valor:70},
    {id:2, paciente:1, variable:1, fecha:new Date(2024, 2, 1, 13, 30, 00), valor:80},
    {id:3, paciente:1, variable:1, fecha:new Date(2024, 3, 1, 13, 30, 00), valor:75},
    {id:4, paciente:1, variable:1, fecha:new Date(2024, 4, 1, 13, 30, 00), valor:78},
    {id:5, paciente:1, variable:2, fecha:new Date(2022, 4, 10, 13, 30, 00), valor:182},
    {id:6, paciente:1, variable:3, fecha:new Date(2022, 4, 10, 13, 30, 00), valor:4000},
    {id:7, paciente:1, variable:4, fecha:new Date(2022, 4, 10, 13, 30, 00), valor:60},
    {id:8, paciente:2, variable:1, fecha:new Date(2022, 4, 10, 13, 30, 00), valor:75},
    {id:9, paciente:2, variable:2, fecha:new Date(2022, 4, 10, 13, 30, 00), valor:170},
    {id:10, paciente:2, variable:3, fecha:new Date(2022, 4, 10, 13, 30, 00), valor:1000},
];
var siguienteMuestra = 8;

module.exports.pacientes=pacientes;
module.exports.medicos=medicos;
module.exports.variables=variables;
module.exports.muestras=muestras;
module.exports.siguienteMuestra=siguienteMuestra;
module.exports.siguientePaciente=siguientePaciente;