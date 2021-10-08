import {
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
	requireAuth,
} from "@bala-tickets/common";
import express, { Request, Response } from "express";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { Order } from "../models/order";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
	"/api/orders/:orderId",
	requireAuth,
	async (request: Request, response: Response) => {
		const { orderId } = request.params;

		const order = await Order.findById(orderId).populate("ticket");

		if (!order) {
			throw new NotFoundError();
		}

		if (order.userId !== request.currentUser?.id) {
			throw new NotAuthorizedError();
		}

		order.status = OrderStatus.CANCELLED;
		await order.save();

		// publishing an event saying that the order was cancelled
		new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			ticket: {
				id: order.ticket.id,
			}
		});

		response.status(204).send(order);
	}
);

export { router as deleteOrderRouter };
