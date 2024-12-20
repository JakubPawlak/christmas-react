// src/pages/LotteryPage.tsx
import { useEffect, useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

interface LotteryData {
  ownerUserId: string;
  participants: string[];
  derangement: string[];
  status: "draft" | "published";
  year: number;
  name: string;
  revealedParticipants?: string[];
  createdAt?: any; 
}

function LotteryPage() {
  const { id } = useParams<{ id: string }>();
  const [lottery, setLottery] = useState<LotteryData | null>(null);
  const [name, setName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLottery() {
      if (!id) return;
      setLoading(true);
      const ref = doc(db, "lotteries", id);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setLottery(snapshot.data() as LotteryData);
      } else {
        setError("Lottery not found.");
      }
      setLoading(false);
    }
    fetchLottery();
  }, [id]);

  async function handleCheck(e: FormEvent) {
    e.preventDefault();
    if (!lottery || !id) return;

    if (lottery.status === "draft") {
      setError("This lottery is not yet published. Please check back later.");
      setResult(null);
      return;
    }

    const idx = lottery.participants.indexOf(name);
    if (idx === -1) {
      setResult(null);
      setError("You are not in the participant list.");
      return;
    }

    // Check if participant already revealed
    const alreadyRevealed = lottery.revealedParticipants?.includes(name);
    if (alreadyRevealed) {
      setResult(null);
      setError("You have already checked your draw.");
      return;
    }

    // If not revealed, show result and update Firestore
    const drawnName = lottery.derangement[idx];
    setResult(drawnName);
    setError(null);

    // Update Firestore to add this participant to revealedParticipants
    const ref = doc(db, "lotteries", id);
    await updateDoc(ref, {
      revealedParticipants: arrayUnion(name)
    });

    // Update local state
    setLottery({
      ...lottery,
      revealedParticipants: [...(lottery.revealedParticipants ?? []), name]
    });
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!lottery) return <p>Lottery not found.</p>;

  if (lottery.status === "draft") {
    return <p>This lottery is currently in draft mode and not published yet.</p>;
  }

  return (
    <div>
      <h1>{lottery.name} ({lottery.year}) Lottery</h1>
      <p>Enter your name to see who you got (one-time only):</p>
      <form onSubmit={handleCheck}>
        <input 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Your name"
        />
        <button type="submit">Check</button>
      </form>
      {result && <p>You got: {result}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default LotteryPage;
