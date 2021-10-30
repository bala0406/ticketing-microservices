import { PaymentCreatedEvent, Publisher, Subject } from "@bala-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subject.PaymentCreated;
}
