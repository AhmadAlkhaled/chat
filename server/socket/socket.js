import jwt from 'jsonwebtoken';
import { UserModel, ChatModel } from '../models/User.js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const socketFunc = (WebServer) => {
  const io = new Server(WebServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  let onlineUsers = [];

  io.on('connection', (socket) => {

    console.log(socket.id);
    console.log('Ein Benutzer hat sich verbunden');

    const token = socket.handshake.query.token;

    const dToken = jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (decodedToken) {
        onlineUsers.push({ userId: decodedToken.userId, socketId: socket.id });
        return decodedToken;
      }
    });

    io.emit('onlineUsers', onlineUsers);

    socket.on('disconnect', async () => {
      console.log('Ein Benutzer hat die Verbindung getrennt');
      if (onlineUsers.length >= 1) {
        const arr = onlineUsers.filter((user) => {
          return user.userId !== dToken.userId;
        });
        onlineUsers = arr;
        io.emit('onlineUsers', onlineUsers);

      }

      if (dToken) {
        const date = new Date();
        const update = {
          $set: {
            lastOnline: ` ${date.getHours()}:${date.getMinutes()},${date.getDate()}.${
              date.getMonth() + 1
            }.${date.getFullYear()} `,
          },
        };
        await UserModel.updateOne({ _id: dToken.userId }, update);
      }
    });

    socket.on('addNewFriend', async (searchedValue) => {
      if (searchedValue) {
        const findUsers = await UserModel.find({
          $or: [{ firstName: { $regex: searchedValue, $options: 'i' } }],
        });
        io.to(socket.id).emit('findUsers', findUsers);
      } else {
        io.emit('findUsers', []);
      }
    });

    socket.on('message', async (msg) => {
      let message;
    
      if (typeof msg.content.text === 'string') {
        message = {
          from: msg.from,
          to: msg.to,
          content: { text: msg.content.text },
          date: msg.date,
        };
      } else if (msg.content.file.name === 'Audio') {
    
        message = {
          from: msg.from,
          to: msg.to,
          content: { file: msg.content.file },
          date: msg.date,
        };
      } else {
        message = {
          from: msg.from,
          to: msg.to,
          content: {
            file: msg.content.file,
          },
          date: msg.date,
        };
      }
       socket.to(msg.currentChatUserSocketId).emit('message', message);
    
      try {
          await ChatModel.create(message);
      } catch (error) {
        console.error('Error saving message to MongoDB:', error);
      }

    });

    socket.on('audioCalling' , (data)=>{
      socket.to(data.to.socketId).emit('call', data.from);
    });

    socket.on('closeCalling' , (id)=>{
      socket.to(id).emit('closeCalling');
    });

    socket.on('peerId' , (data)=>{
      socket.to(data.socketId).emit('peerId' , data.peerId);
    });

    socket.on('startCall' , (socketId)=>{
      socket.to(socketId).emit('startCall');
    });

    socket.on('videoCall' , (data)=>{
      socket.to(data.to.socketId).emit('videoCall', data.from);
    });

    socket.on('closeVideoCall' , (id)=>{
  
      socket.to(id.id).emit('closeVideoCall');
    });




  });
};
