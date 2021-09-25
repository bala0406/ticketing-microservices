import {
	NotAuthorizedError,
	NotFoundError,
	requireAuth,
	validateRequest,
} from "@bala-tickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.put(
	"/api/tickets/:id",
	requireAuth,
	[
		body("title").not().isEmpty().withMessage("Title is required"),
		body("price")
			.isFloat({ gt: 0 })
			.withMessage("Price is required and must be greater than 0"),
	],
	validateRequest,
	async (request: Request, response: Response) => {
		const ticket = await Ticket.findById(request.params.id);
		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.userId !== request.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		ticket.set({
			title: request.body.title,
			price: request.body.price,
		});
		await ticket.save();

		response.send(ticket);
	}
);

export { router as UpdateTicketRouter };
