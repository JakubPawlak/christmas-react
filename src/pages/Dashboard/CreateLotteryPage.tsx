import { useState, FormEvent } from 'react';
import { useLotteries } from '../../hooks/useLotteries';
import { useNavigate } from 'react-router-dom';

function CreateLotteryPage() {
  const { createDraftLottery } = useLotteries();
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const draftId = await createDraftLottery(name, year);
    navigate(`/dashboard/edit/${draftId}`);
  }

  return (
    <div>
      <h1>Create Draft Lottery</h1>
      <form onSubmit={handleCreate}>
        <div>
          <label>
            Lottery Name:
            <input 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Year:
            <input 
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            />
          </label>
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateLotteryPage;
