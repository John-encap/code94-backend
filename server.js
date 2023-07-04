const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
var cors = require("cors");
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/images', express.static('uploads/products'));
app.use("/api/auth/", require("./routes/authRoutes"));
app.use("/api/product/", require("./routes/productRoutes"));

app.listen(PORT, () => {
  console.log("E-Commerce Backend is Running at port " + PORT);
});
