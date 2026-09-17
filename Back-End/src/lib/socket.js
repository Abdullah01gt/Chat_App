import express from "express"
import http from "http"
import { Server } from "socket.io"

const app = express();
const server = http.createServer(app)

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, { cors: { origin: [allowedOrigin]}})

function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

// online users map = { userId: socketId }

const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if(userId) userSocketMap[userId] = socket.id;

    // io.emit() sends event to everyone -broadcast

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        // Only clear the mapping if this socket is still the one on record for
        // this user - a stale disconnect (e.g. from an old connection that was
        // superseded by a reconnect) must not wipe out a newer, still-live one.
        if(userId && userSocketMap[userId] === socket.id){
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap))
        }
    })




})

export {app, server, io, getReceiverSocketId  }