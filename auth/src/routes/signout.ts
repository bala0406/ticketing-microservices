import express from "express";

const router = express.Router();

router.post("/api/users/signout", (request, response) => {
    response.send("hi there");
});

export { router as signoutRouter };
