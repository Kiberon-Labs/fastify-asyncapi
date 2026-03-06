// AsyncAPI 3.0.0 TypeScript Type Definitions
// https://github.com/asyncapi/spec/blob/v3.0.0/spec/asyncapi.md

// ─── Utility Types ──────────────────────────────────────────────────────────

/** A JSON Schema-compatible schema object (AsyncAPI 3.0 superset of JSON Schema Draft 07). */
export type SchemaObject = Record<string, unknown>;

/** A reference object: `{ $ref: "#/components/..." }`. */
export interface ReferenceObject {
    $ref: string;
}

/** Specification extension fields (x-*). */
export type SpecificationExtensions = Record<`x-${string}`, unknown>;

// ─── Info ───────────────────────────────────────────────────────────────────

export interface ContactObject extends SpecificationExtensions {
    name?: string;
    url?: string;
    email?: string;
}

export interface LicenseObject extends SpecificationExtensions {
    name: string;
    url?: string;
}

export interface ExternalDocumentationObject extends SpecificationExtensions {
    description?: string;
    url: string;
}

export interface TagObject extends SpecificationExtensions {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
}

export interface InfoObject extends SpecificationExtensions {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
}

// ─── Server ─────────────────────────────────────────────────────────────────

export interface ServerVariableObject extends SpecificationExtensions {
    enum?: string[];
    default?: string;
    description?: string;
    examples?: string[];
}

export interface ServerObject extends SpecificationExtensions {
    host: string;
    protocol: string;
    protocolVersion?: string;
    pathname?: string;
    description?: string;
    title?: string;
    summary?: string;
    variables?: Record<string, ServerVariableObject | ReferenceObject>;
    security?: Array<SecuritySchemeObject | ReferenceObject>;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
    bindings?: ServerBindingsObject | ReferenceObject;
}

// ─── Channel ────────────────────────────────────────────────────────────────

export interface ParameterObject extends SpecificationExtensions {
    enum?: string[];
    default?: string;
    description?: string;
    examples?: string[];
    location?: string;
}

export interface ChannelObject extends SpecificationExtensions {
    address?: string | null;
    messages?: Record<string, MessageObject | ReferenceObject>;
    title?: string;
    summary?: string;
    description?: string;
    servers?: ReferenceObject[];
    parameters?: Record<string, ParameterObject | ReferenceObject>;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
    bindings?: ChannelBindingsObject | ReferenceObject;
}

// ─── Message ────────────────────────────────────────────────────────────────

export interface CorrelationIdObject extends SpecificationExtensions {
    description?: string;
    location: string;
}

export interface MessageExampleObject extends SpecificationExtensions {
    headers?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    name?: string;
    summary?: string;
}

export interface MultiFormatSchemaObject extends SpecificationExtensions {
    schemaFormat: string;
    schema: unknown;
}

export interface MessageTraitObject extends SpecificationExtensions {
    headers?: MultiFormatSchemaObject | SchemaObject | ReferenceObject;
    correlationId?: CorrelationIdObject | ReferenceObject;
    contentType?: string;
    name?: string;
    title?: string;
    summary?: string;
    description?: string;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
    bindings?: MessageBindingsObject | ReferenceObject;
    examples?: MessageExampleObject[];
}

export interface MessageObject extends SpecificationExtensions {
    headers?: MultiFormatSchemaObject | SchemaObject | ReferenceObject;
    payload?: MultiFormatSchemaObject | SchemaObject | ReferenceObject;
    correlationId?: CorrelationIdObject | ReferenceObject;
    contentType?: string;
    name?: string;
    title?: string;
    summary?: string;
    description?: string;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
    bindings?: MessageBindingsObject | ReferenceObject;
    examples?: MessageExampleObject[];
    traits?: Array<MessageTraitObject | ReferenceObject>;
}

// ─── Operation ──────────────────────────────────────────────────────────────

export interface OperationReplyAddressObject extends SpecificationExtensions {
    description?: string;
    location: string;
}

export interface OperationReplyObject extends SpecificationExtensions {
    address?: OperationReplyAddressObject | ReferenceObject;
    channel?: ReferenceObject;
    messages?: ReferenceObject[];
}

export interface OperationTraitObject extends SpecificationExtensions {
    title?: string;
    summary?: string;
    description?: string;
    security?: Array<SecuritySchemeObject | ReferenceObject>;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
    bindings?: OperationBindingsObject | ReferenceObject;
}

