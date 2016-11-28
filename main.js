"use strict";

var http = require("http");
var express = require("express");
var path = require("path");

var session = require("express-session");
var mysqlSession = require("express-mysql-session");

function imprimir(err, result){
    if(!err){
        console.log(result);
    }
    else{
        console.log(err);
    } 
};

var user = require("Usuario");
var game = require("Partida");

var app = express();


var MySQLStore = new mysqlSession(session);
var sessionStore = new MySQLStore({
    host: "localhost",
    user: "root",
    password: "",
    database: "aw - practica1"
});
var middlewareSession = session({
    saveUninitialized: false,
    secret: "SID",
    resave: false,
    store: sessionStore
});

app.use(middlewareSession);


var ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
/*app.get("/", function(request, response){
    response.status(200);
    response.type("text/plain; charset = utf-8");
    response.write("HTML Bienvenido-Practica1.html");
    response.end();
});*/

app.listen(3000, function(){
    console.log("Servidor en el 3000");
});

app.get("/Nuevo_usuario", function (req, resp){
    var sexo = "Null";
    switch(req.query.sexo) {
        case "hombre": sexo = 1; break;
        case "mujer": sexo = 0; break;
    }
    
    user.CrearUsuario(req.query.usuario, req.query.contrasena, req.query.nombre, sexo, null, req.query.fecha_nacimiento, function (err, resultado){
        if(!err){
            if(resultado){
                resp.render("HTML_Bienvenido-Practica1", {
                    usuario: req.query.usuario,
                    correcto: true
                });
            }
            else{
               resp.render("HTML_NuevoUsuario-Practica1", {
                    usuario: req.query.usuario,
                    nombre: req.query.nombre,
                    sexo: req.query.sexo,
                    fecha: req.query.fecha_nacimiento,
                    correcto: false
                }) ;
            }
        }
    });
    
    
    });

app.get("/Logear", function (req, resp){    
    user.Login(req.query.usuario, req.query.contrasena);
    
    user.LeerUsuario(req.query.usuario, function (err, resultado){
        if(!err){
            req.session.usuario = req.query.usuario;
            req.session.Nombre_Completo = resultado[0].Nombre_Completo;
            req.session.Sexo = resultado[0].Sexo;

            resp.render("HTML_Usuario-Practica1", {
                usuario: req.query.usuario,
                nombreCompleto: resultado[0].Nombre_Completo,
                sexo: resultado[0].Sexo
            });
        }
    });
});

app.get("/HTML_UnirseAPartida-Practica1.ejs", function (req, resp){
    game.LeerPartida.Abiertas(req.session.usuario, function (err, resultado){
        if(!err){
            resp.render("HTML_UnirseAPartida-Practica1", {
                usuario: req.session.usuario,
                partidas: resultado
            });
        } else{
            console.log(err);
        }
    });
});

app.get("/HTML_CrearPartida-Practica1.ejs", function (req, resp){
   resp.render("HTML_CrearPartida-Practica1", {
        usuario: req.session.usuario 
   });
});

app.get("/HTML_Usuario-Practica1.ejs", function (req, resp) {
    game.LeerPartidasAbiertasPrivadas(req.session.usuario, function (err, abiertasPrivadas) {
        if (!err) {
            game.LeerPartidasActivasPrivadas(req.session.usuario, function (err, activasPrivadas) {
                if (!err) {
                    game.LeerPartidasCerradasPrivadas(req.session.usuario, function (err, cerradasPrivadas) {
                        if(!err){
                            resp.render("HTML_Usuario-Practica1", {
                                usuario: req.session.usuario,
                                nombreCompleto: req.session.Nombre_Completo,
                                sexo: req.session.Sexo,
                                abiertasPrivadas: abiertasPrivadas,
                                activasPrivadsa: activasPrivadas,
                                cerradasPrivadas: cerradasPrivadas
                            });
                        }
                    });
                }
            });
        }
    });
});

app.get("/CrearPartida", function (req, resp){
    game.CrearPartida(req.query.nombrePartida, req.session.usuario, req.query.jugadores);
    
    resp.render("HTML_Usuario-Practica1", {
        usuario: req.session.usuario,
        nombreCompleto: req.session.Nombre_Completo,
        sexo: req.session.Sexo
   });
});

//x.CrearUsuario("Juan", "1234", "Juan Rodriguez", 1, null, null, imprimir);

//x.Login("Juan", "123", imprimir);

//x.Login("Juan", "1234", imprimir);