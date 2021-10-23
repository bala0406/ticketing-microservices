import { Listener, Subject, TicketUpdatedEvent } from "@bala-tickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subject.TicketUpdated;
	queueGroupName: string = queueGroupName;

	async onMessage(data: TicketUpdatedEvent["data"], message: Message) {
		const ticket = await Ticket.findByEvent(data);

		if (!ticket) {
			throw new Error("Ticket not found");
		}

		const { title, price } = data;
		ticket.set({ title, price });
		await ticket.save();

		message.ack();
	}
}
