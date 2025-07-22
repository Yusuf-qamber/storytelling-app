const express = require("express");
const router = express.Router();
const isSignedIn = require("../middleware/is-signed-in");
const Story = require("../models/story");

// ADDING A STORY
router.get("/new", isSignedIn, (req, res) => {
  res.render("story/new.ejs");
});

router.post("/", isSignedIn, async (req, res) => {
  try {
    req.body.author = req.session.user._id;
    await Story.create(req.body);
    res.redirect("/story");
  } catch (error) {
    console.log(error);
    res.send("ERROR");
  }
});

// VIEW THE INDEX PAGE
router.get("/", async (req, res) => {
  const foundStory = await Story.find();
  console.log(foundStory);
  res.render("story/index.ejs", { foundStory: foundStory });
});

// VIEW ALL SRORIES
router.get("/", async (req, res) => {
  try {
    const foundStory = await Story.find();
    res.render("story/index.ejs", { foundStory: foundStory });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
});

// VIEW A SINGLE STORY

router.get("/:storyId", async (req, res) => {
  try {
    const foundStory = await Story.findById(req.params.storyId)
      .populate("author")
      .populate("comments.commenter");
    res.render("story/show.ejs", { foundStory });
  } catch (error) {
    console.log(error);
    res.redirect("/story");
  }
});

// DELETE A STORY FROM THE DATABASE
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

// RENDER THE EDIT FORM VIEW
router.get("/:storyId/edit", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId).populate(
    "author"
  );
  if (foundStory.author._id.equals(req.session.user._id)) {
    return res.render("story/edit.ejs", { foundStory: foundStory });
  }
  return res.send("Not authorized");
});

// HANDLE EDIT FORM SUBMISSION

router.put("/:storyId", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId).populate(
    "author"
  );

  if (foundStory.author._id.equals(req.session.user._id)) {
    await Story.findByIdAndUpdate(req.params.storyId, req.body, { new: true });
    return res.redirect(`/story/${req.params.storyId}`);
  }
});

// POST COMMENT FORM TO THE DATABASE
router.post("/:storyId/comments", isSignedIn, async (req, res) => {
  const foundStory = await Story.findById(req.params.storyId)
    .populate("author")
    .populate("comments.commenter");
  req.body.commenter = req.session.user._id;
  foundStory.comments.push(req.body);
  await foundStory.save();
  res.redirect(`/story/${req.params.storyId}`);
});
// UPDATE a COMMENT
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

// DELETE a COMMENT
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
