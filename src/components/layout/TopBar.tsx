import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

function TopBar() {
  const user = auth.currentUser;

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/signin";
  }

  return (
    <div style={{ background: '#eee', padding: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <span>{user?.email}</span>
      <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
    </div>
  );
}

export default TopBar;
