import {Publisher, Subject, TicketUpdatedEvent} from "@bala-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
   readonly subject = Subject.TicketUpdated;
}