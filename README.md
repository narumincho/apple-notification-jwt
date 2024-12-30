# @narumincho/apple-notification-jwt

## Example

Generate an "Apple Push Notifications service (APNs)" key from the
[Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list).

You will download a file containing a private key, such as:

`AuthKey_U7TYW1FV9W.p8`

```
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgo72HR/apP7rVzt/D
dCLcUvzjGvD1pSX5JBrl0pDcK5ihRANCAAQTLLGRWcATb4g7/ie1pHIuhgWGh9dU
X/0rT6wTZlTm60MWPW+NmrtyR06YwY1T7KH4Sj/wARXGyG9c/frZOo/k
-----END PRIVATE KEY-----
```

Remove -----BEGIN PRIVATE KEY-----, -----END PRIVATE KEY-----, and line breaks,
leaving:

`MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgo72HR/apP7rVzt/DdCLcUvzjGvD1pSX5JBrl0pDcK5ihRANCAAQTLLGRWcATb4g7/ie1pHIuhgWGh9dUX/0rT6wTZlTm60MWPW+NmrtyR06YwY1T7KH4Sj/wARXGyG9c/frZOo/k`

Set this value in the environment variable APPLE_NOTIFICATION_SECRET.

![issAndApnsTopic](./image/issAndApnsTopic.png)

You can then send notifications using the following code:

```ts
import { createAppleNotificationJwt } from "jsr:@narumincho/apple-notification-jwt";

const secret = Deno.env.get("APPLE_NOTIFICATION_SECRET");
if (!secret) {
  throw new Error("APPLE_NOTIFICATION_SECRET is not found");
}

const jwt = await createAppleNotificationJwt({
  secret,
  iat: new Date(),
  iss: "FLM12NG8W1", // Your Apple Developer Team ID
  kid: "U7TYW1FV9W", // Key ID from the generated key
});

await fetch(
  isProduction
    ? `https://api.push.apple.com:443/3/device/${deviceToken}`
    : `https://api.development.push.apple.com:443/3/device/${deviceToken}`,
  {
    method: "POST",
    headers: {
      "apns-topic": "com.example.app",
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-expiration": "0",
      "content-type": "application/json",
      authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      aps: {
        alert: {
          title: "Test Notification",
          body: "This is a test notification.",
        },
      },
    }),
  },
);
```

### Notes

- Tokens older than 60 minutes cannot be used.
  [Apple Documentation](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns#Refresh-your-token-regularly)
- Avoid generating multiple tokens within 20 minutes. Reuse existing tokens when
  possible.

## 例

https://developer.apple.com/account/resources/authkeys/list から「Apple Push
Notifications service (APNs)」を有効にした鍵を生成します

以下のような秘密鍵が含まれたファイルがダウンロードされます

`AuthKey_U7TYW1FV9W.p8`

```
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgo72HR/apP7rVzt/D
dCLcUvzjGvD1pSX5JBrl0pDcK5ihRANCAAQTLLGRWcATb4g7/ie1pHIuhgWGh9dU
X/0rT6wTZlTm60MWPW+NmrtyR06YwY1T7KH4Sj/wARXGyG9c/frZOo/k
-----END PRIVATE KEY-----
```

`-----BEGIN PRIVATE KEY-----`, `-----END PRIVATE KEY-----` と改行を取り除いた

`MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgo72HR/apP7rVzt/DdCLcUvzjGvD1pSX5JBrl0pDcK5ihRANCAAQTLLGRWcATb4g7/ie1pHIuhgWGh9dUX/0rT6wTZlTm60MWPW+NmrtyR06YwY1T7KH4Sj/wARXGyG9c/frZOo/k`

を利用する環境の環境変数 APPLE_NOTIFICATION_SECRET に設定します

![issAndApnsTopic](./image/issAndApnsTopic.png)

以下のようなコードで通知を呼び出せます

```ts
import { createAppleNotificationJwt } from "jsr:@narumincho/apple-notification-jwt";

const secret = Deno.env.get("APPLE_NOTIFICATION_SECRET");
if (!secret) {
  throw new Error("APPLE_NOTIFICATION_SECRET is not found");
}

const jwt = await createAppleNotificationJwt({
  secret,
  iat: new Date(),
  iss: "FLM12NG8W1",
  kid: "U7TYW1FV9W",
});

await fetch(
  isProduction
    ? `https://api.push.apple.com:443/3/device/${deviceToken}`
    : `https://api.development.push.apple.com:443/3/device/${deviceToken}`,
  {
    method: "POST",
    headers: {
      "apns-topic": "com.example.app",
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-expiration": "0",
      "content-type": "application/json",
      authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      aps: {
        alert: {
          title: "テスト通知です",
          body: "テスト通知の本文です",
        },
      },
    }),
  },
);
```

### 注意

https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns#Refresh-your-token-regularly
に書かれているように

- 60分以上 昔に生成したものは使えません
- 20分以内に複数のキーを生成するのは避け, 使い回すようにしてください
