import { OrderStatus } from "@bala-tickets/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

it("returns a 404 when purchasing an order that does not exist", async () => {
	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin())
		.send({
			token: "asfsdvdf",
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404);
});

it("returns a 401 when purchasing an order that belong to the user", async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.CREATED,
		version: 0,
		price: 20,
	});
	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin())
		.send({
			token: "asfsdvdf",
			orderId: order.id,
		})
		.expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: userId,
		status: OrderStatus.CANCELLED,
		version: 0,
		price: 20,
	});
	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin(userId))
		.send({
			orderId: order.id,
			token: "asdasdas",
		})
		.expect(400);
});

it("returns a 201 with valid inputs", async () => {
	const userId = new mongoose.Types.ObjectId().toHexString();
	const price = Math.floor(Math.random() * 100000);
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		version: 0,
		price,
		status: OrderStatus.CREATED,
	});
	await order.save();

	await request(app)
		.post("/api/payments")
		.set("Cookie", global.signin(userId))
		.send({
			token: "tok_visa",
			orderId: order.id,
		})
		.expect(201);

	const stripeCharges = await stripe.charges.list({ limit: 50 });

	const stripeCharge = stripeCharges.data.find((charge) => {
		return charge.amount === price * 100;
	});

	expect(stripeCharge).toBeDefined();
	expect(stripeCharge!.currency).toEqual("inr");

	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id,
	});

	expect(payment).not.toBeNull();
});
