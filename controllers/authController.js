// controllers/authController.js

const User =
  require("../models/User");

const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

// ================= REGISTER =================

exports.register =
  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
      } = req.body;

      // ================= VALIDATION =================

      if (
        !name ||
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({
            message:
              "All fields are required",
          });
      }

      // ================= CHECK USER =================

      const existingUser =
        await User.findOne({
          email,
        });

      if (existingUser) {

        return res
          .status(400)
          .json({
            message:
              "User already exists",
          });
      }

      // ================= HASH PASSWORD =================

      const hash =
        await bcrypt.hash(
          password,
          10
        );

      // ================= CREATE USER =================

      const user =
        await User.create({
          name,
          email,
          password: hash,

          // fixed role
          role: "recruiter",
        });

      // ================= REMOVE PASSWORD =================

      const {
        password: _,
        ...userData
      } = user._doc;

      // ================= RESPONSE =================

      res.status(201).json({
        message:
          "User registered successfully",

        user: userData,
      });

    } catch (err) {

      console.error(
        "REGISTER ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  };

// ================= LOGIN =================

exports.login =
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;

      // ================= VALIDATION =================

      if (
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({
            message:
              "Email and password are required",
          });
      }

      // ================= FIND USER =================

      const user =
        await User.findOne({
          email,
        });

      if (!user) {

        return res
          .status(400)
          .json({
            message:
              "User not found",
          });
      }

      // ================= CHECK PASSWORD =================

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {

        return res
          .status(400)
          .json({
            message:
              "Wrong password",
          });
      }

      // ================= JWT TOKEN =================

      const token =
        jwt.sign(
          {
            id: user._id,
          },

          process.env.JWT_SECRET,

          {
            expiresIn: "7d",
          }
        );

      // ================= REMOVE PASSWORD =================

      const {
        password: _,
        ...userData
      } = user._doc;

      // ================= RESPONSE =================

      res.status(200).json({
        message:
          "Login successful",

        token,

        user: userData,
      });

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      res.status(500).json({
        message:
          "Server error",
      });
    }
  };