import { OrderCreatedEvent, Publisher, Subject } from "@bala-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject : Subject.OrderCreated = Subject.OrderCreated;
}