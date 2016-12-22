var mysql = require("mysql");
var config = require("../../config.js");

module.exports = getConexion;

function getConexion(){
    var conexion = mysql.createConnection({
        host: config.dbHost,
        user: config.dbUser,
        password: config.dbPassword,
        database: config.dbName
    });
    
    return conexion;
}