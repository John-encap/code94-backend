const express = require("express");
const router = express.Router();
const { Vendor } = require("../models/vendor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const findUser = await Vendor.findOne({ email: req.body.email });
    if (!findUser) {
      console.log("No user found");
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    if (!findUser.emailVerified) {
      console.log("Email not verified");
      return res.status(401).json({
        success: false,
        error: "Email not verified",
      });
    }

    const passwordMatch = bcrypt.compareSync(
      req.body.password,
      findUser.password
    );

    if (!passwordMatch) {
      console.log("Incorrect password");
      return res.status(401).json({
        success: false,
        error: "Incorrect password",
      });
    }

    const accessToken = jwt.sign(
      { userId: findUser._id },
      process.env.JWTACCESSSECRET
    );

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Failed to log in",
    });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, fName, lName } = req.body;

  try {
    const findUser = await Vendor.findOne(
      { email: req.body.email },
      "emailVerified"
    );

    if (!findUser) {
      const salt = 10;
      const encPassword = bcrypt.hashSync(password, salt);

      const user = new Vendor({
        email,
        password: encPassword,
        fName,
        lName,
        createdAt: Date.now(),
        emailVerified: true,
      });

      await user.save();

      res
        .status(201)
        .json({ success: true, message: "Vendor added successfully" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Vendor already exists" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add Vendor" });
  }
});

module.exports = router;
