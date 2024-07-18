import express from "express";
import path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import { config } from "./config/config.js";
import { logger, middLogger } from "./utils/loggers.js";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import passport from "passport";
import compression from "express-compression";
import { initializePassport } from "./config/passport.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { router as vistasRouter } from "./routes/vistasRouter.js";
import { router as cartRouter } from "./routes/cartRouter.js";
import { router as productRouter } from "./routes/productRouter.js";
import { router as sessionRouter } from "./routes/sessionRouter.js";
import { router as loggerRouter } from "./routes/loggerRouter.js";
import { messageModelo } from "./dao/models/messageModelo.js";

const PORT = config.PORT;
const app = express();

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression({}));
app.use(express.static(path.join(__dirname, "/public")));
app.use(cookieParser(config.SECRET_KEY));

initializePassport();
app.use(passport.initialize());
app.use(middLogger);

//Rutas
app.use("/", vistasRouter);
app.use("/api/product", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/session", sessionRouter);
app.use("/loggerTest", loggerRouter);

// Middleware para manejo de errores
app.use(errorHandler);

// Conexión a la base de datos
const connDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL);
    console.log("Mongoose activo");
  } catch (error) {
    console.log("Error al conectar a DB", error.message);
  }
};

connDB();

// Configuración del servidor
const server = app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});

//chat
let usuarios = [];
export const io = new Server(server);

io.on("connection", socket => {
  /*   console.log(`Se conecto el cliente ${socket.id}`); */

  socket.on("id", async userName => {
    usuarios[socket.id] = userName;
    let messages = await messageModelo.find();
    socket.emit("previousMessages", messages);
    socket.broadcast.emit("newUser", userName);
  });

  socket.on("newMessage", async (userName, message) => {
    await messageModelo.create({ user: userName, message: message });
    io.emit("sendMessage", userName, message);
  });

  socket.on("disconnect", () => {
    const userName = usuarios[socket.id];
    delete usuarios[socket.id];
    if (userName) {
      io.emit("userDisconnected", userName);
    }
  });
});
