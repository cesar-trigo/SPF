import passport from "passport";
import passportjwt from "passport-jwt";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import { userModelo } from "../dao/models/userModelo.js";
import { createHash, isValidPassword } from "../utils.js";
import { config } from "../config/config.js";
import CartManager from "../dao/CartManagerMONGO.js";
import UserManager from "../dao/UserManager.js";

const LocalStrategy = local.Strategy,
  cartManager = new CartManager(),
  userManager = new UserManager();

export const lookToken = req => {
  let token = null;
  if (req.cookies["coderCookie"]) {
    token = req.cookies["coderCookie"];
  }
  return token;
};

export const initializePassport = () => {
  // Estrategia JWT
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
  // Estrategia de Login Local
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

  /*   passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModelo.findById(id);
    done(null, user);
  });
 */

  // Estrategia de GitHub
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: config.CLIENT_ID_GITHUB,
        clientSecret: config.CLIENT_SECRET_GITHUB,
        callbackURL: "http://localhost:8080/api/session/callbackGitHub", //Este ruta se configuro desde github
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModelo.findOne({ email: profile._json.email });
          if (!user) {
            const newUser = {
              first_name: profile._json.name.split(" ")[0],
              last_name: "",
              email: profile._json.email,
              password: "github",
              age: 0,
              role: "user",
              githubId: true,
            };
            const cart = await cartManager.createCart(); // creo el carrito
            newUser.cart = cart._id; // asigno el id del carrito
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
  );

  // Estrategia para Información de Usuario Actual
  passport.use(
    "current",
    new passportjwt.Strategy(
      {
        secretOrKey: config.SECRET_KEY,
        jwtFromRequest: new passportjwt.ExtractJwt.fromExtractors([lookToken]),
      },
      //contenido de usuario
      async (user, done) => {
        try {
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
