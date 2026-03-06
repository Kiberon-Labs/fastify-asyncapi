/**
 * Canary smoke test — start a Fastify server with the AsyncAPI plugin
 * and print the URLs to visit in a browser.
 *
 * Run: pnpm canary
 */
import Fastify from "fastify";
import { AsyncAPIDocument, fastifyAsyncAPI } from "../index.js";

async function main() {
    const app = Fastify({ logger: true });

    // ── Build the AsyncAPI document ──────────────────────────────────────

    const doc = new AsyncAPIDocument({
        info: {
            title: "User Service",
            version: "1.0.0",
            description: "A sample microservice that handles user lifecycle events.",
            contact: {
                name: "Platform Team",
                email: "platform@example.com",
                "x-slack-channel": "#platform-support",
            },
            license: { name: "MIT" },
            "x-api-audience": "internal",
        },
        id: "urn:example:user-service",
        defaultContentType: "application/json",
    });

    // Root-level specification extensions
    doc.addExtension("x-internal-id", "svc-user-001");
    doc.addExtension("x-team", "platform");
    doc.addExtension("x-lifecycle-stage", "production");

    // Servers
    doc.addServer("production", {
        host: "kafka.example.com:9092",
        protocol: "kafka",
        protocolVersion: "3.2",
        description: "Production Kafka cluster",
        "x-region": "us-east-1",
        "x-cluster-id": "kafka-prod-01",
    });

    doc.addServer("staging", {
        host: "kafka-staging.example.com:9092",
        protocol: "kafka",
        protocolVersion: "3.2",
        description: "Staging Kafka cluster",
        "x-region": "us-west-2",
        "x-cluster-id": "kafka-staging-01",
    });

    // Schemas
    doc.addSchema("UserPayload", {
        type: "object",
        properties: {
            userId: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
        },
        required: ["userId", "email"],
        "x-schema-version": 2,
    });

    doc.addSchema("OrderPayload", {
        type: "object",
        properties: {
            orderId: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            total: { type: "number" },
            items: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        productId: { type: "string" },
                        quantity: { type: "integer", minimum: 1 },
                    },
                },
            },
        },
        required: ["orderId", "userId", "total"],
        "x-schema-version": 1,
        "x-pii-fields": ["userId"],
    });

    // Messages
    doc.addMessage("UserSignedUp", {
        title: "User Signed Up",
        summary: "Fired when a new user registers.",
        contentType: "application/json",
        payload: doc.componentRef("schemas", "UserPayload"),
        tags: [{ name: "user" }, { name: "lifecycle" }],
        "x-event-source": "auth-service",
        "x-schema-registry-id": 1001,
    });

    doc.addMessage("UserDeleted", {
        title: "User Deleted",
        summary: "Fired when a user account is deleted.",
        contentType: "application/json",
        payload: doc.componentRef("schemas", "UserPayload"),
        tags: [{ name: "user" }, { name: "lifecycle" }],
        "x-event-source": "auth-service",
        "x-gdpr-relevant": true,
    });

    doc.addMessage("OrderCreated", {
        title: "Order Created",
        summary: "Fired when a new order is placed.",
        contentType: "application/json",
        payload: doc.componentRef("schemas", "OrderPayload"),
        tags: [{ name: "order" }],
        "x-event-source": "order-service",
    });

    // Channels
    doc.addChannel("userSignedUp", {
        address: "user.signedup",
        title: "User Signed Up Channel",
        description: "Channel for user registration events.",
        messages: {
            UserSignedUp: doc.componentRef("messages", "UserSignedUp"),
        },
        "x-topic-retention": "7d",
        "x-partitions": 12,
    });

    doc.addChannel("userDeleted", {
        address: "user.deleted",
        title: "User Deleted Channel",
        messages: {
            UserDeleted: doc.componentRef("messages", "UserDeleted"),
        },
        "x-topic-retention": "30d",
    });

    doc.addChannel("orderCreated", {
        address: "order.created",
        title: "Order Created Channel",
        messages: {
            OrderCreated: doc.componentRef("messages", "OrderCreated"),
        },
        "x-topic-retention": "90d",
        "x-partitions": 24,
    });

    // Operations
    doc.addOperation("onUserSignedUp", {
        action: "receive",
        channel: doc.channelRef("userSignedUp"),
        summary: "Receive user signup events",
        messages: [doc.channelMessageRef("userSignedUp", "UserSignedUp")],
        tags: [{ name: "user" }],
        "x-consumer-group": "user-service-cg",
        "x-retry-policy": { maxRetries: 3, backoffMs: 1000 },
    });

    doc.addOperation("sendUserDeleted", {
        action: "send",
        channel: doc.channelRef("userDeleted"),
        summary: "Send user deletion events",
        messages: [doc.channelMessageRef("userDeleted", "UserDeleted")],
        tags: [{ name: "user" }],
        "x-producer-acks": "all",
    });

    doc.addOperation("onOrderCreated", {
        action: "receive",
        channel: doc.channelRef("orderCreated"),
        summary: "Receive order creation events",
        messages: [doc.channelMessageRef("orderCreated", "OrderCreated")],
        tags: [{ name: "order" }],
        "x-consumer-group": "order-processor-cg",
        "x-dead-letter-channel": "order.created.dlq",
    });

    // ── Register the plugin ─────────────────────────────────────────────

    await app.register(fastifyAsyncAPI, {
        document: doc,
        routePrefix: "/asyncapi",
        ui: { sidebar: true },
    });

    // ── Start ────────────────────────────────────────────────────────────

    const address = await app.listen({ port: 3000, host: "0.0.0.0" });

    console.log(`
╔═══════════════════════════════════════════════════╗
║  AsyncAPI Docs:  ${address}/asyncapi/
║  AsyncAPI JSON:  ${address}/asyncapi/json
╚═══════════════════════════════════════════════════╝
`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
