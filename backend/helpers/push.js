import { Expo } from "expo-server-sdk";

const expo = new Expo();

export async function sendPush(tokens, title, body) {
  if (!tokens || tokens.length === 0) {
    return;
  }

  const groupedMessages = new Map();

  for (const tokenRow of tokens) {
    if (!Expo.isExpoPushToken(tokenRow.expo_push_token)) {
      continue;
    }

    if (!tokenRow.project_id) {
      continue;
    }

    if (!groupedMessages.has(tokenRow.project_id)) {
      groupedMessages.set(tokenRow.project_id, []);
    }

    groupedMessages.get(tokenRow.project_id).push({
      to: tokenRow.expo_push_token,
      sound: "default",
      title,
      body,
    });
  }

  for (const [projectId, messages] of groupedMessages.entries()) {
    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error(`push error for project ${projectId}. ${err.message}`);
      }
    }
  }
}
