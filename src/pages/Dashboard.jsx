import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Chart, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { Card, Row, Col, Table, Button, Spinner } from 'react-bootstrap';

const API_URL = "http://45.64.100.26:88/perpus-api/public/api";
const namaPetugas = "Fajar"; // Ganti dengan nama dinamis jika ada auth
const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stat, setStat] = useState({
    buku: 0,
    member: 0,
    dipinjam: 0,
    denda: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [peminjamanTerbaru, setPeminjamanTerbaru] = useState([]);
  const [bukuPopuler, setBukuPopuler] = useState(null);
  const [anggotaAktif, setAnggotaAktif] = useState(null);
  const motivasi = [
    "Membaca adalah jendela dunia.",
    "Buku adalah sahabat terbaik.",
    "Luangkan waktu membaca setiap hari.",
    "Pengetahuan adalah investasi terbaik."
  ];
  const chartRef = useRef();

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      // Ambil data buku
      const bukuRes = await axios.get(`${API_URL}/buku`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ambil data member
      const memberRes = await axios.get(`${API_URL}/member`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ambil data peminjaman
      const pinjamRes = await axios.get(`${API_URL}/peminjaman`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ambil data denda
      const dendaRes = await axios.get(`${API_URL}/denda`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const bukuData = bukuRes.data.data || bukuRes.data;
      const memberData = memberRes.data.data || memberRes.data;
      const pinjamData = pinjamRes.data.data || pinjamRes.data;
      const dendaData = dendaRes.data.data || dendaRes.data;

      // Hitung statistik
      const totalBuku = Array.isArray(bukuData) ? bukuData.length : 0;
      const totalMember = Array.isArray(memberData) ? memberData.length : 0;
      const totalDipinjam = Array.isArray(pinjamData)
        ? pinjamData.filter(p => p.status_pengembalian === 0).length
        : 0;
      // Jumlah denda dari API denda
      const totalDenda = Array.isArray(dendaData) ? dendaData.length : 0;

      // Data grafik: peminjaman per bulan
      const bulanArr = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const peminjamanPerBulan = Array(12).fill(0);
      if (Array.isArray(pinjamData)) {
        pinjamData.forEach(p => {
          const tgl = new Date(p.tgl_pinjam);
          if (!isNaN(tgl)) {
            const idx = tgl.getMonth();
            peminjamanPerBulan[idx]++;
          }
        });
      }
      setChartData({
        labels: bulanArr,
        datasets: [
          {
            label: 'Peminjaman',
            data: peminjamanPerBulan,
            backgroundColor: 'rgba(13,110,253,0.7)',
            borderRadius: 8,
            maxBarThickness: 32,
          }
        ]
      });

      // Data tabel: 5 peminjaman terbaru
      const sortedPinjam = Array.isArray(pinjamData)
        ? [...pinjamData].sort((a, b) => new Date(b.tgl_pinjam) - new Date(a.tgl_pinjam)).slice(0, 5)
        : [];
      setPeminjamanTerbaru(sortedPinjam);

      // Cari buku terpopuler
      if (Array.isArray(pinjamData) && Array.isArray(bukuData)) {
        const bukuCount = {};
        pinjamData.forEach(p => {
          if (p.id_buku) bukuCount[p.id_buku] = (bukuCount[p.id_buku] || 0) + 1;
        });
        const populerId = Object.keys(bukuCount).sort((a, b) => bukuCount[b] - bukuCount[a])[0];
        const populer = bukuData.find(b => String(b.id) === String(populerId));
        setBukuPopuler(populer ? { ...populer, total: bukuCount[populerId] } : null);
      }

      // Cari anggota teraktif
      if (Array.isArray(pinjamData) && Array.isArray(memberData)) {
        const memberCount = {};
        pinjamData.forEach(p => {
          if (p.id_member) memberCount[p.id_member] = (memberCount[p.id_member] || 0) + 1;
        });
        const aktifId = Object.keys(memberCount).sort((a, b) => memberCount[b] - memberCount[a])[0];
        const aktif = memberData.find(m => String(m.id) === String(aktifId));
        setAnggotaAktif(aktif ? { ...aktif, total: memberCount[aktifId] } : null);
      }

      setStat({
        buku: totalBuku,
        member: totalMember,
        dipinjam: totalDipinjam,
        denda: totalDenda,
      });
    } catch (err) {
      // Handle error
    }
    setLoading(false);
  };

  const stats = [
    { label: "Total Buku", value: stat.buku, icon: "bi-book", color: "primary" },
    { label: "Total Anggota", value: stat.member, icon: "bi-people", color: "success" },
    { label: "Buku Dipinjam", value: stat.dipinjam, icon: "bi-journal-arrow-up", color: "warning" },
    { label: "Denda", value: stat.denda, icon: "bi-cash-coin", color: "danger" }
  ];

  return (
    <div className="bg-light min-vh-100 py-4 px-2 px-md-4">
      {/* Greeting */}
      <div className="mb-4 text-center text-md-start">
        <h3 className="fw-bold mb-1">Selamat Datang, {namaPetugas} 👋</h3>
        <div className="text-muted">{today}</div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Motivasi Membaca */}
          <Row className="g-3 mb-4">
            <Col xs={12} md={4}>
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 18, background: "linear-gradient(135deg, #a5d8ff 0%, #f8fafc 100%)" }}>
                <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                  <i className="bi bi-lightbulb-fill text-warning fs-1 mb-2"></i>
                  <div className="fw-bold fs-5 mb-2">Motivasi Hari Ini</div>
                  <div className="fst-italic text-secondary">{motivasi[Math.floor(Math.random() * motivasi.length)]}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 18 }}>
                <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                  <i className="bi bi-star-fill text-warning fs-1 mb-2"></i>
                  <div className="fw-bold fs-5 mb-2">Buku Terpopuler</div>
                  {bukuPopuler ? (
                    <>
                      <div className="text-primary fw-bold">{bukuPopuler.judul}</div>
                      <div className="text-muted small">Dipinjam {bukuPopuler.total}x</div>
                    </>
                  ) : (
                    <div className="text-muted">Belum ada data</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 18 }}>
                <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                  <i className="bi bi-person-badge-fill text-success fs-1 mb-2"></i>
                  <div className="fw-bold fs-5 mb-2">Anggota Teraktif</div>
                  {anggotaAktif ? (
                    <>
                      <div className="text-primary fw-bold">{anggotaAktif.nama}</div>
                      <div className="text-muted small">Meminjam {anggotaAktif.total}x</div>
                    </>
                  ) : (
                    <div className="text-muted">Belum ada data</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Statistik */}
          <Row className="g-3 mb-4">
            {stats.map((s, idx) => (
              <Col xs={12} sm={6} md={3} key={idx}>
                <Card className={`shadow-sm border-0 h-100 bg-${s.color} text-white`} style={{ borderRadius: 18 }}>
                  <Card.Body className="d-flex align-items-center gap-3">
                    <div className={`bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48 }}>
                      <i className={`bi ${s.icon} fs-3 text-white`}></i>
                    </div>
                    <div>
                      <div className="fw-bold fs-4">{s.value}</div>
                      <div className="small">{s.label}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Grafik */}
          <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: 18 }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">Grafik Peminjaman per Bulan</h5>
              <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                {chartData && (
                  <Bar
                    ref={chartRef}
                    data={{
                      ...chartData,
                      datasets: chartData.datasets.map(ds => ({
                        ...ds,
                        backgroundColor: function(context) {
                          const chart = context.chart;
                          const {ctx, chartArea} = chart;
                          if (!chartArea) return 'rgba(13,110,253,0.7)';
                          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                          gradient.addColorStop(0, '#4f8cff');
                          gradient.addColorStop(1, '#a5d8ff');
                          return gradient;
                        },
                        borderColor: '#2563eb',
                        borderWidth: 2,
                        hoverBackgroundColor: '#2563eb',
                      }))
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: {
                          display: true,
                          text: 'Statistik Peminjaman Buku per Bulan',
                          font: { size: 18, weight: 'bold' },
                          color: '#2563eb',
                          padding: { top: 10, bottom: 30 }
                        },
                        tooltip: {
                          enabled: true,
                          backgroundColor: '#2563eb',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          borderColor: '#a5d8ff',
                          borderWidth: 1,
                          padding: 12,
                        }
                      },
                      animation: {
                        duration: 1200,
                        easing: 'easeOutQuart'
                      },
                      layout: {
                        padding: { left: 10, right: 10, top: 10, bottom: 10 }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: '#2563eb', font: { size: 15, weight: 'bold' } }
                        },
                        y: {
                          beginAtZero: true,
                          grid: { color: '#e0e7ef' },
                          ticks: { color: '#2563eb', font: { size: 15, weight: 'bold' }, stepSize: 5 }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}
