const express = require("express");
const router = express.Router();
const checkToken = require("../checkToken");
const multer = require("multer");
const { Product } = require("../models/product");
const fs = require("fs");
const path = require("path");

const location = "uploads/products";

// Set up Multer storage for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, location); // Specify the destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename for the uploaded image
  },
});

// Create the multer instance with the storage configuration
const upload = multer({ storage: storage });

router.get("/all", async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve products" });
  }
});

router.get("/single", async (req, res) => {
  const id = req.query.id;

  try {
    const details = await Product.findById(id);
    res.status(200).json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve product details" });
  }
});

router.post("/add", checkToken, upload.array("images"), async (req, res) => {
  const { sku, quantity, name, description } = req.body;

  try {
    // Check if a product with the same SKU already exists
    const existingProduct = await Product.findOne({ sku });

    if (existingProduct) {
      return res.status(409).json({ message: "Product already exists" });
    } else {
      // Create a new product instance
      const newProduct = new Product({
        sku,
        quantity,
        name,
        description,
      });

      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => {
          return `${req.protocol}://${req.get("host")}/images/${file.filename}`;
        });
        newProduct.images = images;
      }

      // Save the new product to the database
      await newProduct.save();

      return res.status(201).json({ message: "Product added successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add product" });
  }
});

router.put("/update", checkToken, upload.array("images"), async (req, res) => {
  try {
    const { productId, sku, quantity, name, description } = req.body;

    // Find the product by its ID in the database
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product properties
    product.sku = sku;
    product.quantity = quantity;
    product.name = name;
    product.description = description;

    // Remove the previous images from the server
    product.images.forEach((image) => {
      fs.unlinkSync(`${location}/${image}`);
    });

    // Get the filenames of the newly uploaded images
    const newImages = req.files.map((file) => file.filename);
    product.images = newImages;

    // Save the updated product
    await product.save();

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

router.delete("/delete", checkToken, async (req, res) => {
  try {
    const { productId } = req.body;

    // Find the product by its ID in the database
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove the images from the server
    product.images.forEach((image) => {
      fs.unlinkSync(`${location}/${path.basename(image)}`);
    });

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
