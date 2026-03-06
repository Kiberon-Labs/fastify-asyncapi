import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { AsyncAPIDocument } from "../src/lib/builder.js";
import { fastifyAsyncAPI } from "../src/plugin/asyncapi.js";

function createDocument() {
    const doc = new AsyncAPIDocument({
        info: { title: "Test Plugin Service", version: "1.0.0" },
        defaultContentType: "application/json",
    });

    doc.addServer("dev", {
        host: "localhost:9092",
        protocol: "kafka",
    });

    doc.addSchema("UserPayload", {
        type: "object",
        properties: { userId: { type: "string" } },
    });

    doc.addMessage("UserSignedUp", {
        title: "User Signed Up",
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
        messages: [doc.channelMessageRef("userSignedUp", "UserSignedUp")],
    });

    return doc;
}

describe("fastifyAsyncAPI plugin", () => {
    describe("default route prefix (/asyncapi)", () => {
        it("GET /asyncapi/json should return the spec as JSON", async () => {
            const app = Fastify();
            const doc = createDocument();

            await app.register(fastifyAsyncAPI, { document: doc });
            await app.ready();

            const res = await app.inject({
                method: "GET",
                url: "/asyncapi/json",
            });

            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toContain("application/json");

            const body = res.json();
            expect(body.asyncapi).toBe("3.0.0");
            expect(body.info.title).toBe("Test Plugin Service");
            expect(body.servers.dev).toBeDefined();
            expect(body.channels.userSignedUp).toBeDefined();
            expect(body.operations.onUserSignedUp).toBeDefined();
            expect(body.components.schemas.UserPayload).toBeDefined();
            expect(body.components.messages.UserSignedUp).toBeDefined();

            await app.close();
        });

        it("GET /asyncapi/ should return HTML docs page", async () => {
            const app = Fastify();
            const doc = createDocument();

            await app.register(fastifyAsyncAPI, { document: doc });
            await app.ready();

            const res = await app.inject({
                method: "GET",
                url: "/asyncapi/",
            });

            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toContain("text/html");

            const html = res.body;
            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("AsyncAPI Documentation");
            expect(html).toContain("unpkg.com/@asyncapi/react-component");
            expect(html).toContain("AsyncApiStandalone.render");
            expect(html).toContain("/asyncapi/json");

            await app.close();
        });
    });

    describe("custom route prefix", () => {
        it("should serve spec and docs at custom prefix", async () => {
            const app = Fastify();
            const doc = createDocument();

            await app.register(fastifyAsyncAPI, {
                document: doc,
                routePrefix: "/docs/async",
            });
            await app.ready();

            const specRes = await app.inject({
                method: "GET",
                url: "/docs/async/json",
            });
            expect(specRes.statusCode).toBe(200);
            expect(specRes.json().asyncapi).toBe("3.0.0");

            const docsRes = await app.inject({
                method: "GET",
                url: "/docs/async/",
            });
            expect(docsRes.statusCode).toBe(200);
            expect(docsRes.body).toContain("/docs/async/json");

            await app.close();
        });
    });

    describe("UI options", () => {
        it("should use custom title and CDN version", async () => {
            const app = Fastify();
            const doc = createDocument();

            await app.register(fastifyAsyncAPI, {
                document: doc,
                ui: {
                    title: "My Custom Docs",
                    cdnVersion: "2.0.0",
                },
            });
            await app.ready();

            const res = await app.inject({
                method: "GET",
                url: "/asyncapi/",
            });

            expect(res.body).toContain("My Custom Docs");
            expect(res.body).toContain("@2.0.0");

            await app.close();
        });

        it("should include favicon when provided", async () => {
            const app = Fastify();
            const doc = createDocument();

            await app.register(fastifyAsyncAPI, {
                document: doc,
                ui: {
                    favicon: "/favicon.ico",
                },
            });
            await app.ready();

            const res = await app.inject({
                method: "GET",
                url: "/asyncapi/",
            });

            expect(res.body).toContain('href="/favicon.ico"');

            await app.close();
        });
    });

    describe("decorator", () => {
        it("should expose asyncAPIDocument on the fastify instance", async () => {
            const app = Fastify();
            const doc = createDocument();

            await app.register(fastifyAsyncAPI, { document: doc });
            await app.ready();

            expect(app.asyncAPIDocument).toBe(doc);

            await app.close();
        });

        it("should reflect runtime changes in subsequent requests", async () => {
            const app = Fastify();
            const doc = createDocument();

            await app.register(fastifyAsyncAPI, { document: doc });
            await app.ready();

            // Add a new channel after registration
            app.asyncAPIDocument.addChannel("orderCreated", {
                address: "order.created",
            });

            const res = await app.inject({
                method: "GET",
                url: "/asyncapi/json",
            });

            const body = res.json();
            expect(body.channels.orderCreated).toBeDefined();
            expect(body.channels.orderCreated.address).toBe("order.created");

            await app.close();
        });
    });
});
