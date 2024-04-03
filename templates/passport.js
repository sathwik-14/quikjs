function whatsTaken(userModel) {
  let content = ``;
  if (Object.hasOwn(userModel, "username")) {
    content += `const usernameTaken = async (username) => {
const user = await db.User.findOne({ where: { username } });
return !!user;
  };`;
  }
  if (Object.hasOwn(userModel, "email")) {
    content += `const emailTaken = async (email) => {
const user = await db.User.findOne({ where: { email } });
return !!user;
  };`;
  }
  return content;
}

function loginThrough(userModel) {
  let content = ``;
  if (Object.hasOwn(userModel, "username")) {
    content += `const userData = await db.User.findOne({ where: { username: user.username } });`;
  }
  if (Object.hasOwn(userModel, "email")) {
    content += `const userData = await db.User.findOne({ where: { email: user.email } });`;
  }
  return content;
}

function serializeUserContent(userModel) {
  const keys = Object.keys(userModel);
  const validKeys = keys.filter(key => !['password', 'id', 'createdAt', 'updatedAt'].includes(key));

  let content = `const serializeUser = (user) => {
    return {      
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      id: user.id,`;
  
  validKeys.forEach(key => {
    content += `
      ${key}: user.${key},`;
  });

  content += `
    };
  };`;

  return content;
}

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
  util: (input,userModel) => `
const passport = require("passport");
const db = require("../models/index");
const userAuth = passport.authenticate("jwt", { session: false });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

${whatsTaken(userModel)}

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
    ${loginThrough(userModel)}
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

${input.roles.length?'const checkRole = roles => (req,res,next) => !roles.includes(req.user.role) ? res.status(401).json("unauthorized"):next();':''}

${serializeUserContent(userModel)}

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
