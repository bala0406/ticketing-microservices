import { Listener, OrderCreatedEvent, Subject } from "@bala-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subject.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent["data"], message: Message) {
		const order = Order.build({
			id: data.id,
			price: data.ticket.price,
			status: data.status,
			userId: data.userId,
			version: data.version,
		});
		await order.save();

		message.ack();
	}
}
