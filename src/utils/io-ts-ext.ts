import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import BigNumberImpl from 'bignumber.js';
export * from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { Base64 } from 'js-base64';

/**
 * Type lambda returning a union of key names from input type P having type A
 */
export type FieldsWith<A, P> = {
  [K in keyof P]-?: A extends P[K] ? K : never;
}[keyof P];

/**
 * Dual for FieldsWith - returns the rest of the fields
 */
export type FieldsWithout<A, P> = Exclude<keyof P, FieldsWith<A, P>>;

/**
 * Typa lambda returning new type with all fields within P having type U marked as optional
 */
export type MakeOptional<P, U = undefined> = Pick<P, FieldsWithout<U, P>> &
  Partial<Pick<P, FieldsWith<U, P>>>;

/**
 * Fix signature by marking all fields with undefined as optional
 */
export function fixOptionals<C extends t.Mixed>(
  c: C,
): t.Type<MakeOptional<t.TypeOf<C>>, t.OutputOf<C>, t.InputOf<C>> {
  return c;
}

/**
 * Just an alias for T | undefined coded
 */
export function optional<C extends t.Mixed>(
  c: C,
): t.UnionC<[t.UndefinedC, t.NullC, C]> {
  return t.union([t.undefined, t.null, c], `${c.name}?`);
}

/** Support for query arguments in the browser */
export function QueryArgs<P extends t.Props>(
  props: P,
  name?: string,
): t.Type<t.TypeOf<t.TypeC<P>>, { [k: string]: string }, unknown> {
  const typ = t.type(props, name);
  return new t.Type<t.TypeOf<t.TypeC<P>>, { [k: string]: string }, unknown>(
    `QueryArgs<{name ?? '?'}>`,
    (u): u is t.TypeOf<t.TypeC<P>> => typ.is(u),
    (s, c) => {
      if (s == null) {
        return t.failure(s, c, 'Expected non-null value');
      }
      if (typeof s !== 'object') {
        return t.failure(s, c, 'Expected a JSON object');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out: Record<string, any> = { ...s };
      for (const k in out) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument
          out[k] = JSON.parse(out[k]);
        } catch (e: unknown) {
          return t.failure(s, c, 'Expected a valid JSON object');
        }
      }
      return typ.decode(out);
    },
    (a) => {
      // we stringify each key as all query args are interpreted as strings.
      const out = typ.encode(a);
      for (const k in out) {
        out[k] = JSON.stringify(out[k]);
      }
      return out;
    },
  );
}

//------------------------------------------------------------------------------
// BigNumber support
//------------------------------------------------------------------------------
export const BigNumber = new t.Type<BigNumberImpl, string, unknown>(
  'BigNumber',
  (u): u is BigNumberImpl => u instanceof BigNumberImpl,
  (s, c) => {
    if (typeof s === 'string') {
      const n = new BigNumberImpl(s);
      if (n.isNaN()) {
        return t.failure(s, c, 'Invalid BigNumber');
      }
      return t.success(n);
    }
    return t.failure(s, c, 'Expected base-10 encoded BigNumber');
  },
  (a) => a.toString(10),
);
export type BigNumber = t.TypeOf<typeof BigNumber>;

export function toJSONString<A>(type: t.Encoder<A, unknown>, input: A): string {
  return JSON.stringify(type.encode(input));
}

export function fromJSONString<A>(
  type: t.Decoder<unknown, A>,
  input: string,
  ctx: t.Context = [],
): t.Validation<A> {
  let json: unknown;
  try {
    json = JSON.parse(input);
  } catch (e: unknown) {
    return t.failure(input, ctx, 'Invalid JSON');
  }
  return type.decode(json);
}

export function fromJSONString2<A>(
  type: t.Decoder<unknown, A>,
  input: unknown,
  ctx: t.Context = [],
): t.Validation<A> {
  if (typeof input !== 'string') {
    return t.failure(input, ctx, 'Not a JSON string');
  }
  return fromJSONString(type, input, ctx);
}

export function toEither<T>(v: t.Validation<T>): E.Either<string, T> {
  return E.mapLeft(() => PathReporter.report(v).join(', '))(v);
}

// B64 backed Uint8Array
export const B64U8a = new t.Type<Uint8Array, string, unknown>(
  'B64U8a',
  (u): u is Uint8Array => tagOf(u) === 'Uint8Array',
  (s, c) =>
    typeof s === 'string'
      ? t.success(Base64.toUint8Array(s))
      : t.failure(s, c, 'Expected base64 encoded string'),
  (a) => Base64.fromUint8Array(a),
);

function tagOf(u: unknown): string {
  return Object.prototype.toString.call(u).slice(8, -1);
}
