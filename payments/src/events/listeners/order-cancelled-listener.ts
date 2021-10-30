import {
	Listener,
	OrderCancelledEvent,
	OrderStatus,
	Subject,
} from "@bala-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subject.OrderCancelled;
	queueGroupName = queueGroupName;
	async onMessage(data: OrderCancelledEvent["data"], message: Message) {
		const order = await Order.findOne({
			_id: data.id,
			version: data.version - 1,
		});

		if (!order) {
			throw new Error("Order not found");
		}

		order.set({ status: OrderStatus.CANCELLED });
        await order.save();

        message.ack();
	}
}
