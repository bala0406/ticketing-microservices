import {Publisher, Subject, TicketCreatedEvent} from "@bala-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
   readonly subject = Subject.TicketCreated;
}