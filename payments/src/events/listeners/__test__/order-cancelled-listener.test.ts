import { OrderCancelledEvent, OrderStatus } from "@bala-tickets/common";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.CREATED,
		price: 10,
		userId: "asdfsssdfs",
		version: 0,
	});

	await order.save();

	const data: OrderCancelledEvent["data"] = {
		id: order.id,
		version: 1,
		ticket: {
			id: "asdsafsad",
		},
	};

	// @ts-ignore
	const message: Message = {
		ack: jest.fn(),
	};

	return { listener, data, message, order };
};

it("updates the status of the order", async () => {
	const { listener, data, message, order } = await setup();
	await listener.onMessage(data, message);

	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED);
});

it("acks the message", async () => {
	const { listener, data, message, order } = await setup();
	await listener.onMessage(data, message);

	expect(message.ack).toHaveBeenCalled();
});
