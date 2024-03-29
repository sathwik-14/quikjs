let template = "";

export default template = {
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

const userAuth = passport.authenticate("jwt", { session: false });

const serializeUser = (user) => {
  return {
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
    id: user.id,
  };
};

module.exports = {
  userAuth,
  serializeUser
};

    `,
};
