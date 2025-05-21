import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  const books = [
    {
      src: "/buku-1.webp",
      title: "Buku 1",
      desc: "Deskripsi singkat tentang buku pertama."
    },
    {
      src: "/buku-2.webp",
      title: "Buku 2",
      desc: "Deskripsi singkat tentang buku kedua."
    },
    {
      src: "/buku-3.webp",
      title: "Buku 3",
      desc: "Deskripsi singkat tentang buku ketiga."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + books.length) % books.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % books.length);
  };

  return (
    <div>
      <Navbar onLogout={handleLogout} />

      {/* Background Buram */}
      <div
        style={{
          backgroundImage: 'url(/perpustakaan-image.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5) blur(2px)',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50%',
        }}
      ></div>

      {/* Konten Hero */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          color: 'white',
        }}
      >
        <div className="container py-5 mt-5 text-center">
          <h1 className="display-4 mb-3 animate__animated animate__fadeIn" style={{ fontWeight: 'bold' }}>
            Selamat Datang di <span style={{ color: '#00d8ff' }}>Perpustakaan Digital</span>
          </h1>
          <p className="lead animate__animated animate__fadeIn">
            Temukan koleksi buku terbaik untuk menambah wawasan dan ilmu pengetahuan Anda
          </p>
          {/* Tampilkan tombol hanya jika belum login */}
          {!token && (
            <div className="d-flex justify-content-center mt-4">
              <a href="/login" className="btn btn-lg btn-outline-light mx-2 animate__animated animate__fadeIn">
                Login
              </a>
              <a href="/register" className="btn btn-lg btn-primary mx-2 animate__animated animate__fadeIn">
                Daftar
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Marquee Pengumuman */}
      <div style={{ background: 'black', color: '#fff', fontWeight: 'bold', fontSize: 18, borderRadius: 20 }}>
        <marquee behavior="scroll" direction="left" scrollamount="7">
          📢 Pengumuman: Jadwal buka perpustakaan Senin-Sabtu 08.00-16.00 | Dapatkan hadiah menarik untuk 10 peminjam terbanyak bulan ini! | Download aplikasi mobile kami di Play Store!
        </marquee>
      </div>

      {/* Statistik Singkat */}
      <div className="py-4" style={{ background: '#fff' }}>
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-3">
              <div className="fw-bold fs-2 text-info">1200+</div>
              <div className="text-muted">Buku Digital</div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="fw-bold fs-2 text-success">800+</div>
              <div className="text-muted">Anggota Aktif</div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="fw-bold fs-2 text-warning">150+</div>
              <div className="text-muted">Buku Dipinjam Hari Ini</div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="fw-bold fs-2 text-danger">15</div>
              <div className="text-muted">Event Tahun Ini</div>
            </div>
          </div>
        </div>
      </div>

      {/* Buku Populer */}
      <div className="py-5" style={{ backgroundColor: '#f7f7f7' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>📚 Buku Populer</h2>
          <div className="text-center">
            <div className="d-flex justify-content-center mb-3">
              <img
                src={books[currentIndex].src}
                alt={books[currentIndex].title}
                style={{
                  height: '300px',
                  width: '200px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              />
            </div>
            <h5 style={{ color: '#555' }}>{books[currentIndex].title}</h5>
            <p style={{ color: '#777' }}>{books[currentIndex].desc}</p>
            <div className="mt-3">
              <button className="btn btn-outline-secondary mx-2" onClick={goToPrev}>Previous</button>
              <button className="btn btn-outline-secondary mx-2" onClick={goToNext}>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Fitur Pencarian */}
      <div className="py-5" style={{ background: '#222', color: 'white' }}>
        <div className="container text-center">
          <h2 className="mb-4" style={{ fontWeight: 'bold' }}>🔍 Cari Buku Anda</h2>
          <div className="d-flex justify-content-center">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Cari buku favoritmu..."
              style={{
                backgroundColor: '#333',
                border: '1px solid #555',
                color: 'white',
              }}
            />
            <button className="btn btn-info ms-2">Cari</button>
          </div>
        </div>
      </div>

      {/* Tentang Perpustakaan */}
      <div className="py-5" style={{ backgroundColor: '#f0f0f0' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>📖 Tentang Perpustakaan</h2>
          <div className="row">
            <div className="col-md-6">
              <p style={{ color: '#444' }}>
                Perpustakaan Digital adalah tempat untuk menemukan buku-buku terbaik, mulai dari fiksi, non-fiksi,
                hingga literatur pendidikan. Kami menyediakan akses mudah dan cepat bagi siapa saja yang ingin belajar
                dan berkembang.
              </p>
            </div>
            <div className="col-md-6">
              <p style={{ color: '#444' }}>
                Anda hanya perlu login atau mendaftar untuk mendapatkan akses ke koleksi lengkap buku digital kami
                yang bisa dibaca kapan saja, di mana saja tanpa batasan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimoni Pengguna */}
      <div className="py-5" style={{ background: '#f7f7f7' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>💬 Testimoni Pengguna</h2>
          <div className="row justify-content-center">
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <p>"Koleksi bukunya lengkap dan mudah diakses!"</p>
                <div className="fw-bold text-info">- Rina, Mahasiswa</div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <p>"Saya suka fitur pencariannya, sangat membantu."</p>
                <div className="fw-bold text-info">- Budi, Guru</div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <p>"Event literasi di perpustakaan sangat seru!"</p>
                <div className="fw-bold text-info">- Sari, Pelajar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kategori Buku */}
      <div className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>Kategori Buku</h2>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <span className="badge bg-primary fs-6 p-3">Fiksi</span>
            <span className="badge bg-success fs-6 p-3">Non-Fiksi</span>
            <span className="badge bg-warning text-dark fs-6 p-3">Teknologi</span>
            <span className="badge bg-info text-dark fs-6 p-3">Bisnis</span>
            <span className="badge bg-danger fs-6 p-3">Sains</span>
            <span className="badge bg-secondary fs-6 p-3">Sejarah</span>
            <span className="badge bg-dark fs-6 p-3">Novel</span>
            <span className="badge bg-light text-dark fs-6 p-3">Komik</span>
          </div>
        </div>
      </div>

      {/* Buku Terbaru */}
      <div className="py-5" style={{ background: '#f7f7f7' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>🆕 Buku Terbaru</h2>
          <div className="row justify-content-center">
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm">
                <img src="/buku-4.webp" className="card-img-top" alt="Buku 4" />
                <div className="card-body">
                  <h5 className="card-title">Buku 4</h5>
                  <p className="card-text">Buku terbaru tentang teknologi masa depan.</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm">
                <img src="/buku-5.webp" className="card-img-top" alt="Buku 5" />
                <div className="card-body">
                  <h5 className="card-title">Buku 5</h5>
                  <p className="card-text">Novel inspiratif karya penulis lokal.</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm">
                <img src="/buku-6.webp" className="card-img-top" alt="Buku 6" />
                <div className="card-body">
                  <h5 className="card-title">Buku 6</h5>
                  <p className="card-text">Panduan bisnis untuk pemula.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buku Rekomendasi */}
      <div className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>⭐ Buku Rekomendasi</h2>
          <div className="row justify-content-center">
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm">
                <img src="/buku-7.webp" className="card-img-top" alt="Buku 7" />
                <div className="card-body">
                  <h5 className="card-title">Buku 7</h5>
                  <p className="card-text">Buku motivasi yang wajib dibaca semua kalangan.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm">
                <img src="/buku-8.webp" className="card-img-top" alt="Buku 8" />
                <div className="card-body">
                  <h5 className="card-title">Buku 8</h5>
                  <p className="card-text">Komik edukasi untuk anak-anak.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event/Kegiatan */}
      <div className="py-5" style={{ background: '#f7f7f7' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>🎉 Event & Kegiatan</h2>
          <div className="row justify-content-center">
            <div className="col-md-6 mb-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 className="fw-bold text-primary">Lomba Membaca Cepat</h5>
                <p>Ikuti lomba membaca cepat dan menangkan hadiah menarik! 20 Mei 2025.</p>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="p-3 bg-white rounded shadow-sm">
                <h5 className="fw-bold text-primary">Workshop Menulis Cerita</h5>
                <p>Belajar menulis cerita bersama penulis profesional. 5 Juni 2025.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Aplikasi Mobile */}
      <div className="py-5" style={{ background: '#fff' }}>
        <div className="container text-center">
          <h2 className="mb-4" style={{ fontWeight: 'bold', color: '#333' }}>📱 Download Aplikasi Mobile</h2>
          <a href="#" className="btn btn-info btn-lg px-4">
            <i className="bi bi-google-play"></i> Download di Play Store
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-5" style={{ background: '#f7f7f7' }}>
        <div className="container">
          <h2 className="text-center mb-4" style={{ fontWeight: 'bold', color: '#333' }}>❓ FAQ</h2>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="faq1">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
                  Bagaimana cara meminjam buku?
                </button>
              </h2>
              <div id="collapse1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Login, cari buku yang diinginkan, lalu klik tombol "Pinjam".
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header" id="faq2">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2">
                  Apakah ada denda jika terlambat mengembalikan buku?
                </button>
              </h2>
              <div id="collapse2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  Ya, denda akan dikenakan sesuai kebijakan perpustakaan.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kontak Cepat */}
      <div className="py-5" style={{ background: '#fff' }}>
        <div className="container text-center">
          <h2 className="mb-4" style={{ fontWeight: 'bold', color: '#333' }}>📞 Kontak Cepat</h2>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success btn-lg px-4"
          >
            <i className="bi bi-whatsapp"></i> Hubungi Admin via WhatsApp
          </a>
        </div>
      </div>

      {/* Routing */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
