import express from "express";

const router = express.Router();

router.get("/api/users/signup", (request, response) => {
  response.send("hi there");
});

export { router as signupRouter };
