import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, push } from "firebase/database";
import { db, rtdb } from "./firebase";

export async function addVisitor(visitorData: { [s: string]: unknown; } | ArrayLike<unknown>) {
  try {
    const sanitizedData = Object.fromEntries(
      Object.entries(visitorData).filter(
        ([_, value]) =>
          value !== undefined &&
          typeof value !== "function" &&
          typeof value !== "symbol"
      )
    );

    const docRef = await addDoc(collection(db, "visitors"), {
      ...sanitizedData,
      timestamp: serverTimestamp(), 
    });

    await push(ref(rtdb, "visitors"), {
      ...sanitizedData,
      timestamp: new Date().toISOString(), 
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding visitor:", error);
    throw error;
  }
}
