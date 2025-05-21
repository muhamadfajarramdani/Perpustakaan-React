import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Form, Modal, Card, Container, Row, Col, Alert, Badge } from 'react-bootstrap';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const PAGE_SIZE = 6;

const PeminjamanPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        id_buku: '',
        id_member: '',
        tgl_pinjam: '',
        tgl_pengembalian: ''
    });

    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [dataMember, setDataMember] = useState([]);
    const [dataBuku, setDataBuku] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [showDendaModal, setShowDendaModal] = useState(false);
    const [dendaInfo, setDendaInfo] = useState({});

    const apiUrl = 'http://45.64.100.26:88/perpus-api/public/api';

    const fetchPeminjaman = async () => {
        const getToken = localStorage.getItem('token');
        try {
            const res = await axios.get(`${apiUrl}/peminjaman`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setDataPeminjaman(res.data.data || []);
        } catch (error) {
            setErrorMessage('Gagal mengambil data peminjaman');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchPeminjaman();
        bukuId();
        memberId();
    }, []);

    function memberId() {
        const token = localStorage.getItem("token");
        axios.get(apiUrl + "/member", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            setDataMember(res.data.data || res.data); // fix jika API mengembalikan data di .data
        }).catch(() => {
            setDataMember([]);
        })
    }

    function bukuId() {
        const token = localStorage.getItem("token");
        axios.get(apiUrl + "/buku", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => {
            setDataBuku(res.data.data || res.data); // fix jika API mengembalikan data di .data
        }).catch(() => {
            setDataBuku([]);
        })
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePeminjaman = async () => {
        const getToken = localStorage.getItem('token');
        try {
            await axios.post(`${apiUrl}/peminjaman`, form, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });
            setForm({ id_buku: '', id_member: '', tgl_pinjam: '', tgl_pengembalian: '' });
            fetchPeminjaman();
            bukuId(); // <-- Tambahkan ini agar stok buku terupdate di frontend
            setSuccessMessage('Peminjaman berhasil ditambahkan');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Gagal menambahkan peminjaman');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handlePengembalian = async (item) => {
        const getToken = localStorage.getItem('token');
        const isLate = moment().isAfter(moment(item.tgl_pengembalian));
        const hariTerlambat = isLate ? moment().diff(moment(item.tgl_pengembalian), 'days') : 0;
        const jumlahDenda = isLate ? hariTerlambat * 1000 : 0;

        try {
            // Proses pengembalian (ubah status_pengembalian jadi 1)
            const formData = new FormData();
            formData.append('_method', 'PUT');

            await axios.post(`${apiUrl}/peminjaman/pengembalian/${item.id}`, formData, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${getToken}`
                }
            });

            setSuccessMessage('Pengembalian berhasil.');
            setTimeout(() => setSuccessMessage(''), 3000);
            fetchPeminjaman();
            bukuId();

            // Jika terlambat, langsung buat denda via API dan tampilkan modal
            if (isLate) {
                await axios.post(`${apiUrl}/denda`, {
                    id_peminjaman: item.id,
                    id_member: item.id_member,
                    id_buku: item.id_buku,
                    jumlah_denda: String(jumlahDenda), // <-- ubah ke string
                    jenis_denda: 'Terlambat',
                    hari_terlambat: hariTerlambat,
                    deskripsi: `terlambat mengembalikan buku ${hariTerlambat} hari`
                }, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${getToken}`
                    }
                });

                setDendaInfo({
                    nama: getMemberName(item.id_member),
                    judul: getBookTitle(item.id_buku),
                    hariTerlambat,
                    jumlahDenda
                });
                setShowDendaModal(true);
            }
        } catch (error) {
            setErrorMessage('Gagal melakukan pengembalian');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const handleShowDetail = (id) => {
        setSelectedId(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedId(null);
    };

    const getMemberName = (id) => {
        if (!Array.isArray(dataMember)) return '-';
        const member = dataMember.find((m) => String(m.id) === String(id));
        return member ? member.nama : 'Member Sudah Tidak Aktif';
    };

    const getBookTitle = (id) => {
        if (!Array.isArray(dataBuku)) return '-';
        const book = dataBuku.find((b) => String(b.id) === String(id));
        return book ? book.judul : 'Buku Sudah Tidak Tersedia';
    };

    const exportExcel = () => {
        // Siapkan data untuk Excel
        const data = dataPeminjaman.map(item => ({
            "ID": item.id,
            "Nama Member": getMemberName(item.id_member),
            "Judul Buku": getBookTitle(item.id_buku),
            "Tanggal Pinjam": item.tgl_pinjam,
            "Tanggal Pengembalian": item.tgl_pengembalian,
            "Status": item.status_pengembalian === 1 ? "Dikembalikan" : "Dipinjam"
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman");
        XLSX.writeFile(workbook, "data-peminjaman.xlsx");
    };

    // Pagination logic
    const filteredAllData = dataPeminjaman.filter(item => {
        const matchText =
            getMemberName(item.id_member).toLowerCase().includes(search.toLowerCase()) ||
            getBookTitle(item.id_buku).toLowerCase().includes(search.toLowerCase());
        const matchDate = searchDate
            ? moment(item.tgl_pinjam).format('YYYY-MM-DD') === searchDate
            : true;
        return matchText && matchDate;
    });

    const totalPage = Math.ceil(filteredAllData.length / PAGE_SIZE);
    const pagedData = filteredAllData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const detailPeminjaman = dataPeminjaman.find((item) => item.id === selectedId);

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)",
            paddingTop: 40,
            paddingBottom: 40,
            fontFamily: "'Poppins', 'Segoe UI', sans-serif"
        }}>
            <Container>
                <Row className="justify-content-center mb-4">
                    <Col xl={10}>
                        <Card className="shadow-lg border-0" style={{ borderRadius: 24, background: "#fffbe7" }}>
                            <Card.Body>
                                <Row>
                                    <Col md={7} className="d-flex flex-column justify-content-center">
                                        <h2 className="fw-bold mb-3" style={{
                                            color: "#1a237e",
                                            letterSpacing: 1,
                                            textShadow: "0 2px 8px #e0e7ef"
                                        }}>
                                            <i className="bi bi-book-half me-2 text-warning"></i>
                                            <span style={{ color: "#FFD700" }}>Peminjaman Buku</span>
                                        </h2>
                                        <p className="text-secondary mb-4" style={{ fontSize: 18 }}>
                                            Kelola peminjaman buku dengan mudah dan profesional. Data peminjaman ditampilkan dalam bentuk kartu yang modern dan informatif.
                                        </p>
                                    </Col>
                                    <Col md={5}>
                                        <Card className="shadow border-0" style={{ borderRadius: 18, background: "#fff" }}>
                                            <Card.Header className="bg-primary text-white" style={{ borderRadius: "18px 18px 0 0" }}>
                                                <h5 className="mb-0">Form Peminjaman</h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <Form>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="fw-semibold">Buku</Form.Label>
                                                        <Form.Select
                                                            value={form.id_buku}
                                                            onChange={(e) => setForm({ ...form, id_buku: e.target.value })}
                                                        >
                                                            <option value="">----Pilih Buku----</option>
                                                            {dataBuku.map((buku) => (
                                                                <option key={buku.id} value={buku.id}>
                                                                    {buku.id} - {buku.judul}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="fw-semibold">Member</Form.Label>
                                                        <Form.Select
                                                            value={form.id_member}
                                                            onChange={(e) => setForm({ ...form, id_member: e.target.value })}
                                                        >
                                                            <option value="">----Pilih Member----</option>
                                                            {dataMember.map((member) => (
                                                                <option key={member.id} value={member.id}>
                                                                    {member.id} - {member.nama}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label className="fw-semibold">Tanggal Pinjam</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            name="tgl_pinjam"
                                                            value={form.tgl_pinjam}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-semibold">Tanggal Pengembalian</Form.Label>
                                                        <Form.Control
                                                            type="date"
                                                            name="tgl_pengembalian"
                                                            value={form.tgl_pengembalian}
                                                            onChange={handleChange}
                                                        />
                                                    </Form.Group>
                                                    <Button
                                                        variant="warning"
                                                        onClick={handlePeminjaman}
                                                        className="w-100 fw-bold"
                                                        style={{
                                                            borderRadius: 10,
                                                            background: "linear-gradient(90deg, #FFD700 60%, #fffbe7 100%)",
                                                            color: "#1a237e",
                                                            border: "none",
                                                            boxShadow: "0 2px 8px #ffe082",
                                                            fontSize: 16
                                                        }}
                                                    >
                                                        <i className="bi bi-plus-circle me-2"></i>Pinjam Buku
                                                    </Button>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                                {successMessage && <Alert variant="success" className="mt-4">{successMessage}</Alert>}
                                {errorMessage && <Alert variant="danger" className="mt-4">{errorMessage}</Alert>}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="justify-content-center mb-4">
                    <Col xl={10}>
                        <Card className="shadow-lg border-0" style={{ borderRadius: 24 }}>
                            <Card.Header
                                className="bg-white border-0 d-flex align-items-center justify-content-between flex-wrap"
                                style={{ borderRadius: "24px 24px 0 0" }}
                            >
                                <h4 className="fw-bold mb-0" style={{ color: "#1a237e" }}>
                                    <i className="bi bi-card-list me-2"></i>Daftar Peminjaman
                                </h4>
                                <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                                    <Button
                                        variant="success"
                                        style={{ borderRadius: 8, fontWeight: 600 }}
                                        onClick={exportExcel}
                                    >
                                        <i className="bi bi-file-earmark-excel me-2"></i>
                                        Export Excel
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Form className="mb-4">
                                    <Row className="g-2">
                                        <Col md={8} xs={12}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Cari berdasarkan nama member atau judul buku..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                style={{
                                                    borderRadius: 8,
                                                    paddingLeft: 40,
                                                    paddingRight: 40,
                                                    background: "#f8f9fa",
                                                    borderColor: "#ced4da",
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                                }}
                                            />
                                        </Col>
                                        <Col md={4} xs={12}>
                                            <Form.Control
                                                type="date"
                                                value={searchDate}
                                                onChange={e => {
                                                    setSearchDate(e.target.value);
                                                    setPage(1);
                                                }}
                                                style={{
                                                    borderRadius: 8,
                                                    background: "#f8f9fa",
                                                    borderColor: "#ced4da"
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Form>

                                {pagedData.length === 0 ? (
                                    <div className="text-center text-muted py-5 animate__animated animate__fadeIn">
                                        <i className="bi bi-inbox display-3 mb-3"></i>
                                        <h5>Belum ada data peminjaman</h5>
                                    </div>
                                ) : (
                                    <Row xs={1} md={2} lg={3} className="g-4">
                                        {pagedData.map((item) => {
                                            const isLate = moment().isAfter(moment(item.tgl_pengembalian));
                                            const statusClass = isLate ? 'danger' : 'success';
                                            const statusText = isLate ? 'Terlambat' : 'Aktif';

                                            return (
                                                <Col key={item.id}>
                                                    <Card className="h-100 shadow-sm border-0 animate__animated animate__fadeIn animated-card"
                                                        style={{
                                                            borderRadius: 18,
                                                            background: "#fff",
                                                            transition: "transform 0.2s, box-shadow 0.2s",
                                                            boxShadow: isLate
                                                                ? "0 0 0 2px #f8d7da"
                                                                : "0 4px 24px #e0e7ef"
                                                        }}>
                                                        <Card.Body>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <Badge bg={statusClass} className="me-2" style={{
                                                                    fontSize: 13,
                                                                    borderRadius: 8,
                                                                    background: isLate ? "#b71c1c" : "#388e3c"
                                                                }}>
                                                                    {statusText}
                                                                </Badge>
                                                                <span className="text-muted ms-auto" style={{ fontSize: 13 }}>
                                                                    #{item.id}
                                                                </span>
                                                            </div>
                                                            <h5 className="fw-bold mb-1" style={{ color: "#1a237e" }}>{getBookTitle(item.id_buku)}</h5>
                                                            <div className="mb-2">
                                                                <span className="text-secondary" style={{ fontSize: 15 }}>
                                                                    <i className="bi bi-person-fill me-1"></i>
                                                                    {getMemberName(item.id_member)}
                                                                </span>
                                                            </div>
                                                            <div className="mb-2">
                                                                <span className="text-muted" style={{ fontSize: 13 }}>
                                                                    <i className="bi bi-calendar-event me-1"></i>
                                                                    Pinjam: {moment(item.tgl_pinjam).format('DD/MM/YYYY')}
                                                                </span>
                                                                <br />
                                                                <span className="text-muted" style={{ fontSize: 13 }}>
                                                                    <i className="bi bi-calendar-check me-1"></i>
                                                                    Kembali: {moment(item.tgl_pengembalian).format('DD/MM/YYYY')}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex gap-2 mt-3">
                                                                {item.status_pengembalian !== 1 ? (
                                                                    <Button
                                                                        variant="outline-success"
                                                                        size="sm"
                                                                        onClick={() => handlePengembalian(item)}
                                                                        style={{ borderRadius: 8, fontWeight: 600 }}
                                                                    >
                                                                        <i className="bi bi-arrow-return-left"></i> Kembalikan
                                                                    </Button>
                                                                ) : (
                                                                    <span className="badge bg-secondary align-self-center" style={{ fontSize: 13 }}>
                                                                        Sudah dikembalikan
                                                                    </span>
                                                                )}
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handleShowDetail(item.id)}
                                                                    style={{ borderRadius: 8, fontWeight: 600 }}
                                                                >
                                                                    <i className="bi bi-eye-fill"></i> Detail
                                                                </Button>
                                                            </div>
                                                        </Card.Body>
                                                        <Card.Footer className="bg-light border-0 text-end"
                                                            style={{ borderRadius: "0 0 18px 18px", fontSize: 12 }}>
                                                            <span className="text-muted">ID Buku: {item.id_buku} | ID Member: {item.id_member}</span>
                                                        </Card.Footer>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                )}

                                {/* Pagination */}
                                <div className="d-flex justify-content-between align-items-center mt-4">
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-primary"
                                            disabled={page === 1}
                                            onClick={() => setPage(1)}
                                            style={{ borderRadius: 8, minWidth: 80 }}
                                        >
                                            <i className="bi bi-chevron-double-left"></i> First
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                            style={{ borderRadius: 8, minWidth: 100 }}
                                        >
                                            <i className="bi bi-chevron-left"></i> Previous
                                        </Button>
                                    </div>
                                    <span className="fw-bold text-secondary">
                                        Page {page} of {totalPage}
                                    </span>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-primary"
                                            disabled={page === totalPage || totalPage === 0}
                                            onClick={() => setPage(page + 1)}
                                            style={{ borderRadius: 8, minWidth: 100 }}
                                        >
                                            Next <i className="bi bi-chevron-right"></i>
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            disabled={page === totalPage || totalPage === 0}
                                            onClick={() => setPage(totalPage)}
                                            style={{ borderRadius: 8, minWidth: 80 }}
                                        >
                                            Last <i className="bi bi-chevron-double-right"></i>
                                        </Button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal Denda */}
            <Modal show={showDendaModal} onHide={() => setShowDendaModal(false)} centered>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>Denda Keterlambatan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: 48 }}></i>
                        <h5 className="mt-3 mb-2">Anda terlambat mengembalikan buku!</h5>
                        <p>
                            <strong>Nama:</strong> {dendaInfo.nama} <br />
                            <strong>Buku:</strong> {dendaInfo.judul} <br />
                            <strong>Hari Terlambat:</strong> {dendaInfo.hariTerlambat} hari <br />
                            <strong>Denda:</strong> <span className="text-danger fw-bold">Rp {dendaInfo.jumlahDenda?.toLocaleString()}</span>
                        </p>
                        <Alert variant="danger" className="mt-3">
                            Silakan lakukan pembayaran denda ke petugas perpustakaan.
                        </Alert>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDendaModal(false)}>
                        Tutup
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Detail Peminjaman */}
            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Detail Peminjaman</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailPeminjaman ? (
                        <Row>
                            <Col md={6}>
                                <h5 className="mb-3">Informasi Peminjaman</h5>
                                <p><strong>ID Peminjaman:</strong> {detailPeminjaman.id}</p>
                                <p><strong>ID Member:</strong> {detailPeminjaman.id_member}</p>
                                <p><strong>Nama Member:</strong> {getMemberName(detailPeminjaman.id_member)}</p>
                                <p><strong>ID Buku:</strong> {detailPeminjaman.id_buku}</p>
                                <p><strong>Judul Buku:</strong> {getBookTitle(detailPeminjaman.id_buku)}</p>
                            </Col>
                            <Col md={6}>
                                <h5 className="mb-3">Jadwal</h5>
                                <p><strong>Tanggal Pinjam:</strong> {moment(detailPeminjaman.tgl_pinjam).format('DD MMMM YYYY')}</p>
                                <p><strong>Tanggal Pengembalian:</strong> {moment(detailPeminjaman.tgl_pengembalian).format('DD MMMM YYYY')}</p>
                                <p><strong>Status:</strong>{' '}
                                    <span className={moment().isAfter(moment(detailPeminjaman.tgl_pengembalian)) ? 'text-danger' : 'text-success'}>
                                        {moment().isAfter(moment(detailPeminjaman.tgl_pengembalian)) ? 'Terlambat' : 'Aktif'}
                                    </span>
                                </p>
                            </Col>
                        </Row>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-muted">Data tidak ditemukan</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Tutup</Button>
                </Modal.Footer>
            </Modal>

            <style>
{`
.animated-card {
    transition: transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s;
}
.animated-card:hover {
    transform: scale(1.04) translateY(-4px);
    box-shadow: 0 8px 32px #1a237e22 !important;
    z-index: 2;
}
`}
</style>
        </div>
    );
};

export default PeminjamanPage;
