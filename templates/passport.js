export default {
  middleware: `
const db = require("../models/index");
const { Strategy, ExtractJwt } = require("passport-jwt");
require("dotenv").config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

module.exports = (passport) => {
  passport.use(
    new Strategy(options, async (payload, done) => {
      db.User.findByPk(payload.id)
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => {
          return done(null, false);
        });
    })
  );
};

    `,
  util: `
const passport = require("passport");
const db = require("../models/index");
const userAuth = passport.authenticate("jwt", { session: false });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const usernameTaken = async (username) => {
  const user = await db.User.findOne({ where: { username } });
  return !!user;
};

const emailTaken = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  return !!user;
};

const userRegister = async (user, res) => {
  try {
    if (user.username) {
      const usernameIsTaken = await usernameTaken(user.username);
      if (usernameIsTaken) {
        return res.status(400).json({
          message: "Username already taken",
          success: false,
        });
      }
    }

    if (user.email) {
      const emailIsTaken = await emailTaken(user.email);
      if (emailIsTaken) {
        return res.status(400).json({
          message: "Email already exist",
          success: false,
        });
      }
    }

    const hashedPassword = await hashPassword(user.password);
    const newUser = await db.User.create({
      ...user,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "User created",
      user: serializeUser(newUser),
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Unable to register user",
      success: false,
    });
  }
};

const userLogin = async (user, res) => {
  try {
    const userData = await db.User.findOne({ where: { email: user.email } });
    if (!userData) {
      return res.status(400).json({
        message: "User does not exist",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(user.password, userData.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password does not match",
        success: false,
      });
    }

    const token = jwt.sign(serializeUser(userData), process.env.SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      ...serializeUser(userData),
      token,
      message: "User logged in",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Unable to login",
      success: false,
    });
  }
};

const checkRole => roles => (req,res,next) => !roles.includes(req.user.role) ? res.status(401).json("unauthorized"):next();

const serializeUser = (user) => {
  return {
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    id: user.id,
  };
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

module.exports = {
  userRegister,
  userLogin,
  userAuth,
  checkRole,
  serializeUser,
};

  `,
};
