import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5005/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Validate email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email provided by Google"), null);
          }

          // Check if email already exists
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            return done(
              new Error("Email already registered with another account"),
              null
            );
          }

          // Create new user with required fields
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || email.split("@")[0], // Fallback to email username if no display name
            email: email,
            address: "", // Default empty address
            role: "user", // Default role
            createdIdeas: [], // Initialize empty arrays
            collaborations: [],
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  try {
    done(null, user.id);
  } catch (error) {
    done(error, null);
  }
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return done(new Error("User not found"), null);
    }
    done(null, user);
  } catch (error) {
    console.error("Deserialize User Error:", error);
    done(error, null);
  }
});

export default passport;
