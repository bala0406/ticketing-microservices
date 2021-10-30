import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { ExpirationCompleteEvent } from "@bala-tickets/common";

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: "conecert",
		price: 20,
	});
	await ticket.save();

	const order = Order.build({
		status: OrderStatus.CREATED,
		userId: "fsdfsdf",
		expiresAt: new Date(),
		ticket,
	});
	await order.save();

	const data: ExpirationCompleteEvent["data"] = {
		orderId: order.id,
	};

	// @ts-ignore
	const message: Message = {
		ack: jest.fn(),
	};

	return { listener, order, ticket, data, message };
};

it("updates the order status to cancelled", async () => {
	const { listener, order, data, message } = await setup();

	await listener.onMessage(data, message);

	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("emits an order cancelled event", async () => {
	const { listener, order, data, message } = await setup();

	await listener.onMessage(data, message);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
	const { listener, data, message } = await setup();

	await listener.onMessage(data, message);

	expect(message.ack).toHaveBeenCalled();
});
