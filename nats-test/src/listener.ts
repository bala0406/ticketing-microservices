import nats, { Message } from "node-nats-streaming";
import { randomBytes } from "crypto";

console.clear();

const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
	url: "http://localhost:4222",
});

stan.on("connect", () => {
	console.log("listener connected to NATS");

	stan.on("close", () => {
		console.log("NATS Connection closed");
		process.exit();
	});

	const options = stan
		.subscriptionOptions()
		.setManualAckMode(true)
		.setDeliverAllAvailable() 
		.setDurableName("accounting-service");

	const subscription = stan.subscribe(
		"ticket:created",
		"orders-service-queue-group",
		options
	);

	subscription.on("message", (message: Message) => {
		const data = message.getData();

		if (typeof data === "string") {
			console.log(
				`Received event #${message.getSequence()}, with data: ${data}`
			);

			message.ack();
		}
	});
});

process.on("SIGINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
