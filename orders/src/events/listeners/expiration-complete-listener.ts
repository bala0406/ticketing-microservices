import {
	ExpirationCompleteEvent,
	Listener,
	OrderStatus,
	Subject,
} from "@bala-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
	readonly subject = Subject.ExpirationComplete;
	queueGroupName = queueGroupName;

	async onMessage(data: ExpirationCompleteEvent["data"], message: Message) {
		const order = await Order.findById(data.orderId).populate("ticket");

		if (!order) {
			throw new Error("order not found");
		}

		if (order.status === OrderStatus.COMPLETE) {
			message.ack();
			return;
		}

		order.set({ status: OrderStatus.CANCELLED });
		await order.save();
		new OrderCancelledPublisher(this.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		});

		message.ack();
	}
}
