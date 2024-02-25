import { UserModel, ChatModel } from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const getRoot = (req, res)=>{
res.send(' Server runing port:4040  ')
}


export const addNewUser = async (req, res) => {
  const { currentUserId, friedUserId } = req.body;
  const filterCurrentUserId = { _id: currentUserId };
  const update = {
    $addToSet: {
      friendsIds: friedUserId,
    },
  };

  await UserModel.updateOne(filterCurrentUserId, update);
  const currentUser = await UserModel.findOne({ _id: filterCurrentUserId });
  const findUsers = await UserModel.find({
    _id: { $in: currentUser.friendsIds },
  });
  res.json(findUsers);
};

export const updateImg = async (req, res) => {
  const { currentUserId, imgBuffer } = req.body;
  const filterCurrentUserId = { _id: currentUserId };
  const update = {
    $set: {
      userImg: imgBuffer,
    },
  };

  const result = await UserModel.updateOne(filterCurrentUserId, update);
  res.json({ status: result.acknowledged });
};

export const deleteUser = async (req, res) => {
  const { user, currentUser } = req.body;
  const filterCurrentUserId = { _id: currentUser.userId };
  const update = {
    $pull: {
      friendsIds: user.id,
    },
  };

  await UserModel.updateOne(filterCurrentUserId, update);
  const CurrentUser = await UserModel.findOne({ _id: filterCurrentUserId });
  const findUsers = await UserModel.find({
    _id: { $in: CurrentUser.friendsIds },
  });
  res.json(findUsers);
};

export const getFriends = async (req, res) => {
  const { id } = req.body;

  const currentUser = await UserModel.findOne({ _id: id });
  const findUsers = await UserModel.find({
    _id: { $in: currentUser.friendsIds },
  });

  res.json({ findUsers: findUsers });
};

export const getChats = async (req, res) => {
  const { currentUserID, currentChatUserID } = req.body;

  const currentUserMessages = await ChatModel.find({
    from: currentUserID,
    to: currentChatUserID,
  });
  const currentChatUserMessages = await ChatModel.find({
    from: currentChatUserID,
    to: currentUserID,
  });
  const arr = [...currentUserMessages, ...currentChatUserMessages];
  const AllMessages = arr.sort((a, b) => {
    return a.createdAt - b.createdAt;
  });
  res.json({ AllMessages });
};

export const updateUserData = async (req, res) => {
  const { currentUserId, newUserData } = req.body;
  const { firstName, lastName, email } = newUserData;

  const updateFields = {};

  if (firstName && firstName.trim() !== '') {
    updateFields.firstName = firstName;
  }

  if (lastName && lastName.trim() !== '') {
    updateFields.lastName = lastName;
  }

  if (email && email.trim() !== '') {
    updateFields.email = email;
  }

  if (Object.keys(updateFields).length > 0) {
    const updatedUserData = await UserModel.findOneAndUpdate(
      { _id: currentUserId },
      { $set: updateFields },
      { new: true }
    );
    updatedUserData;


    jwt.sign(
      {
        userId: updatedUserData._id,
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        email: updatedUserData.email,
        friends: updatedUserData.friendsIds,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.cookie('token', token).status(200).json(updatedUserData);
      }
    );

  }
};
