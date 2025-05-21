import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    c_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerProcess = (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setError("Password harus minimal 8 karakter.");
      return;
    }

    if (form.password !== form.c_password) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    axios.post("http://45.64.100.26:88/perpus-api/public/api/register", form)
      .then((res) => {
        // Cek jika API mengembalikan error di body meski status sukses
        if (res.data && res.data.errors) {
          let message = Object.values(res.data.errors).flat().join(', ');
          if (message.toLowerCase().includes('email') && message.toLowerCase().includes('taken')) {
            message = 'Email sudah terdaftar, silakan gunakan email lain.';
          }
          setError(message);
          setSuccess(false);
          return; // <-- Penting! Supaya tidak lanjut ke setSuccess(true)
        }
        setSuccess(true);
        setError('');
        setTimeout(() => {
          navigate('/login');
        }, 2200); // Tampilkan animasi sukses 2 detik lalu redirect
      })
      .catch((err) => {
        const errors = err.response?.data?.errors;
        let message = errors ? Object.values(errors).flat().join(', ') : 'Registrasi gagal';
        // Cek jika error karena email sudah terdaftar
        if (message.toLowerCase().includes('email') && message.toLowerCase().includes('taken')) {
          message = 'Email sudah terdaftar, silakan gunakan email lain.';
        }
        setError(message);
        setSuccess(false);
      });
  };

  return (
    
    <div className="d-flex align-items-center justify-content-center vh-100 bg-gradient bg-light" style={{ minHeight: '100vh' }}>
      <div className="w-100" style={{ maxWidth: 450 }}>
        <div className="card shadow-lg p-4 animate__animated animate__fadeIn rounded-4 mt-5">
          <div className="text-center mb-4">
            <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
            <h2 className="fw-bold mt-2">Buat Akun Baru</h2>
            <p className="text-muted mb-0">Lengkapi form untuk mendaftar</p>
          </div>
          {success ? (
            <div className="text-center animate__animated animate__tada">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: 60 }}></i>
              <h4 className="fw-bold mt-3 text-success">Registrasi Berhasil!</h4>
              <p className="text-muted">Anda akan diarahkan ke halaman login...</p>
            </div>
          ) : (
            <form onSubmit={registerProcess}>
              <div className="mb-3 input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-person-fill text-primary"></i>
                </span>
                <input
                  name="name"
                  placeholder="Nama Lengkap"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control border-start-0"
                  required
                />
              </div>
              <div className="mb-3 input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-envelope-fill text-primary"></i>
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control border-start-0"
                  required
                />
              </div>
              <div className="mb-3 input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-lock-fill text-primary"></i>
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control border-start-0"
                  required
                />
              </div>
              <div className="mb-3 input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-shield-lock-fill text-primary"></i>
                </span>
                <input
                  name="c_password"
                  type="password"
                  placeholder="Konfirmasi Password"
                  value={form.c_password}
                  onChange={handleChange}
                  className="form-control border-start-0"
                  required
                />
              </div>
              {/* ALERT ERROR */}
              {error && <div className="alert alert-danger py-2 text-center">{error}</div>}
              <button type="submit" className="btn btn-primary w-100 fw-semibold">
                <i className="bi bi-person-plus me-2"></i>Daftar
              </button>
            </form>
          )}
          {!success && (
            <div className="text-center mt-3">
              <small>
                Sudah punya akun?{' '}
                <Link to="/" className="text-decoration-none fw-semibold text-primary">
                  Login di sini
                </Link>
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
