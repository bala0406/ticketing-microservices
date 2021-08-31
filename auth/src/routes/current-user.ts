import express from "express";

const router = express.Router();

router.get("/api/users/currentuser", (request, response) => {
  response.send("hi there");
});

export { router as currentUserRouter };
