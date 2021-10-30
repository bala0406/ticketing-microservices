import { ExpirationCompleteEvent, Publisher, Subject } from "@bala-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subject.ExpirationComplete;
    
}