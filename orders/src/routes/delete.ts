import {
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
} from "@bala-tickets/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";

const router = express.Router();

router.delete(
	"/api/orders/:orderId",
	requireAuth,
	async (request: Request, response: Response) => {
		const { orderId } = request.params;

		const order = await Order.findById(orderId);

		if (!order) {
			throw new NotFoundError();
		}

		if (order.userId !== request.currentUser?.id) {
			throw new NotAuthorizedError();
		}

		order.status = OrderStatus.CANCELLED;
		await order.save();

		// publishing an event saying that the order was cancelled
		
		response.status(204).send(order);
	}
);

export { router as deleteOrderRouter };
