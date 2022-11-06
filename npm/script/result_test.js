"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dntShim = __importStar(require("./_dnt.test_shims.js"));
const asserts_js_1 = require("./deps/deno.land/std@0.161.0/testing/asserts.js");
const mock_js_1 = require("./deps/deno.land/std@0.161.0/testing/mock.js");
const option_js_1 = require("./option.js");
const result_js_1 = __importStar(require("./result.js"));
dntShim.Deno.test("Err", () => {
    const err = (0, result_js_1.Err)("Error");
    (0, asserts_js_1.assertEquals)(err.discriminant, result_js_1.ResultType.Err);
    (0, asserts_js_1.assertInstanceOf)(err, result_js_1.default);
});
dntShim.Deno.test("Ok", () => {
    const ok = (0, result_js_1.Ok)(1);
    (0, asserts_js_1.assertEquals)(ok.discriminant, result_js_1.ResultType.Ok);
    (0, asserts_js_1.assertInstanceOf)((0, result_js_1.Ok)(1), result_js_1.default);
});
dntShim.Deno.test("iterator", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = (0, mock_js_1.spy)(callback);
    for (const ok of (0, result_js_1.Ok)(2)) {
        inspectSpy(ok);
    }
    for (const err of (0, result_js_1.Err)("foo")) {
        inspectSpy(err);
    }
    (0, mock_js_1.assertSpyCalls)(inspectSpy, 1);
});
dntShim.Deno.test("and", () => {
    let x;
    let y;
    x = (0, result_js_1.Ok)(2);
    y = (0, result_js_1.Err)("late error");
    (0, asserts_js_1.assertEquals)(x.and(y), (0, result_js_1.Err)("late error"));
    x = (0, result_js_1.Err)("early error");
    y = (0, result_js_1.Ok)("foo");
    (0, asserts_js_1.assertEquals)(x.and(y), (0, result_js_1.Err)("early error"));
    x = (0, result_js_1.Err)("not a 2");
    y = (0, result_js_1.Err)("late error");
    (0, asserts_js_1.assertEquals)(x.and(y), (0, result_js_1.Err)("not a 2"));
    x = (0, result_js_1.Ok)(2);
    y = (0, result_js_1.Ok)("other type");
    (0, asserts_js_1.assertEquals)(x.and(y), (0, result_js_1.Ok)("other type"));
});
dntShim.Deno.test("andThen", () => {
    function sqThenToString(x) {
        return (0, result_js_1.Ok)((x * x).toString());
    }
    const ok = (0, result_js_1.Ok)(2);
    const err = (0, result_js_1.Err)("not a number");
    (0, asserts_js_1.assertEquals)(ok.andThen(sqThenToString), (0, result_js_1.Ok)("4"));
    (0, asserts_js_1.assertEquals)(err.andThen(sqThenToString), (0, result_js_1.Err)("not a number"));
});
dntShim.Deno.test("contains", () => {
    const x = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.contains(2), true);
    const y = (0, result_js_1.Ok)(3);
    (0, asserts_js_1.assertEquals)(y.contains(2), false);
    const z = (0, result_js_1.Err)("Some error message");
    (0, asserts_js_1.assertEquals)(z.contains(2), false);
});
dntShim.Deno.test("containsErr", () => {
    const x = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.containsErr("Some error message"), false);
    const y = (0, result_js_1.Err)("Some error message");
    (0, asserts_js_1.assertEquals)(y.containsErr("Some error message"), true);
    const z = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(z.containsErr("Some error message"), false);
});
dntShim.Deno.test("err", () => {
    const x = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.err(), (0, option_js_1.None)());
    const y = (0, result_js_1.Err)("Error");
    (0, asserts_js_1.assertEquals)(y.err(), (0, option_js_1.Some)("Error"));
});
dntShim.Deno.test("expect", () => {
    (0, asserts_js_1.assertEquals)((0, result_js_1.Ok)(2).expect("foo"), 2);
    (0, asserts_js_1.assertThrows)(() => (0, result_js_1.Err)(1).expect("foo"), Error, "foo");
});
dntShim.Deno.test("expectErr", () => {
    (0, asserts_js_1.assertEquals)((0, result_js_1.Err)(1).expectErr("foo"), 1);
    (0, asserts_js_1.assertThrows)(() => (0, result_js_1.Ok)(2).expectErr("foo"), Error, "foo");
});
dntShim.Deno.test("flatten", () => {
    const x = (0, result_js_1.Ok)((0, result_js_1.Ok)(2));
    (0, asserts_js_1.assertEquals)((0, result_js_1.Ok)(2), x.flatten());
    const y = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)((0, result_js_1.Err)("foo"), y.flatten());
    const z = (0, result_js_1.Ok)((0, result_js_1.Ok)((0, result_js_1.Ok)(3)));
    (0, asserts_js_1.assertEquals)((0, result_js_1.Ok)((0, result_js_1.Ok)(3)), z.flatten());
    (0, asserts_js_1.assertEquals)((0, result_js_1.Ok)(3), z.flatten().flatten());
});
dntShim.Deno.test("inspect", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = (0, mock_js_1.spy)(callback);
    (0, result_js_1.Err)("foo").inspect(inspectSpy);
    (0, result_js_1.Ok)(2).inspect(inspectSpy);
    (0, mock_js_1.assertSpyCall)(inspectSpy, 0, {
        args: [2],
        returned: undefined,
    });
    (0, mock_js_1.assertSpyCalls)(inspectSpy, 1);
});
dntShim.Deno.test("inspectErr", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = (0, mock_js_1.spy)(callback);
    (0, result_js_1.Ok)(2).inspectErr(inspectSpy);
    (0, result_js_1.Err)("foo").inspectErr(inspectSpy);
    (0, mock_js_1.assertSpyCall)(inspectSpy, 0, {
        args: ["foo"],
        returned: undefined,
    });
    (0, mock_js_1.assertSpyCalls)(inspectSpy, 1);
});
dntShim.Deno.test("isErr", () => {
    const x = (0, result_js_1.Ok)(-3);
    (0, asserts_js_1.assertEquals)(x.isErr(), false);
    const y = (0, result_js_1.Err)("Some error message");
    (0, asserts_js_1.assertEquals)(y.isErr(), true);
});
dntShim.Deno.test("isErrAnd", () => {
    const x = (0, result_js_1.Err)(Error("NotFound"));
    (0, asserts_js_1.assertEquals)(x.isErrAnd((x) => x.message === "NotFound"), true);
    const y = (0, result_js_1.Err)(Error("OtherError"));
    (0, asserts_js_1.assertEquals)(y.isErrAnd((y) => y.message === "NotFound"), false);
    const z = (0, result_js_1.Ok)(123);
    (0, asserts_js_1.assertEquals)(z.isErrAnd((z) => z.message === "NotFound"), false);
});
dntShim.Deno.test("isOk", () => {
    const x = (0, result_js_1.Ok)(-3);
    (0, asserts_js_1.assertEquals)(x.isOk(), true);
    const y = (0, result_js_1.Err)("Some error message");
    (0, asserts_js_1.assertEquals)(y.isOk(), false);
});
dntShim.Deno.test("isOkAnd", () => {
    const x = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.isOkAnd((x) => x > 1), true);
    const y = (0, result_js_1.Ok)(0);
    (0, asserts_js_1.assertEquals)(y.isOkAnd((y) => y > 1), false);
    const z = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(z.isOkAnd((z) => z > 1), false);
});
dntShim.Deno.test("iter", () => {
    const x = (0, result_js_1.Ok)(4);
    const iterX = x.iter();
    const x1 = iterX.next();
    (0, asserts_js_1.assertEquals)(x1.value, (0, option_js_1.Some)(4));
    (0, asserts_js_1.assertEquals)(x1.done, false);
    const x2 = iterX.next();
    (0, asserts_js_1.assertEquals)(x2.value, (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)(x2.done, true);
    const y = (0, result_js_1.Err)("foo");
    const iterY = y.iter();
    const y1 = iterY.next();
    (0, asserts_js_1.assertEquals)(y1.value, (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)(y1.done, true);
});
dntShim.Deno.test("map", () => {
    function callback(value) {
        return value.toString();
    }
    const x = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.map(callback), (0, result_js_1.Ok)("2"));
    const y = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(y.map(callback), (0, result_js_1.Err)("foo"));
});
dntShim.Deno.test("mapErr", () => {
    function callback(value) {
        return value.length;
    }
    const x = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(x.mapErr(callback), (0, result_js_1.Err)(3));
    const y = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(y.mapErr(callback), (0, result_js_1.Ok)(2));
});
dntShim.Deno.test("mapOr", () => {
    const x = (0, result_js_1.Ok)("foo");
    (0, asserts_js_1.assertEquals)(x.mapOr(42, (x) => x.length), 3);
    const y = (0, result_js_1.Err)("some error");
    (0, asserts_js_1.assertEquals)(y.mapOr(42, (y) => y.length), 42);
});
dntShim.Deno.test("mapOrElse", () => {
    const x = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.mapOrElse((e) => e.length, (x) => x * 2), 4);
    const y = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(y.mapOrElse((e) => e.length, (y) => y / 7), 3);
});
dntShim.Deno.test("ok", () => {
    const x = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.ok(), (0, option_js_1.Some)(2));
    const y = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(y.ok(), (0, option_js_1.None)());
});
dntShim.Deno.test("or", () => {
    let x;
    let y;
    x = (0, result_js_1.Ok)(2);
    y = (0, result_js_1.Err)("late error");
    (0, asserts_js_1.assertEquals)(x.or(y), (0, result_js_1.Ok)(2));
    x = (0, result_js_1.Err)("early error");
    y = (0, result_js_1.Ok)(2);
    (0, asserts_js_1.assertEquals)(x.or(y), (0, result_js_1.Ok)(2));
    x = (0, result_js_1.Err)("early error");
    y = (0, result_js_1.Err)("late error");
    (0, asserts_js_1.assertEquals)(x.or(y), (0, result_js_1.Err)("late error"));
    x = (0, result_js_1.Ok)(2);
    y = (0, result_js_1.Ok)(100);
    (0, asserts_js_1.assertEquals)(x.or(y), (0, result_js_1.Ok)(2));
});
dntShim.Deno.test("orElse", () => {
    function square(x) {
        return (0, result_js_1.Ok)(x.length);
    }
    const ok = (0, result_js_1.Ok)(2);
    const err = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(ok.orElse(square), (0, result_js_1.Ok)(2));
    (0, asserts_js_1.assertEquals)(err.orElse(square), (0, result_js_1.Ok)(3));
});
dntShim.Deno.test("transpose", () => {
    let x;
    let y;
    x = (0, result_js_1.Ok)((0, option_js_1.Some)(5));
    y = (0, option_js_1.Some)((0, result_js_1.Ok)(5));
    (0, asserts_js_1.assertEquals)(x.transpose(), y);
    x = (0, result_js_1.Err)("foo");
    y = (0, option_js_1.Some)((0, result_js_1.Err)("foo"));
    (0, asserts_js_1.assertEquals)(x.transpose(), y);
    x = (0, result_js_1.Ok)((0, option_js_1.None)());
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.transpose(), y);
});
dntShim.Deno.test("unwrap", () => {
    (0, asserts_js_1.assertEquals)((0, result_js_1.Ok)(2).unwrap(), 2);
    (0, asserts_js_1.assertThrows)(() => (0, result_js_1.Err)("foo").unwrap(), Error);
});
dntShim.Deno.test("unwrapErr", () => {
    (0, asserts_js_1.assertEquals)((0, result_js_1.Err)("foo").unwrapErr(), "foo");
    (0, asserts_js_1.assertThrows)(() => (0, result_js_1.Ok)(2).unwrapErr(), Error);
});
dntShim.Deno.test("unwrapErrUnchecked", () => {
    (0, asserts_js_1.assertEquals)((0, result_js_1.Err)("foo").unwrapErrUnchecked(), "foo");
    (0, asserts_js_1.assertEquals)((0, result_js_1.Ok)(2).unwrapErrUnchecked(), undefined);
});
dntShim.Deno.test("unwrapOr", () => {
    const x = (0, result_js_1.Ok)(9);
    (0, asserts_js_1.assertEquals)(x.unwrapOr(42), 9);
    const y = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(y.unwrapOr(42), 42);
});
dntShim.Deno.test("unwrapOrElse", () => {
    const x = (0, result_js_1.Ok)(9);
    (0, asserts_js_1.assertEquals)(x.unwrapOrElse((e) => e.length), 9);
    const y = (0, result_js_1.Err)("foo");
    (0, asserts_js_1.assertEquals)(y.unwrapOrElse((e) => e.length), 3);
});
dntShim.Deno.test("unwrapUnchecked", () => {
    (0, asserts_js_1.assertEquals)((0, result_js_1.Ok)(2).unwrapUnchecked(), 2);
    (0, asserts_js_1.assertEquals)((0, result_js_1.Err)("foo").unwrapUnchecked(), undefined);
});
