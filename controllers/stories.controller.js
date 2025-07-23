const express = require("express");
const router = express.Router();
const isSignedIn = require("../middleware/is-signed-in");
const Story = require("../models/story");
const User = require("../models/user");


router.get("/new", isSignedIn, (req, res) => {
  res.render("story/new.ejs");
});

router.post("/", isSignedIn, async (req, res) => {
  try {
    req.body.author = req.session.user._id;
    await Story.create(req.body);
    res.redirect("/story");
  } catch (error) {
    
    res.send("ERROR");
  }
});


router.get("/", async (req, res) => {
  const foundStory = await Story.find();
  
  res.render("story/index.ejs", { foundStory: foundStory });
});


router.get("/", async (req, res) => {
  try {
    const foundStory = await Story.find();
    res.render("story/index.ejs", { foundStory: foundStory });
  } catch (err) {
   
    res.send("Something went wrong");
  }
});



router.get("/:storyId", async (req, res) => {
  try {
    const foundStory = await Story.findById(req.params.storyId)
      .populate("author")
      .populate("comments.commenter");
    res.render("story/show.ejs", { foundStory });
  } catch (error) {
    
    res.redirect("/story");
  }
});


router.get("/profile/:userId", async (req, res) => {
  const foundUser = await User.findById(req.params.userId).lean();
  const stories= await Story.find({author:req.params.userId}).lean()
  res.render("story/profile.ejs", {  foundUser ,stories});
});



router.delete("/:storyId", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId).populate(
    "author"
  );

  if (foundStory.author._id.equals(req.session.user._id)) {
    await foundStory.deleteOne();
    return res.redirect("story");
  } else {
    return res.send("Not authorized");
  }
});


router.get("/:storyId/edit", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId).populate(
    "author"
  );
  if (foundStory.author._id.equals(req.session.user._id)) {
    return res.render("story/edit.ejs", { foundStory: foundStory });
  }
  return res.send("Not authorized");
});



router.put("/:storyId", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId).populate(
    "author"
  );

  if (foundStory.author._id.equals(req.session.user._id)) {
    await Story.findByIdAndUpdate(req.params.storyId, req.body, { new: true });
    return res.redirect(`/story/${req.params.storyId}`);
  }
});


router.post("/:storyId/comments", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId)
    .populate("author")
    .populate("comments.commenter");
  req.body.commenter = req.session.user._id;
  foundStory.comments.push(req.body);
  await foundStory.save();
  res.redirect(`/story/${req.params.storyId}`);
});


router.put("/:storyId/comments/:commentId", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId);
  const comment = foundStory.comments.id(req.params.commentId);

  if (comment.commenter.equals(req.session.user._id)) {
    comment.content = req.body.content;
    await foundStory.save();
    res.redirect(`/story/${req.params.storyId}`);
  } else {
    res.send("Not authorized");
  }
});


router.delete("/:storyId/comments/:commentId", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId);
  const comment = foundStory.comments.id(req.params.commentId);

  if (comment.commenter.equals(req.session.user._id)) {
    comment.deleteOne();
    await foundStory.save();
    res.redirect(`/story/${req.params.storyId}`);
  } else {
    res.send("Not authorized");
  }
});

module.exports = router;
