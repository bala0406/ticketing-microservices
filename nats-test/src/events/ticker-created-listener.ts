import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { Subject } from "./subject";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subject.TicketCreated;
	queueGroupName = "payments-service";
	onMessage(data: TicketCreatedEvent["data"], message: Message): void {
		console.log("Event data", data);
		message.ack();
		
	}
}
