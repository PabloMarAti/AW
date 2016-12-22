-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-12-2016 a las 19:11:26
-- Versión del servidor: 10.1.16-MariaDB
-- Versión de PHP: 5.6.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aw - practica1`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cartas`
--

CREATE TABLE `cartas` (
  `ID` int(11) NOT NULL,
  `Tipo` varchar(20) NOT NULL,
  `URL` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `cartas`
--

INSERT INTO `cartas` (`ID`, `Tipo`, `URL`) VALUES
(1, 'Inicio', 'img/Start.png'),
(2, 'Oro', 'img/Gold.png'),
(3, 'Fracaso', 'img/NoGold.png'),
(4, 'Incognita', 'img/DNK.png'),
(5, 'd', 'img/T1.png'),
(6, 'r', 'img/T2.png'),
(7, 'dr', 'img/T3.png'),
(8, 'u', 'img/T4.png'),
(9, 'ud', 'img/T5.png'),
(10, 'ur', 'img/T6.png'),
(11, 'udr', 'img/T7.png'),
(12, 'l', 'img/T8.png'),
(13, 'ld', 'img/T9.png'),
(14, 'lr', 'img/T10.png'),
(15, 'lrd', 'img/T11.png'),
(16, 'lu', 'img/T12.png'),
(17, 'lud', 'img/T13.png'),
(18, 'lru', 'img/T14.png'),
(19, 'lrud', 'img/T15.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juega`
--

CREATE TABLE `juega` (
  `ID` int(11) NOT NULL,
  `ID_Usuario` int(11) DEFAULT NULL,
  `ID_Partida` int(11) DEFAULT NULL,
  `Rol` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partidas`
--

CREATE TABLE `partidas` (
  `ID` int(11) NOT NULL,
  `Nombre` varchar(20) DEFAULT NULL,
  `Creador` varchar(30) DEFAULT NULL,
  `Turno` varchar(30) DEFAULT NULL,
  `Fecha` varchar(10) DEFAULT NULL,
  `Estado` varchar(15) DEFAULT NULL,
  `Numero_Jugadores` int(11) DEFAULT NULL,
  `Turnos_restantes` int(11) DEFAULT NULL,
  `Ganador` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `poner`
--

CREATE TABLE `poner` (
  `ID` int(11) NOT NULL,
  `ID_Usuario` int(11) DEFAULT NULL,
  `ID_Partida` int(11) DEFAULT NULL,
  `ID_Carta` int(11) DEFAULT NULL,
  `Fila` int(11) DEFAULT NULL,
  `Columna` int(11) DEFAULT NULL,
  `Descubierta` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tiene`
--

CREATE TABLE `tiene` (
  `ID` int(11) NOT NULL,
  `ID_Usuario` int(11) NOT NULL,
  `ID_Partida` int(11) NOT NULL,
  `ID_Carta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `ID` int(11) NOT NULL,
  `Nombre_Usuario` varchar(15) NOT NULL,
  `Password` varchar(30) NOT NULL,
  `Nombre_Completo` varchar(40) NOT NULL,
  `Sexo` tinyint(1) DEFAULT NULL,
  `Foto` varchar(300) DEFAULT NULL,
  `Fecha_Nacimiento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cartas`
--
ALTER TABLE `cartas`
  ADD PRIMARY KEY (`ID`);

--
-- Indices de la tabla `juega`
--
ALTER TABLE `juega`
  ADD PRIMARY KEY (`ID`);

--
-- Indices de la tabla `partidas`
--
ALTER TABLE `partidas`
  ADD PRIMARY KEY (`ID`);

--
-- Indices de la tabla `poner`
--
ALTER TABLE `poner`
  ADD PRIMARY KEY (`ID`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `tiene`
--
ALTER TABLE `tiene`
  ADD PRIMARY KEY (`ID`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cartas`
--
ALTER TABLE `cartas`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
--
-- AUTO_INCREMENT de la tabla `juega`
--
ALTER TABLE `juega`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `partidas`
--
ALTER TABLE `partidas`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `poner`
--
ALTER TABLE `poner`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `tiene`
--
ALTER TABLE `tiene`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
