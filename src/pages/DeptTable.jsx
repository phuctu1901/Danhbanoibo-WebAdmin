import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function DeptTable({ departments, people, saveDepts }) {
  const [justAddedId, setJustAddedId] = useState(null);

  const addRow = () => {
    const newDept = { id: `D_${Date.now()}`, name: '', icon: '' };
    saveDepts([...departments, newDept]);
    setJustAddedId(newDept.id);
  };

  const updateDept = (id, field, value) => {
    const updated = departments.map(d => d.id === id ? { ...d, [field]: value } : d);
    saveDepts(updated);
  };

  const deleteDept = (id) => {
    const deptName = departments.find(d => d.id === id)?.name || '(chưa đặt tên)';
    const memberCount = (people || []).filter(p => p.departmentId === id).length;
    let msg = `Xóa phòng ban "${deptName}"?`;
    if (memberCount > 0) {
      msg = `Phòng ban "${deptName}" đang có ${memberCount} nhân sự.\n\nNếu xóa, các nhân sự này sẽ còn lại "không thuộc phòng ban nào" cho đến khi bạn gán lại.\n\nVẫn xóa?`;
    }
    if (window.confirm(msg)) {
      saveDepts(departments.filter(d => d.id !== id));
    }
  };

  return (
    <div className="page-container">
      <div className="flex-between mb-4">
        <h1 className="page-title m-0">Quản lý Phòng Ban</h1>
        <button onClick={addRow} className="accent"><Plus size={16}/> Thêm dòng mới</button>
      </div>

      <div className="glass-panel p-0">
        <div className="table-container">
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th width="40">STT</th>
                <th>Tên phòng ban</th>
                <th>Icon (Tuỳ chọn)</th>
                <th width="60">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d, index) => (
                <tr key={d.id}>
                  <td className="text-center text-muted">{index + 1}</td>
                  <td className="editable-cell">
                    <input
                      value={d.name}
                      onChange={(e) => updateDept(d.id, 'name', e.target.value)}
                      placeholder="Nhập tên..."
                      autoFocus={d.id === justAddedId}
                    />
                  </td>
                  <td className="editable-cell">
                    <input 
                      value={d.icon || ''} 
                      onChange={(e) => updateDept(d.id, 'icon', e.target.value)}
                      placeholder="Tên SF Symbol (vd: person.3)"
                    />
                  </td>
                  <td className="text-center">
                    <button className="icon-btn danger" onClick={() => deleteDept(d.id)}>
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-8">Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
