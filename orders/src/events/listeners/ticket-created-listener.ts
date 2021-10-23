import { Message } from "node-nats-streaming";
import { Listener, Subject, TicketCreatedEvent } from "@bala-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subject.TicketCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: TicketCreatedEvent["data"], message: Message) {
		const { id, title, price } = data;
		const ticket = Ticket.build({
			id,
			title,
			price,
		});
		await ticket.save();

		message.ack();
	}
}