export interface OperationObject extends SpecificationExtensions {
    action: "send" | "receive";
    channel: ReferenceObject;
    title?: string;
    summary?: string;
    description?: string;
    security?: Array<SecuritySchemeObject | ReferenceObject>;
    tags?: TagObject[];
    externalDocs?: ExternalDocumentationObject | ReferenceObject;
    bindings?: OperationBindingsObject | ReferenceObject;
    traits?: Array<OperationTraitObject | ReferenceObject>;
    messages?: ReferenceObject[];
    reply?: OperationReplyObject | ReferenceObject;
}

// ─── Security ───────────────────────────────────────────────────────────────

export interface OAuthFlowObject extends SpecificationExtensions {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    availableScopes?: Record<string, string>;
}

export interface OAuthFlowsObject extends SpecificationExtensions {
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    authorizationCode?: OAuthFlowObject;
}

export interface SecuritySchemeObject extends SpecificationExtensions {
    type: string;
    description?: string;
    name?: string;
    in?: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlowsObject;
    openIdConnectUrl?: string;
    scopes?: string[];
}

// ─── Bindings (protocol-agnostic maps) ──────────────────────────────────────

export type ServerBindingsObject = Record<string, unknown> &
    SpecificationExtensions;
export type ChannelBindingsObject = Record<string, unknown> &
    SpecificationExtensions;
export type OperationBindingsObject = Record<string, unknown> &
    SpecificationExtensions;
export type MessageBindingsObject = Record<string, unknown> &
    SpecificationExtensions;

// ─── Components ─────────────────────────────────────────────────────────────

export interface ComponentsObject extends SpecificationExtensions {
    schemas?: Record<
        string,
        MultiFormatSchemaObject | SchemaObject | ReferenceObject
    >;
    servers?: Record<string, ServerObject | ReferenceObject>;
    channels?: Record<string, ChannelObject | ReferenceObject>;
    operations?: Record<string, OperationObject | ReferenceObject>;
    messages?: Record<string, MessageObject | ReferenceObject>;
    securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
    serverVariables?: Record<string, ServerVariableObject | ReferenceObject>;
    parameters?: Record<string, ParameterObject | ReferenceObject>;
    correlationIds?: Record<string, CorrelationIdObject | ReferenceObject>;
    replies?: Record<string, OperationReplyObject | ReferenceObject>;
    replyAddresses?: Record<
        string,
        OperationReplyAddressObject | ReferenceObject
    >;
    externalDocs?: Record<string, ExternalDocumentationObject | ReferenceObject>;
    tags?: Record<string, TagObject | ReferenceObject>;
    operationTraits?: Record<string, OperationTraitObject | ReferenceObject>;
    messageTraits?: Record<string, MessageTraitObject | ReferenceObject>;
    serverBindings?: Record<string, ServerBindingsObject | ReferenceObject>;
    channelBindings?: Record<string, ChannelBindingsObject | ReferenceObject>;
    operationBindings?: Record<string, OperationBindingsObject | ReferenceObject>;
    messageBindings?: Record<string, MessageBindingsObject | ReferenceObject>;
}

// ─── Root Document ──────────────────────────────────────────────────────────

export interface AsyncAPIDocumentObject extends SpecificationExtensions {
    asyncapi: "3.0.0";
    id?: string;
    info: InfoObject;
    servers?: Record<string, ServerObject | ReferenceObject>;
    defaultContentType?: string;
    channels?: Record<string, ChannelObject | ReferenceObject>;
    operations?: Record<string, OperationObject | ReferenceObject>;
    components?: ComponentsObject;
}

// ─── Plugin Options ─────────────────────────────────────────────────────────

export interface AsyncAPIPluginOptions {
    /** The AsyncAPIDocument builder instance. */
    document: {
        toJSON(): AsyncAPIDocumentObject;
    };
    /** Route prefix for spec and docs endpoints. Defaults to "/asyncapi". */
    routePrefix?: string;
    /** Options for the docs UI HTML page. */
    ui?: AsyncAPIUIOptions;
}

export interface AsyncAPIUIOptions {
    /** Override the CDN base URL for the @asyncapi/react-component standalone bundle. */
    cdnUrl?: string;
    /** The version of @asyncapi/react-component to load from CDN. Defaults to "latest". */
    cdnVersion?: string;
    /** Show the sidebar in the rendered docs. Defaults to true. */
    sidebar?: boolean;
    /** Page title for the HTML document. */
    title?: string;
    /** Favicon URL. */
    favicon?: string;
}
