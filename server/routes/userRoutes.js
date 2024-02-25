import express from 'express';
const router = express.Router();
import {
  addNewUser,
  getFriends,
  getChats,
  deleteUser,
  updateImg,
  updateUserData,
  getRoot
} from '../controllers/userController.js';

router.get('/', getRoot);
router.post('/addNewUser', addNewUser);
router.post('/getFriends', getFriends);
router.post('/getChats', getChats);
router.post('/updateImg', updateImg);
router.post('/deleteUser', deleteUser);
router.put('/updateUserData', updateUserData);

export default router;
