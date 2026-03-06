import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { AsyncAPIDocument } from "../lib/builder.js";
import type { AsyncAPIPluginOptions } from "../lib/types.js";
import { generateHTML } from "./html.js";

declare module "fastify" {
    interface FastifyInstance {
        asyncAPIDocument: AsyncAPIDocument;
    }
}

const asyncapiPlugin: FastifyPluginAsync<AsyncAPIPluginOptions> = async (
    fastify: FastifyInstance,
    opts: AsyncAPIPluginOptions,
) => {
    const { document, routePrefix = "/asyncapi", ui } = opts;

    // Decorate the instance so users can add channels/operations after registration
    fastify.decorate("asyncAPIDocument", document as AsyncAPIDocument);

    const specPath = `${routePrefix}/json`;
    const docsPath = routePrefix.endsWith("/") ? routePrefix : `${routePrefix}/`;

    // GET {routePrefix}/json — raw AsyncAPI spec
    fastify.get(specPath, async (_request, reply) => {
        const spec = fastify.asyncAPIDocument.toJSON();
        return reply.type("application/json").send(spec);
    });

    // GET {routePrefix}/ — rendered HTML docs
    fastify.get(docsPath, async (_request, reply) => {
        const html = generateHTML(specPath, ui);
        return reply.type("text/html").send(html);
    });
};

export const fastifyAsyncAPI = fp(asyncapiPlugin, {
    fastify: ">=5.x.x",
    name: "fastify-asyncapi",
});
