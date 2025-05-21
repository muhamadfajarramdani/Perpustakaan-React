import React, { useEffect, useState } from "react";
import axios from "axios";
import { Accordion, Card, Spinner, Table, Alert, Container, Row, Col, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom"; // tambahkan useNavigate
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://45.64.100.26:88/perpus-api/public/api";

export default function MemberLoans() {
  const { memberId } = useParams();
  const navigate = useNavigate(); // tambahkan ini
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [loans, setLoans] = useState([]);
  const [dendas, setDendas] = useState([]);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cek token login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAllData();
    bukuId();
    fetchDenda();
  }, [memberId, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const [memberRes, loanRes] = await Promise.all([
        axios.get(`${API_URL}/member/${memberId}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
        axios.get(`${API_URL}/peminjaman`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
      ]);
      setMember(memberRes.data.data || memberRes.data);
      setLoans(
        Array.isArray(loanRes.data.data)
          ? loanRes.data.data.filter(l => String(l.id_member) === String(memberId))
          : []
      );
      // Denda diambil lewat fetchDenda, tidak di sini lagi
    } catch (err) {
      setError("Gagal memuat data.");
    }
    setLoading(false);
  };

  // Tambahkan fungsi bukuId
  const bukuId = () => {
    const token = localStorage.getItem("token");
    axios.get(API_URL + "/buku", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then((res) => {
        setBooks(res.data.data || res.data); // gunakan setBooks
      })
      .catch(() => {
        setBooks([]);
      });
  };

  const getBookTitle = (id) => {
        if (!Array.isArray(books)) return 'Buku Sudah Tidak Tersedia';
        const book = books.find((b) => String(b.id) === String(id));
        return book ? book.judul : 'Buku Sudah Tidak Tersedia';
    };

  // Cek field pada data denda
  const getDendaByLoan = (loan) =>
  dendas.find(
    (d) =>
      String(d.id_buku) === String(loan.id_buku) &&
      String(d.id_member) === String(loan.id_member)
  );

  const totalDenda = loans.reduce((sum, loan) => {
    const dendaObj = getDendaByLoan(loan);
    return sum + Number(dendaObj?.jumlah_denda || 0);
  }, 0);  

  useEffect(() => {
    if (books.length && loans.length) {
      // Cek id_buku dan id
      loans.forEach(l => console.log("loan.id_buku:", l.id_buku, typeof l.id_buku));
      // console.log("books:", books.map(b => [b.id, typeof b.id]));
      // console.log("books", books);
      // console.log("loans", loans);
    }
  }, [books, loans]);

  const fetchDenda = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_URL}/denda`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      setDendas(res.data.data || []);
      console.log("denda:", res.data.data);
    } catch (error) {
      setError("Gagal mengambil data denda");
    }
  };

  const handleCetakPDF = () => {
    const doc = new jsPDF();
    doc.text("Riwayat Peminjaman Member", 14, 15);

    const tableColumn = ["#", "Judul Buku", "Tanggal Pinjam", "Status", "Denda"];
    const tableRows = [];

    loans.forEach((loan, i) => {
      const dendaObj = getDendaByLoan(loan);
      tableRows.push([
        i + 1,
        getBookTitle(loan.id_buku),
        loan.tgl_pinjam,
        loan.status_pengembalian === 0
          ? "Dipinjam"
          : loan.status_pengembalian === 1
          ? "Dikembalikan"
          : "-",
        dendaObj && dendaObj.jumlah_denda
          ? `Rp ${Number(dendaObj.jumlah_denda).toLocaleString("id-ID")}`
          : "-",
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`riwayat-peminjaman-${member?.nama || "member"}.pdf`);
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Card className="shadow-lg border-0" style={{ borderRadius: 20 }}>
            <Card.Body>
              <h3 className="fw-bold mb-0 text-primary text-center">Riwayat Peminjaman Member</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 18 }}>
          <Card.Body>
            {member && (
              <>
                <h5 className="fw-bold text-primary mb-2">{member.nama}</h5>
                <div className="mb-2 text-muted">
                  <i className="bi bi-geo-alt"></i> {member.alamat}
                </div>
                <div className="mb-2 text-muted">
                  <i className="bi bi-calendar-event"></i> {member.tgl_lahir}
                </div>
                <div className="mb-3">
                  <span className="fw-bold text-danger">
                    Total Denda: Rp {totalDenda.toLocaleString("id-ID")}
                  </span>
                </div>
              </>
            )}
            <h6 className="fw-bold mb-2 text-secondary">Riwayat Peminjaman:</h6>
            <Button variant="danger" className="mb-3" onClick={handleCetakPDF}>
              <i className="bi bi-file-earmark-pdf"></i> Cetak PDF
            </Button>
            <Table bordered hover responsive className="shadow-sm bg-white" style={{ borderRadius: 12, overflow: "hidden" }}>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Judul Buku</th>
                  <th>Tanggal Pinjam</th>
                  <th>Status</th>
                  <th>Denda</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Belum pernah meminjam buku.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan, i) => {
                    const dendaObj = getDendaByLoan(loan);
                    return (
                      <tr key={loan.id}>
                        <td>{i + 1}</td>
                        <td className="fw-semibold">{getBookTitle(loan.id_buku)}</td>
                        <td>{loan.tgl_pinjam}</td>
                        <td>
                          <span className={
                            loan.status_pengembalian === 0 ? "badge bg-primary" :
                              loan.status_pengembalian === 1 ? "badge bg-success" :
                                "badge bg-secondary"
                          }>
                            {loan.status_pengembalian === 0 ? "Dipinjam" : loan.status_pengembalian === 1 ? "Dikembalikan" : "-"}
                          </span>
                        </td>
                        <td>
                          {dendaObj && dendaObj.jumlah_denda
                            ? `Rp ${Number(dendaObj.jumlah_denda).toLocaleString("id-ID")}`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}