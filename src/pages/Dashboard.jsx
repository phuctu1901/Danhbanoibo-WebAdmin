import React, { useState, useRef } from 'react';
import { CryptoUtil } from '../CryptoUtil';
import { ExcelUtil } from '../ExcelUtil';
import { Download, KeyRound, Smartphone, Database, ShieldCheck, Key, Copy, Save, FileSpreadsheet, Upload } from 'lucide-react';

export default function Dashboard({ masterKey, setMasterKey, departments, people, saveDepts, savePeople }) {
  const [deviceId, setDeviceId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [importKeyInput, setImportKeyInput] = useState('');
  const fileInputRef = useRef(null);

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    if (!deviceId) return;
    const code = await CryptoUtil.generateActivationCode(masterKey, deviceId);
    setActivationCode(code);
  };

  const handleExport = async () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      departments,
      people
    };

    const jsonString = JSON.stringify(exportData);
    const encryptedData = await CryptoUtil.encryptData(jsonString, masterKey);
    
    const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danhba.enc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    ExcelUtil.parseExcel(file, (newDepts, newPeople) => {
      if (window.confirm(`Đã tìm thấy ${newDepts.length} phòng ban và ${newPeople.length} nhân sự trong file Excel. Bạn có muốn GHI ĐÈ dữ liệu hiện tại không? (Dữ liệu cũ sẽ bị xóa)`)) {
        saveDepts(newDepts);
        savePeople(newPeople);
        alert("Nhập dữ liệu thành công!");
      }
      e.target.value = ''; // reset input
    }, (error) => {
      alert("Lỗi khi đọc file Excel: " + error);
      e.target.value = '';
    });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Tổng Quan Hệ Thống</h1>
      
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <Database className="stat-icon text-primary" size={32} />
          <div className="stat-value">{departments.length}</div>
          <div className="stat-label">Phòng Ban</div>
        </div>
        <div className="stat-card glass-panel">
          <Database className="stat-icon text-primary" size={32} />
          <div className="stat-value">{people.length}</div>
          <div className="stat-label">Nhân Sự</div>
        </div>
        <div className="stat-card glass-panel">
          <ShieldCheck className="stat-icon text-success" size={32} />
          <div className="stat-value">AES-256</div>
          <div className="stat-label">Mã hóa GCM</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-panel">
          <h2><Download size={20} className="text-accent"/> Xuất File Dữ Liệu</h2>
          <p className="subtitle mb-4">
            File danhba.enc sau khi xuất đã được mã hóa. Chỉ thiết bị có mã kích hoạt mới có thể đọc.
          </p>
          <button onClick={handleExport} className="w-full justify-center accent">
            <Download size={18}/> Tải file danhba.enc
          </button>
        </div>

        <div className="glass-panel">
          <h2><KeyRound size={20} className="text-accent"/> Cấp Mã Kích Hoạt</h2>
          <p className="subtitle mb-4">
            Nhập Device ID của thiết bị cần cấp quyền truy cập.
          </p>
          <form onSubmit={handleGenerateCode} className="flex gap-2">
            <input 
              placeholder="VD: 276EB32B-..." 
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
              required
            />
            <button type="submit" className="accent"><Smartphone size={16}/> Tạo mã</button>
          </form>
          
          {activationCode && (
            <div className="code-box mt-4">
              <div className="text-muted text-sm mb-2">Mã kích hoạt:</div>
              <div className="text-lg">{activationCode}</div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel mt-4 border-dashed" style={{ borderColor: 'var(--success)' }}>
        <h2><FileSpreadsheet size={20} className="text-success"/> Quản Lý Dữ Liệu bằng Excel</h2>
        <p className="subtitle mb-4">
          Bạn có thể nhập liệu toàn bộ danh bạ bằng phần mềm Microsoft Excel thay vì nhập tay trên web. Dữ liệu từ Excel sẽ ghi đè lên dữ liệu hiện tại trên web.
        </p>
        
        <div className="grid-2">
          <button onClick={ExcelUtil.downloadTemplate} className="secondary w-full justify-center">
            <Download size={16}/> Tải Form Mẫu Excel
          </button>
          
          <div>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleExcelUpload}
            />
            <button className="secondary w-full justify-center" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16}/> Upload File Excel đã nhập
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel mt-4 border-dashed" style={{ borderColor: 'var(--border-light)' }}>
        <h2><Key size={20} className="text-muted"/> Quản Lý Master Key (Khóa Chủ)</h2>
        <p className="subtitle mb-4">
          Master Key là chìa khóa gốc dùng để mã hóa file. Nếu bạn đổi trình duyệt hoặc cài lại máy, bạn cần lưu lại đoạn mã này để nạp lại.
        </p>
        
        <div className="flex gap-2 mb-4">
          <input 
            type={showKey ? "text" : "password"}
            value={CryptoUtil.bytesToBase64(masterKey)}
            readOnly
            className="font-mono bg-dark"
          />
          <button className="secondary" onClick={() => setShowKey(!showKey)}>{showKey ? 'Ẩn' : 'Hiện'}</button>
          <button className="secondary" onClick={() => navigator.clipboard.writeText(CryptoUtil.bytesToBase64(masterKey))}><Copy size={16}/> Copy</button>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted mb-2">Nhập Master Key có sẵn (Dùng khi chuyển máy):</p>
          <div className="flex gap-2">
            <input 
              placeholder="Paste Master Key dạng Base64 vào đây..." 
              value={importKeyInput}
              onChange={e => setImportKeyInput(e.target.value)}
            />
            <button className="danger" onClick={() => {
              try {
                const newKey = CryptoUtil.base64ToBytes(importKeyInput);
                if (newKey.length !== 32) throw new Error("Invalid key length");
                setMasterKey(newKey);
                localStorage.setItem('danhba_master_key', importKeyInput);
                setImportKeyInput('');
                alert("Đã cập nhật Master Key thành công!");
              } catch (e) {
                alert("Master Key không hợp lệ!");
              }
            }}><Save size={16}/> Khôi phục</button>
          </div>
        </div>
      </div>
    </div>
  );
}
