import { describe, expect, it } from "vitest";
import { AsyncAPIDocument } from "../src/lib/builder.js";

describe("AsyncAPIDocument Builder", () => {
    function createBaseDoc() {
        return new AsyncAPIDocument({
            info: { title: "Test Service", version: "1.0.0" },
        });
    }

    describe("constructor & toJSON basics", () => {
        it("should produce a minimal valid AsyncAPI 3.0.0 document", () => {
            const doc = createBaseDoc();
            const json = doc.toJSON();

            expect(json.asyncapi).toBe("3.0.0");
            expect(json.info.title).toBe("Test Service");
            expect(json.info.version).toBe("1.0.0");
            expect(json.servers).toBeUndefined();
            expect(json.channels).toBeUndefined();
            expect(json.operations).toBeUndefined();
            expect(json.components).toBeUndefined();
        });

        it("should include id when provided", () => {
            const doc = new AsyncAPIDocument({
                info: { title: "Test", version: "1.0.0" },
                id: "urn:example:test:service",
            });

            expect(doc.toJSON().id).toBe("urn:example:test:service");
        });

        it("should include defaultContentType when provided", () => {
            const doc = new AsyncAPIDocument({
                info: { title: "Test", version: "1.0.0" },
                defaultContentType: "application/json",
            });

            expect(doc.toJSON().defaultContentType).toBe("application/json");
        });
    });

    describe("addServer", () => {
        it("should add a server to the document", () => {
            const doc = createBaseDoc();
            doc.addServer("production", {
                host: "broker.example.com:9092",
                protocol: "kafka",
                description: "Production Kafka broker",
            });

            const json = doc.toJSON();
            expect(json.servers).toBeDefined();
            expect(json.servers?.production).toEqual({
                host: "broker.example.com:9092",
                protocol: "kafka",
                description: "Production Kafka broker",
            });
        });

        it("should throw on duplicate server names", () => {
            const doc = createBaseDoc();
            doc.addServer("prod", { host: "a.com", protocol: "kafka" });

            expect(() =>
                doc.addServer("prod", { host: "b.com", protocol: "kafka" }),
            ).toThrow('Server "prod" already exists.');
        });

        it("should support method chaining", () => {
            const doc = createBaseDoc();
            const result = doc.addServer("prod", {
                host: "a.com",
                protocol: "kafka",
            });
            expect(result).toBe(doc);
        });
    });

    describe("addChannel", () => {
        it("should add a channel to the document", () => {
            const doc = createBaseDoc();
            doc.addChannel("userSignedUp", {
                address: "user.signedup",
                title: "User Signed Up",
                messages: {
                    UserSignedUp: {
                        $ref: "#/components/messages/UserSignedUp",
                    },
                },
            });

            const json = doc.toJSON();
            expect(json.channels?.userSignedUp).toEqual({
                address: "user.signedup",
                title: "User Signed Up",
                messages: {
                    UserSignedUp: {
                        $ref: "#/components/messages/UserSignedUp",
                    },
                },
            });
        });

        it("should throw on duplicate channel IDs", () => {
            const doc = createBaseDoc();
            doc.addChannel("ch1", { address: "a.b" });

            expect(() => doc.addChannel("ch1", { address: "c.d" })).toThrow(
                'Channel "ch1" already exists.',
            );
        });
    });

    describe("addOperation", () => {
        it("should add an operation to the document", () => {
            const doc = createBaseDoc();
            doc.addChannel("userSignedUp", {
                address: "user.signedup",
                messages: {
                    UserSignedUp: { $ref: "#/components/messages/UserSignedUp" },
                },
            });
            doc.addOperation("onUserSignedUp", {
                action: "receive",
                channel: doc.channelRef("userSignedUp"),
                summary: "Receive user signup events",
                messages: [doc.channelMessageRef("userSignedUp", "UserSignedUp")],
            });

            const json = doc.toJSON();
            expect(json.operations?.onUserSignedUp).toEqual({
                action: "receive",
                channel: { $ref: "#/channels/userSignedUp" },
                summary: "Receive user signup events",
                messages: [{ $ref: "#/channels/userSignedUp/messages/UserSignedUp" }],
            });
        });

        it("should throw on duplicate operation IDs", () => {
            const doc = createBaseDoc();
            doc.addOperation("op1", {
                action: "send",
                channel: { $ref: "#/channels/ch1" },
            });

            expect(() =>
                doc.addOperation("op1", {
                    action: "receive",
                    channel: { $ref: "#/channels/ch2" },
                }),
            ).toThrow('Operation "op1" already exists.');
        });
    });

    describe("component methods", () => {
        it("addSchema should add to components.schemas", () => {
            const doc = createBaseDoc();
            doc.addSchema("User", {
                type: "object",
                properties: { id: { type: "string" } },
            });

            expect(doc.toJSON().components?.schemas?.User).toEqual({
                type: "object",
                properties: { id: { type: "string" } },
            });
        });

        it("addSchema should throw on duplicates", () => {
            const doc = createBaseDoc();
            doc.addSchema("User", { type: "object" });
            expect(() => doc.addSchema("User", { type: "string" })).toThrow(
                'Schema "User" already exists in components.',
            );
        });

        it("addMessage should add to components.messages", () => {
            const doc = createBaseDoc();
            doc.addMessage("UserSignedUp", {
                payload: {
                    type: "object",
                    properties: { userId: { type: "string" } },
                },
                title: "User Signed Up",
            });

            const msg = doc.toJSON().components?.messages?.UserSignedUp;
            expect(msg).toBeDefined();
            expect((msg as Record<string, unknown>).title).toBe("User Signed Up");
        });

        it("addMessage should throw on duplicates", () => {
            const doc = createBaseDoc();
            doc.addMessage("Msg", { title: "A" });
            expect(() => doc.addMessage("Msg", { title: "B" })).toThrow(
                'Message "Msg" already exists in components.',
            );
        });

        it("addSecurityScheme should add to components.securitySchemes", () => {
            const doc = createBaseDoc();
            doc.addSecurityScheme("apiKey", {
                type: "apiKey",
                in: "user",
            });

            expect(doc.toJSON().components?.securitySchemes?.apiKey).toEqual({
                type: "apiKey",
                in: "user",
            });
        });

        it("addOperationTrait should add to components.operationTraits", () => {
            const doc = createBaseDoc();
            doc.addOperationTrait("kafka", {
                bindings: { kafka: { ack: false } },
            });

            expect(doc.toJSON().components?.operationTraits?.kafka).toEqual({
                bindings: { kafka: { ack: false } },
            });
        });

        it("addMessageTrait should add to components.messageTraits", () => {
            const doc = createBaseDoc();
            doc.addMessageTrait("commonHeaders", {
                headers: {
                    type: "object",
                    properties: {
                        correlationId: { type: "string" },
                    },
                },
            });

            expect(
                doc.toJSON().components?.messageTraits?.commonHeaders,
            ).toBeDefined();
        });

        it("addServerVariable should add to components.serverVariables", () => {
            const doc = createBaseDoc();
            doc.addServerVariable("env", {
                default: "production",
                enum: ["production", "staging"],
            });

            expect(doc.toJSON().components?.serverVariables?.env).toEqual({
                default: "production",
                enum: ["production", "staging"],
            });
        });

        it("addCorrelationId should add to components.correlationIds", () => {
            const doc = createBaseDoc();
            doc.addCorrelationId("default", {
                location: "$message.header#/correlationId",
            });

            expect(doc.toJSON().components?.correlationIds?.default).toEqual({
                location: "$message.header#/correlationId",
            });
        });

        it("addParameter should add to components.parameters", () => {
            const doc = createBaseDoc();
            doc.addParameter("userId", {
                description: "The user identifier",
            });

            expect(doc.toJSON().components?.parameters?.userId).toEqual({
                description: "The user identifier",
            });
        });

        it("addReply should add to components.replies", () => {
            const doc = createBaseDoc();
            doc.addReply("signupReply", {
                channel: { $ref: "#/channels/signupReply" },
            });

            expect(doc.toJSON().components?.replies?.signupReply).toBeDefined();
        });

        it("addReplyAddress should add to components.replyAddresses", () => {
            const doc = createBaseDoc();
            doc.addReplyAddress("inbox", {
                location: "$message.header#/replyTo",
            });

            expect(doc.toJSON().components?.replyAddresses?.inbox).toBeDefined();
        });

        it("addTag should add to components.tags", () => {
            const doc = createBaseDoc();
            doc.addTag("user", {
                name: "user",
                description: "User-related events",
            });

            expect(doc.toJSON().components?.tags).toBeDefined();
        });
    });

    describe("extensions", () => {
        it("addExtension should add root-level x- attributes", () => {
            const doc = createBaseDoc();
            doc.addExtension("x-internal-id", "abc-123");
            doc.addExtension("x-team", "platform");

            const json = doc.toJSON() as Record<string, unknown>;
            expect(json["x-internal-id"]).toBe("abc-123");
            expect(json["x-team"]).toBe("platform");
        });

        it("addExtension should overwrite duplicate keys", () => {
            const doc = createBaseDoc();
            doc.addExtension("x-version", 1);
            doc.addExtension("x-version", 2);

            const json = doc.toJSON() as Record<string, unknown>;
            expect(json["x-version"]).toBe(2);
        });

        it("addExtension should support complex values", () => {
            const doc = createBaseDoc();
            doc.addExtension("x-retry-policy", {
                maxRetries: 3,
                backoffMs: 1000,
            });

            const json = doc.toJSON() as Record<string, unknown>;
            expect(json["x-retry-policy"]).toEqual({
                maxRetries: 3,
                backoffMs: 1000,
            });
        });

        it("inline x- attributes on nested objects should pass through", () => {
            const doc = createBaseDoc();
            doc.addServer("prod", {
                host: "localhost:9092",
                protocol: "kafka",
                "x-region": "us-east-1",
            });

            doc.addChannel("events", {
                address: "events",
                "x-partitions": 12,
            });

            doc.addMessage("Msg", {
                payload: { type: "object" },
                "x-schema-registry-id": 42,
            });

            const json = doc.toJSON();
            expect((json.servers?.prod as Record<string, unknown>)["x-region"]).toBe(
                "us-east-1",
            );
            expect(
                (json.channels?.events as Record<string, unknown>)["x-partitions"],
            ).toBe(12);
            expect(
                (json.components?.messages?.Msg as Record<string, unknown>)[
                "x-schema-registry-id"
                ],
            ).toBe(42);
        });

        it("addExtension should be chainable", () => {
            const doc = createBaseDoc();
            const result = doc.addExtension("x-a", 1).addExtension("x-b", 2);

            expect(result).toBe(doc);
            const json = doc.toJSON() as Record<string, unknown>;
            expect(json["x-a"]).toBe(1);
            expect(json["x-b"]).toBe(2);
        });
    });

    describe("reference helpers", () => {
        it("channelRef should produce correct $ref", () => {
            const doc = createBaseDoc();
            expect(doc.channelRef("userSignedUp")).toEqual({
                $ref: "#/channels/userSignedUp",
            });
        });

        it("channelMessageRef should produce correct $ref", () => {
            const doc = createBaseDoc();
            expect(doc.channelMessageRef("userSignedUp", "UserSignedUp")).toEqual({
                $ref: "#/channels/userSignedUp/messages/UserSignedUp",
            });
        });

        it("serverRef should produce correct $ref", () => {
            const doc = createBaseDoc();
            expect(doc.serverRef("production")).toEqual({
                $ref: "#/servers/production",
            });
        });

        it("componentRef should produce correct $ref for messages", () => {
            const doc = createBaseDoc();
            expect(doc.componentRef("messages", "UserSignedUp")).toEqual({
                $ref: "#/components/messages/UserSignedUp",
            });
        });

        it("componentRef should produce correct $ref for schemas", () => {
            const doc = createBaseDoc();
            expect(doc.componentRef("schemas", "Address")).toEqual({
                $ref: "#/components/schemas/Address",
            });
        });

        it("componentRef should produce correct $ref for operationTraits", () => {
            const doc = createBaseDoc();
            expect(doc.componentRef("operationTraits", "kafka")).toEqual({
                $ref: "#/components/operationTraits/kafka",
            });
        });
    });

    describe("toString", () => {
        it("should return a formatted JSON string", () => {
            const doc = createBaseDoc();
            const str = doc.toString();
            const parsed = JSON.parse(str);

            expect(parsed.asyncapi).toBe("3.0.0");
            expect(parsed.info.title).toBe("Test Service");
            // Should be formatted with 2-space indent
            expect(str).toContain("  ");
        });
    });

    describe("full document assembly", () => {
        it("should produce a complete document with all sections", () => {
            const doc = new AsyncAPIDocument({
                info: {
                    title: "User Service",
                    version: "2.0.0",
                    description: "Handles user events",
                },
                id: "urn:example:user-service",
                defaultContentType: "application/json",
            });

            doc.addServer("production", {
                host: "kafka.example.com:9092",
                protocol: "kafka",
                protocolVersion: "3.2",
            });

            doc.addSchema("UserPayload", {
                type: "object",
                properties: {
                    userId: { type: "string" },
                    email: { type: "string", format: "email" },
                },
                required: ["userId", "email"],
            });

            doc.addMessage("UserSignedUp", {
                title: "User Signed Up",
                contentType: "application/json",
                payload: doc.componentRef("schemas", "UserPayload"),
            });

            doc.addChannel("userSignedUp", {
                address: "user.signedup",
                messages: {
                    UserSignedUp: doc.componentRef("messages", "UserSignedUp"),
                },
            });

            doc.addOperation("onUserSignedUp", {
                action: "receive",
                channel: doc.channelRef("userSignedUp"),
                summary: "Receive user signup events",
                messages: [doc.channelMessageRef("userSignedUp", "UserSignedUp")],
            });

            const json = doc.toJSON();

            expect(json.asyncapi).toBe("3.0.0");
            expect(json.id).toBe("urn:example:user-service");
            expect(json.defaultContentType).toBe("application/json");
            expect(json.info.title).toBe("User Service");
            expect(json.servers?.production).toBeDefined();
            expect(json.channels?.userSignedUp).toBeDefined();
            expect(json.operations?.onUserSignedUp).toBeDefined();
            expect(json.components?.schemas?.UserPayload).toBeDefined();
            expect(json.components?.messages?.UserSignedUp).toBeDefined();
        });
    });

    describe("immutability of output", () => {
        it("toJSON should return a new object each time", () => {
            const doc = createBaseDoc();
            doc.addServer("s1", { host: "a.com", protocol: "mqtt" });

            const json1 = doc.toJSON();
            const json2 = doc.toJSON();

            expect(json1).not.toBe(json2);
            expect(json1).toEqual(json2);
        });

        it("should reflect changes made after initial toJSON call", () => {
            const doc = createBaseDoc();
            const json1 = doc.toJSON();

            doc.addServer("late", { host: "late.com", protocol: "amqp" });
            const json2 = doc.toJSON();

            expect(json1.servers).toBeUndefined();
            expect(json2.servers?.late).toBeDefined();
        });
    });
});
