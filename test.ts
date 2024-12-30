import { assert, assertStringIncludes } from "jsr:@std/assert";
import { createAppleNotificationJwt } from "./mod.ts";
import { decodeBase64Url, encodeBase64 } from "jsr:@std/encoding";

Deno.test("generate and verify jwt", async () => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );

  const secret = encodeBase64(
    await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    ),
  );

  console.group("=== secret ===");
  console.log(`-----BEGIN PRIVATE KEY-----
${
    secret.match(/.{1,64}/g)
      ?.join("\n")
  }
-----END PRIVATE KEY-----`);
  console.groupEnd();

  const jwt = await createAppleNotificationJwt({
    secret,
    iat: new Date("2022-12-29T11:00:00Z"),
    iss: "FLM12NG8W1",
    kid: "U7TYW1FV9W",
  });

  console.group("=== jwt ===");
  console.log(jwt);
  console.groupEnd();

  assertStringIncludes(
    jwt,
    "eyJraWQiOiJVN1RZVzFGVjlXIiwiYWxnIjoiRVMyNTYifQ.eyJpYXQiOjE2NzIzMTE2MDAsImlzcyI6IkZMTTEyTkc4VzEifQ.",
  );
  const signature = jwt.split(".")[2];
  if (!signature) {
    throw new Error("signature is not found");
  }

  const isValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    keyPair.publicKey,
    decodeBase64Url(signature),
    new TextEncoder().encode(
      "eyJraWQiOiJVN1RZVzFGVjlXIiwiYWxnIjoiRVMyNTYifQ.eyJpYXQiOjE2NzIzMTE2MDAsImlzcyI6IkZMTTEyTkc4VzEifQ",
    ),
  );
  assert(isValid);
});
