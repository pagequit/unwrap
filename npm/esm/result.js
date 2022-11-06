import { None, Some } from "./option.js";
export default class Result {
    constructor(value, discriminant) {
        Object.defineProperty(this, "variant0", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "variant1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "discriminant", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (discriminant === ResultType.Err) {
            this.variant0 = value;
            this.variant1 = undefined;
        }
        else {
            this.variant0 = undefined;
            this.variant1 = value;
        }
        this.discriminant = discriminant;
    }
    *[Symbol.iterator]() {
        if (this.isOk()) {
            yield Some(this.unwrap());
        }
        return None();
    }
    and(result) {
        return this.isErr() ? this : result;
    }
    andThen(callback) {
        return this.isErr() ? this : callback(this.variant1);
    }
    contains(value) {
        return this.isOk() && this.variant1 === value;
    }
    containsErr(value) {
        return this.isErr() && this.variant0 === value;
    }
    err() {
        return this.isErr() ? Some(this.variant0) : None();
    }
    expect(msg) {
        if (this.isErr()) {
            throw Error(msg);
        }
        return this.variant1;
    }
    expectErr(msg) {
        if (this.isOk()) {
            throw Error(msg);
        }
        return this.variant0;
    }
    flatten() {
        return this.andThen((value) => value);
    }
    inspect(callback) {
        this.isOk() && callback(this.variant1);
        return this;
    }
    inspectErr(callback) {
        this.isErr() && callback(this.variant0);
        return this;
    }
    isErr() {
        return this.discriminant === ResultType.Err;
    }
    isErrAnd(predicate) {
        return this.isErr() && predicate(this.variant0);
    }
    isOk() {
        return this.discriminant === ResultType.Ok;
    }
    isOkAnd(predicate) {
        return this.isOk() && predicate(this.variant1);
    }
    iter() {
        return this[Symbol.iterator]();
    }
    map(callback) {
        return this.isOk()
            ? Ok(callback(this.variant1))
            : Err(this.variant0);
    }
    mapErr(callback) {
        return this.isErr()
            ? Err(callback(this.variant0))
            : Ok(this.variant1);
    }
    mapOr(defaultValue, callback) {
        return this.isOk() ? callback(this.variant1) : defaultValue;
    }
    mapOrElse(defaultCallback, callback) {
        return this.isOk()
            ? callback(this.variant1)
            : defaultCallback(this.variant0);
    }
    ok() {
        return this.isOk() ? Some(this.variant1) : None();
    }
    or(result) {
        return this.isOk() ? this : result;
    }
    orElse(callback) {
        return this.isOk() ? this : callback(this.variant0);
    }
    transpose() {
        return this.isErr()
            ? Some(this)
            : (this.unwrap().isSome() ? Some(Ok(this.unwrap().unwrap())) : None());
    }
    unwrap() {
        return this.expect(`${this.variant1}`);
    }
    unwrapErr() {
        return this.expectErr(`${this.variant0}`);
    }
    unwrapErrUnchecked() {
        return this.variant0;
    }
    unwrapOr(defaultValue) {
        return this.isOk() ? this.variant1 : defaultValue;
    }
    unwrapOrElse(callback) {
        return this.isOk() ? this.variant1 : callback(this.variant0);
    }
    unwrapUnchecked() {
        return this.variant1;
    }
}
export var ResultType;
(function (ResultType) {
    ResultType[ResultType["Err"] = 0] = "Err";
    ResultType[ResultType["Ok"] = 1] = "Ok";
})(ResultType || (ResultType = {}));
export function Err(value) {
    return new Result(value, ResultType.Err);
}
export function Ok(value) {
    return new Result(value, ResultType.Ok);
}
