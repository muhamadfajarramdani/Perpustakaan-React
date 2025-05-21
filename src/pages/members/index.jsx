import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";

const API_URL = "http://45.64.100.26:88/perpus-api/public/api";
const PAGE_SIZE = 6;

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [formModal, setFormModal] = useState({
    no_ktp: "",
    nama: "",
    alamat: "",
    tgl_lahir: "",
  });
  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    const getToken = localStorage.getItem("token");
    axios
      .get(`${API_URL}/member`, {
        headers: {
          Authorization: `Bearer ${getToken}`,
          Accept: "application/json",
        },
      })
      .then((res) => {
        setMembers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data || {});
        }
      });
  };

  const handleSubmitModal = (e) => {
    e.preventDefault();
    const getToken = localStorage.getItem("token");
    const url = isEditMode
      ? `${API_URL}/member/${currentMemberId}`
      : `${API_URL}/member`;

    const method = isEditMode ? axios.put : axios.post;

    method(url, formModal, {
      headers: {
        Authorization: `Bearer ${getToken}`,
        Accept: "application/json",
      },
    })
      .then(() => {
        setShowModal(false);
        setSuccessMessage(
          isEditMode ? "Berhasil mengubah data" : "Berhasil menambah data"
        );
        setFormModal({
          no_ktp: "",
          nama: "",
          alamat: "",
          tgl_lahir: "",
        });
        setIsEditMode(false);
        setCurrentMemberId(null);
        fetchMembers();
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Update Berhasil' : 'Tambah Berhasil',
          text: 'Data member berhasil diproses!',
        });
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data || { message: "Terjadi kesalahan" });
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Terjadi kesalahan saat memproses data.',
          });
        }
      });
  };

  const handleEdit = (member) => {
    setFormModal({
      no_ktp: member.no_ktp,
      nama: member.nama,
      alamat: member.alamat,
      tgl_lahir: member.tgl_lahir,
    });
    setCurrentMemberId(member.id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDeleteConfirm = () => {
    const getToken = localStorage.getItem("token");
    axios
      .delete(`${API_URL}/member/${deleteTargetId}`, {
        headers: {
          Authorization: `Bearer ${getToken}`,
          Accept: "application/json",
        },
      })
      .then(() => {
        setSuccessMessage("Berhasil menghapus data member");
        setShowDeleteModal(false);
        setDeleteTargetId(null);
        fetchMembers();
        Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Data member berhasil dihapus.',
        });
      })
      .catch((err) => {
        setError(err.response?.data || { message: "Gagal menghapus data" });
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Gagal menghapus data member.',
        });
      });
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    setFormModal({ ...formModal, [e.target.name]: e.target.value });
  };

  const fetchMemberDetail = (id) => {
    const getToken = localStorage.getItem("token");
    axios
      .get(`${API_URL}/member/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken}`,
          Accept: "application/json",
        },
      })
      .then((res) => {
        setSelectedMember(res.data);
        setShowDetailModal(true);
      })
      .catch((err) => {
        setError(err.response?.data || { message: "Gagal memuat detail member" });
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Gagal memuat detail member.',
        });
      });
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(members);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "data_member.xlsx");
  };

  const filteredMembers = members.filter((m) =>
    m.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalPage = Math.ceil(filteredMembers.length / PAGE_SIZE);
  const pagedMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)",
      paddingTop: 40,
      paddingBottom: 40
    }}>
      <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div className="d-flex align-items-center gap-3">
            <i className="bi bi-people-fill fs-2 text-primary"></i>
            <div>
              <h3 className="fw-bold text-primary mb-0">Data Member</h3>
              <div className="text-muted" style={{ fontSize: 15 }}>Manajemen data anggota perpustakaan</div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button variant="success" className="fw-bold shadow" onClick={handleExportExcel}>
              <i className="bi bi-file-earmark-excel me-2"></i>Export Excel
            </Button>
            <Button
              variant="primary"
              className="fw-bold shadow"
              onClick={() => {
                setIsEditMode(false);
                setFormModal({ no_ktp: "", nama: "", alamat: "", tgl_lahir: "" });
                setShowModal(true);
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>Tambah Member
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Form.Control
            type="text"
            placeholder="Cari nama member..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="shadow-sm"
            style={{ maxWidth: 350 }}
          />
        </div>

        {successMessage && (
          <Alert variant="success" className="mb-3">{successMessage}</Alert>
        )}
        {error.message && (
          <Alert variant="danger" className="mb-3">{error.message}</Alert>
        )}

        {pagedMembers.length === 0 ? (
          <Alert variant="info" className="text-center">Data member tidak ditemukan.</Alert>
        ) : (
          <>
            <Row xs={1} md={2} lg={3} className="g-4">
              {pagedMembers.map((member) => (
                <Col key={member.id}>
                  <Card
                    className="shadow-sm border-0 member-card"
                    style={{
                      borderRadius: 18,
                      minHeight: 220,
                      transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center mb-2">
                        <span className="badge bg-primary me-2">{member.no_ktp}</span>
                        <span className="text-muted ms-auto" style={{ fontSize: 13 }}>ID: {member.id}</span>
                      </div>
                      <h5 className="fw-bold text-primary mb-1">{member.nama}</h5>
                      <div className="mb-2 text-secondary" style={{ fontSize: 15 }}>
                        <i className="bi bi-geo-alt-fill me-1"></i>{member.alamat}
                      </div>
                      <div className="mb-2 text-muted" style={{ fontSize: 13 }}>
                        <i className="bi bi-calendar-event me-1"></i>{member.tgl_lahir}
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => fetchMemberDetail(member.id)}
                          style={{ borderRadius: 8 }}
                        >
                          <i className="bi bi-eye"></i> Detail
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => navigate(`/detailDataMember/${member.id}`)}
                          style={{ borderRadius: 8 }}
                        >
                          <i className="bi bi-journal-text"></i> Data Peminjaman
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleEdit(member)}
                          style={{ borderRadius: 8 }}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
                          style={{ borderRadius: 8 }}
                        >
                          <i className="bi bi-trash"></i> Hapus
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
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

        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>Detail Member</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedMember ? (
              <>
                <p><strong>No KTP:</strong> {selectedMember.no_ktp}</p>
                <p><strong>Nama:</strong> {selectedMember.nama}</p>
                <p><strong>Alamat:</strong> {selectedMember.alamat}</p>
                <p><strong>Tanggal Lahir:</strong> {selectedMember.tgl_lahir}</p>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Form onSubmit={handleSubmitModal}>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title>{isEditMode ? "Edit Member" : "Tambah Member"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>No KTP</Form.Label>
                <Form.Control
                  type="text"
                  name="no_ktp"
                  value={formModal.no_ktp}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nama</Form.Label>
                <Form.Control
                  type="text"
                  name="nama"
                  value={formModal.nama}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Alamat</Form.Label>
                <Form.Control
                  type="text"
                  name="alamat"
                  value={formModal.alamat}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tanggal Lahir</Form.Label>
                <Form.Control
                  type="date"
                  name="tgl_lahir"
                  value={formModal.tgl_lahir}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                {isEditMode ? "Update" : "Create"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton className="bg-danger text-white">
            <Modal.Title>Konfirmasi Hapus</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Apakah Anda yakin ingin menghapus member ini?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}
