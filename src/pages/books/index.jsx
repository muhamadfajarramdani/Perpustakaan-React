import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, Button, Row, Col, Container, Badge, Form, InputGroup, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import { useNavigate } from "react-router-dom"; // Tambahkan ini

const PAGE_SIZE = 6;

export default function BukuIndex() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Selected book for detail/edit
    const [selectedBook, setSelectedBook] = useState(null);

    // Form states
    const [form, setForm] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });

    const [editForm, setEditForm] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });

    // Search/filter state
    const [search, setSearch] = useState("");
    // Sorting
    const [sortBy, setSortBy] = useState("judul");
    const [sortDir, setSortDir] = useState("asc");

    const navigate = useNavigate(); // Tambahkan ini

    useEffect(() => {
        // Cek token login
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "http://45.64.100.26:88/perpus-api/public/api/buku",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        Accept: "application/json",
                    },
                }
            );
            setBooks(response.data);
            setError("");
        } catch (err) {
            setError("Gagal mengambil data buku.");
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            await axios.post(
                "http://45.64.100.26:88/perpus-api/public/api/buku",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            Swal.fire("Berhasil!", "Buku baru telah ditambahkan.", "success");
            setShowAddModal(false);
            setForm({
                no_rak: "",
                judul: "",
                pengarang: "",
                tahun_terbit: "",
                penerbit: "",
                stok: "",
                detail: "",
            });
            fetchBooks();
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat menambahkan buku.", "error");
        }
    };

    const handleDetail = async (id) => {
        try {
            const response = await axios.get(
                `http://45.64.100.26:88/perpus-api/public/api/buku/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        Accept: "application/json",
                    },
                }
            );
            setSelectedBook(response.data);
            setShowDetailModal(true);
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat mengambil data buku.", "error");
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await axios.get(
                `http://45.64.100.26:88/perpus-api/public/api/buku/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        Accept: "application/json",
                    },
                }
            );
            setSelectedBook(response.data);
            setEditForm({
                no_rak: response.data.no_rak || "",
                judul: response.data.judul || "",
                pengarang: response.data.pengarang || "",
                tahun_terbit: response.data.tahun_terbit || "",
                penerbit: response.data.penerbit || "",
                stok: response.data.stok || "",
                detail: response.data.detail || "",
            });
            setShowEditModal(true);
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat mengambil data buku.", "error");
        }
    };

    const handleEditChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(editForm).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append("_method", "PUT");

            await axios.post(
                `http://45.64.100.26:88/perpus-api/public/api/buku/${selectedBook.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            Swal.fire("Berhasil!", "Buku berhasil diupdate.", "success");
            setShowEditModal(false);
            setSelectedBook(null);
            fetchBooks();
        } catch (err) {
            Swal.fire("Gagal!", "Tidak dapat mengupdate buku.", "error");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await Swal.fire({
            title: "Apakah Anda yakin?",
            text: "Buku ini akan dihapus!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
        });

        if (confirmed.isConfirmed) {
            try {
                await axios.delete(
                    `http://45.64.100.26:88/perpus-api/public/api/buku/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            Accept: "application/json",
                        },
                    }
                );
                setBooks(books.filter((book) => book.id !== id));
                Swal.fire("Berhasil!", "Buku telah dihapus.", "success");
            } catch (err) {
                Swal.fire("Gagal!", "Tidak dapat menghapus buku.", "error");
            }
        }
    };

    // Search/filter logic
    const filteredBooks = books.filter((book) =>
        book.judul.toLowerCase().includes(search.toLowerCase())
    );

    // Sorting logic
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === "judul" || sortBy === "pengarang" || sortBy === "penerbit") {
            valA = valA ? valA.toLowerCase() : "";
            valB = valB ? valB.toLowerCase() : "";
        } else {
            valA = Number(valA);
            valB = Number(valB);
        }
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalPage = Math.ceil(sortedBooks.length / PAGE_SIZE);
    const pagedBooks = sortedBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Badge stok logic
    const getStokBadge = (stok) => {
        if (stok <= 2)
            return (
                <OverlayTrigger overlay={<Tooltip>Stok sangat sedikit</Tooltip>}>
                    <Badge bg="danger" className="me-2">Low</Badge>
                </OverlayTrigger>
            );
        if (stok <= 5)
            return (
                <OverlayTrigger overlay={<Tooltip>Stok menengah</Tooltip>}>
                    <Badge bg="warning" text="dark" className="me-2">Medium</Badge>
                </OverlayTrigger>
            );
        return (
            <OverlayTrigger overlay={<Tooltip>Stok aman</Tooltip>}>
                <Badge bg="success" className="me-2">High</Badge>
            </OverlayTrigger>
        );
    };

    if (loading)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
            paddingTop: 40,
            paddingBottom: 40,
        }}>
            <Container>
                {/* Header */}
                <div className="bg-white rounded shadow-sm px-4 py-3 mb-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between border" style={{ borderColor: "#e5e7eb" }}>
                    <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-journal-bookmark-fill fs-2 text-primary"></i>
                        <div>
                            <h3 className="fw-bold text-primary mb-0">Daftar Buku</h3>
                            <div className="text-muted" style={{ fontSize: 15 }}>Manajemen koleksi buku perpustakaan</div>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        className="fw-bold shadow-sm mt-3 mt-md-0"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="bi bi-plus-circle me-2"></i>Tambah Buku
                    </Button>
                </div>

                {/* Info & Sorting */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                    <div className="text-muted">
                        <i className="bi bi-collection me-1"></i>
                        <b>{filteredBooks.length}</b> buku ditemukan
                    </div>
                    <div>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                <i className="bi bi-sort-alpha-down"></i> Urutkan: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} ({sortDir === "asc" ? "A-Z/↑" : "Z-A/↓"})
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => { setSortBy("judul"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>
                                    Judul {sortBy === "judul" && (sortDir === "asc" ? "↑" : "↓")}
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => { setSortBy("stok"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>
                                    Stok {sortBy === "stok" && (sortDir === "asc" ? "↑" : "↓")}
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => { setSortBy("tahun_terbit"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>
                                    Tahun Terbit {sortBy === "tahun_terbit" && (sortDir === "asc" ? "↑" : "↓")}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {/* Search/filter */}
                <div className="mb-4">
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-0">
                            <i className="bi bi-search text-secondary"></i>
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Cari judul buku..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="border-0 shadow-sm"
                        />
                    </InputGroup>
                </div>

                {/* Content */}
                {!filteredBooks || filteredBooks.length === 0 ? (
                    <div className="alert alert-info text-center">Data buku tidak ditemukan.</div>
                ) : (
                    <>
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {pagedBooks.map((book) => (
                                <Col key={book.id}>
                                    <Card
                                        className={`shadow-sm border-0 animate__animated animate__fadeIn`}
                                        style={{
                                            borderRadius: 16,
                                            minHeight: 340,
                                            background: "#f9fafb",
                                            transition: "box-shadow 0.2s, border 0.2s",
                                            border: Number(book.stok) <= 2 ? "1.5px solid #e74c3c" : "none",
                                            boxShadow: Number(book.stok) <= 2 ? "0 0 0 2px #f8d7da" : undefined,
                                        }}
                                    >
                                        <Card.Body>
                                            <div className="d-flex align-items-center mb-2">
                                                <Badge bg="secondary" className="me-2">{book.no_rak}</Badge>
                                                <span className="text-muted ms-auto" style={{ fontSize: 13 }}>#{book.id}</span>
                                            </div>
                                            <h5 className="fw-bold text-primary mb-1">{book.judul}</h5>
                                            <div className="mb-2">
                                                <span className="text-secondary" style={{ fontSize: 15 }}>
                                                    <i className="bi bi-person-lines-fill me-1"></i>
                                                    {book.pengarang}
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                {getStokBadge(Number(book.stok))}
                                                <Badge bg="light" text="dark" className="border ms-1">Tahun: {book.tahun_terbit}</Badge>
                                                <span className="ms-2 text-muted" style={{ fontSize: 13 }}>
                                                    <i className="bi bi-box-seam me-1"></i>
                                                    Stok: <b>{book.stok}</b>
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-muted" style={{ fontSize: 13 }}>
                                                    <i className="bi bi-building me-1"></i>
                                                    {book.penerbit}
                                                </span>
                                            </div>
                                            <div className="mb-2">
                                                <span className="text-muted" style={{ fontSize: 13, display: 'block', minHeight: 30 }}>
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    {book.detail}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-2 mt-3">
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleDetail(book.id)}
                                                    style={{ borderRadius: 8 }}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(book.id)}
                                                    style={{ borderRadius: 8 }}
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(book.id)}
                                                    style={{ borderRadius: 8 }}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <Button
                                variant="light"
                                className="border"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                style={{ borderRadius: 8, minWidth: 100 }}
                            >
                                <i className="bi bi-chevron-left"></i> Previous
                            </Button>
                            <span className="fw-bold text-secondary">
                                Page {page} of {totalPage}
                            </span>
                            <Button
                                variant="light"
                                className="border"
                                disabled={page === totalPage || totalPage === 0}
                                onClick={() => setPage(page + 1)}
                                style={{ borderRadius: 8, minWidth: 100 }}
                            >
                                Next <i className="bi bi-chevron-right"></i>
                            </Button>
                        </div>
                    </>
                )}

                {/* Modal Tambah Buku */}
                {showAddModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content border-0 shadow-lg animate__animated animate__fadeIn">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title">Tambah Buku Baru</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="no_rak" className="form-label">No Rak</label>
                                            <input type="text" className="form-control" id="no_rak" name="no_rak" value={form.no_rak} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="judul" className="form-label">Judul Buku</label>
                                            <input type="text" className="form-control" id="judul" name="judul" value={form.judul} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="pengarang" className="form-label">Pengarang</label>
                                            <input type="text" className="form-control" id="pengarang" name="pengarang" value={form.pengarang} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="tahun_terbit" className="form-label">Tahun Terbit</label>
                                            <input type="number" className="form-control" id="tahun_terbit" name="tahun_terbit" value={form.tahun_terbit} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="penerbit" className="form-label">Penerbit</label>
                                            <input type="text" className="form-control" id="penerbit" name="penerbit" value={form.penerbit} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="stok" className="form-label">Stok</label>
                                            <input type="number" className="form-control" id="stok" name="stok" value={form.stok} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="detail" className="form-label">Detail</label>
                                            <textarea className="form-control" id="detail" name="detail" rows="3" value={form.detail} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                            Batal
                                        </button>
                                        <button type="submit" className="btn btn-primary">Simpan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Detail Buku */}
                {showDetailModal && selectedBook && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content border-0 shadow-lg animate__animated animate__fadeIn">
                                <div className="modal-header bg-info text-white">
                                    <h5 className="modal-title">Detail Buku</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <strong>No Rak: </strong> {selectedBook.no_rak}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Judul Buku: </strong> {selectedBook.judul}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Pengarang: </strong> {selectedBook.pengarang}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Tahun Terbit: </strong> {selectedBook.tahun_terbit}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Penerbit: </strong> {selectedBook.penerbit}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Stok: </strong> {selectedBook.stok}
                                    </div>
                                    <div className="mb-3">
                                        <strong>Detail: </strong> {selectedBook.detail}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Edit Buku */}
                {showEditModal && selectedBook && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content border-0 shadow-lg animate__animated animate__fadeIn">
                                <div className="modal-header bg-warning text-white">
                                    <h5 className="modal-title">Edit Buku</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                                </div>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="no_rak" className="form-label">No Rak</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="no_rak"
                                                name="no_rak"
                                                value={editForm.no_rak}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="judul" className="form-label">Judul Buku</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="judul"
                                                name="judul"
                                                value={editForm.judul}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="pengarang" className="form-label">Pengarang</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="pengarang"
                                                name="pengarang"
                                                value={editForm.pengarang}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="tahun_terbit" className="form-label">Tahun Terbit</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="tahun_terbit"
                                                name="tahun_terbit"
                                                value={editForm.tahun_terbit}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="penerbit" className="form-label">Penerbit</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="penerbit"
                                                name="penerbit"
                                                value={editForm.penerbit}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="stok" className="form-label">Stok</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="stok"
                                                name="stok"
                                                value={editForm.stok}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="detail" className="form-label">Detail</label>
                                            <textarea
                                                className="form-control"
                                                id="detail"
                                                name="detail"
                                                rows="3"
                                                value={editForm.detail}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                            Batal
                                        </button>
                                        <button type="submit" className="btn btn-warning">Perbarui</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}
