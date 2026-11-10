import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import type { CircleFeedType } from "../types/circleFeed";

const FEED_COLLECTION = "circle_feed";

interface PostToCirclesParams {
  goerUid: string;
  username: string;
  type: CircleFeedType;
  happeningId?: string;
  happeningTitle?: string;
  /** Only post to these Circles; defaults to every Circle the Goer is in */
  circleIds?: string[];
}

export const circleFeedService = {
  /**
   * Adds an item to the "What We're Doing" feed of the Goer's Circles.
   * Never throws: the feed is a nice-to-have and must not break RSVP or check-in.
   */
  async postToMyCircles({
    goerUid,
    username,
    type,
    happeningId,
    happeningTitle,
    circleIds,
  }: PostToCirclesParams): Promise<void> {
    try {
      let targets = circleIds;
      if (!targets) {
        const goerSnap = await getDoc(doc(db, "goers", goerUid));
        targets = (goerSnap.data()?.circles as string[] | undefined) ?? [];
      }
      await Promise.all(
        targets.map((circleId) =>
          addDoc(collection(db, FEED_COLLECTION), {
            circle_id: circleId,
            goer_uid: goerUid,
            username,
            type,
            ...(happeningId ? { happening_id: happeningId } : {}),
            ...(happeningTitle ? { happening_title: happeningTitle } : {}),
            created_at: serverTimestamp(),
          })
        )
      );
    } catch (err) {
      console.warn("Could not post to Circle feed", err);
    }
  },
};
