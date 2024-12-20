import { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLotteries } from '../../hooks/useLotteries';

function CopyLotteryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLotteryById, lottery, loading, copyPublished } = useLotteries();
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (id) {
      getLotteryById(id);
    }
  }, [id]);

  useEffect(() => {
    if (lottery && lottery.status === "published") {
      setName(lottery.name);
      setYear(new Date().getFullYear());
    }
  }, [lottery]);

  if (loading) return <p>Loading...</p>;
  if (!lottery) return <p>Lottery not found.</p>;
  if (lottery.status !== "published") return <p>Can only copy from published lotteries.</p>;

  async function handleCopy(e: FormEvent) {
    e.preventDefault();
    const newId = await copyPublished(lottery.id, name, year);
    alert("Draft created from published lottery!");
    navigate(`/dashboard/edit/${newId}`);
  }

  return (
    <div>
      <h1>Copy Published Lottery to Draft</h1>
      <p>Source: {lottery.name} ({lottery.year})</p>
      <form onSubmit={handleCopy}>
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
        <button type="submit">Create Draft</button>
      </form>
    </div>
  );
}

export default CopyLotteryPage;
