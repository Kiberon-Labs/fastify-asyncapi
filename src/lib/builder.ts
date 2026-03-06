import type {
    AsyncAPIDocumentObject,
    ChannelObject,
    ComponentsObject,
    CorrelationIdObject,
    InfoObject,
    MessageObject,
    MessageTraitObject,
    MultiFormatSchemaObject,
    OperationObject,
    OperationReplyAddressObject,
    OperationReplyObject,
    OperationTraitObject,
    ParameterObject,
    ReferenceObject,
    SchemaObject,
    SecuritySchemeObject,
    ServerObject,
    ServerVariableObject,
    TagObject,
} from "./types.js";

export interface AsyncAPIDocumentInit {
    /** Application info (title, version are required). */
    info: InfoObject;
    /** Optional unique identifier for the application (URI). */
    id?: string;
    /** Default content type for message payloads. */
    defaultContentType?: string;
}

/**
 * Imperative builder for constructing an AsyncAPI 3.0.0 document.
 *
 * @example
 * ```ts
 * const doc = new AsyncAPIDocument({
 *   info: { title: "My Service", version: "1.0.0" }
 * });
 *
 * doc.addServer("production", {
 *   host: "broker.example.com:9092",
 *   protocol: "kafka",
 * });
 *
 * doc.addChannel("userSignedUp", {
 *   address: "user.signedup",
 *   messages: {
 *     UserSignedUp: { $ref: "#/components/messages/UserSignedUp" },
 *   },
 * });
 *
 * doc.addMessage("UserSignedUp", {
 *   payload: { type: "object", properties: { userId: { type: "string" } } },
 * });
 *
 * doc.addOperation("onUserSignedUp", {
 *   action: "receive",
 *   channel: doc.channelRef("userSignedUp"),
 *   messages: [doc.channelMessageRef("userSignedUp", "UserSignedUp")],
 * });
 *
 * const spec = doc.toJSON();
 * ```
 */
export class AsyncAPIDocument {
    private readonly _info: InfoObject;
    private readonly _id?: string;
    private readonly _defaultContentType?: string;

    private readonly _servers: Record<string, ServerObject> = {};
    private readonly _channels: Record<string, ChannelObject> = {};
    private readonly _operations: Record<string, OperationObject> = {};
    private readonly _components: ComponentsObject = {};
    private readonly _extensions: Record<`x-${string}`, unknown> = {};

    constructor(init: AsyncAPIDocumentInit) {
        this._info = init.info;
        this._id = init.id;
        this._defaultContentType = init.defaultContentType;
    }

    // ─── Servers ──────────────────────────────────────────────────────────────

    /** Add a server definition. */
    addServer(name: string, server: ServerObject): this {
        if (this._servers[name]) {
            throw new Error(`Server "${name}" already exists.`);
        }
        this._servers[name] = server;
        return this;
    }

    // ─── Channels ─────────────────────────────────────────────────────────────

    /** Add a channel definition. */
    addChannel(channelId: string, channel: ChannelObject): this {
        if (this._channels[channelId]) {
            throw new Error(`Channel "${channelId}" already exists.`);
        }
        this._channels[channelId] = channel;
        return this;
    }

    // ─── Operations ───────────────────────────────────────────────────────────

    /** Add an operation definition. */
    addOperation(operationId: string, operation: OperationObject): this {
        if (this._operations[operationId]) {
            throw new Error(`Operation "${operationId}" already exists.`);
        }
        this._operations[operationId] = operation;
        return this;
    }

    // ─── Components ───────────────────────────────────────────────────────────

    /** Add a schema to components.schemas. */
    addSchema(
        name: string,
        schema: MultiFormatSchemaObject | SchemaObject,
    ): this {
        this._components.schemas ??= {};
        if (this._components.schemas[name]) {
            throw new Error(`Schema "${name}" already exists in components.`);
        }
        this._components.schemas[name] = schema;
        return this;
    }

    /** Add a message to components.messages. */
    addMessage(name: string, message: MessageObject): this {
        this._components.messages ??= {};
        if (this._components.messages[name]) {
            throw new Error(`Message "${name}" already exists in components.`);
        }
        this._components.messages[name] = message;
        return this;
    }

    /** Add a security scheme to components.securitySchemes. */
    addSecurityScheme(name: string, scheme: SecuritySchemeObject): this {
        this._components.securitySchemes ??= {};
        if (this._components.securitySchemes[name]) {
            throw new Error(
                `Security scheme "${name}" already exists in components.`,
            );
        }
        this._components.securitySchemes[name] = scheme;
        return this;
    }

    /** Add an operation trait to components.operationTraits. */
    addOperationTrait(name: string, trait: OperationTraitObject): this {
        this._components.operationTraits ??= {};
        if (this._components.operationTraits[name]) {
            throw new Error(
                `Operation trait "${name}" already exists in components.`,
            );
        }
        this._components.operationTraits[name] = trait;
        return this;
    }

    /** Add a message trait to components.messageTraits. */
    addMessageTrait(name: string, trait: MessageTraitObject): this {
        this._components.messageTraits ??= {};
        if (this._components.messageTraits[name]) {
            throw new Error(`Message trait "${name}" already exists in components.`);
        }
        this._components.messageTraits[name] = trait;
        return this;
    }

    /** Add a server variable to components.serverVariables. */
    addServerVariable(name: string, variable: ServerVariableObject): this {
        this._components.serverVariables ??= {};
        if (this._components.serverVariables[name]) {
            throw new Error(
                `Server variable "${name}" already exists in components.`,
            );
        }
        this._components.serverVariables[name] = variable;
        return this;
    }

