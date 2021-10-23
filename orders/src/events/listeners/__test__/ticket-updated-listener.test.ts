import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedEvent } from "@bala-tickets/common";

const setup = async () => {
	// create a listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	// create and save a ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: "concert",
		price: 20,
	});
	await ticket.save();

	// create a fake data object
	const data: TicketUpdatedEvent["data"] = {
		id: ticket.id,
		version: ticket.version + 1,
		title: "new concert",
		price: 999,
		userId: "asdasd",
	};

	// create fake message object
	// @ts-ignore
	const message: Message = {
		ack: jest.fn(),
	};

	// return all
	return { message, data, ticket, listener };
};

it("finds, updates, and saves a ticket", async () => {
	const { message, data, ticket, listener } = await setup();
	await listener.onMessage(data, message);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.title).toEqual(data.title);
	expect(updatedTicket!.price).toEqual(data.price);
	expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
    const { message, data, listener } = await setup();
	await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
    const {message, data, listener, ticket} = await setup();

    data.version = 10;

    try{
        await listener.onMessage(data, message);
    }catch(error){

    }
    expect(message.ack).not.toHaveBeenCalled();
})
