/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server"
import type * as collectors_makro from "../collectors/makro.js"
import type * as collectors_makroParse from "../collectors/makroParse.js"
import type * as crons from "../crons.js"
import type * as deals from "../deals.js"
import type * as lib_catalog from "../lib/catalog.js"
import type * as lib_dealFields from "../lib/dealFields.js"
import type * as stores from "../stores.js"

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "collectors/makro": typeof collectors_makro
  "collectors/makroParse": typeof collectors_makroParse
  crons: typeof crons
  deals: typeof deals
  "lib/catalog": typeof lib_catalog
  "lib/dealFields": typeof lib_dealFields
  stores: typeof stores
}>
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>
