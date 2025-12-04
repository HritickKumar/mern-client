import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
    const [search, setSearch] = useState("");

    const fetchUsers = async (page = 1) => {
        const res = await api.get("/users", {
            params: { page, limit: 10, search },
        });
        setUsers(res.data.data);
        setMeta(res.data.meta);
    };

    useEffect(() => {
        fetchUsers(1);
        // eslint-disable-next-line
    }, []);

    const onSearch = async (e) => {
        e.preventDefault();
        await fetchUsers(1);
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Admin – Users</h2>
            <form onSubmit={onSearch} style={{ marginBottom: "1rem" }}>
                <input
                    placeholder="Search by email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" style={{ marginLeft: 6 }}>
                    Search
                </button>
            </form>

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "1rem",
                }}
            >
                <thead>
                    <tr>
                        <th style={{ borderBottom: "1px solid #ddd" }}>Email</th>
                        <th style={{ borderBottom: "1px solid #ddd" }}>Name</th>
                        <th style={{ borderBottom: "1px solid #ddd" }}>Roles</th>
                        <th style={{ borderBottom: "1px solid #ddd" }}>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u._id}>
                            <td>{u.email}</td>
                            <td>{u.name}</td>
                            <td>{u.roles?.join(", ")}</td>
                            <td>{new Date(u.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div>
                Page {meta.page} of {meta.pages} | Total: {meta.total}
            </div>
        </div>
    );
};

export default AdminUsers;
