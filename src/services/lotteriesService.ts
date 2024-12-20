import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDoc 
} from "firebase/firestore";
import { generateDerangement } from '../utils/derangement';

export interface Lottery {
  id: string;
  ownerUserId: string;
  participants: string[];
  derangement: string[];
  status: "draft" | "published";
  year: number;
  name: string;
  revealedParticipants?: string[];
  createdAt?: any; // Firestore Timestamp
}

async function fetchLotteriesByUser(userId: string): Promise<Lottery[]> {
  const q = query(collection(db, "lotteries"), where("ownerUserId", "==", userId));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Lottery[];
  return data;
}

async function createDraftLottery(userId: string, name: string, year: number): Promise<string> {
  const docRef = await addDoc(collection(db, "lotteries"), {
    ownerUserId: userId,
    participants: [],
    derangement: [],
    status: "draft",
    year,
    name: name.trim(),
    revealedParticipants: [],
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

async function getLottery(id: string): Promise<Lottery | null> {
  const ref = doc(db, "lotteries", id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Lottery;
}

async function updateLotteryInfo(id: string, name: string, year: number) {
  const ref = doc(db, "lotteries", id);
  await updateDoc(ref, { name: name.trim(), year });
}

async function addParticipantToLottery(id: string, participant: string) {
  const lottery = await getLottery(id);
  if (!lottery) return;
  // Check duplicates on service level as well if desired
  if (lottery.participants.map(p => p.toLowerCase()).includes(participant.toLowerCase())) {
    throw new Error(`Participant "${participant}" already exists.`);
  }
  
  const ref = doc(db, "lotteries", id);
  await updateDoc(ref, {
    participants: [...lottery.participants, participant]
  });
}

async function removeParticipantFromLottery(id: string, participant: string) {
  const lottery = await getLottery(id);
  if (!lottery) return;
  const updatedParticipants = lottery.participants.filter(p => p !== participant);
  const ref = doc(db, "lotteries", id);
  await updateDoc(ref, {
    participants: updatedParticipants
  });
}

async function publishLottery(id: string) {
  const lottery = await getLottery(id);
  if (!lottery) return;
  if (lottery.participants.length < 2) throw new Error("Need at least 2 participants to publish.");
  const derangement = generateDerangement(lottery.participants);
  const ref = doc(db, "lotteries", id);
  await updateDoc(ref, {
    derangement,
    status: "published"
  });
}

async function deleteDraftLottery(id: string) {
  await deleteDoc(doc(db, "lotteries", id));
}

async function copyPublishedToDraft(userId: string, sourceLotteryId: string, name: string, year: number) {
  const source = await getLottery(sourceLotteryId);
  if (!source) throw new Error("Source lottery not found.");
  if (source.status !== "published") throw new Error("Can only copy from published lotteries.");
  
  const docRef = await addDoc(collection(db, "lotteries"), {
    ownerUserId: userId,
    participants: [...source.participants],
    derangement: [],
    status: "draft",
    year,
    name: name.trim(),
    revealedParticipants: [],
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

export const lotteriesService = {
  fetchLotteriesByUser,
  createDraftLottery,
  getLottery,
  updateLotteryInfo,
  addParticipantToLottery,
  removeParticipantFromLottery,
  publishLottery,
  deleteDraftLottery,
  copyPublishedToDraft
};
