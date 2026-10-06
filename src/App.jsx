import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CryptoUtil } from './CryptoUtil';
import { Shield, Users, Building2, LayoutDashboard } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import DeptTable from './pages/DeptTable';
import PeopleTable from './pages/PeopleTable';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Tổng Quan' },
    { path: '/departments', icon: <Building2 size={20} />, label: 'Phòng Ban' },
    { path: '/people', icon: <Users size={20} />, label: 'Nhân Sự' },
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
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard masterKey={masterKey} setMasterKey={setMasterKey} departments={departments} people={people} saveDepts={saveDepts} savePeople={savePeople} />} />
            <Route path="/departments" element={<DeptTable departments={departments} saveDepts={saveDepts} />} />
            <Route path="/people" element={<PeopleTable people={people} departments={departments} savePeople={savePeople} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
