import { useEffect, useState, FormEvent, KeyboardEvent } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { generateDerangement } from "../utils/derangement";

interface Lottery {
  id: string;
  ownerUserId: string;
  participants: string[];
  derangement: string[];
}

function Dashboard() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [lotteryStarted, setLotteryStarted] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    fetchLotteries();
  }, [user]);

  async function fetchLotteries() {
    if (!user) return;
    const q = query(collection(db, "lotteries"), where("ownerUserId", "==", user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lottery[];
    setLotteries(data);
  }

  const handleAddParticipant = () => {
    const trimmed = newParticipant.trim();
    if (trimmed && !lotteryStarted) {
      setParticipants([...participants, trimmed]);
      setNewParticipant("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddParticipant();
    }
  };

  async function handleStartLottery() {
    if (!user) return;
    if (participants.length < 2) {
      alert("Need at least 2 participants.");
      return;
    }
    const derangement = generateDerangement(participants);

    const docRef = await addDoc(collection(db, "lotteries"), {
      ownerUserId: user.uid,
      participants,
      derangement
    });

    alert(`Lottery created! Link: ${window.location.origin}/l/${docRef.id}`);
    setLotteryStarted(true);
    fetchLotteries();
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as {user?.email}</p>

      <h2>Create New Lottery</h2>
      <div>
        <ul>
          {participants.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
          {!lotteryStarted && (
            <li>
              <input
                type="text"
                placeholder="Add participant"
                value={newParticipant}
                onChange={e => setNewParticipant(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleAddParticipant}>Add</button>
            </li>
          )}
        </ul>

        {!lotteryStarted && (
          <button onClick={handleStartLottery} disabled={participants.length < 2}>
            Start Lottery
          </button>
        )}
      </div>

      <h2>Your Lotteries</h2>
      <ul>
        {lotteries.map(l => (
          <li key={l.id}>
            <a href={`/l/${l.id}`}>{l.id}</a> - {l.participants.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
