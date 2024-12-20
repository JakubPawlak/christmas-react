import { useEffect, useState, KeyboardEvent, FormEvent } from "react";
import { auth, db } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { generateDerangement } from "../utils/derangement";

interface Lottery {
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

function Dashboard() {
  const [newParticipant, setNewParticipant] = useState("");
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [selectedDraftLotteryId, setSelectedDraftLotteryId] = useState<string | null>(null);

  // Fields for creating a new draft lottery manually
  const [newLotteryYear, setNewLotteryYear] = useState<number>(new Date().getFullYear());
  const [newLotteryName, setNewLotteryName] = useState("");

  // Fields for filtering/searching
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [filterName, setFilterName] = useState("");

  // Fields for copying from a published lottery
  const [copySourceLottery, setCopySourceLottery] = useState<Lottery | null>(null);
  const [copyName, setCopyName] = useState("");
  const [copyYear, setCopyYear] = useState<number>(new Date().getFullYear());

  // Fields for editing draft lottery info (name/year)
  const [editName, setEditName] = useState("");
  const [editYear, setEditYear] = useState<number>(new Date().getFullYear());

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

  async function handleCreateDraft(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!newLotteryName.trim()) {
      alert("Please provide a name for the lottery.");
      return;
    }

    if (!newLotteryYear || isNaN(newLotteryYear) || newLotteryYear < 2000 || newLotteryYear > 2100) {
      alert("Please provide a valid year.");
      return;
    }

    const docRef = await addDoc(collection(db, "lotteries"), {
      ownerUserId: user.uid,
      participants: [],
      derangement: [],
      status: "draft",
      year: newLotteryYear,
      name: newLotteryName.trim(),
      revealedParticipants: [],
      createdAt: serverTimestamp()
    });
    setSelectedDraftLotteryId(docRef.id);
    setNewLotteryName("");
    setNewLotteryYear(new Date().getFullYear());
    fetchLotteries();
  }

