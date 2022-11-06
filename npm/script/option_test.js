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
const option_js_1 = __importStar(require("./option.js"));
const result_js_1 = require("./result.js");
dntShim.Deno.test("None", () => {
    const none = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(none.discriminant, option_js_1.OptionType.None);
    (0, asserts_js_1.assertInstanceOf)(none, option_js_1.default);
});
dntShim.Deno.test("Some", () => {
    const some = (0, option_js_1.Some)(1);
    (0, asserts_js_1.assertEquals)(some.discriminant, option_js_1.OptionType.Some);
    (0, asserts_js_1.assertInstanceOf)((0, option_js_1.Some)(1), option_js_1.default);
});
dntShim.Deno.test("iterator", () => {
    function callback(value) {
        return value;
    }
    const inspectSpy = (0, mock_js_1.spy)(callback);
    for (const some of (0, option_js_1.Some)("foo")) {
        inspectSpy(some);
    }
    for (const none of (0, option_js_1.None)()) {
        inspectSpy(none);
    }
    (0, mock_js_1.assertSpyCalls)(inspectSpy, 1);
});
dntShim.Deno.test("and", () => {
    let x;
    let y;
    x = (0, option_js_1.Some)(2);
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.and(y), (0, option_js_1.None)());
    x = (0, option_js_1.None)();
    y = (0, option_js_1.Some)("foo");
    (0, asserts_js_1.assertEquals)(x.and(y), (0, option_js_1.None)());
    x = (0, option_js_1.Some)(2);
    y = (0, option_js_1.Some)("foo");
    (0, asserts_js_1.assertEquals)(x.and(y), (0, option_js_1.Some)("foo"));
    x = (0, option_js_1.None)();
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.and(y), (0, option_js_1.None)());
});
dntShim.Deno.test("andThen", () => {
    function sqThenToString(x) {
        return (0, option_js_1.Some)((x * x).toString());
    }
    const some = (0, option_js_1.Some)(2);
    const none = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(some.andThen(sqThenToString), (0, option_js_1.Some)("4"));
    (0, asserts_js_1.assertEquals)(none.andThen(sqThenToString), (0, option_js_1.None)());
});
dntShim.Deno.test("contains", () => {
    const x = (0, option_js_1.Some)(2);
    (0, asserts_js_1.assertEquals)(x.contains(2), true);
    const y = (0, option_js_1.Some)(3);
    (0, asserts_js_1.assertEquals)(y.contains(2), false);
    const z = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(z.contains(2), false);
});
dntShim.Deno.test("expect", () => {
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(2).expect("foo"), 2);
    (0, asserts_js_1.assertThrows)(() => (0, option_js_1.None)().expect("foo"), Error, "foo");
});
dntShim.Deno.test("filter", () => {
    function isEven(n) {
        return n % 2 === 0;
    }
    (0, asserts_js_1.assertEquals)((0, option_js_1.None)().filter(isEven), (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(3).filter(isEven), (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(4).filter(isEven), (0, option_js_1.Some)(4));
});
dntShim.Deno.test("flatten", () => {
    const x = (0, option_js_1.Some)((0, option_js_1.Some)("foo"));
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)("foo"), x.flatten());
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)((0, option_js_1.None)(), y.flatten());
    const z = (0, option_js_1.Some)((0, option_js_1.Some)((0, option_js_1.Some)(6)));
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)((0, option_js_1.Some)(6)), z.flatten());
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(6), z.flatten().flatten());
});
dntShim.Deno.test("getOrInsert", () => {
    const x = (0, option_js_1.None)();
    const y = x.getOrInsert(7);
    (0, asserts_js_1.assertEquals)(x, (0, option_js_1.Some)(7));
    (0, asserts_js_1.assertEquals)(y, 7);
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)("foo").getOrInsert("bar"), "foo");
});
dntShim.Deno.test("getOrInsertWith", () => {
    const x = (0, option_js_1.None)();
    const y = x.getOrInsertWith(() => 8);
    (0, asserts_js_1.assertEquals)(x, (0, option_js_1.Some)(8));
    (0, asserts_js_1.assertEquals)(y, 8);
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)("foo").getOrInsertWith(() => "bar"), "foo");
});
dntShim.Deno.test("insert", () => {
    const opt = (0, option_js_1.None)();
    const val = opt.insert([1]);
    val[0] = 2;
    (0, asserts_js_1.assertEquals)(opt, (0, option_js_1.Some)([2]));
    (0, asserts_js_1.assertEquals)(val, [2]);
});
dntShim.Deno.test("inspect", () => {
    function callback(value) {
        console.log(value);
    }
    const inspectSpy = (0, mock_js_1.spy)(callback);
    (0, option_js_1.None)().inspect(inspectSpy);
    (0, option_js_1.Some)("foo").inspect(inspectSpy);
    (0, mock_js_1.assertSpyCall)(inspectSpy, 0, {
        args: ["foo"],
        returned: undefined,
    });
    (0, mock_js_1.assertSpyCalls)(inspectSpy, 1);
});
dntShim.Deno.test("isNone", () => {
    const x = (0, option_js_1.Some)(2);
    (0, asserts_js_1.assertEquals)(x.isNone(), false);
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(y.isNone(), true);
});
dntShim.Deno.test("isSome", () => {
    const x = (0, option_js_1.Some)(2);
    (0, asserts_js_1.assertEquals)(x.isSome(), true);
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(y.isSome(), false);
});
dntShim.Deno.test("isSomeAnd", () => {
    function predicate(value) {
        return value > 1;
    }
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(2).isSomeAnd(predicate), true);
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(0).isSomeAnd(predicate), false);
    (0, asserts_js_1.assertEquals)((0, option_js_1.None)().isSomeAnd(predicate), false);
});
dntShim.Deno.test("iter", () => {
    const x = (0, option_js_1.Some)(4);
    const iterX = x.iter();
    const x1 = iterX.next();
    (0, asserts_js_1.assertEquals)(x1.value, (0, option_js_1.Some)(4));
    (0, asserts_js_1.assertEquals)(x1.done, false);
    const x2 = iterX.next();
    (0, asserts_js_1.assertEquals)(x2.value, (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)(x2.done, true);
    const y = (0, option_js_1.None)();
    const iterY = y.iter();
    const y1 = iterY.next();
    (0, asserts_js_1.assertEquals)(y1.value, (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)(y1.done, true);
});
dntShim.Deno.test("map", () => {
    function callback(value) {
        return value.length;
    }
    const x = (0, option_js_1.Some)("foo");
    (0, asserts_js_1.assertEquals)(x.map(callback), (0, option_js_1.Some)(3));
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(y.map(callback), (0, option_js_1.None)());
});
dntShim.Deno.test("mapOr", () => {
    function callback(value) {
        return value.length;
    }
    const x = (0, option_js_1.Some)("foo");
    (0, asserts_js_1.assertEquals)(x.mapOr(12, callback), 3);
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(y.mapOr(12, callback), 12);
});
dntShim.Deno.test("mapOrElse", () => {
    function callback(value) {
        return value.length;
    }
    const x = (0, option_js_1.Some)("foo");
    (0, asserts_js_1.assertEquals)(x.mapOrElse(() => 12, callback), 3);
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(y.mapOrElse(() => 12, callback), 12);
});
dntShim.Deno.test("okOr", () => {
    const x = (0, option_js_1.Some)("foo");
    (0, asserts_js_1.assertEquals)(x.okOr(0), (0, result_js_1.Ok)("foo"));
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(y.okOr(0), (0, result_js_1.Err)(0));
});
dntShim.Deno.test("okOrElse", () => {
    const x = (0, option_js_1.Some)("foo");
    (0, asserts_js_1.assertEquals)(x.okOrElse(() => 0), (0, result_js_1.Ok)("foo"));
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(y.okOrElse(() => 0), (0, result_js_1.Err)(0));
});
dntShim.Deno.test("or", () => {
    let x;
    let y;
    x = (0, option_js_1.Some)(2);
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.or(y), (0, option_js_1.Some)(2));
    x = (0, option_js_1.None)();
    y = (0, option_js_1.Some)(100);
    (0, asserts_js_1.assertEquals)(x.or(y), (0, option_js_1.Some)(100));
    x = (0, option_js_1.Some)(2);
    y = (0, option_js_1.Some)(100);
    (0, asserts_js_1.assertEquals)(x.or(y), (0, option_js_1.Some)(2));
    x = (0, option_js_1.None)();
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.or(y), (0, option_js_1.None)());
});
dntShim.Deno.test("orElse", () => {
    function nobody() {
        return (0, option_js_1.None)();
    }
    function vikings() {
        return (0, option_js_1.Some)("vikings");
    }
    const none = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)("barbarians").orElse(vikings), (0, option_js_1.Some)("barbarians"));
    (0, asserts_js_1.assertEquals)(none.orElse(vikings), (0, option_js_1.Some)("vikings"));
    (0, asserts_js_1.assertEquals)(none.orElse(nobody), (0, option_js_1.None)());
});
dntShim.Deno.test("replace", () => {
    let x = (0, option_js_1.Some)(2);
    let old = x.replace(5);
    (0, asserts_js_1.assertEquals)(x, (0, option_js_1.Some)(5));
    (0, asserts_js_1.assertEquals)(old, (0, option_js_1.Some)(2));
    x = (0, option_js_1.None)();
    old = x.replace(3);
    (0, asserts_js_1.assertEquals)(x, (0, option_js_1.Some)(3));
    (0, asserts_js_1.assertEquals)(old, (0, option_js_1.None)());
});
dntShim.Deno.test("take", () => {
    let x = (0, option_js_1.Some)(2);
    let y = x.take();
    (0, asserts_js_1.assertEquals)(x, (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)(y, (0, option_js_1.Some)(2));
    x = (0, option_js_1.None)();
    y = x.take();
    (0, asserts_js_1.assertEquals)(x, (0, option_js_1.None)());
    (0, asserts_js_1.assertEquals)(y, (0, option_js_1.None)());
});
dntShim.Deno.test("transpose", () => {
    let x;
    let y;
    x = (0, result_js_1.Ok)((0, option_js_1.Some)(5));
    y = (0, option_js_1.Some)((0, result_js_1.Ok)(5));
    (0, asserts_js_1.assertEquals)(x, y.transpose());
    x = (0, result_js_1.Err)("foo");
    y = (0, option_js_1.Some)((0, result_js_1.Err)("foo"));
    (0, asserts_js_1.assertEquals)(x, y.transpose());
    x = (0, result_js_1.Ok)((0, option_js_1.None)());
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x, y.transpose());
});
dntShim.Deno.test("unwrap", () => {
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(2).unwrap(), 2);
    (0, asserts_js_1.assertThrows)(() => (0, option_js_1.None)().unwrap(), Error);
});
dntShim.Deno.test("unwrapOr", () => {
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)("foo").unwrapOr("bar"), "foo");
    const none = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(none.unwrapOr("bar"), "bar");
});
dntShim.Deno.test("unwrapOrElse", () => {
    const k = 10;
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)(4).unwrapOrElse(() => 2 * k), 4);
    const none = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(none.unwrapOrElse(() => 2 * k), 20);
});
dntShim.Deno.test("unwrapUnchecked", () => {
    (0, asserts_js_1.assertEquals)((0, option_js_1.Some)("foo").unwrapUnchecked(), "foo");
    (0, asserts_js_1.assertEquals)((0, option_js_1.None)().unwrapUnchecked(), undefined);
});
dntShim.Deno.test("unzip", () => {
    const x = (0, option_js_1.Some)([2, "foo"]);
    const y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.unzip(), [(0, option_js_1.Some)(2), (0, option_js_1.Some)("foo")]);
    (0, asserts_js_1.assertEquals)(y.unzip(), [(0, option_js_1.None)(), (0, option_js_1.None)()]);
});
dntShim.Deno.test("xor", () => {
    let x;
    let y;
    x = (0, option_js_1.Some)(2);
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.xor(y), (0, option_js_1.Some)(2));
    x = (0, option_js_1.None)();
    y = (0, option_js_1.Some)(3);
    (0, asserts_js_1.assertEquals)(x.xor(y), (0, option_js_1.Some)(3));
    x = (0, option_js_1.Some)(4);
    y = (0, option_js_1.Some)(5);
    (0, asserts_js_1.assertEquals)(x.xor(y), (0, option_js_1.None)());
    x = (0, option_js_1.None)();
    y = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.xor(y), (0, option_js_1.None)());
});
dntShim.Deno.test("zip", () => {
    const x = (0, option_js_1.Some)(2);
    const y = (0, option_js_1.Some)("foo");
    const z = (0, option_js_1.None)();
    (0, asserts_js_1.assertEquals)(x.zip(y), (0, option_js_1.Some)([2, "foo"]));
    (0, asserts_js_1.assertEquals)(x.zip(z), (0, option_js_1.None)());
});
dntShim.Deno.test("zipWith", () => {
    function Point(x, y) {
        return Object.create({ x, y });
    }
    const x = (0, option_js_1.Some)(1);
    const y = (0, option_js_1.Some)(2);
    (0, asserts_js_1.assertEquals)(x.zipWith(y, Point), (0, option_js_1.Some)(Point(1, 2)));
    (0, asserts_js_1.assertEquals)(x.zipWith((0, option_js_1.None)(), Point), (0, option_js_1.None)());
});
