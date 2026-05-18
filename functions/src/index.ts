import { initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();

const db = getFirestore();
const BATCH_LIMIT = 500;

export const dispatchScheduledMessages = onSchedule(
  {
    schedule: "* * * * *",
    region: "southamerica-east1",
    timeZone: "America/Sao_Paulo"
  },
  async () => {
    const now = Timestamp.now();
    const snapshot = await db
      .collection("messages")
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .limit(BATCH_LIMIT)
      .get();

    if (snapshot.empty) {
      logger.info("No scheduled messages ready to dispatch.");
      return;
    }

    const batch = db.batch();

    snapshot.docs.forEach((message) => {
      batch.update(message.ref, {
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    logger.info("Scheduled messages dispatched.", {
      count: snapshot.size
    });
  }
);
