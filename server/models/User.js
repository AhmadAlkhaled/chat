import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String },
    repeatedPassword: { type: String },
    userImg:{ type:String },
    friendsIds: { type: Array },
    lastOnline: { type: String  },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', UserSchema);


const ChatSchema = new Schema(
  {
    from: { type: String },
    to: { type: String },
    content: {
      type: {
        text: { type: String }, 
        file: {
          name: { type: String },
          type: { type: String },
          size: { type: String },
          fileContent: { type: String },
          data:{ type: Array },
          duration : { type : Number }
        }
      }
    },    date:{ type: String }
  },
  { timestamps: true }
);

const ChatModel = mongoose.model('Chat', ChatSchema);

export  {UserModel , ChatModel};