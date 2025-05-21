import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Jika ingin Navbar langsung update tanpa refresh, gunakan prop onLogout dari App
    const handleLogout = () => {
        localStorage.removeItem('token');
        if (onLogout) onLogout();
        navigate('/');
    };

    return (
        <>
            <nav
                className="navbar navbar-expand-lg shadow-sm fixed-top"
                style={{
                    background: "linear-gradient(90deg, #fff 70%, #e3f0ff 100%)",
                    fontFamily: "'Poppins', 'Inter', sans-serif",
                    borderBottom: "1.5px solid #e0e7ef",
                    minHeight: 64,
                    zIndex: 1000
                }}
            >
                <div className="container-fluid">
                    <Link to="/" className="navbar-brand d-flex align-items-center" style={{ fontWeight: 700, fontSize: 22, color: "#184e77" }}>
                        <span
                            style={{
                                background: "#b7e4c7",
                                borderRadius: "50%",
                                padding: 8,
                                marginRight: 10,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <i className="bi bi-journal-bookmark" style={{ color: "#184e77", fontSize: 22 }}></i>
                        </span>
                        <span>Perpustakaan <span style={{ color: "#388e3c" }}>APP</span></span>
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto align-items-lg-center" style={{ fontWeight: 500 }}>
                            {token ? (
                                <>
                                    <li className="nav-item">
                                        <Link to="/dashboard" className="nav-link px-3" style={{ color: "#184e77" }}>Dashboard</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/books" className="nav-link px-3" style={{ color: "#184e77" }}>Buku</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/members" className="nav-link px-3" style={{ color: "#184e77" }}>Member</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/peminjaman" className="nav-link px-3" style={{ color: "#184e77" }}>Peminjaman</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to="/denda" className="nav-link px-3" style={{ color: "#184e77" }}>Denda</Link>
                                    </li>
                                    <li className="nav-item d-lg-none mt-2">
                                        <button onClick={handleLogout} className="btn btn-outline-danger w-100 rounded-pill fw-semibold">
                                            <i className="bi bi-box-arrow-right me-1"></i> Logout
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <Link to="/login" className="btn btn-success rounded-pill px-4 fw-semibold" style={{ fontSize: 16 }}>
                                        <i className="bi bi-box-arrow-in-right me-1"></i> Login
                                    </Link>
                                </li>
                            )}
                        </ul>
                        {token && (
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline-danger ms-3 d-none d-lg-inline rounded-pill fw-semibold"
                                style={{ fontSize: 16 }}
                            >
                                <i className="bi bi-box-arrow-right me-1"></i> Logout
                            </button>
                        )}
                    </div>
                </div>
                <style>
                    {`
                    .navbar-nav .nav-link {
                        transition: color 0.2s, background 0.2s;
                        border-radius: 20px;
                    }
                    .navbar-nav .nav-link:hover, .navbar-nav .nav-link.active {
                        background: #b7e4c7;
                        color: #184e77 !important;
                    }
                    `}
                </style>
            </nav>
            {/* Spacer agar konten di bawah navbar tidak tertutup */}
            <div style={{ marginTop: 70 }}></div>
        </>
    );
}
