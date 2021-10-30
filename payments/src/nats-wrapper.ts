import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
	private _client?: Stan;

	get client() {
		if (!this._client) {
			throw new Error("Cannot access NATS client before connecting");
		}
		return this._client;
	}

	connect(clusterID: string, clientID: string, url: string): Promise<void> {
		this._client = nats.connect(clusterID, clientID, {
			url: url,
		});

		return new Promise((resolve, reject) => {
			this.client.on("connect", () => {
				console.log("connected to nats");
				resolve();
			});
			this.client.on("error", (error) => {
				reject(error);
			});
		});
	}
}

export const natsWrapper = new NatsWrapper();
