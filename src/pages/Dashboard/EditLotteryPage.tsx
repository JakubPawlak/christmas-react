import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, KeyboardEvent } from 'react';
import { useLotteries } from '../../hooks/useLotteries';

function EditLotteryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLotteryById, updateLotteryInfo, addParticipant, removeParticipant, publishLottery, lottery, loading } = useLotteries();
  const [editName, setEditName] = useState("");
  const [editYear, setEditYear] = useState<number>(new Date().getFullYear());
  const [newParticipant, setNewParticipant] = useState("");

  useEffect(() => {
    if (id) {
      getLotteryById(id);
    }
  }, [id]);

  useEffect(() => {
    if (lottery && lottery.status === "draft") {
      setEditName(lottery.name);
      setEditYear(lottery.year);
    }
  }, [lottery]);

  if (loading) return <p>Loading...</p>;
  if (!lottery) return <p>Lottery not found.</p>;
  if (lottery.status !== "draft") return <p>Cannot edit a published lottery.</p>;

  async function handleSaveInfo() {
    await updateLotteryInfo(lottery.id, editName, editYear);
    alert("Draft info updated!");
  }

  async function handleAdd() {
    if (newParticipant.trim()) {
      await addParticipant(lottery.id, newParticipant.trim());
      setNewParticipant("");
    }
  }

  async function handleRemoveParticipant(p: string) {
    await removeParticipant(lottery.id, p);
  }

  async function handlePublish() {
    await publishLottery(lottery.id);
    navigate("/dashboard");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div>
      <h1>Editing Draft Lottery</h1>
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
      <button onClick={handleSaveInfo}>Save Draft Info</button>

      <h4>Participants</h4>
      <ul>
        {lottery.participants.map((p, i) => (
          <li key={i}>
            {p} <button onClick={() => handleRemoveParticipant(p)}>Remove</button>
          </li>
        ))}
        <li>
          <input
            type="text"
            placeholder="Add participant"
            value={newParticipant}
            onChange={e => setNewParticipant(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleAdd}>Add</button>
        </li>
      </ul>

      <button onClick={handlePublish} disabled={lottery.participants.length < 2}>
        Publish Lottery
      </button>
      <button onClick={() => navigate("/dashboard")}>Back</button>
    </div>
  );
}

export default EditLotteryPage;
