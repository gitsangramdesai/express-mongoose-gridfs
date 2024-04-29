let express = require("express");
let router = express.Router();
let FoodItem = require("../models/foodItem").FoodItem;
let FoodItemSchema = require("../models/foodItem").FoodItemSchema;
let mongoose = require("mongoose");
let {upload} = require("../upload");
const path = require('path')
const fs = require('fs')
let {bucket} = require("../connection")

/* insert a new food item */
router.post("/insert",upload.single('resume'), async function (req, res, next) {
    let foodItemName = req.body.name;
    let foodItemDesc = req.body.description;
    let foodItemPrice = req.body.price;

    console.log("Files",)

    try {
      let foodItem = await FoodItem.create({
        name: foodItemName,
        description: foodItemDesc,
        price: foodItemPrice,
        picture:req.file.filename
      });
   
      res.json({
        message: "food item added successfully",
        error: "",
        data: foodItem,
        success: true,
      });
    } catch (err) {
      res.json({
        message: "unable to save food items",
        error: err.message.toString(),
        data: [],
        success: false,
      });
    }
});



router.get("/image/:filename", (req, res) => {
  bucket.openDownloadStreamByName(req.params.filename).
  pipe(res);
});


module.exports = router;
