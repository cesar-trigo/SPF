import express from "express";
import path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { router as vistasRouter } from './routes/vistas.router.js';
import { router as cartRouter } from './routes/cartRouter.js';
import { router as productRouter } from './routes/productRouter.js';
import { messageModelo } from "./dao/models/messageModelo.js";
import session from 'express-session';
import MongoStore from "connect-mongo";
import cookieParser from 'cookie-parser';
/* import { router as authRouter } from './routes/authRouter.js'; */



const PORT = 8080;
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://coderh:5iaNR9LCN6MarkJg@cluster0.ufvnnqc.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0',
        ttl: 3600
    }),
    secret: 'CoderCoder123',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, '/public')));

app.use(cookieParser("CoderCoder123"));
app.use('/', vistasRouter);
/* app.use('/api/session', authRouter); */
app.use('/api/product', productRouter);
app.use('/api/carts', cartRouter);

let usuarios = [];

const server = app.listen(PORT, () => {
    console.log(`Server escuchando en puerto ${PORT}`);
});



export const io = new Server(server);

/* io.on("connection", (socket) => { 
    console.log(`Se conecto el cliente ${socket.id}`)

    socket.on("id", async (userName) => {
        usuarios[socket.id] = userName;
        let messages = await messageModelo.find()
        socket.emit("previousMessages", messages)
        socket.broadcast.emit("newUser", userName)
    })

    socket.on("newMessage", async (userName, message) => {
        await messageModelo.create({ user: userName, message: message })
        io.emit("sendMessage", userName, message)
    })

    socket.on("disconnect", () => {
        const userName = usuarios[socket.id];
        delete usuarios[socket.id];
        if (userName) {
            io.emit("userDisconnected", userName);
        }
    })
}) */

const connDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://coderh:5iaNR9LCN6MarkJg@cluster0.ufvnnqc.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0"
        )
        console.log("Mongoose activo")
    } catch (error) {
        console.log("Error al conectar a DB", error.message)
    }
}

connDB()