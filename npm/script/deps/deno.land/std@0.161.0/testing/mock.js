"use strict";
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvesNext = exports.returnsNext = exports.returnsArgs = exports.returnsArg = exports.returnsThis = exports.assertSpyCallArgs = exports.assertSpyCallArg = exports.assertSpyCallAsync = exports.assertSpyCall = exports.assertSpyCalls = exports.stub = exports.spy = exports.restore = exports.mockSessionAsync = exports.mockSession = exports.MockError = void 0;
/** A mocking and spying library.
 *
 * This module is browser compatible.
 *
 * @module
 */
const asserts_js_1 = require("./asserts.js");
/** An error related to spying on a function or instance method. */
class MockError extends Error {
    constructor(message) {
        super(message);
        this.name = "MockError";
    }
}
exports.MockError = MockError;
function functionSpy(func) {
    const original = func ?? (() => { }), calls = [];
    const spy = function (...args) {
        const call = { args };
        if (this)
            call.self = this;
        try {
            call.returned = original.apply(this, args);
        }
        catch (error) {
            call.error = error;
            calls.push(call);
            throw error;
        }
        calls.push(call);
        return call.returned;
    };
    Object.defineProperties(spy, {
        original: {
            enumerable: true,
            value: original,
        },
        calls: {
            enumerable: true,
            value: calls,
        },
        restored: {
            enumerable: true,
            get: () => false,
        },
        restore: {
            enumerable: true,
            value: () => {
                throw new MockError("function cannot be restored");
            },
        },
    });
    return spy;
}
/** Checks if a function is a spy. */
function isSpy(func) {
    const spy = func;
    return typeof spy === "function" &&
        typeof spy.original === "function" &&
        typeof spy.restored === "boolean" &&
        typeof spy.restore === "function" &&
        Array.isArray(spy.calls);
}
// deno-lint-ignore no-explicit-any
const sessions = [];
// deno-lint-ignore no-explicit-any
function getSession() {
    if (sessions.length === 0)
        sessions.push(new Set());
    return sessions[sessions.length - 1];
}
// deno-lint-ignore no-explicit-any
function registerMock(spy) {
    const session = getSession();
    session.add(spy);
}
// deno-lint-ignore no-explicit-any
function unregisterMock(spy) {
    const session = getSession();
    session.delete(spy);
}
function mockSession(func) {
    if (func) {
        return function (...args) {
            const id = sessions.length;
            sessions.push(new Set());
            try {
                return func.apply(this, args);
            }
            finally {
                restore(id);
            }
        };
    }
    else {
        sessions.push(new Set());
        return sessions.length - 1;
    }
}
exports.mockSession = mockSession;
/** Creates an async session that tracks all mocks created before the promise resolves. */
function mockSessionAsync(func) {
    return async function (...args) {
        const id = sessions.length;
        sessions.push(new Set());
        try {
            return await func.apply(this, args);
        }
        finally {
            restore(id);
        }
    };
}
exports.mockSessionAsync = mockSessionAsync;
/**
 * Restores all mocks registered in the current session that have not already been restored.
 * If an id is provided, it will restore all mocks registered in the session associed with that id that have not already been restored.
 */
