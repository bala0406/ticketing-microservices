import { Listener, OrderCancelledEvent, Subject } from "@bala-tickets/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subject.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent["data"], message: Message) {
		const ticket = await Ticket.findById(data.ticket.id);

		if (!ticket) {
			throw new Error("Ticket not found");
		}

		ticket.set({ orderId: undefined });

		await ticket.save();
		new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			orderId: ticket.orderId,
			userId: ticket.userId,
			price: ticket.price,
			title: ticket.title,
			version: ticket.version,
		});

		message.ack();
	}
}
