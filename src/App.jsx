import React, { useState, useEffect } from 'react';
// Dùng HashRouter vì GitHub Pages là host tĩnh (không rewrite URL được như BrowserRouter)
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { CryptoUtil } from './CryptoUtil';
import { Shield, Users, Building2, LayoutDashboard, Home, Plus } from 'lucide-react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DeptTable from './pages/DeptTable';
import PeopleTable from './pages/PeopleTable';

const safeParse = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    return v ?? fallback;
  } catch {
    return fallback; // localStorage hỏng/không phải JSON → không làm trắng màn hình
  }
};

const newDataset = (name, departments = [], people = []) => ({
  id: `DS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: name || 'Danh bạ không tên',
  departments,
  people,
  updatedAt: new Date().toISOString(),
});

const Sidebar = ({ datasets, activeId, switchDataset, createDataset }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Trang Chủ' },
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tổng Quan' },
    { path: '/admin/departments', icon: <Building2 size={20} />, label: 'Phòng Ban' },
    { path: '/admin/people', icon: <Users size={20} />, label: 'Nhân Sự' },
  ];

  const handleCreate = () => {
    const name = window.prompt('Tên danh bạ mới (VD: Danh bạ Chi nhánh Bắc):');
    if (name && name.trim()) createDataset(name.trim());
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Shield size={24} className="text-accent" />
        <h2>Admin Portal</h2>
      </div>

      {/* Chuyển nhanh giữa các tập danh bạ */}
      <div className="dataset-switcher">
        <label>Danh bạ đang mở</label>
        <div className="flex gap-2">
          <select value={activeId || ''} onChange={(e) => switchDataset(e.target.value)}>
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button className="icon-btn" title="Tạo danh bạ mới" onClick={handleCreate}>
            <Plus size={16} />
          </button>
        </div>
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
const AdminLayout = ({ children, ...sidebarProps }) => (
  <div className="app-layout">
    <Sidebar {...sidebarProps} />
    <main className="main-content">{children}</main>
  </div>
);

function App() {
  const [masterKey, setMasterKey] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    // Load Master Key; nếu hỏng/thiếu thì sinh mới (file .enc cũ sẽ cần khôi phục key đúng)
    let key = null;
    const storedKey = localStorage.getItem('danhba_master_key');
    if (storedKey) {
      try {
        const k = CryptoUtil.base64ToBytes(storedKey);
        if (k.length === 32) key = k;
      } catch { key = null; }
    }
    if (!key) {
      key = CryptoUtil.generateMasterKey();
      localStorage.setItem('danhba_master_key', CryptoUtil.bytesToBase64(key));
    }
    setMasterKey(key);

    // Load danh sách danh bạ (định dạng mới), tự nâng cấp từ định dạng cũ 1 danh bạ
    let list = safeParse('danhba_datasets_v1', []);
    if (!Array.isArray(list) || list.length === 0) {
      const oldDepts = safeParse('danhba_depts', []);
      const oldPeople = safeParse('danhba_people', []);
      const oldName = localStorage.getItem('danhba_dataset_name') || 'Danh bạ chính';
      list = [newDataset(oldName, oldDepts, oldPeople)];
      localStorage.setItem('danhba_datasets_v1', JSON.stringify(list));
    }
    setDatasets(list);

    const storedActive = localStorage.getItem('danhba_active_dataset');
    const active = list.some((d) => d.id === storedActive) ? storedActive : list[0].id;
    setActiveId(active);
    localStorage.setItem('danhba_active_dataset', active);
  }, []);

  const persist = (list) => {
    setDatasets(list);
    localStorage.setItem('danhba_datasets_v1', JSON.stringify(list));
  };

  const withUpdated = (id, patch) =>
    persist(datasets.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)));

  const switchDataset = (id) => {
    setActiveId(id);
    localStorage.setItem('danhba_active_dataset', id);
  };

  const createDataset = (name) => {
    const ds = newDataset(name);
    persist([...datasets, ds]);
    switchDataset(ds.id);
    return ds;
  };

  const renameDataset = (id, name) => withUpdated(id, { name });

  const deleteDataset = (id) => {
    const ds = datasets.find((d) => d.id === id);
    if (!ds) return;
    if (!window.confirm(`Xoá danh bạ "${ds.name}" (${ds.departments.length} phòng ban, ${ds.people.length} nhân sự)?\n\nChỉ xoá khỏi trình duyệt này — file .enc đã phát hành không bị ảnh hưởng.`)) return;
    const list = datasets.filter((d) => d.id !== id);
    if (list.length === 0) list.push(newDataset('Danh bạ chính'));
    persist(list);
    if (activeId === id) switchDataset(list[0].id);
  };

  const replaceAllDatasets = (list) => {
    persist(list);
    switchDataset(list[0]?.id || null);
  };

  const saveDepts = (newDepts) => withUpdated(activeId, { departments: newDepts });
  const savePeople = (newPpl) => withUpdated(activeId, { people: newPpl });

  const activeDataset = datasets.find((d) => d.id === activeId) || datasets[0] || null;

  if (!masterKey || !activeDataset) return null;

  const sidebarProps = { datasets, activeId: activeDataset.id, switchDataset, createDataset };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin" element={
          <AdminLayout {...sidebarProps}>
            <Dashboard
              masterKey={masterKey}
              setMasterKey={setMasterKey}
              datasets={datasets}
              activeDataset={activeDataset}
              switchDataset={switchDataset}
              createDataset={createDataset}
              renameDataset={renameDataset}
              deleteDataset={deleteDataset}
              replaceAllDatasets={replaceAllDatasets}
              saveDepts={saveDepts}
              savePeople={savePeople}
            />
          </AdminLayout>
        } />
        <Route path="/admin/departments" element={
          <AdminLayout {...sidebarProps}>
            <DeptTable departments={activeDataset.departments} people={activeDataset.people} saveDepts={saveDepts} />
          </AdminLayout>
        } />
        <Route path="/admin/people" element={
          <AdminLayout {...sidebarProps}>
            <PeopleTable people={activeDataset.people} departments={activeDataset.departments} savePeople={savePeople} />
          </AdminLayout>
        } />
        {/* Route lạ (VD bấm #thuat-toan cũ) → quay về landing thay vì màn đen */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
