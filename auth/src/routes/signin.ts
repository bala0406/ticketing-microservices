import express from "express";

const router = express.Router();

router.post("/api/users/signin", (request, response) => {
    response.send("hi there");
});

export { router as signinRouter };
