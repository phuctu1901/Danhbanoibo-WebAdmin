import React, { useState, useEffect } from 'react';
// Dùng HashRouter vì GitHub Pages là host tĩnh (không rewrite URL được như BrowserRouter)
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CryptoUtil } from './CryptoUtil';
import { Shield, Users, Building2, LayoutDashboard, Home } from 'lucide-react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DeptTable from './pages/DeptTable';
import PeopleTable from './pages/PeopleTable';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Trang Chủ' },
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng Quan' },
    { path: '/admin/departments', icon: <Building2 size={20} />, label: 'Phòng Ban' },
    { path: '/admin/people', icon: <Users size={20} />, label: 'Nhân Sự' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Shield size={24} className="text-accent" />
        <h2>Admin Portal</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

// Khung trang quản trị: sidebar + nội dung
const AdminLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

function App() {
  const [masterKey, setMasterKey] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    // Load state
    const storedKey = localStorage.getItem('danhba_master_key');
    if (storedKey) {
      setMasterKey(CryptoUtil.base64ToBytes(storedKey));
    } else {
      const newKey = CryptoUtil.generateMasterKey();
      setMasterKey(newKey);
      localStorage.setItem('danhba_master_key', CryptoUtil.bytesToBase64(newKey));
    }

    const storedDepts = localStorage.getItem('danhba_depts');
    if (storedDepts) setDepartments(JSON.parse(storedDepts));

    const storedPeople = localStorage.getItem('danhba_people');
    if (storedPeople) setPeople(JSON.parse(storedPeople));
  }, []);

  const saveDepts = (newDepts) => {
    setDepartments(newDepts);
    localStorage.setItem('danhba_depts', JSON.stringify(newDepts));
  };

  const savePeople = (newPpl) => {
    setPeople(newPpl);
    localStorage.setItem('danhba_people', JSON.stringify(newPpl));
  };

  if (!masterKey) return null;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={
          <AdminLayout>
            <Dashboard masterKey={masterKey} setMasterKey={setMasterKey} departments={departments} people={people} saveDepts={saveDepts} savePeople={savePeople} />
          </AdminLayout>
        } />
        <Route path="/admin/departments" element={
          <AdminLayout>
            <DeptTable departments={departments} people={people} saveDepts={saveDepts} />
          </AdminLayout>
        } />
        <Route path="/admin/people" element={
          <AdminLayout>
            <PeopleTable people={people} departments={departments} savePeople={savePeople} />
          </AdminLayout>
        } />
      </Routes>
    </HashRouter>
  );
}

export default App;