function restore(id) {
    id ??= (sessions.length || 1) - 1;
    while (id < sessions.length) {
        const session = sessions.pop();
        if (session) {
            for (const value of session) {
                value.restore();
            }
        }
    }
}
exports.restore = restore;
/** Wraps an instance method with a Spy. */
function methodSpy(self, property) {
    if (typeof self[property] !== "function") {
        throw new MockError("property is not an instance method");
    }
    if (isSpy(self[property])) {
        throw new MockError("already spying on instance method");
    }
    const propertyDescriptor = Object.getOwnPropertyDescriptor(self, property);
    if (propertyDescriptor && !propertyDescriptor.configurable) {
        throw new MockError("cannot spy on non configurable instance method");
    }
    const original = self[property], calls = [];
    let restored = false;
    const spy = function (...args) {
        const call = { args };
        if (this)
            call.self = this;
        try {
            call.returned = original.apply(this, args);
        }
        catch (error) {
            call.error = error;
            calls.push(call);
            throw error;
        }
        calls.push(call);
        return call.returned;
    };
    Object.defineProperties(spy, {
        original: {
            enumerable: true,
            value: original,
        },
        calls: {
            enumerable: true,
            value: calls,
        },
        restored: {
            enumerable: true,
            get: () => restored,
        },
        restore: {
            enumerable: true,
            value: () => {
                if (restored) {
                    throw new MockError("instance method already restored");
                }
                if (propertyDescriptor) {
                    Object.defineProperty(self, property, propertyDescriptor);
                }
                else {
                    delete self[property];
                }
                restored = true;
                unregisterMock(spy);
            },
        },
    });
    Object.defineProperty(self, property, {
        configurable: true,
        enumerable: propertyDescriptor?.enumerable,
        writable: propertyDescriptor?.writable,
        value: spy,
    });
    registerMock(spy);
    return spy;
}
function spy(funcOrSelf, property) {
    const spy = typeof property !== "undefined"
        ? methodSpy(funcOrSelf, property)
        : typeof funcOrSelf === "function"
            ? functionSpy(funcOrSelf)
            : functionSpy();
    return spy;
}
exports.spy = spy;
function stub(self, property, func) {
    if (self[property] !== undefined && typeof self[property] !== "function") {
        throw new MockError("property is not an instance method");
    }
    if (isSpy(self[property])) {
        throw new MockError("already spying on instance method");
    }
    const propertyDescriptor = Object.getOwnPropertyDescriptor(self, property);
    if (propertyDescriptor && !propertyDescriptor.configurable) {
        throw new MockError("cannot spy on non configurable instance method");
    }
    const fake = func ?? (() => { });
    const original = self[property], calls = [];
    let restored = false;
    const stub = function (...args) {
        const call = { args };
        if (this)
            call.self = this;
        try {
            call.returned = fake.apply(this, args);
        }
        catch (error) {
            call.error = error;
            calls.push(call);
            throw error;
        }
        calls.push(call);
        return call.returned;
    };
    Object.defineProperties(stub, {
        original: {
            enumerable: true,
            value: original,
        },
        fake: {
            enumerable: true,
            value: fake,
        },
        calls: {
            enumerable: true,
            value: calls,
        },
        restored: {
            enumerable: true,
            get: () => restored,
        },
        restore: {
            enumerable: true,
            value: () => {
                if (restored) {
                    throw new MockError("instance method already restored");
                }
                if (propertyDescriptor) {
                    Object.defineProperty(self, property, propertyDescriptor);
                }
                else {
                    delete self[property];
                }
                restored = true;
                unregisterMock(stub);
            },
        },
    });
    Object.defineProperty(self, property, {
        configurable: true,
        enumerable: propertyDescriptor?.enumerable,
        writable: propertyDescriptor?.writable,
        value: stub,
    });
    registerMock(stub);
    return stub;
}
exports.stub = stub;
/**
 * Asserts that a spy is called as much as expected and no more.
 */
function assertSpyCalls(spy, expectedCalls) {
    try {
        (0, asserts_js_1.assertEquals)(spy.calls.length, expectedCalls);
    }
    catch (e) {
        (0, asserts_js_1.assertIsError)(e);
        let message = spy.calls.length < expectedCalls
            ? "spy not called as much as expected:\n"
            : "spy called more than expected:\n";
        message += e.message.split("\n").slice(1).join("\n");
        throw new asserts_js_1.AssertionError(message);
    }
}
exports.assertSpyCalls = assertSpyCalls;
/**
 * Asserts that a spy is called as expected.
 */
function assertSpyCall(spy, callIndex, expected) {
    if (spy.calls.length < (callIndex + 1)) {
        throw new asserts_js_1.AssertionError("spy not called as much as expected");
    }
    const call = spy.calls[callIndex];
    if (expected) {
        if (expected.args) {
            try {
                (0, asserts_js_1.assertEquals)(call.args, expected.args);
            }
            catch (e) {
                (0, asserts_js_1.assertIsError)(e);
                throw new asserts_js_1.AssertionError("spy not called with expected args:\n" +
                    e.message.split("\n").slice(1).join("\n"));
            }
        }
        if ("self" in expected) {
            try {
                (0, asserts_js_1.assertEquals)(call.self, expected.self);
            }
            catch (e) {
                (0, asserts_js_1.assertIsError)(e);
                let message = expected.self
                    ? "spy not called as method on expected self:\n"
                    : "spy not expected to be called as method on object:\n";
                message += e.message.split("\n").slice(1).join("\n");
                throw new asserts_js_1.AssertionError(message);
            }
        }
        if ("returned" in expected) {
            if ("error" in expected) {
                throw new TypeError("do not expect error and return, only one should be expected");
            }
            if (call.error) {
                throw new asserts_js_1.AssertionError("spy call did not return expected value, an error was thrown.");
            }
            try {
                (0, asserts_js_1.assertEquals)(call.returned, expected.returned);
            }
            catch (e) {
                (0, asserts_js_1.assertIsError)(e);
                throw new asserts_js_1.AssertionError("spy call did not return expected value:\n" +
                    e.message.split("\n").slice(1).join("\n"));
            }
        }
        if ("error" in expected) {
            if ("returned" in call) {
                throw new asserts_js_1.AssertionError("spy call did not throw an error, a value was returned.");
            }
            (0, asserts_js_1.assertIsError)(call.error, expected.error?.Class, expected.error?.msgIncludes);
        }
    }
}
exports.assertSpyCall = assertSpyCall;
/**
 * Asserts that an async spy is called as expected.
 */
