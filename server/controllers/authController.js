import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.js';
import dotenv from 'dotenv';
import {config} from '../config.js'

dotenv.config();
const env = process.env.NODE_ENV ;
const configOptions = config[env];



// JST SECRET KEY
const JWT_SECRET = configOptions && configOptions.JWT_SECRET;


// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await UserModel.findOne({ email });

    if (foundUser) {
      const isPasswordValid = bcrypt.compareSync(password, foundUser.password);
      if (isPasswordValid) {
        jwt.sign(
          {
            userId: foundUser._id,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            email: foundUser.email,
            friends: foundUser.friendsIds,
          },
          JWT_SECRET,
          { expiresIn: '24h' },
          (err, token) => {
            if (err) throw err;
            res.cookie('token', token).status(200).json({
              message: 'your logged in',
              token: token
            });
          }
        );
      } else {
        res.status(200).json('Invalid credentials');
      }
    } else {
      res.json('user not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json('Server error');
  }
};

// LogIn with Google
export const logInGoogle = async (req, res) => {
  const { email_verified, email } = req.body;

  if (email_verified === true) {
    try {
      const foundUser = await UserModel.findOne({ email });

      if (foundUser) {
        jwt.sign(
          {
            userId: foundUser._id,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            email: foundUser.email,
            friends: foundUser.friendsIds,
          },
          JWT_SECRET,
          { expiresIn: '24h' },
          (err, token) => {
            if (err) throw err;
            res.cookie('token', token).status(200).json({
              message: 'your logged in',
            });
          }
        );
      } else {
        res.status(200).json('user not found');
      }
    } catch (error) {
      res.json(error.message);
    }
  } else {
    res.status(401).json('email is not verified');
  }
};

// SIGNUP
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      id: createdUser._id,
      message: 'your are successfully registered',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
};

// CHECK WEB TOKEN
export const checkWebToken = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).send('There is no token');
    }
    jwt.verify(token, JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(200).json({
          status: false,
          message: err.message,
        });
      }

      try {
        const existingUser = await UserModel.findOne({
          _id: decodedToken.userId,
        });
        if (existingUser) {
          return res.status(200).json({
            status: true,
            userImg: existingUser.userImg,
          });
        } else {
          return res.status(401).send('User not found');
        }
      } catch (error) {
        return res.status(500).send('Internal Server Error');
      }
    });
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
};

// PROFILE
export const getProfile = async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json('there is no token');
  }
};