    /** Add a correlation ID to components.correlationIds. */
    addCorrelationId(name: string, correlationId: CorrelationIdObject): this {
        this._components.correlationIds ??= {};
        if (this._components.correlationIds[name]) {
            throw new Error(`Correlation ID "${name}" already exists in components.`);
        }
        this._components.correlationIds[name] = correlationId;
        return this;
    }

    /** Add a parameter to components.parameters. */
    addParameter(name: string, parameter: ParameterObject): this {
        this._components.parameters ??= {};
        if (this._components.parameters[name]) {
            throw new Error(`Parameter "${name}" already exists in components.`);
        }
        this._components.parameters[name] = parameter;
        return this;
    }

    /** Add a reply to components.replies. */
    addReply(name: string, reply: OperationReplyObject): this {
        this._components.replies ??= {};
        if (this._components.replies[name]) {
            throw new Error(`Reply "${name}" already exists in components.`);
        }
        this._components.replies[name] = reply;
        return this;
    }

    /** Add a reply address to components.replyAddresses. */
    addReplyAddress(name: string, address: OperationReplyAddressObject): this {
        this._components.replyAddresses ??= {};
        if (this._components.replyAddresses[name]) {
            throw new Error(`Reply address "${name}" already exists in components.`);
        }
        this._components.replyAddresses[name] = address;
        return this;
    }

    /** Add a tag to components.tags. */
    addTag(name: string, tag: TagObject): this {
        this._components.tags ??= {};
        if ((this._components.tags as Record<string, unknown>)[name]) {
            throw new Error(`Tag "${name}" already exists in components.`);
        }
        (this._components.tags as Record<string, TagObject>)[name] = tag;
        return this;
    }

    // ─── Extensions ──────────────────────────────────────────────────────────

    /**
     * Add a specification extension (`x-*`) to the root document.
     *
     * For extensions on nested objects (servers, channels, messages, etc.),
     * simply include the `x-` property inline when calling `addServer`,
     * `addChannel`, `addMessage`, etc.
     *
     * @example doc.addExtension("x-internal-id", "abc-123")
     */
    addExtension(key: `x-${string}`, value: unknown): this {
        this._extensions[key] = value;
        return this;
    }

    // ─── Reference Helpers ────────────────────────────────────────────────────

    /**
     * Create a `$ref` pointing to a root channel.
     *
     * @example doc.channelRef("userSignedUp") → { $ref: "#/channels/userSignedUp" }
     */
    channelRef(channelId: string): ReferenceObject {
        return { $ref: `#/channels/${channelId}` };
    }

    /**
     * Create a `$ref` pointing to a message within a channel.
     *
     * Use this in operation `messages` arrays — AsyncAPI 3.0 requires
     * operation messages to reference channel messages, not component messages.
     *
     * @example doc.channelMessageRef("userSignedUp", "UserSignedUp")
     *          → { $ref: "#/channels/userSignedUp/messages/UserSignedUp" }
     */
    channelMessageRef(channelId: string, messageId: string): ReferenceObject {
        return { $ref: `#/channels/${channelId}/messages/${messageId}` };
    }

    /**
     * Create a `$ref` pointing to a root server.
     *
     * @example doc.serverRef("production") → { $ref: "#/servers/production" }
     */
    serverRef(name: string): ReferenceObject {
        return { $ref: `#/servers/${name}` };
    }

    /**
     * Create a `$ref` pointing to a component.
     *
     * @example doc.componentRef("messages", "UserSignedUp") → { $ref: "#/components/messages/UserSignedUp" }
     */
    componentRef(
        type:
            | "schemas"
            | "servers"
            | "channels"
            | "operations"
            | "messages"
            | "securitySchemes"
            | "serverVariables"
            | "parameters"
            | "correlationIds"
            | "replies"
            | "replyAddresses"
            | "externalDocs"
            | "tags"
            | "operationTraits"
            | "messageTraits"
            | "serverBindings"
            | "channelBindings"
            | "operationBindings"
            | "messageBindings",
        name: string,
    ): ReferenceObject {
        return { $ref: `#/components/${type}/${name}` };
    }

    // ─── Serialization ───────────────────────────────────────────────────────

    /** Produce the full AsyncAPI 3.0.0 document as a plain object. */
    toJSON(): AsyncAPIDocumentObject {
        const doc: AsyncAPIDocumentObject = {
            asyncapi: "3.0.0",
            info: this._info,
        };

        if (this._id) {
            doc.id = this._id;
        }

        if (this._defaultContentType) {
            doc.defaultContentType = this._defaultContentType;
        }

        if (Object.keys(this._servers).length > 0) {
            doc.servers = { ...this._servers };
        }

        if (Object.keys(this._channels).length > 0) {
            doc.channels = { ...this._channels };
        }

        if (Object.keys(this._operations).length > 0) {
            doc.operations = { ...this._operations };
        }

        if (Object.keys(this._components).length > 0) {
            doc.components = { ...this._components };
        }

        // Merge root-level specification extensions
        for (const [key, value] of Object.entries(this._extensions)) {
            (doc as Record<string, unknown>)[key] = value;
        }

        return doc;
    }

    /** Produce the full AsyncAPI 3.0.0 document as a formatted JSON string. */
    toString(): string {
        return JSON.stringify(this.toJSON(), null, 2);
    }
}
