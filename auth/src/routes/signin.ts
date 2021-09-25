import express, { Request, Response } from "express";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@bala-tickets/common";
import { User } from "../models/user";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
    "/api/users/signin",
    [
        body("email").isEmail().withMessage("Email must be valid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("You must supply as password"),
    ],
    validateRequest,
    async (request: Request, response: Response) => {
        const { email, password } = request.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            throw new BadRequestError("Invalid credentials");
        }

        const passwordsMatch = await Password.compare(
            existingUser.password,
            password
        );
        if (!passwordsMatch) {
            throw new BadRequestError("Invalid credentials");
        }

        // Generate JWT
        const userJWT = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            process.env.JWT_KEY!
        );

        // Store it on session object
        request.session = {
            jwt: userJWT,
        };

        response.status(200).send(existingUser);
    }
);

export { router as signinRouter };
