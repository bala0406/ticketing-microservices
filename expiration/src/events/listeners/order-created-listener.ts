import {
	Listener,
	OrderCreatedEvent,
	OrderStatus,
	Subject,
} from "@bala-tickets/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subject.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent["data"], message: Message) {
		const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
		console.log("waiting this many milliseconds to process the job", delay);
		await expirationQueue.add(
			{
				orderId: data.id,
			},
			{
				delay: delay,
			}
		);
		message.ack();
	}
}
