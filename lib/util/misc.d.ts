import { SetOptional } from 'type-fest';

declare global {
  type IsUndefined<T> = undefined extends T ? true : false

  type NonNullableObject<T> = T extends Record<string, unknown>
    ? Required<{ [key in keyof T]: NonNullableObject<T[key]> }>
    : T extends Array<infer R>
    ? Array<NonNullableObject<R>>
    : NonNullable<T>

  type MakeOptionalObject<T> = T extends Record<string, unknown>
    ? SetOptional<{ [key in keyof T]: MakeOptionalObject<T[key]> }, NonNullable<{ [key in keyof T]: undefined extends T[key] ? key : never }[keyof T]>>
    : T extends Array<infer R>
    ? Array<MakeOptionalObject<R>>
    : T
}