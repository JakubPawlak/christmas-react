import { Link } from 'react-router-dom';

function SideMenu() {
  return (
    <div style={{ width: '200px', background: '#f5f5f5', padding: '20px' }}>
      <h3>Menu</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/dashboard">All Lotteries</Link></li>
        <li><Link to="/dashboard/create">Create Lottery</Link></li>
      </ul>
    </div>
  );
}

export default SideMenu;
