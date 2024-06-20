import passport from "passport";
import passportjwt from "passport-jwt";
import local from "passport-local";
import GitHubStrategy from "passport-github2";

const LocalStrategy = local.Strategy;
import { userModelo } from "../dao/models/userModelo.js";
import { createHash, isValidPassword } from "../utils.js";
import { config } from "./config.js";
import CartManager from "../dao/CartManagerMONGO.js";
import UserManager from "../dao/UserManager.js";

const cartManager = new CartManager();
const userManager = new UserManager();

const lookToken = req => {
  let token = null;
  if (req.cookies["coderCookie"]) {
    token = req.cookies["coderCookie"];
  }
  return token;
};

export const initializePassport = () => {
  passport.use(
    "jwt",
    new passportjwt.Strategy(
      {
        jwtFromRequest: new passportjwt.ExtractJwt.fromExtractors([lookToken]),
        secretOrKey: config.SECRET_KEY,
      },
      async (jwt_payload, done) => {
        try {
          const user = await userManager.getUserById(jwt_payload.id);
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  /*   passport.use(
    "register", // nombre de estragia passport
    new LocalStrategy(
      {
        passReqToCallback: true, // quiero pasar la request al callback
        usernameField: "email", // se va validar con el email
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age, role } = req.body;
        try {
          const user = await userModelo.findOne({ email });
          if (user) {
            return done(null, false);
          } else {
            const newUser = {
              first_name,
              last_name,
              email,
              age,
              role,
              password: await createHash(password),
            };

            const cart = await cartManager.createCart(); // creo el carrito
            newUser.cart = cart._id; // asigno el id del carrito
            const result = await userModelo.create(newUser);
            return done(null, result);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  ); */

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          const user = await userModelo.findOne({ email: username });
          if (!user) {
            return done(null, false);
          }
          if (!isValidPassword(user, password)) {
            return done(null, false);
          }
          delete user.password;
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  /* passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModelo.findById(id);
    done(null, user);
  });

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv23litTYe5PEfpiJZ6C",
        clientSecret: "0cb85631b1845026f65bb76b8c734f60dd2198fa",
        callbackURL: "http://localhost:8080/callbackGithub",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModelo.findOne({ email: profile._json.email });
          if (!user) {
            const newUser = {
              first_name: profile._json.name.split(" ")[0],
              email: profile._json.email,
              password: "github",
              age: 0,
              githubId: true,
            };
            const result = await userModelo.create(newUser);
            return done(null, result);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  ); */
};