  const handleAddParticipant = async () => {
    if (!selectedDraftLotteryId || !user) return;
    const trimmed = newParticipant.trim();
    if (!trimmed) return;

    const draftLottery = lotteries.find(l => l.id === selectedDraftLotteryId);
    if (!draftLottery || draftLottery.status !== "draft") return;

    // Check duplicates
    if (draftLottery.participants.map(p => p.toLowerCase()).includes(trimmed.toLowerCase())) {
      alert(`Participant "${trimmed}" already exists in this lottery.`);
      return;
    }

    const updatedParticipants = [...draftLottery.participants, trimmed];

    await updateDoc(doc(db, "lotteries", selectedDraftLotteryId), {
      participants: updatedParticipants
    });

    setNewParticipant("");
    fetchLotteries();
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleAddParticipant();
    }
  };

  async function handlePublishLottery() {
    if (!selectedDraftLotteryId || !user) return;

    const draftLottery = lotteries.find(l => l.id === selectedDraftLotteryId);
    if (!draftLottery || draftLottery.status !== "draft") return;

    if (draftLottery.participants.length < 2) {
      alert("Need at least 2 participants to publish.");
      return;
    }

    const derangement = generateDerangement(draftLottery.participants);

    await updateDoc(doc(db, "lotteries", selectedDraftLotteryId), {
      derangement,
      status: "published"
    });

    alert(`Lottery published! Link: ${window.location.origin}/l/${selectedDraftLotteryId}`);
    setSelectedDraftLotteryId(null);
    fetchLotteries();
  }

  async function handleDeleteDraftLottery(lotteryId: string) {
    if (!user) return;
    const lotteryToDelete = lotteries.find(l => l.id === lotteryId);
    if (!lotteryToDelete || lotteryToDelete.status !== "draft") {
      alert("You can only delete draft lotteries.");
      return;
    }

    // If currently editing this draft, deselect it
    if (selectedDraftLotteryId === lotteryId) {
      setSelectedDraftLotteryId(null);
    }

    await deleteDoc(doc(db, "lotteries", lotteryId));
    fetchLotteries();
  }

  function handleCopyAsDraft(lottery: Lottery) {
    // Set the source and prefill the form fields
    setCopySourceLottery(lottery);
    setCopyName(lottery.name);
    setCopyYear(new Date().getFullYear());
  }

  async function handleCreateDraftFromPublished(e: FormEvent) {
    e.preventDefault();
    if (!user || !copySourceLottery) return;

    if (!copyName.trim()) {
      alert("Please provide a name for the lottery.");
      return;
    }

    if (!copyYear || isNaN(copyYear) || copyYear < 2000 || copyYear > 2100) {
      alert("Please provide a valid year.");
      return;
    }

    // Copy participants from the published lottery
    const participantsToCopy = [...copySourceLottery.participants];

    const docRef = await addDoc(collection(db, "lotteries"), {
      ownerUserId: user.uid,
      participants: participantsToCopy,
      derangement: [],
      status: "draft",
      year: copyYear,
      name: copyName.trim(),
      revealedParticipants: [],
      createdAt: serverTimestamp()
    });

    alert("Draft lottery created successfully from the published one!");
    setSelectedDraftLotteryId(docRef.id);
    setCopySourceLottery(null);
    setCopyName("");
    setCopyYear(new Date().getFullYear());
    fetchLotteries();
  }

  // When selecting a draft to edit, load its name/year into edit states
  useEffect(() => {
    if (selectedDraftLotteryId) {
      const draft = lotteries.find(l => l.id === selectedDraftLotteryId && l.status === "draft");
      if (draft) {
        setEditName(draft.name);
        setEditYear(draft.year);
      }
    }
  }, [selectedDraftLotteryId, lotteries]);

  async function handleSaveDraftInfo() {
    if (!user || !selectedDraftLotteryId) return;

    if (!editName.trim()) {
      alert("Please provide a name.");
      return;
    }

    if (!editYear || isNaN(editYear) || editYear < 2000 || editYear > 2100) {
      alert("Please provide a valid year.");
      return;
    }

    await updateDoc(doc(db, "lotteries", selectedDraftLotteryId), {
      name: editName.trim(),
      year: editYear
    });

    alert("Draft info updated!");
    fetchLotteries();
  }

  const draftLotteries = lotteries.filter(l => l.status === "draft");
  let publishedLotteries = lotteries.filter(l => l.status === "published");

  const filteredDraftLotteries = draftLotteries.filter(l => {
    const lotName = l.name ?? "";
    const lotYear = typeof l.year === "number" ? l.year : 0;
    const matchesName = lotName.toLowerCase().includes(filterName.toLowerCase());
    const matchesYear = filterYear === "" || lotYear === filterYear;
    return matchesName && matchesYear;
  });

  const filteredPublishedLotteries = publishedLotteries
    .filter(l => {
      const lotName = l.name ?? "";
      const lotYear = typeof l.year === "number" ? l.year : 0;
      const matchesName = lotName.toLowerCase().includes(filterName.toLowerCase());
      const matchesYear = filterYear === "" || lotYear === filterYear;
      return matchesName && matchesYear;
    })
    .sort((a, b) => b.year - a.year);

  const selectedDraft = draftLotteries.find(l => l.id === selectedDraftLotteryId);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as {user?.email}</p>

      <h2>Create a Lottery</h2>
      {!selectedDraftLotteryId && !copySourceLottery && (
        <form onSubmit={handleCreateDraft} style={{ marginBottom: "20px" }}>
          <div>
            <label>
              Lottery Name:
              <input 
                type="text" 
                value={newLotteryName} 
                onChange={e => setNewLotteryName(e.target.value)} 
                placeholder="e.g. Family Christmas" 
              />
            </label>
          </div>
          <div>
            <label>
              Year:
              <input 
                type="number" 
                value={newLotteryYear} 
                onChange={e => setNewLotteryYear(Number(e.target.value))} 
                placeholder="e.g. 2023"
              />
            </label>
          </div>
          <button type="submit">Create Draft Lottery</button>
        </form>
      )}

      {copySourceLottery && !selectedDraftLotteryId && (
        <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
          <h3>Copy from Published Lottery: {copySourceLottery.name} ({copySourceLottery.year})</h3>
          <form onSubmit={handleCreateDraftFromPublished}>
            <div>
              <label>
                Lottery Name:
                <input 
                  type="text"
                  value={copyName}
                  onChange={e => setCopyName(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Year:
                <input 
                  type="number"
                  value={copyYear}
                  onChange={e => setCopyYear(Number(e.target.value))}
                />
              </label>
            </div>
            <button type="submit">Create Draft from Published</button>
            <button type="button" onClick={() => setCopySourceLottery(null)}>Cancel</button>
          </form>
        </div>
      )}

      {selectedDraft && (
        <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
          <h3>Editing Draft Lottery</h3>
          <div>
            <label>
              Name:
              <input 
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Year:
              <input 
                type="number"
                value={editYear}
                onChange={e => setEditYear(Number(e.target.value))}
              />
            </label>
          </div>
          <button onClick={handleSaveDraftInfo}>Save Draft Info</button>
          <br /><br />

          <h4>Participants</h4>
          <ul>
            {selectedDraft.participants.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
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
          </ul>

          <button
            onClick={handlePublishLottery}
            disabled={selectedDraft.participants.length < 2}
          >
            Publish Lottery
          </button>
          <button onClick={() => setSelectedDraftLotteryId(null)}>Close Draft Editing</button>
        </div>
      )}

      <h2>Filter Lotteries</h2>
      <div style={{ marginBottom: "20px" }}>
        <input 
          type="text"
          placeholder="Search by name..."
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input 
          type="number"
          placeholder="Filter by year..."
          value={filterYear === "" ? "" : filterYear}
          onChange={e => {
            const val = e.target.value;
            setFilterYear(val === "" ? "" : Number(val));
          }}
        />
      </div>

      <h2>Your Draft Lotteries</h2>
      <ul>
        {filteredDraftLotteries.map(l => {
          let createdDate = l.createdAt?.toDate ? l.createdAt.toDate() : null;
          return (
            <li key={l.id}>
              {l.name} ({l.year})
              {createdDate && <> - Created: {createdDate.toLocaleString()}</>}
              {" - Participants: "} 
              {l.participants.join(", ")}{" "}
              {selectedDraftLotteryId !== l.id && (
                <button onClick={() => setSelectedDraftLotteryId(l.id)}>Edit</button>
              )}
              <button onClick={() => handleDeleteDraftLottery(l.id)}>Delete</button>
            </li>
          );
        })}
      </ul>

      <h2>Your Published Lotteries</h2>
      <ul>
        {filteredPublishedLotteries.map(l => {
          const revealedCount = l.revealedParticipants ? l.revealedParticipants.length : 0;
          const totalCount = l.participants.length;
          let createdDate = l.createdAt?.toDate ? l.createdAt.toDate() : null;

          return (
            <li key={l.id}>
              {l.name} ({l.year})
              {createdDate && <> - Created: {createdDate.toLocaleString()}</>}
              {" - "}
              <a href={`/l/${l.id}`}>{l.id}</a>{" "}
              - Participants: {l.participants.join(", ")} <br />
              {revealedCount} out of {totalCount} participants have revealed their draws.
              <br />
              <button onClick={() => handleCopyAsDraft(l)}>Copy as Draft</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Dashboard;
