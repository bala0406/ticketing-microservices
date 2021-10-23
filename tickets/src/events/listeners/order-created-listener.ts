import { Listener, OrderCreatedEvent, Subject } from "@bala-tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subject.OrderCreated;
	queueGroupName = queueGroupName;
	
	async onMessage(data: OrderCreatedEvent["data"], message: Message) {
		// find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		// If no ticket, throw error
		if (!ticket) {
			throw new Error("Ticket not found");
		}


		// Mark the ticket as being reserved by setting its orderId property
		ticket.set({ orderId: data.id });

		// save the ticket
		await ticket.save();

		// publish the update
	    new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
			orderId: ticket.orderId
		});

		// ack the message
		message.ack();

	}
}
