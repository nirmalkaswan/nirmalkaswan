import { Link } from 'react-router-dom'; // You missed importing Link
import UserList from './UserList';

export default function Users() {
  return (
    <div className="space-y-6 p-4">
      <Link 
        to="/adduser" 
        className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        ➕ Add User
      </Link>

      <h2 className="text-2xl font-bold text-blue-600 mt-10">📋 User List</h2>
      <UserList />
    </div>
  );
}
