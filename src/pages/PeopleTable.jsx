import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function PeopleTable({ people, departments, savePeople }) {
  const [justAddedId, setJustAddedId] = useState(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    // Cuộn xuống dòng vừa thêm để người dùng nhìn thấy ngay
    if (justAddedId && tableContainerRef.current) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
    }
  }, [people.length]);

  const addRow = () => {
    const newPerson = {
      id: `P_${Date.now()}`,
      fullName: '',
      gender: 'Nam',
      birthday: '',
      phone: '',
      secondaryPhone: '',
      email: '',
      zalo: '',
      telegram: '',
      facebook: '',
      signal: '',
      signet: '',
      alias: '',
      departmentId: departments[0]?.id || '',
      position: '',
      title: '',
      officeRoom: '',
      extensionNumber: '',
      workAddress: '',
      homeAddress: '',
      currentAddress: '',
      note: ''
    };
    savePeople([...people, newPerson]);
    setJustAddedId(newPerson.id);
  };

  const updatePerson = (id, field, value) => {
    const updated = people.map(p => p.id === id ? { ...p, [field]: value } : p);
    savePeople(updated);
  };

  const deletePerson = (id) => {
    savePeople(people.filter(p => p.id !== id));
  };

  return (
    <div className="page-container" style={{maxWidth: '100%'}}>
      <div className="flex-between mb-4">
        <h1 className="page-title m-0">Quản lý Nhân Sự</h1>
        <button onClick={addRow} className="accent"><Plus size={16}/> Thêm dòng mới</button>
      </div>

      <div className="glass-panel p-0">
        <div className="table-container" ref={tableContainerRef} style={{maxHeight: 'calc(100vh - 200px)'}}>
          <table className="spreadsheet-table">
            <thead>
              <tr>
                <th className="sticky-col">Họ tên *</th>
                <th>Phòng ban *</th>
                <th>Chức vụ *</th>
                <th>Chức danh</th>
                <th>Số điện thoại *</th>
                <th>Email</th>
                <th>Giới tính</th>
                <th>Ngày sinh</th>
                <th>SĐT phụ</th>
                <th>Bí danh</th>
                <th>Phòng làm việc</th>
                <th>Số máy lẻ</th>
                <th>Zalo</th>
                <th>Telegram</th>
                <th>Facebook</th>
                <th>Signal</th>
                <th>Signet</th>
                <th>ĐC cơ quan</th>
                <th>ĐC nhà</th>
                <th>ĐC hiện tại</th>
                <th>Ghi chú</th>
                <th width="50" className="sticky-col-right">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {people.map(p => (
                <tr key={p.id}>
                  <td className="editable-cell sticky-col">
                    <input value={p.fullName} onChange={e => updatePerson(p.id, 'fullName', e.target.value)} placeholder="Họ tên" autoFocus={p.id === justAddedId}/>
                  </td>
                  <td className="editable-cell">
                    <select value={p.departmentId} onChange={e => updatePerson(p.id, 'departmentId', e.target.value)}>
                      <option value="">-- Chọn --</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </td>
                  <td className="editable-cell">
                    <input value={p.position} onChange={e => updatePerson(p.id, 'position', e.target.value)} placeholder="Chức vụ"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.title || ''} onChange={e => updatePerson(p.id, 'title', e.target.value)} placeholder="Chức danh"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.phone} onChange={e => updatePerson(p.id, 'phone', e.target.value)} placeholder="SĐT"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.email || ''} onChange={e => updatePerson(p.id, 'email', e.target.value)} placeholder="Email"/>
                  </td>
                  <td className="editable-cell">
                    <select value={p.gender} onChange={e => updatePerson(p.id, 'gender', e.target.value)}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </td>
                  <td className="editable-cell">
                    <input value={p.birthday || ''} onChange={e => updatePerson(p.id, 'birthday', e.target.value)} placeholder="dd/MM/yyyy"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.secondaryPhone || ''} onChange={e => updatePerson(p.id, 'secondaryPhone', e.target.value)} placeholder="SĐT 2"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.alias || ''} onChange={e => updatePerson(p.id, 'alias', e.target.value)} placeholder="Bí danh"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.officeRoom || ''} onChange={e => updatePerson(p.id, 'officeRoom', e.target.value)} placeholder="Phòng số"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.extensionNumber || ''} onChange={e => updatePerson(p.id, 'extensionNumber', e.target.value)} placeholder="Số nội bộ"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.zalo || ''} onChange={e => updatePerson(p.id, 'zalo', e.target.value)} placeholder="SĐT Zalo"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.telegram || ''} onChange={e => updatePerson(p.id, 'telegram', e.target.value)} placeholder="Username Telegram"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.facebook || ''} onChange={e => updatePerson(p.id, 'facebook', e.target.value)} placeholder="Link Facebook"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.signal || ''} onChange={e => updatePerson(p.id, 'signal', e.target.value)} placeholder="SĐT Signal"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.signet || ''} onChange={e => updatePerson(p.id, 'signet', e.target.value)} placeholder="Tài khoản Signet"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.workAddress || ''} onChange={e => updatePerson(p.id, 'workAddress', e.target.value)} placeholder="Địa chỉ cơ quan"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.homeAddress || ''} onChange={e => updatePerson(p.id, 'homeAddress', e.target.value)} placeholder="Địa chỉ nhà"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.currentAddress || ''} onChange={e => updatePerson(p.id, 'currentAddress', e.target.value)} placeholder="Địa chỉ hiện tại"/>
                  </td>
                  <td className="editable-cell">
                    <input value={p.note || ''} onChange={e => updatePerson(p.id, 'note', e.target.value)} placeholder="Ghi chú"/>
                  </td>
                  <td className="text-center sticky-col-right bg-dark">
                    <button className="icon-btn danger" onClick={() => deletePerson(p.id)}>
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              {people.length === 0 && (
                <tr>
                  <td colSpan="22" className="text-center text-muted py-8">Chưa có dữ liệu. Bấm "Thêm dòng mới" để bắt đầu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
