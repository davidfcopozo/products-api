const express = require("express");
const router = express.Router();

//Here we are importing the controllers we will use for a given route
const {
  getAllProducts,
  getAllProductsStatic,
} = require("../controllers/products");

//Here we are applying both imported controllers from the jobs.js file in the controllers folder for different types of requests (get, post, etc) and this route will be used in app.js
router.route("/").get(getAllProducts);
router.route("/static").get(getAllProductsStatic);

module.exports = router;
