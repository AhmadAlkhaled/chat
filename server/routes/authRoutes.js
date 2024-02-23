import express from 'express';
const router = express.Router();
import {
  login,
  signup,
  checkWebToken,
  getProfile,
  logInGoogle,
} from '../controllers/authController.js';

router.post('/log-in', login);
router.post('/log-in-google', logInGoogle);
router.post('/sign-up', signup);
router.get('/profile', getProfile);
router.post('/check-web-token', checkWebToken);

export default router;
