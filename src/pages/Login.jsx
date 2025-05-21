import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../Api';
import 'bootstrap-icons/font/bootstrap-icons.css'; // make sure ini di-import

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password harus minimal 8 karakter.');
      return;
    }

    try {
      const res = await api.post('/login', { email, password });

      // Jika API tidak mengembalikan token, anggap gagal
      if (!res.data.token) {
        setError('Login gagal. Data tidak valid.');
        return;
      }

      // Simpan token dan redirect
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      // Tampilkan error dari server jika ada, atau fallback pesan default
      const message = err.response?.data?.message || 'Email atau password salah.';
      setError(message);
    }
  };


  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-gradient bg-light">
      <div className="card shadow-lg p-4 animate__animated animate__fadeIn rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-person-badge-fill fs-1 text-primary"></i>
          <h2 className="fw-bold mt-2">Welcome Back!</h2>
          <p className="text-muted mb-0">Silakan login ke akunmu</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-envelope-fill text-primary"></i>
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="form-control border-start-0"
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-lock-fill text-primary"></i>
            </span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="form-control border-start-0"
              required
            />
          </div>
          {error && <div className="alert alert-danger py-2 text-center">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 fw-semibold">
            <i className="bi bi-box-arrow-in-right me-2"></i>Login
          </button>
        </form>
        <div className="text-center mt-3">
          <small>
            Belum punya akun?{' '}
            <Link to="/register" className="text-decoration-none fw-semibold text-primary">
              Register di sini
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
