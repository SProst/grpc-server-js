/// <reference types="node" />
import * as http2 from 'http2';
import { Duplex, Readable, Writable } from 'stream';


export interface Serialize<T> {
  (value: T): Buffer;
}

export interface Deserialize<T> {
  (bytes: Buffer): T;
}

export interface MethodDefinition<RequestType, ResponseType> {
  path: string;
  requestStream: boolean;
  responseStream: boolean;
  requestSerialize: Serialize<RequestType>;
  responseSerialize: Serialize<ResponseType>;
  requestDeserialize: Deserialize<RequestType>;
  responseDeserialize: Deserialize<ResponseType>;
  originalName?: string;
}

export interface ServiceDefinition {
  [index: string]: MethodDefinition<object, object>;
}


export declare type KeyCertPair = {
  private_key: Buffer;
  cert_chain: Buffer;
};

export declare abstract class ServerCredentials {
  abstract _isSecure(): boolean;
  abstract _getSettings(): http2.SecureServerOptions | null;
  static createInsecure(): ServerCredentials;
  static createSsl(rootCerts: Buffer | null,
                   keyCertPairs: KeyCertPair[],
                   checkClientCertificate?: boolean): ServerCredentials;
}


export declare type MetadataValue = string | Buffer;
export declare type MetadataObject = Map<string, MetadataValue[]>;
export declare class Metadata {
  protected internalRepr: MetadataObject;
  set(key: string, value: MetadataValue): void;
  add(key: string, value: MetadataValue): void;
  remove(key: string): void;
  get(key: string): MetadataValue[];
  getMap(): { [key: string]: MetadataValue; };
  clone(): Metadata;
  merge(other: Metadata): void;
  toHttp2Headers(): http2.OutgoingHttpHeaders;
  static fromHttp2Headers(headers: http2.IncomingHttpHeaders): Metadata;
}


export declare enum Status {
  OK = 0,
  CANCELLED = 1,
  UNKNOWN = 2,
  INVALID_ARGUMENT = 3,
  DEADLINE_EXCEEDED = 4,
  NOT_FOUND = 5,
  ALREADY_EXISTS = 6,
  PERMISSION_DENIED = 7,
  RESOURCE_EXHAUSTED = 8,
  FAILED_PRECONDITION = 9,
  ABORTED = 10,
  OUT_OF_RANGE = 11,
  UNIMPLEMENTED = 12,
  INTERNAL = 13,
  UNAVAILABLE = 14,
  DATA_LOSS = 15,
  UNAUTHENTICATED = 16
}

export interface StatusObject {
  code: Status;
  details: string;
  metadata: Metadata;
}

export declare type ServiceError = StatusObject & Error;


declare type ServerSurfaceCall = {
  cancelled: boolean;
  getPeer(): string;
  sendMetadata(responseMetadata: Metadata): void;
};
export declare type ServerUnaryCall<RequestType, ResponseType> =
    ServerSurfaceCall & { request: RequestType | null; };
export declare type ServerReadableStream<RequestType, ResponseType> =
    ServerSurfaceCall & Readable;
export declare type ServerWritableStream<RequestType, ResponseType> =
    ServerSurfaceCall & Writable & { request: RequestType | null; };
export declare type ServerDuplexStream<RequestType, ResponseType> =
    ServerSurfaceCall & Duplex;


export declare type sendUnaryData<ResponseType> =
    (error: ServiceError | null,
     value: ResponseType | null,
     trailer?: Metadata,
     flags?: number) => void;
export declare type handleUnaryCall<RequestType, ResponseType> =
    (call: ServerUnaryCall<RequestType, ResponseType>,
     callback: sendUnaryData<ResponseType>) => void;
export declare type handleClientStreamingCall<RequestType, ResponseType> =
    (call: ServerReadableStream<RequestType, ResponseType>,
     callback: sendUnaryData<ResponseType>) => void;
export declare type handleServerStreamingCall<RequestType, ResponseType> =
    (call: ServerWritableStream<RequestType, ResponseType>) => void;
export declare type handleBidiStreamingCall<RequestType, ResponseType> =
    (call: ServerDuplexStream<RequestType, ResponseType>) => void;


export declare type HandleCall<RequestType, ResponseType> =
    handleUnaryCall<RequestType, ResponseType> |
    handleClientStreamingCall<RequestType, ResponseType> |
    handleServerStreamingCall<RequestType, ResponseType> |
    handleBidiStreamingCall<RequestType, ResponseType>;


export declare class Server {
  constructor(options?: object);
  addProtoService(): void;
  addService(service: ServiceDefinition, implementation: object): void;
  bind(port: string, creds: ServerCredentials): Promise<void>;
  bindAsync(port: string,
            creds: ServerCredentials,
            callback: (error: Error | null, port: number) => void): void;
  forceShutdown(): void;
  register<RequestType, ResponseType>(
    name: string,
    handler: HandleCall<RequestType, ResponseType>,
    serialize: Serialize<ResponseType>,
    deserialize: Deserialize<RequestType>,
    type: string
  ): boolean;
  start(): void;
  tryShutdown(callback: (error?: Error) => void): void;
  addHttp2Port(): void;
}
