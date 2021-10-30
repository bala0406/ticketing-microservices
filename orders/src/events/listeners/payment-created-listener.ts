import {
	Listener,
	OrderStatus,
	PaymentCreatedEvent,
	Subject,
} from "@bala-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subject.PaymentCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: PaymentCreatedEvent["data"], message: Message) {
		const order = await Order.findById(data.orderId);

		if (!order) {
			throw new Error("order not found");
		}

		order.set({
			status: OrderStatus.COMPLETE,
		});
		await order.save();

		// an event should be published to keep the version in sync with all other services, but its not necessary in this case

		message.ack();
	}
}
