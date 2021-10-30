import { OrderCancelledEvent } from "@bala-tickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";

const setup = async () => {
	// create an instance of the listener
	const listener = new OrderCancelledListener(natsWrapper.client);

	// create and save a ticket
	const orderId = new mongoose.Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: "concert",
		price: 99,
		userId: "Asdasd",
	});
	ticket.set({ orderId });
	await ticket.save();

	// create the fake data event
	const data: OrderCancelledEvent["data"] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		ticket: {
			id: ticket.id,
		},
	};

	// @ts-ignore
	const message: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, message, orderId };
};

it("updates the ticket, publishes an event, and acks the message", async () => {
	const { message, data, ticket, orderId, listener } = await setup();

	await listener.onMessage(data, message);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).not.toBeDefined();
    expect(message.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
