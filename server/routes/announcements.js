// const express = require('express')
// const router = express.Router()
// const fetchuser = require('../middleware/fetchuser')
// const isAdmin = require('../middleware/isAdmin')
// const Announce = require('../models/Announcement')
// const { body, validationResult } = require('express-validator');


// const dateconvert= (timestamp) => {
//      // Convert the timestamp string to a number
//      const timestampNumber = parseInt(timestamp);
//      // Create a Date object using the timestamp
//      const date = new Date(timestampNumber);
//      // Format the date as desired
//      return formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
// }

// //ROUTE:1 GET all announcements using /api/announcements/fetchannouncements, login required
// router.get('/fetchannouncements', fetchuser, async (req, res) => {
//      try {
//           const announce = await Announce.find()
//           const announcements = announce.map((ann)=>{
//                const currdate = dateconvert(ann.date)
//                return {_id: ann._id, user: ann.user, title: ann.title, description: ann.description, date: currdate}
//           })
//           return res.json(announcements);
//      }
//      catch (error) {
//           console.log(error.message)
//           return res.status(500).send("Internal Server Error")
//      }
// })

// //ROUTE:2 add announcements using /api/announcement/addannouncement, login required
// router.post('/addannouncements', fetchuser, isAdmin, [
//      body('title', 'Enter a valid title').isLength({ min: 3 }),
//      body('description', 'Enter a valid description').isLength({ min: 5 }),
// ], async (req, res) => {
//      try {
//           const { title, description } = req.body;
//           //If there are errors, return bad request
//           const result = validationResult(req);
//           if (!result.isEmpty()) {
//                return res.json({ errors: result.array() });
//           }
//           const announce = new Announce({
//                title, description, user: req.user.id
//           })

//           const savedannounce = await announce.save()
//           return res.json(savedannounce)
//      }
//      catch (error) {
//           console.log(error.message)
//           return res.status(500).send("Internal Server Error")
//      }
// })

// //ROUTE:3 update announcements using /api/announcement/updateannouncement, login required
// router.put('/updateannouncements/:id', fetchuser, isAdmin, async (req, res) => {
//      try {
//           const { title, description } = req.body;
//           //Create a newannouncement object
//           const newAnnounce = {user: req.user.id}
//           if (title) { newAnnounce.title = title }
//           if (description) { newAnnounce.description = description }

//           //find the announcement to be updated and update it
//           let announce = await Announce.findById(req.params.id)
//           if (!announce) { return res.status(404).send("Not Found") }

//           //updating the particular announcement
//           announce = await Announce.findByIdAndUpdate(req.params.id, { $set: newAnnounce }, { new: true })
//           return res.json({ announce })
//      }
//      catch (error) {
//           console.log(error.message)
//           return res.status(500).send("Internal Server Error")
//      }
// })

// //ROUTE:4 delete announcements using /api/announcement/deleteannouncement, login required
// router.delete('/deleteannouncements/:id', fetchuser, isAdmin, async (req, res) => {
//      try {
//           //find the announcement to be deleted and delete it
//           let announce = await Announce.findById(req.params.id)
//           if (!announce) { return res.status(404).send("Not Found") }

//           //deleting the particular announcement
//           announce = await Announce.findByIdAndDelete(req.params.id)
//           return res.json({ "Success": "the announcement has been deleted", "id": req.user.id })
//      }
//      catch (error) {
//           console.log(error.message)
//           return res.status(500).send("Internal Server Error")
//      }
// })
// module.exports = router







const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const isAdmin = require("../middleware/isAdmin");
const Announce = require("../models/Announcement");
const { body, validationResult } = require("express-validator");
const cache = require("../middleware/cache");
const { redisClient } = require("../redisClient"); // ✅ for cache invalidation

// helper to convert timestamp → dd-mm-yyyy
const dateconvert = (timestamp) => {
  const date = new Date(parseInt(timestamp));
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
};

// ROUTE:1 GET all announcements -> /api/announcements/fetchannouncements
router.get(
  "/fetchannouncements",
  fetchuser,
  cache("announcements", 1800), // ✅ cache for 30 minutes
  async (req, res) => {
    try {
      const announce = await Announce.find();
      const announcements = announce.map((ann) => {
        const currdate = dateconvert(ann.date);
        return {
          _id: ann._id,
          user: ann.user,
          title: ann.title,
          description: ann.description,
          date: currdate,
        };
      });
      return res.json(announcements);
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE:2 add announcements -> /api/announcements/addannouncements
router.post(
  "/addannouncements",
  fetchuser,
  isAdmin,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.json({ errors: result.array() });
      }

      const announce = new Announce({
        title,
        description,
        user: req.user.id,
      });

      const savedAnnounce = await announce.save();

      // ✅ Invalidate cache so new data appears immediately
      await redisClient.del("announcements");
      console.log("🧹 Cache invalidated: announcements");

      return res.json(savedAnnounce);
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE:3 update announcements -> /api/announcements/updateannouncements/:id
router.put("/updateannouncements/:id", fetchuser, isAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    const newAnnounce = { user: req.user.id };
    if (title) newAnnounce.title = title;
    if (description) newAnnounce.description = description;

    let announce = await Announce.findById(req.params.id);
    if (!announce) return res.status(404).send("Not Found");

    announce = await Announce.findByIdAndUpdate(
      req.params.id,
      { $set: newAnnounce },
      { new: true }
    );

    // ✅ Invalidate cache after update
    await redisClient.del("announcements");
    console.log("🧹 Cache invalidated: announcements");

    return res.json({ announce });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
});

// ROUTE:4 delete announcements -> /api/announcements/deleteannouncements/:id
router.delete(
  "/deleteannouncements/:id",
  fetchuser,
  isAdmin,
  async (req, res) => {
    try {
      let announce = await Announce.findById(req.params.id);
      if (!announce) return res.status(404).send("Not Found");

      await Announce.findByIdAndDelete(req.params.id);

      // ✅ Invalidate cache after deletion
      await redisClient.del("announcements");
      console.log("🧹 Cache invalidated: announcements");

      return res.json({
        Success: "The announcement has been deleted",
        id: req.user.id,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
