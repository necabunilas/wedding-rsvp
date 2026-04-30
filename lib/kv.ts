import { createClient, type VercelKV } from "@vercel/kv";

const url =
  process.env.UPSTASH_KV_REST_API_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

export const isKvConfigured = !!(url && token);

const client = isKvConfigured ? createClient({ url: url!, token: token! }) : null;

export const kv: VercelKV = new Proxy({} as VercelKV, {
  get(_target, prop) {
    if (!client) {
      throw new Error(
        "KV is not configured. Set UPSTASH_KV_REST_API_URL and UPSTASH_KV_REST_API_TOKEN (or the legacy KV_REST_API_URL / KV_REST_API_TOKEN)."
      );
    }
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});
