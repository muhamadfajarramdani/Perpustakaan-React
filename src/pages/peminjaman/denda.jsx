import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Card, Modal, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';

const PAGE_SIZE = 6;

const DendaPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const getToken = localStorage.getItem('token');

    const { id_peminjaman, id_buku, id_member } = location.state || {};

    useEffect(() => {
        if (!getToken) {
            navigate('/login');
        }
    }, [getToken, navigate]);

    const [form, setForm] = useState({
        id_member: id_member || '',
        id_buku: id_buku || '',
        jumlah_denda: '',
        jenis_denda: '',
        deskripsi: ''
    });

    const [dendaData, setDendaData] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [detailDenda, setDetailDenda] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const apiUrl = 'http://45.64.100.26:88/perpus-api/public/api';

    const fetchDenda = async () => {
        try {
            const res = await axios.get(`${apiUrl}/denda`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setDendaData(res.data.data || []);
        } catch (error) {
            setErrorMessage('Gagal mengambil data denda');
        }
    };

    const fetchMembers = () => {
        axios
            .get(`${apiUrl}/member`, {
                headers: {
                    Authorization: `Bearer ${getToken}`,
                    Accept: "application/json",
                },
            })
            .then((res) => {
                setMembers(res.data || []);
            })
            .catch(() => {
                setMembers([]);
                setErrorMessage('Gagal mengambil data member');
            });
    };

    const fetchBooks = async () => {
        try {
            const response = await axios.get(`${apiUrl}/buku`, {
                headers: {
                    Authorization: `Bearer ${getToken}`,
                    Accept: "application/json",
                },
            });
            setBooks(response.data || []);
        } catch {
            setBooks([]);
            setErrorMessage("Gagal mengambil data buku.");
        }
    };

    useEffect(() => {
        fetchDenda();
        fetchMembers();
        fetchBooks();
    }, []);

    const handleShowDetail = (id) => {
        const detail = dendaData.find((denda) => denda.id === id);
        if (detail) {
            setDetailDenda(detail);
            setShowModal(true);
        } else {
            setErrorMessage('Data tidak ditemukan');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setDetailDenda(null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateDenda = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${apiUrl}/denda`, form, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setForm({
                id_member: '',
                id_buku: '',
                jumlah_denda: '',
                jenis_denda: '',
                deskripsi: ''
            });
            fetchDenda();
            setSuccessMessage('Data denda berhasil ditambahkan');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch {
            setErrorMessage('Gagal menambahkan data denda');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const getMemberName = (id) => {
        const member = members.find((m) => String(m.id) === String(id));
        return member ? member.nama : 'Member Sudah Tidak Aktif';
    };

    const getBookTitle = (id) => {
        const book = books.find((b) => String(b.id) === String(id));
        return book ? book.judul : 'Buku Sudah Tidak Tersedia';
    };

    // Filter dan pagination berdasarkan search
    const filteredDenda = dendaData.filter(item =>
        getMemberName(item.id_member).toLowerCase().includes(search.toLowerCase()) ||
        getBookTitle(item.id_buku).toLowerCase().includes(search.toLowerCase())
    );
    const totalPage = Math.ceil(filteredDenda.length / PAGE_SIZE);
    const pagedDenda = filteredDenda.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Export Excel
    const exportExcel = () => {
        const data = filteredDenda.map(item => ({
            "ID": item.id,
            "Nama Member": getMemberName(item.id_member),
            "Judul Buku": getBookTitle(item.id_buku),
            "Jumlah Denda": item.jumlah_denda,
            "Jenis Denda": item.jenis_denda,
            "Deskripsi": item.deskripsi
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Denda");
        XLSX.writeFile(workbook, "data-denda.xlsx");
    };

    return (
        <div
            className="py-5"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
                padding: "40px 0",
            }}  
        >
            <div className="container">
                <div className="mb-4">
                    <h2 className="fw-bold mb-3"
                        style={{
                            color: "#1a237e",
                            letterSpacing: 1.5,
                            textShadow: "0 2px 8px #e0e7ef"
                        }}>
                        <i className="bi bi-cash-coin me-2 text-warning"></i>
                        <span style={{ color: "#FFD700" }}>Manajemen Denda</span>
                    </h2>
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    <Card className="shadow-lg border-0 mb-4" style={{ borderRadius: 18, background: "#fffbe7" }}>
                        <Card.Body>
                            <Form onSubmit={handleCreateDenda}>
                                <h5 className="mb-3 fw-bold text-primary">Form Tambah Denda</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Member</Form.Label>
                                            <Form.Select
                                                name="id_member"
                                                value={form.id_member}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Pilih Member</option>
                                                {members.map((member) => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.nama}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Buku</Form.Label>
                                            <Form.Select
                                                name="id_buku"
                                                value={form.id_buku}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Pilih Buku</option>
                                                {books.map((book) => (
                                                    <option key={book.id} value={book.id}>
                                                        {book.judul}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Jumlah Denda</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="jumlah_denda"
                                                value={form.jumlah_denda}
                                                onChange={handleChange}
                                                placeholder="Jumlah Denda"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Jenis Denda</Form.Label>
                                            <Form.Select
                                                name="jenis_denda"
                                                value={form.jenis_denda}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Pilih Jenis</option>
                                                <option value="terlambat">Terlambat</option>
                                                <option value="kerusakan">Kerusakan</option>
                                                <option value="lainnya">Lainnya</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-semibold">Deskripsi</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                name="deskripsi"
                                                value={form.deskripsi}
                                                onChange={handleChange}
                                                placeholder="Deskripsi"
                                                rows={1}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="text-end">
                                    <Button
                                        variant="warning"
                                        type="submit"
                                        className="fw-bold px-4"
                                        style={{
                                            borderRadius: 10,
                                            background: "linear-gradient(90deg, #FFD700 60%, #fffbe7 100%)",
                                            color: "#1a237e",
                                            border: "none",
                                            boxShadow: "0 2px 8px #ffe082"
                                        }}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>Tambah Denda
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>

                {/* Search & Export */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
                    <Form className="mb-2 mb-md-0" style={{ flex: 1, maxWidth: 320 }}>
                        <Form.Control
                            type="text"
                            placeholder="Cari nama member atau judul buku..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            style={{
                                borderRadius: 8,
                                background: "#f8f9fa",
                                borderColor: "#ced4da"
                            }}
                        />
                    </Form>
                    <Button
                        variant="success"
                        style={{ borderRadius: 8, fontWeight: 600, minWidth: 140 }}
                        onClick={exportExcel}
                    >
                        <i className="bi bi-file-earmark-excel me-2"></i>
                        Export Excel
                    </Button>
                </div>

                <h4 className="fw-bold mb-3" style={{ color: "#1a237e" }}>Daftar Denda</h4>
                {pagedDenda.length === 0 ? (
                    <Alert variant="info" className="text-center">Data denda tidak ditemukan.</Alert>
                ) : (
                    <>
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {pagedDenda.map((denda) => (
                                <Col key={denda.id}>
                                    <Card
                                        className="shadow border-0 h-100"
                                        style={{
                                            borderRadius: 18,
                                            background: "#fff",
                                            transition: "transform 0.2s, box-shadow 0.2s",
                                            boxShadow: "0 4px 24px #e0e7ef"
                                        }}
                                    >
                                        <Card.Body>
                                            <div className="d-flex align-items-center mb-2">
                                                <Badge bg="primary" className="me-2" style={{ fontSize: 13, borderRadius: 8 }}>
                                                    {getMemberName(denda.id_member)}
                                                </Badge>
                                                <span className="text-muted ms-auto" style={{ fontSize: 13 }}>ID: {denda.id}</span>
                                            </div>
                                            <h5 className="fw-bold mb-1" style={{ color: "#1a237e" }}>{getBookTitle(denda.id_buku)}</h5>
                                            <div className="mb-2 text-secondary" style={{ fontSize: 15 }}>
                                                <i className="bi bi-person-badge me-1"></i>
                                                <span className="fw-semibold">Member:</span> {getMemberName(denda.id_member)}
                                            </div>
                                            <div className="mb-2 text-secondary" style={{ fontSize: 15 }}>
                                                <i className="bi bi-book me-1"></i>
                                                <span className="fw-semibold">Buku:</span> {getBookTitle(denda.id_buku)}
                                            </div>
                                            <div className="mb-2" style={{ fontSize: 15 }}>
                                                <i className="bi bi-cash-stack me-1 text-warning"></i>
                                                <span className="fw-semibold text-warning">Jumlah:</span>{" "}
                                                <span style={{
                                                    color: "#bfa100",
                                                    fontWeight: "bold",
                                                    fontSize: 18,
                                                    letterSpacing: 1
                                                }}>
                                                    Rp {Number(denda.jumlah_denda).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            <div className="mb-2 text-warning" style={{ fontSize: 15 }}>
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                <span className="fw-semibold">Jenis:</span> {denda.jenis_denda}
                                            </div>
                                            <div className="mb-2 text-muted" style={{ fontSize: 13 }}>
                                                <i className="bi bi-info-circle me-1"></i>{denda.deskripsi}
                                            </div>
                                            <div className="d-flex gap-2 mt-3">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleShowDetail(denda.id)}
                                                    style={{ borderRadius: 8 }}
                                                >
                                                    <i className="bi bi-eye"></i> Detail
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
                                variant="outline-primary"
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
                                variant="outline-primary"
                                disabled={page === totalPage || totalPage === 0}
                                onClick={() => setPage(page + 1)}
                                style={{ borderRadius: 8, minWidth: 100 }}
                            >
                                Next <i className="bi bi-chevron-right"></i>
                            </Button>
                        </div>
                    </>
                )}

                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton style={{ background: "#f8fafc" }}>
                        <Modal.Title style={{ color: "#1a237e" }}>Detail Denda</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {detailDenda ? (
                            <div>
                                <p><strong>ID Member:</strong> {detailDenda.id_member}</p>
                                <p><strong>Nama Member:</strong> {getMemberName(detailDenda.id_member)}</p>
                                <p><strong>ID Buku:</strong> {detailDenda.id_buku}</p>
                                <p><strong>Judul Buku:</strong> {getBookTitle(detailDenda.id_buku)}</p>
                                <p><strong>Jumlah Denda:</strong> <span style={{ color: "#bfa100", fontWeight: "bold" }}>Rp {Number(detailDenda.jumlah_denda).toLocaleString("id-ID")}</span></p>
                                <p><strong>Jenis Denda:</strong> {detailDenda.jenis_denda}</p>
                                <p><strong>Deskripsi:</strong> {detailDenda.deskripsi}</p>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Tutup
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default DendaPage;
