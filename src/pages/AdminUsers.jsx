import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({});
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get("/admin/users", { params: { page, limit: 20, search } });
            setUsers(res.data.data);
            setMeta(res.data.meta);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(1); }, []);

    const changeRole = async (userId, roles) => {
        await api.post("/admin/users/role", { userId, roles });
        fetchUsers(meta.page || 1);
    };

    const blockUser = async (userId) => {
        await api.post("/admin/users/block", { userId, reason: "Blocked by admin" });
        fetchUsers(meta.page || 1);
    };

    const unblockUser = async (userId) => {
        await api.post("/admin/users/unblock", { userId });
        fetchUsers(meta.page || 1);
    };

    const invalidateSessions = async (userId) => {
        await api.post("/admin/users/invalidate-sessions", { userId });
        alert("User sessions invalidated");
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Admin — Users</h2>
            <div style={{ marginBottom: 12 }}>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email" />
                <button onClick={() => fetchUsers(1)} style={{ marginLeft: 8 }}>Search</button>
            </div>

            {loading ? <div>Loading...</div> : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr><th>Email</th><th>Name</th><th>Roles</th><th>Locked</th><th>Actions</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td>{u.email}</td>
                                <td>{u.name}</td>
                                <td>{u.roles?.join(", ")}</td>
                                <td>{u.lockUntil ? new Date(u.lockUntil).toLocaleString() : "No"}</td>
                                <td>
                                    <button onClick={() => changeRole(u._id, u.roles?.includes("admin") ? ["user"] : ["user", "admin"])}>
                                        {u.roles?.includes("admin") ? "Demote" : "Promote"}
                                    </button>
                                    <button onClick={() => blockUser(u._id)} style={{ marginLeft: 6 }}>Block</button>
                                    <button onClick={() => unblockUser(u._id)} style={{ marginLeft: 6 }}>Unblock</button>
                                    <button onClick={() => invalidateSessions(u._id)} style={{ marginLeft: 6 }}>Invalidate Sessions</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: 12 }}>
                Page {meta.page} of {meta.pages} | Total: {meta.total}
            </div>
        </div>
    );
};

export default AdminUsersPage;
