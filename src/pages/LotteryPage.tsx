import { useEffect, useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface LotteryData {
  ownerUserId: string;
  participants: string[];
  derangement: string[];
}

function LotteryPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const [lottery, setLottery] = useState<LotteryData | null>(null);
  const [name, setName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLottery() {
      if (!publicId) return;
      const ref = doc(db, "lotteries", publicId);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setLottery(snapshot.data() as LotteryData);
      } else {
        setError("Lottery not found.");
      }
    }
    fetchLottery();
  }, [publicId]);

  function handleCheck(e: FormEvent) {
    e.preventDefault();
    if (!lottery) return;
    const idx = lottery.participants.indexOf(name);
    if (idx === -1) {
      setResult(null);
      setError("You are not in the participant list.");
    } else {
      setError(null);
      setResult(lottery.derangement[idx]);
    }
  }

  if (!lottery && !error) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Lottery</h1>
      <p>Enter your name to see who you got!</p>
      <form onSubmit={handleCheck}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
        <button type="submit">Check</button>
      </form>
      {result && <p>You got: {result}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default LotteryPage;
