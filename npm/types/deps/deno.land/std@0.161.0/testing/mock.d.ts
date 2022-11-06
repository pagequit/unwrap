/** An error related to spying on a function or instance method. */
export declare class MockError extends Error {
    constructor(message: string);
}
/** Call information recorded by a spy. */
export interface SpyCall<Self = any, Args extends unknown[] = any[], Return = any> {
    /** Arguments passed to a function when called. */
    args: Args;
    /** The value that was returned by a function. */
    returned?: Return;
    /** The error value that was thrown by a function. */
    error?: Error;
    /** The instance that a method was called on. */
    self?: Self;
}
/** A function or instance method wrapper that records all calls made to it. */
export interface Spy<Self = any, Args extends unknown[] = any[], Return = any> {
    (this: Self, ...args: Args): Return;
    /** The function that is being spied on. */
    original: (this: Self, ...args: Args) => Return;
    /** Information about calls made to the function or instance method. */
    calls: SpyCall<Self, Args, Return>[];
    /** Whether or not the original instance method has been restored. */
    restored: boolean;
    /** If spying on an instance method, this restores the original instance method. */
    restore(): void;
}
/**
 * Creates a session that tracks all mocks created before it's restored.
 * If a callback is provided, it restores all mocks created within it.
 */
export declare function mockSession(): number;
export declare function mockSession<Self, Args extends unknown[], Return>(func: (this: Self, ...args: Args) => Return): (this: Self, ...args: Args) => Return;
/** Creates an async session that tracks all mocks created before the promise resolves. */
export declare function mockSessionAsync<Self, Args extends unknown[], Return>(func: (this: Self, ...args: Args) => Promise<Return>): (this: Self, ...args: Args) => Promise<Return>;
/**
 * Restores all mocks registered in the current session that have not already been restored.
 * If an id is provided, it will restore all mocks registered in the session associed with that id that have not already been restored.
 */
export declare function restore(id?: number): void;
/** Utility for extracting the arguments type from a property */
declare type GetParametersFromProp<Self, Prop extends keyof Self> = Self[Prop] extends (...args: infer Args) => unknown ? Args : unknown[];
/** Utility for extracting the return type from a property */
declare type GetReturnFromProp<Self, Prop extends keyof Self> = Self[Prop] extends (...args: any[]) => infer Return ? Return : unknown;
/** Wraps a function or instance method with a Spy. */
export declare function spy<Self = any, Args extends unknown[] = any[], Return = undefined>(): Spy<Self, Args, Return>;
export declare function spy<Self, Args extends unknown[], Return>(func: (this: Self, ...args: Args) => Return): Spy<Self, Args, Return>;
export declare function spy<Self, Prop extends keyof Self>(self: Self, property: Prop): Spy<Self, GetParametersFromProp<Self, Prop>, GetReturnFromProp<Self, Prop>>;
/** An instance method replacement that records all calls made to it. */
export interface Stub<Self = any, Args extends unknown[] = any[], Return = any> extends Spy<Self, Args, Return> {
    /** The function that is used instead of the original. */
    fake: (this: Self, ...args: Args) => Return;
}
/** Replaces an instance method with a Stub. */
export declare function stub<Self, Prop extends keyof Self>(self: Self, property: Prop): Stub<Self, GetParametersFromProp<Self, Prop>, GetReturnFromProp<Self, Prop>>;
export declare function stub<Self, Prop extends keyof Self>(self: Self, property: Prop, func: (this: Self, ...args: GetParametersFromProp<Self, Prop>) => GetReturnFromProp<Self, Prop>): Stub<Self, GetParametersFromProp<Self, Prop>, GetReturnFromProp<Self, Prop>>;
/**
 * Asserts that a spy is called as much as expected and no more.
 */
export declare function assertSpyCalls<Self, Args extends unknown[], Return>(spy: Spy<Self, Args, Return>, expectedCalls: number): void;
/** Call information recorded by a spy. */
export interface ExpectedSpyCall<Self = any, Args extends unknown[] = any[], Return = any> {
    /** Arguments passed to a function when called. */
    args?: [...Args, ...unknown[]];
    /** The instance that a method was called on. */
    self?: Self;
    /**
     * The value that was returned by a function.
     * If you expect a promise to reject, expect error instead.
     */
    returned?: Return;
    error?: {
        /** The class for the error that was thrown by a function. */
        Class?: new (...args: any[]) => Error;
        /** Part of the message for the error that was thrown by a function. */
        msgIncludes?: string;
    };
}
/**
 * Asserts that a spy is called as expected.
 */
export declare function assertSpyCall<Self, Args extends unknown[], Return>(spy: Spy<Self, Args, Return>, callIndex: number, expected?: ExpectedSpyCall<Self, Args, Return>): void;
/**
 * Asserts that an async spy is called as expected.
 */
export declare function assertSpyCallAsync<Self, Args extends unknown[], Return>(spy: Spy<Self, Args, Promise<Return>>, callIndex: number, expected?: ExpectedSpyCall<Self, Args, Promise<Return> | Return>): Promise<void>;
/**
 * Asserts that a spy is called with a specific arg as expected.
 */
export declare function assertSpyCallArg<Self, Args extends unknown[], Return, ExpectedArg>(spy: Spy<Self, Args, Return>, callIndex: number, argIndex: number, expected: ExpectedArg): ExpectedArg;
/**
 * Asserts that an spy is called with a specific range of args as expected.
 * If a start and end index is not provided, the expected will be compared against all args.
 * If a start is provided without an end index, the expected will be compared against all args from the start index to the end.
 * The end index is not included in the range of args that are compared.
 */
export declare function assertSpyCallArgs<Self, Args extends unknown[], Return, ExpectedArgs extends unknown[]>(spy: Spy<Self, Args, Return>, callIndex: number, expected: ExpectedArgs): ExpectedArgs;
export declare function assertSpyCallArgs<Self, Args extends unknown[], Return, ExpectedArgs extends unknown[]>(spy: Spy<Self, Args, Return>, callIndex: number, argsStart: number, expected: ExpectedArgs): ExpectedArgs;
export declare function assertSpyCallArgs<Self, Args extends unknown[], Return, ExpectedArgs extends unknown[]>(spy: Spy<Self, Args, Return>, callIndex: number, argStart: number, argEnd: number, expected: ExpectedArgs): ExpectedArgs;
/** Creates a function that returns the instance the method was called on. */
export declare function returnsThis<Self = any, Args extends unknown[] = any[]>(): (this: Self, ...args: Args) => Self;
/** Creates a function that returns one of its arguments. */
export declare function returnsArg<Arg, Self = any>(idx: number): (this: Self, ...args: Arg[]) => Arg;
/** Creates a function that returns its arguments or a subset of them. If end is specified, it will return arguments up to but not including the end. */
export declare function returnsArgs<Args extends unknown[], Self = any>(start?: number, end?: number): (this: Self, ...args: Args) => Args;
/** Creates a function that returns the iterable values. Any iterable values that are errors will be thrown. */
export declare function returnsNext<Return, Self = any, Args extends unknown[] = any[]>(values: Iterable<Return | Error>): (this: Self, ...args: Args) => Return;
/** Creates a function that resolves the awaited iterable values. Any awaited iterable values that are errors will be thrown. */
export declare function resolvesNext<Return, Self = any, Args extends unknown[] = any[]>(iterable: Iterable<Return | Error | Promise<Return | Error>> | AsyncIterable<Return | Error | Promise<Return | Error>>): (this: Self, ...args: Args) => Promise<Return>;
export {};
