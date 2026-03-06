# fastify-asyncapi

A **Fastify 5** plugin for building and serving [AsyncAPI 3.0](https://www.asyncapi.com/docs/reference/specification/v3.0.0) documentation.

Build your AsyncAPI spec imperatively using the `AsyncAPIDocument` builder, register the plugin, and get:

- **`GET /asyncapi/json`** — raw AsyncAPI 3.0.0 spec as JSON
- **`GET /asyncapi/`** — interactive documentation UI (powered by [@asyncapi/react-component](https://github.com/asyncapi/asyncapi-react))

## Installation

```bash
npm install fastify-asyncapi
# or
pnpm add fastify-asyncapi
```

> **Peer dependency:** `fastify ^5.x.x`

## Quick Start

```ts
import Fastify from "fastify";
import { AsyncAPIDocument, fastifyAsyncAPI } from "fastify-asyncapi";

const app = Fastify();

// 1. Build the document
const doc = new AsyncAPIDocument({
  info: { title: "User Service", version: "1.0.0" },
  defaultContentType: "application/json",
});

doc.addServer("production", {
  host: "kafka.example.com:9092",
  protocol: "kafka",
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

// 2. Register the plugin
await app.register(fastifyAsyncAPI, { document: doc });

// 3. Start
await app.listen({ port: 3000 });
// Docs at http://localhost:3000/asyncapi/
// Spec at  http://localhost:3000/asyncapi/json
```

## API

### `AsyncAPIDocument`

The standalone builder class for constructing an AsyncAPI 3.0.0 document.

#### Constructor

```ts
new AsyncAPIDocument(init: {
  info: InfoObject;       // Required: { title, version, description?, ... }
  id?: string;            // Application identifier (URI)
  defaultContentType?: string; // e.g. "application/json"
})
```

#### Builder Methods

All methods return `this` for chaining.

| Method | Description |
|--------|-------------|
| `addServer(name, serverObject)` | Add a server (broker) definition |
| `addChannel(channelId, channelObject)` | Add a channel definition |
| `addOperation(operationId, operationObject)` | Add an operation (send/receive) |
| `addSchema(name, schemaObject)` | Add to `components.schemas` |
| `addMessage(name, messageObject)` | Add to `components.messages` |
| `addSecurityScheme(name, scheme)` | Add to `components.securitySchemes` |
| `addOperationTrait(name, trait)` | Add to `components.operationTraits` |
| `addMessageTrait(name, trait)` | Add to `components.messageTraits` |
| `addServerVariable(name, variable)` | Add to `components.serverVariables` |
| `addCorrelationId(name, id)` | Add to `components.correlationIds` |
| `addParameter(name, parameter)` | Add to `components.parameters` |
| `addReply(name, reply)` | Add to `components.replies` |
| `addReplyAddress(name, address)` | Add to `components.replyAddresses` |
| `addTag(name, tag)` | Add to `components.tags` |

#### Reference Helpers

```ts
doc.channelRef("userSignedUp")
// → { $ref: "#/channels/userSignedUp" }

doc.channelMessageRef("userSignedUp", "UserSignedUp")
// → { $ref: "#/channels/userSignedUp/messages/UserSignedUp" }
// Use this in operation `messages` arrays (AsyncAPI 3.0 requirement)

doc.serverRef("production")
// → { $ref: "#/servers/production" }

doc.componentRef("messages", "UserSignedUp")
// → { $ref: "#/components/messages/UserSignedUp" }
```

#### Serialization

```ts
doc.toJSON()    // → AsyncAPIDocumentObject (plain object)
doc.toString()  // → formatted JSON string
```

### `fastifyAsyncAPI` Plugin

```ts
await app.register(fastifyAsyncAPI, {
  document: doc,              // Required: AsyncAPIDocument instance
  routePrefix: "/asyncapi",   // Optional: defaults to "/asyncapi"
  ui: {                       // Optional: docs UI configuration
    title: "My API Docs",     // HTML page title
    sidebar: true,            // Show sidebar (default: true)
    cdnVersion: "latest",     // @asyncapi/react-component version
    cdnUrl: "https://unpkg.com/@asyncapi/react-component", // CDN base URL
    favicon: "/favicon.ico",  // Favicon URL
  },
});
```

#### Routes Registered

| Route | Description |
|-------|-------------|
| `GET {routePrefix}/json` | Raw AsyncAPI 3.0.0 spec as JSON |
| `GET {routePrefix}/` | Interactive HTML documentation |

#### Decorator

After registration, the document is available on the Fastify instance:

```ts
// Add channels at runtime — changes are reflected immediately
app.asyncAPIDocument.addChannel("orderCreated", {
  address: "order.created",
  messages: { ... },
});
```

### `generateHTML(specUrl, options?)`

Low-level function to generate the HTML docs page. Used internally by the plugin but exported for custom use cases.

```ts
import { generateHTML } from "fastify-asyncapi";

const html = generateHTML("/my-spec.json", {
  title: "My Docs",
  sidebar: true,
});
```

## TypeScript

All AsyncAPI 3.0.0 types are fully exported:

```ts
import type {
  AsyncAPIDocumentObject,
  ChannelObject,
  OperationObject,
  MessageObject,
  ServerObject,
  SchemaObject,
  // ... and more
} from "fastify-asyncapi";
```

The plugin augments `FastifyInstance` with the `asyncAPIDocument` property for full type safety.

## License

MIT