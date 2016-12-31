"use strict";

var http = require("http");
var express = require("express");
var path = require("path");
var config = require("./config.js");

var session = require("express-session");
var mysqlSession = require("express-mysql-session");
var multer = require("multer");
var multerFactory = multer({dest: "uploads/"});
var fs = require("fs");
var expressValidator = require("express-validator");

var user = require("Usuario");
var game = require("Partida");
var gameboard = require("Tablero");
var card = require("Cartas");
var comments = require("Comentarios");

var app = express();

var MySQLStore = new mysqlSession(session);
var sessionStore = new MySQLStore({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName
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
app.use(expressValidator());

app.listen(config.port, function () {
    console.log("Servidor iniciado en el puerto " + config.port);
});


app.get("/", function (req, resp) {
    resp.redirect("HTML_Bienvenido-Practica1.html");
});

//Gestion de usuarios

app.post("/Nuevo_usuario", multerFactory.single("imagen"), function (req, resp) {
    req.checkBody("usuario",
            "Nombre de usuario vacío").notEmpty();

    req.checkBody("usuario",
            "Nombre de usuario no válido").matches(/^[A-Z0-9]*$/i);

    req.checkBody("contrasena",
            "La contraseña no es válida tiene que contener de 4 a 15 caracteres").isLength({min: 4, max: 15});
    req.checkBody("nombre",
            "Nombre Completo de usuario vacío").notEmpty();
    req.getValidationResult().then(function (result) {

        if (result.isEmpty()) {
            var sexo = "Null";
            switch (req.body.sexo) {
                case "hombre":
                    sexo = 1;
                    break;
                case "mujer":
                    sexo = 0;
                    break;
            }

            var urlFichero = null; // URL del fichero dentro del servidor

            if (req.file) {
                if (!fs.existsSync("./public/img/perfiles/")) {
                    fs.mkdirSync("./public/img/perfiles/");
                }
                urlFichero = "img/perfiles/" + req.file.filename;
                // Nombre del fichero destino
                var fichDestino = path.join("public", urlFichero);
                // Realizamos la copia
                fs.createReadStream(req.file.path)
                        .pipe(fs.createWriteStream(fichDestino));
            }
            user.CrearUsuario(req.body.usuario, req.body.contrasena, req.body.nombre, sexo, urlFichero, req.body.fecha_nacimiento, function (err, resultado) {
                if (!err) {
                    if (resultado) {
                        resp.render("HTML_Bienvenido-Practica1", {
                            usuario: req.body.usuario,
                            correcto: true
                        });
                    } else {
                        resp.render("HTML_NuevoUsuario-Practica1", {
                            usuario: req.body.usuario,
                            nombre: req.body.nombre,
                            sexo: req.body.sexo,
                            fecha: req.body.fecha_nacimiento,
                            correcto: false,
                            errores: null
                        });
                    }
                } else {
                    resp.status(500);
                    resp.type("text/plain; charset = utf-8");
                    resp.write("Error 500 Internal server error " + err);
                    resp.end();
                }
            });
        } else {

            resp.render("HTML_NuevoUsuario-Practica1", {
                usuario: req.body.usuario,
                nombre: req.body.nombre,
                sexo: req.body.sexo,
                fecha: req.body.fecha_nacimiento,
                correcto: null,
                errores: result.mapped()
            });
        }
    });
});

app.post("/Logear", multerFactory.single(), function (req, resp) {
    user.Login(req.body.usuario, req.body.contraseña, function (err, resultado) {
        if (!err) {
            if (resultado) {
                user.LeerUsuario(req.body.usuario, function (err, resultado) {
                    if (!err) {
                        req.session.usuario = req.body.usuario;
                        req.session.Nombre_Completo = resultado[0].Nombre_Completo;
                        req.session.Sexo = resultado[0].Sexo;
                        req.session.Foto = resultado[0].Foto;
                        resp.redirect("HTML_Usuario-Practica1.ejs");
                    }
                });
            } else {
                resp.render("HTML_Login-Practica1", {
                    usuario: req.query.usuario,
                    correcto: false
                });
            }
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });
});

app.get("/desconectar", function (req, resp) {
    req.session.destroy();
    resp.redirect("HTML_Bienvenido-Practica1.html");
});


//Gestión de partidas

app.get("/HTML_Usuario-Practica1.ejs", function (req, resp) {
    var creacion, partida;
    if (req.query.creacion === "true") {
        creacion = true;
        partida = req.query.partida;
    } else {
        creacion = false;
    }
    var unirse;
    if (req.query.unirse === "true") {
        unirse = true;
        partida = req.query.partida;
    } else {
        unirse = false;
    }
    var cerrada;
    if (req.query.cerrada === "true") {
        cerrada = true;
        partida = req.query.partida;
    } else if (req.query.cerrada === "noJugadores") {
        cerrada = "noJugadores";
        partida = req.query.partida;
    } else {
        cerrada = false;
    }
    game.LeerPartida.AbiertasPrivadas(req.session.usuario, function (err, abiertasPrivadas) {
        if (!err) {
            game.LeerPartida.ActivasPrivadas(req.session.usuario, function (err, activasPrivadas) {
                if (!err) {
                    game.LeerPartida.CerradasPrivadas(req.session.usuario, function (err, cerradasPrivadas) {
                        if (!err) {
                            resp.render("HTML_Usuario-Practica1", {
                                usuario: req.session.usuario,
                                nombreCompleto: req.session.Nombre_Completo,
                                sexo: req.session.Sexo,
                                foto: req.session.Foto,
                                abiertasPrivadas: abiertasPrivadas,
                                activasPrivadas: activasPrivadas,
                                cerradasPrivadas: cerradasPrivadas,
                                creacion: creacion,
                                unirse: unirse,
                                cerrada: cerrada,
                                partida: partida
                            });
                        } else {
                            resp.status(500);
                            resp.type("text/plain; charset = utf-8");
                            resp.write("Error 500 Internal server error " + err);
                            resp.end();
                        }
                    });
                } else {
                    resp.status(500);
                    resp.type("text/plain; charset = utf-8");
                    resp.write("Error 500 Internal server error " + err);
                    resp.end();
                }
            });
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });
});

app.post("/CrearPartida", multerFactory.single(), function (req, resp) {
    req.checkBody("nombrePartida",
            "nombre de la partida vacío").notEmpty();
    req.getValidationResult().then(function (result) {

        if (result.isEmpty()) {
            game.CrearPartida(req.body.nombrePartida, req.session.usuario, req.body.jugadores, function (err, resultado) {
                if (!err) {
                    if (resultado) {
                        resp.redirect("HTML_Usuario-Practica1.ejs?creacion=true&partida=" + req.body.nombrePartida);
                    } else {
                        resp.render("HTML_CrearPartida-Practica1.ejs", {
                            usuario: req.session.usuario,
                            foto: req.session.Foto,
                            partida: req.body.nombrePartida,
                            jugadores: req.body.jugadores,
                            correcto: false,
                            errores: null
                        });
                    }
                } else {
                    resp.status(500);
                    resp.type("text/plain; charset = utf-8");
                    resp.write("Error 500 Internal server error " + err);
                    resp.end();
                }
            });
        } else {
            resp.render("HTML_CrearPartida-Practica1.ejs", {
                usuario: req.session.usuario,
                foto: req.session.Foto,
                partida: req.body.nombrePartida,
                jugadores: req.body.jugadores,
                correcto: null,
                errores: result.mapped()
            });
        }
    });
});

app.get("/HTML_CrearPartida-Practica1.ejs", function (req, resp) {
    resp.render("HTML_CrearPartida-Practica1", {
        usuario: req.session.usuario,
        foto: req.session.Foto,
        correcto: true,
        errores: null
    });
});

app.get("/unirse", function (req, resp) {
    game.Unirse(req.query.nombre, req.session.usuario, req.query.maximo, function (err, resultado) {
        if (resultado) {
            if (!err) {
                resp.redirect("HTML_Usuario-Practica1.ejs?unirse=true&partida=" + req.query.nombre);
            } else {
                resp.status(500);
                resp.type("text/plain; charset = utf-8");
                resp.write("Error 500 Internal server error " + err);
                resp.end();
            }
        } else {
            resp.redirect("/ActivarPartida?nombre=" + req.query.nombre);
        }
    });
});

app.get("/HTML_UnirseAPartida-Practica1.ejs", function (req, resp) {
    game.LeerPartida.Abiertas(req.session.usuario, function (err, resultado) {
        if (!err) {
            resp.render("HTML_UnirseAPartida-Practica1", {
                usuario: req.session.usuario,
                foto: req.session.Foto,
                partidas: resultado
            });
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });
});

app.get("/ActivarPartida", function (req, resp) {
    game.ModificarEstadoPartida.ActivarPartida(req.query.nombre, function (err, activa) {
        if (!err) {
            if (activa) {
                game.InicializarPartida(req.query.nombre, function (err, resultado) {
                    if (!err) {
                        resp.redirect("/HTML_Usuario-Practica1.ejs?cerrada=true&partida=" + req.query.nombre);
                    } else {
                        resp.status(500);
                        resp.type("text/plain; charset = utf-8");
                        resp.write("Error 500 Internal server error " + err);
                        resp.end();
                    }
                });
            } else {
                resp.redirect("/HTML_Usuario-Practica1.ejs?cerrada=noJugadores&partida=" + req.query.nombre);
            }
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });
});

// Gestion del tablero
app.get("/cargaTablero", function (req, resp) {
    game.LeerRolJugador(req.query.nombre, req.session.usuario, function (err, Rol) {
        if (!err) {
            gameboard.Lectura.tablero(req.query.nombre, function (err, tablero) {
                if (!err) {
                    comments.LeerComentariosPartida(req.query.nombre,function (err, comentarios) {
                        if (!err) {
                            game.LeerPartida.PartidaActual(req.query.nombre, function (err, resultado) {
                                if (!err) {
                                    if (resultado[0].Ganador === null) {
                                        card.LeerMano(req.query.nombre, req.session.usuario, function (err, mano) {
                                            if (!err) {
                                                resp.render("HTML_Tablero-Practica1", {
                                                    usuario: req.session.usuario,
                                                    foto: req.session.Foto,
                                                    creador: resultado[0].Creador,
                                                    jugadores: resultado[0].Numero_Jugadores,
                                                    JugadoresUnidos: resultado,
                                                    turno: resultado[0].Turno,
                                                    turnosRestantes: resultado[0].Turnos_restantes,
                                                    partida: req.query.nombre,
                                                    tablero: tablero,
                                                    mano: mano,
                                                    ganador: null,
                                                    puesta: req.query.puesta,
                                                    Rol: Rol,
                                                    comentarios: comentarios
                                                });
                                            } else {
                                                resp.status(500);
                                                resp.type("text/plain; charset = utf-8");
                                                resp.write("Error 500 Internal server error " + err);
                                                resp.end();
                                            }

                                        });
                                    } else {
                                        resp.render("HTML_Tablero-Practica1", {
                                            usuario: req.session.usuario,
                                            foto: req.session.Foto,
                                            creador: resultado[0].Creador,
                                            jugadores: resultado[0].Numero_Jugadores,
                                            JugadoresUnidos: resultado,
                                            turno: resultado[0].Turno,
                                            turnosRestantes: resultado[0].Turnos_restantes,
                                            partida: req.query.nombre,
                                            tablero: tablero,
                                            mano: null,
                                            ganador: resultado[0].Ganador,
                                            puesta: req.query.puesta,
                                            Rol: Rol,
                                            comentarios: comentarios

                                        });
                                    }

                                } else {
                                    resp.status(500);
                                    resp.type("text/plain; charset = utf-8");
                                    resp.write("Error 500 Internal server error " + err);
                                    resp.end();
                                }
                            });
                        } else {
                            resp.status(500);
                            resp.type("text/plain; charset = utf-8");
                            resp.write("Error 500 Internal server error " + err);
                            resp.end();
                        }
                    });
                } else {
                    resp.status(500);
                    resp.type("text/plain; charset = utf-8");
                    resp.write("Error 500 Internal server error " + err);
                    resp.end();
                }
            });
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });
});

app.get("/elegircarta", function (req, resp) {
    game.LeerRolJugador(req.query.partida, req.session.usuario, function (err, Rol) {
        if (!err) {
            gameboard.Lectura.tablero(req.query.partida, function (err, tablero) {
                if (!err) {
                    game.LeerPartida.PartidaActual(req.query.partida, function (err, resultado) {
                        if (!err) {
                            card.LeerDatosCarta(req.query.ID, function (err, carta) {
                                if (!err)
                                {
                                    resp.render("HTML_ponerFicha-Practica1", {
                                        usuario: req.session.usuario,
                                        foto: req.session.Foto,
                                        partida: req.query.partida,
                                        carta: req.query.ID,
                                        tablero: tablero,
                                        Tipo: carta[0].Tipo,
                                        URL: carta[0].URL,
                                        Rol: Rol,
                                        JugadoresUnidos: resultado,
                                        ganador: null
                                    });
                                } else {
                                    resp.status(500);
                                    resp.type("text/plain; charset = utf-8");
                                    resp.write("Error 500 Internal server error " + err);
                                    resp.end();
                                }
                            });
                        } else {
                            resp.status(500);
                            resp.type("text/plain; charset = utf-8");
                            resp.write("Error 500 Internal server error " + err);
                            resp.end();
                        }
                    });
                } else {
                    resp.status(500);
                    resp.type("text/plain; charset = utf-8");
                    resp.write("Error 500 Internal server error " + err);
                    resp.end();
                }

            });
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });
});

app.get("/ponerFicha", function (req, resp) {
    gameboard.PonerFichaTablero(req.session.usuario, null, req.query.partida, req.query.ID, req.query.fila, req.query.columna, function (err, puesta) {
        if (!err) {
            if (puesta !== "No Inicio" && puesta !== "Mal Puesta") {
                game.ComprobarGanador(req.query.partida, function (err, ganador) {
                    if (!err) {
                        if (ganador === "No Ganador") {
                            card.CambiarCarta(req.query.partida, req.session.usuario, req.query.ID, function (err, resultado) {
                                if (!err) {
                                    game.CambiarTurno(req.query.partida, 0, function (err, ganadorSaboteador) {
                                        if (!err) {
                                            if (ganadorSaboteador) {
                                                game.ModificarEstadoPartida.CerrarPartida(req.query.partida, "Saboteador", function (err, resultado) {
                                                    if (!err) {
                                                        resp.redirect("/cargaTablero?nombre=" + req.query.partida);
                                                    } else {
                                                        resp.status(500);
                                                        resp.type("text/plain; charset = utf-8");
                                                        resp.write("Error 500 Internal server error " + err);
                                                        resp.end();
                                                    }
                                                });
                                            } else {
                                                resp.redirect("/cargaTablero?nombre=" + req.query.partida);
                                            }
                                        } else {
                                            resp.status(500);
                                            resp.type("text/plain; charset = utf-8");
                                            resp.write("Error 500 Internal server error " + err);
                                            resp.end();
                                        }
                                    });
                                } else {
                                    resp.status(500);
                                    resp.type("text/plain; charset = utf-8");
                                    resp.write("Error 500 Internal server error " + err);
                                    resp.end();
                                }
                            });
                        } else {
                            game.ModificarEstadoPartida.CerrarPartida(req.query.partida, ganador, function (err, resultado) {
                                if (!err) {
                                    resp.redirect("/cargaTablero?nombre=" + req.query.partida);
                                } else {
                                    resp.status(500);
                                    resp.type("text/plain; charset = utf-8");
                                    resp.write("Error 500 Internal server error " + err);
                                    resp.end();
                                }
                            });
                        }
                    } else {
                        resp.status(500);
                        resp.type("text/plain; charset = utf-8");
                        resp.write("Error 500 Internal server error " + err);
                        resp.end();
                    }
                });
            } else { // no se puede colocar la ficha
                resp.redirect("/cargaTablero?nombre=" + req.query.partida + "&puesta=false");
            }
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });
});

app.get("/ponerFichaEspecial", function (req, resp) {
    gameboard.PonerFichaTablero(req.session.usuario, req.query.UsuarioAfectado, req.query.partida, req.query.ID, req.query.fila, req.query.columna, function (err, puesta) {
        if (!err) {
            card.CambiarCarta(req.query.partida, req.session.usuario, req.query.ID, function (err, resultado) {
                if (!err) {
                    game.CambiarTurno(req.query.partida, 0, function (err, ganadorSaboteador) {
                        if (!err) {
                            if (ganadorSaboteador) {
                                game.ModificarEstadoPartida.CerrarPartida(req.query.partida, "Saboteador", function (err, resultado) {
                                    if (!err) {
                                        resp.redirect("/cargaTablero?nombre=" + req.query.partida);
                                    } else {
                                        resp.status(500);
                                        resp.type("text/plain; charset = utf-8");
                                        resp.write("Error 500 Internal server error " + err);
                                        resp.end();
                                    }
                                });
                            } else {
                                resp.redirect("/cargaTablero?nombre=" + req.query.partida);
                            }
                        } else {
                            resp.status(500);
                            resp.type("text/plain; charset = utf-8");
                            resp.write("Error 500 Internal server error " + err);
                            resp.end();
                        }
                    });
                } else {
                    resp.status(500);
                    resp.type("text/plain; charset = utf-8");
                    resp.write("Error 500 Internal server error " + err);
                    resp.end();
                }
            });
        }
    });
});

app.get("/desechar", function (req, resp) {
    card.CambiarCarta(req.query.partida, req.session.usuario, req.query.ID, function (err, resultado) {
        if (!err) {
            game.CambiarTurno(req.query.partida, function (err, resultado) {
                if (!err) {
                    resp.redirect("/cargaTablero?nombre=" + req.query.partida);
                } else {
                    resp.status(500);
                    resp.type("text/plain; charset = utf-8");
                    resp.write("Error 500 Internal server error " + err);
                    resp.end();
                }
            });
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });

});

app.get("/LeerDatosCarta", function (req, resp) {
    card.LeerDatosCarta(req.query.ID, function (err, carta) {
        if (!err)
        {
            if (parseInt(req.query.ID) !== 4)
            {
                gameboard.Lectura.casilla(req.query.ID, req.query.partida, req.query.fila, req.query.columna, function (err, casilla) {
                    if (!err)
                    {
                        resp.render("HTML_DatosCarta-Practica1", {
                            usuario: req.session.usuario,
                            foto: req.session.Foto,
                            URL: carta[0].URL,
                            Tipo: carta[0].Tipo,
                            nombre: casilla[0].Nombre_Usuario,
                            Fila: req.query.fila,
                            Columna: req.query.columna,
                            partida: req.query.partida
                        });
                    } else {
                        resp.status(500);
                        resp.type("text/plain; charset = utf-8");
                        resp.write("Error 500 Internal server error " + err);
                        resp.end();
                    }
                });
            } else
            {
                resp.render("HTML_DatosCarta-Practica1", {
                    usuario: req.session.usuario,
                    foto: req.session.Foto,
                    URL: carta[0].URL,
                    Tipo: carta[0].Tipo,
                    partida: req.query.partida,
                    Fila: req.query.fila,
                    Columna: req.query.columna
                });
            }
        }
    });
});
app.post("/Comentario", multerFactory.single(), function (req, resp) {
    comments.NuevoComentario(req.body.partida, req.session.usuario, req.body.comentario,function (err) {
        if (!err) {
            resp.redirect("/cargaTablero?nombre=" + req.body.partida);
        } else {
            resp.status(500);
            resp.type("text/plain; charset = utf-8");
            resp.write("Error 500 Internal server error " + err);
            resp.end();
        }
    });

});