async function assertSpyCallAsync(spy, callIndex, expected) {
    const expectedSync = expected && { ...expected };
    if (expectedSync) {
        delete expectedSync.returned;
        delete expectedSync.error;
    }
    assertSpyCall(spy, callIndex, expectedSync);
    const call = spy.calls[callIndex];
    if (call.error) {
        throw new asserts_js_1.AssertionError("spy call did not return a promise, an error was thrown.");
    }
    if (call.returned !== Promise.resolve(call.returned)) {
        throw new asserts_js_1.AssertionError("spy call did not return a promise, a value was returned.");
    }
    if (expected) {
        if ("returned" in expected) {
            if ("error" in expected) {
                throw new TypeError("do not expect error and return, only one should be expected");
            }
            if (call.error) {
                throw new asserts_js_1.AssertionError("spy call did not return expected value, an error was thrown.");
            }
            let expectedResolved;
            try {
                expectedResolved = await expected.returned;
            }
            catch {
                throw new TypeError("do not expect rejected promise, expect error instead");
            }
            let resolved;
            try {
                resolved = await call.returned;
            }
            catch {
                throw new asserts_js_1.AssertionError("spy call returned promise was rejected");
            }
            try {
                (0, asserts_js_1.assertEquals)(resolved, expectedResolved);
            }
            catch (e) {
                (0, asserts_js_1.assertIsError)(e);
                throw new asserts_js_1.AssertionError("spy call did not resolve to expected value:\n" +
                    e.message.split("\n").slice(1).join("\n"));
            }
        }
        if ("error" in expected) {
            await (0, asserts_js_1.assertRejects)(() => Promise.resolve(call.returned), expected.error?.Class ?? Error, expected.error?.msgIncludes ?? "");
        }
    }
}
exports.assertSpyCallAsync = assertSpyCallAsync;
/**
 * Asserts that a spy is called with a specific arg as expected.
 */
function assertSpyCallArg(spy, callIndex, argIndex, expected) {
    assertSpyCall(spy, callIndex);
    const call = spy.calls[callIndex];
    const arg = call.args[argIndex];
    (0, asserts_js_1.assertEquals)(arg, expected);
    return arg;
}
exports.assertSpyCallArg = assertSpyCallArg;
function assertSpyCallArgs(spy, callIndex, argsStart, argsEnd, expected) {
    assertSpyCall(spy, callIndex);
    const call = spy.calls[callIndex];
    if (!expected) {
        expected = argsEnd;
        argsEnd = undefined;
    }
    if (!expected) {
        expected = argsStart;
        argsStart = undefined;
    }
    const args = typeof argsEnd === "number"
        ? call.args.slice(argsStart, argsEnd)
        : typeof argsStart === "number"
            ? call.args.slice(argsStart)
            : call.args;
    (0, asserts_js_1.assertEquals)(args, expected);
    return args;
}
exports.assertSpyCallArgs = assertSpyCallArgs;
/** Creates a function that returns the instance the method was called on. */
function returnsThis() {
    return function () {
        return this;
    };
}
exports.returnsThis = returnsThis;
/** Creates a function that returns one of its arguments. */
// deno-lint-ignore no-explicit-any
function returnsArg(idx) {
    return function (...args) {
        return args[idx];
    };
}
exports.returnsArg = returnsArg;
/** Creates a function that returns its arguments or a subset of them. If end is specified, it will return arguments up to but not including the end. */
function returnsArgs(start = 0, end) {
    return function (...args) {
        return args.slice(start, end);
    };
}
exports.returnsArgs = returnsArgs;
/** Creates a function that returns the iterable values. Any iterable values that are errors will be thrown. */
function returnsNext(values) {
    const gen = (function* returnsValue() {
        yield* values;
    })();
    let calls = 0;
    return function () {
        const next = gen.next();
        if (next.done) {
            throw new MockError(`not expected to be called more than ${calls} times`);
        }
        calls++;
        const { value } = next;
        if (value instanceof Error)
            throw value;
        return value;
    };
}
exports.returnsNext = returnsNext;
/** Creates a function that resolves the awaited iterable values. Any awaited iterable values that are errors will be thrown. */
function resolvesNext(iterable) {
    const gen = (async function* returnsValue() {
        yield* iterable;
    })();
    let calls = 0;
    return async function () {
        const next = await gen.next();
        if (next.done) {
            throw new MockError(`not expected to be called more than ${calls} times`);
        }
        calls++;
        const { value } = next;
        if (value instanceof Error)
            throw value;
        return value;
    };
}
exports.resolvesNext = resolvesNext;
