import { Message, Stan } from "node-nats-streaming";
import { Subject } from "./subject";

interface Event {
	subject: Subject;
	data: any;
}

export abstract class Listener<T extends Event> {
	abstract subject: T["subject"];
	abstract queueGroupName: string;
	abstract onMessage(data: T["data"], message: Message): void;
	private client: Stan;
	protected ackWait = 5 * 1000;

	constructor(client: Stan) {
		this.client = client;
	}

	subscriptionsOptions() {
		return this.client
			.subscriptionOptions()
			.setDeliverAllAvailable()
			.setManualAckMode(true)
			.setAckWait(this.ackWait)
			.setDurableName(this.queueGroupName);
	}

	listen() {
		const subscription = this.client.subscribe(
			this.subject,
			this.queueGroupName,
			this.subscriptionsOptions()
		);

		subscription.on("message", (message: Message) => {
			console.log(
				`Message Received: ${this.subject} / ${this.queueGroupName}`
			);

			const parsedData = this.parseMessage(message);
			this.onMessage(parsedData, message);
		});
	}

	parseMessage(message: Message) {
		const data = message.getData();
		return typeof data === "string"
			? JSON.parse(data)
			: JSON.parse(data.toString("utf8"));
	}
}