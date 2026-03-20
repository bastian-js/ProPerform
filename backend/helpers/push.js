import { Expo } from "expo-server-sdk";

const expo = new Expo();

export async function sendPush(tokens, title, body) {
  if (!tokens || tokens.length === 0) {
    return;
  }

  const messages = tokens
    .filter((t) => Expo.isExpoPushToken(t.expo_push_token))
    .map((t) => ({ to: t.expo_push_token, sound: "default", title, body }));

  if (messages.length === 0) {
    return;
  }

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("push error. " + err.message);
    }
  }
}
