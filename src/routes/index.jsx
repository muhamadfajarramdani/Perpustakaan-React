import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import MemberManagement from '../pages/members/index.jsx';
import Template from '../layouts/Template.jsx';
import BookManagement from '../pages/books/index.jsx';
import PeminjamanPage from '../pages/peminjaman/index.jsx';
import DendaPage from '../pages/peminjaman/denda.jsx';
import MemberLoans from '../pages/members/detailMember.jsx';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Template />,
    children: [
      {
        path: "/",
        element: <App />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/register",
        element: <Register />
      },
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "/members",
        element: <MemberManagement />
      },
      {
        path: "/books",
        element: <BookManagement />
      },
      {
        path: "/peminjaman",
        element: <PeminjamanPage />
      },
      {
        path: "/denda",
        element: <DendaPage />
      },
      {
        path: "detailDataMember/:memberId",
        element: <MemberLoans />
      }
    ]
  }
]);
