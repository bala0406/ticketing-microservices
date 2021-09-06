import express from "express";
import { currentUser } from "../middlewares/current-user";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, (request, response) => {
    response.send({ currentUser: request.currentUser || null });
});

export { router as currentUserRouter };
