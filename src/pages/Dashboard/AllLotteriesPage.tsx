import { useLotteries } from '../../hooks/useLotteries';
import { Link } from 'react-router-dom';

function AllLotteriesPage() {
  const { draftLotteries, publishedLotteries, filterName, filterYear, setFilterName, setFilterYear, loading } = useLotteries();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>All Lotteries</h1>
      <div style={{ marginBottom: '20px' }}>
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
        {draftLotteries.map(l => (
          <li key={l.id}>
            {l.name} ({l.year}) - Participants: {l.participants.join(", ")}
            <Link to={`/dashboard/edit/${l.id}`} style={{ marginLeft: '10px' }}>Edit</Link>
          </li>
        ))}
      </ul>

      <h2>Your Published Lotteries</h2>
      <ul>
        {publishedLotteries.map(l => {
          const revealedCount = l.revealedParticipants ? l.revealedParticipants.length : 0;
          const totalCount = l.participants.length;

          return (
            <li key={l.id}>
              {l.name} ({l.year})  
              {" - Participants: "} {l.participants.join(", ")} <br />
              {revealedCount} out of {totalCount} participants have revealed their draws.
              <br />
              {/* Restore public lottery link: */}
              <a href={`/l/${l.id}`} target="_blank" rel="noopener noreferrer">View Public Lottery</a>
              <br />
              <Link to={`/dashboard/copy/${l.id}`}>Copy as Draft</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AllLotteriesPage;
