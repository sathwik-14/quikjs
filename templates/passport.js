const generateCheckExistsFunction = (userModelFields) => {
  let content = '';
  
  if (Object.hasOwn(userModelFields, 'username')) {
    content += `const isUsernameTaken = async (username) => {
  const user = await db.User.findOne({ where: { username } });
  return !!user;
};

`;
  }
  
  if (Object.hasOwn(userModelFields, 'email')) {
    content += `const isEmailTaken = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  return !!user;
};

`;
  }
  
  return content;
};

const generateLoginQuery = (userModelFields) => {
  let content = '';
  
  if (Object.hasOwn(userModelFields, 'username')) {
    content += `const userData = await db.User.findOne({ where: { username: user.username } });
`;
  }
  
  if (Object.hasOwn(userModelFields, 'email')) {
    content += `const userData = await db.User.findOne({ where: { email: user.email } });
`;
  }
  
  return content;
};

const generateSerializeUser = (userModelFields) => {
  const excludedFields = ['password', 'id', 'createdAt', 'updatedAt'];
  const validFields = userModelFields.filter(
    (field) => !excludedFields.includes(field.name),
  );

  let content = `const serializeUser = (user) => {
  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,`;
    
  for (const field of validFields) {
    content += `
    ${field.name}: user.${field.name},`;
  }

  content += `
  };
};`;

  return content;
};

export default {
  middleware: `
const db = require("../models/index");
const { Strategy, ExtractJwt } = require("passport-jwt");

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
  
  util: (input, userModel) => `
const passport = require("passport");
const db = require("../models/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userAuth = passport.authenticate("jwt", { session: false });

${generateCheckExistsFunction(userModel)}

const userRegister = async (user, res) => {
  try {
    if (user.username) {
      const usernameExists = await isUsernameTaken(user.username);
      if (usernameExists) {
        return res.status(400).json({
          message: "Username already taken",
          success: false,
        });
      }
    }

    if (user.email) {
      const emailExists = await isEmailTaken(user.email);
      if (emailExists) {
        return res.status(400).json({
          message: "Email already exists",
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
      message: "User created successfully",
      user: serializeUser(newUser),
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to register user",
      success: false,
    });
  }
};

const userLogin = async (user, res) => {
  try {
    ${generateLoginQuery(userModel)}
    
    if (!userData) {
      return res.status(404).json({
        message: "User does not exist",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(user.password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }

    const token = jwt.sign(serializeUser(userData), process.env.SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      ...serializeUser(userData),
      token,
      message: "Login successful",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to login",
      success: false,
    });
  }
};

${input?.roles?.length ? `const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Unauthorized access",
      success: false,
    });
  }
  next();
};

` : ''}

${generateSerializeUser(userModel)}

const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

module.exports = {
  userAuth,
  userRegister,
  userLogin,
  serializeUser,
  ${input?.roles?.length ? 'checkRole,' : ''}
};
`,
};