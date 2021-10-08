import { OrderCancelledEvent, Publisher, Subject } from "@bala-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject : Subject.OrderCancelled = Subject.OrderCancelled;
}