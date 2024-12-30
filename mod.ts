import { decodeBase64, encodeBase64Url } from "jsr:@std/encoding";

/**
 * Create a json web token for Apple Notification
 *
 * @returns json web token
 *
 * @example
 * ```ts
 * const secret = Deno.env.get("APPLE_NOTIFICATION_SECRET");
 * if(!secret) {
 *   throw new Error("APPLE_NOTIFICATION_SECRET is not found");
 * }
 *
 * const jwt = await createAppleNotificationJwt({
 *   secret,
 *   iat: new Date(),
 *   iss: "FLM12NG8W1",
 *   kid: "U7TYW1FV9W",
 * });
 *
 * await fetch(
 *   isProduction
 *     ? `https://api.push.apple.com:443/3/device/${deviceToken}`
 *     : `https://api.development.push.apple.com:443/3/device/${deviceToken}`,
 *   {
 *     method: "POST",
 *     headers: {
 *       "apns-topic": "com.example.app",
 *       "apns-push-type": "alert",
 *       "apns-priority": "10",
 *       "apns-expiration": "0",
 *       "apns-id": apnsId,
 *       "apns-collapse-id": apnsCollapseId,
 *       "content-type": "application/json",
 *       authorization: `Bearer ${jwt}`,
 *     },
 *     body: JSON.stringify({ aps }),
 *   },
 * );
 * ```
 */
export const createAppleNotificationJwt = async (
  { secret, iat, kid, iss }: {
    /**
     * Private key in pkcs8 format
     *
     * remove `-----BEGIN PUBLIC KEY-----`, `-----END PUBLIC KEY-----`, and newlines
     *
     * @example
     * ```
     * `MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgo72HR/apP7rVzt/DdCLcUvzjGvD1pSX5JBrl0pDcK5ihRANCAAQTLLGRWcATb4g7/ie1pHIuhgWGh9dUX/0rT6wTZlTm60MWPW+NmrtyR06YwY1T7KH4Sj/wARXGyG9c/frZOo/k`
     * ```
     */
    readonly secret: string;

    /**
     * Issued At
     */
    readonly iat: Date;

    /**
     * Key ID
     */
    readonly kid: string;
    /**
     * Issuer
     */
    readonly iss: string;
  },
): Promise<string> => {
  return await createP8Jwt({
    secret,
    // https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns#Create-and-encrypt-your-JSON-token
    header: {
      kid,
      alg: "ES256",
    },
    payload: {
      iat: Math.floor(iat.getTime() / 1000),
      iss,
    },
  });
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { readonly [k in string]: JsonValue }
  | ReadonlyArray<JsonValue>;

const createP8Jwt = async (
  { header, payload, secret }: {
    readonly header: JsonValue;
    readonly payload: JsonValue;
    readonly secret: string;
  },
): Promise<string> => {
  const message = `${encodeBase64Url(JSON.stringify(header))}.${
    encodeBase64Url(JSON.stringify(payload))
  }`;
  const signature = await sign({ secret, message });
  return `${message}.${signature}`;
};

const sign = async (
  { secret, message }: { readonly secret: string; readonly message: string },
): Promise<string> => {
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    decodeBase64(secret),
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    cryptoKey,
    new TextEncoder().encode(message),
  );

  return encodeBase64Url(signature);
};
