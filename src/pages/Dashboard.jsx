import React, { useState, useRef, useEffect } from 'react';
import { CryptoUtil } from '../CryptoUtil';
import { ExcelUtil } from '../ExcelUtil';
import { Download, KeyRound, Smartphone, Database, ShieldCheck, Key, Copy, Save, FileSpreadsheet, Upload, FileJson, AlertTriangle } from 'lucide-react';

// Trigger download file từ bytes/text
const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function Dashboard({ masterKey, setMasterKey, departments, people, saveDepts, savePeople }) {
  const [deviceId, setDeviceId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [importKeyInput, setImportKeyInput] = useState('');
  const [datasetName, setDatasetName] = useState('Danh bạ chính');
  const fileInputRef = useRef(null);
  const jsonBackupRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('danhba_dataset_name');
    if (stored) setDatasetName(stored);
  }, []);

  const updateDatasetName = (value) => {
    setDatasetName(value);
    localStorage.setItem('danhba_dataset_name', value);
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    if (!deviceId) return;
    const code = await CryptoUtil.generateActivationCode(masterKey, deviceId.trim());
    setActivationCode(code);
  };

  // Đóng gói đúng cấu trúc ExportData mà app iOS giải mã (JSONDecoder strict key)
  const buildExportData = () => ({
    version: 1,
    datasetName: datasetName || 'Danh bạ chính',
    departments: departments.map(d => ({
      id: d.id,
      name: d.name,
      icon: d.icon || null // chuỗi rỗng sẽ làm iOS hiển thị icon lỗi, phải để null
    })),
    people: people.map(p => ({
      id: p.id,
      fullName: p.fullName || '',
      gender: p.gender || 'Nam',
      phone: p.phone || '',
      secondaryPhone: p.secondaryPhone || null,
      zalo: p.zalo || null,
      telegram: p.telegram || null,
      facebook: p.facebook || null,
      signal: p.signal || null,
      signet: p.signet || null,
      email: p.email || null,
      alias: p.alias || null,
      departmentId: p.departmentId || '',
      position: p.position || '',
      title: p.title || null,
      officeRoom: p.officeRoom || null,
      extensionNumber: p.extensionNumber || null,
      workAddress: p.workAddress || null,
      homeAddress: p.homeAddress || null,
      currentAddress: p.currentAddress || null,
      note: p.note || null
    }))
  });

  const handleExport = async () => {
    // Cảnh báo các dòng thiếu dữ liệu bắt buộc trước khi xuất
    const invalid = people.filter(p => !p.fullName?.trim() || !p.phone?.trim() || !p.departmentId || !p.position?.trim());
    const orphanDepts = people.filter(p => p.departmentId && !departments.some(d => d.id === p.departmentId));
    const problems = [];
    if (invalid.length > 0) problems.push(`${invalid.length} nhân sự thiếu Họ tên / SĐT / Phòng ban / Chức vụ`);
    if (orphanDepts.length > 0) problems.push(`${orphanDepts.length} nhân sự thuộc phòng ban không tồn tại`);
    if (people.length === 0) {
      alert('Chưa có dữ liệu nhân sự để xuất file.');
      return;
    }
    if (problems.length > 0 && !window.confirm(`Cảnh báo trước khi xuất:\n\n- ${problems.join('\n- ')}\n\nCác dòng này vẫn sẽ nằm trong file nhưng có thể hiển thị thiếu trên app. Tiếp tục xuất file?`)) {
      return;
    }

    const jsonString = JSON.stringify(buildExportData());
    const encryptedData = await CryptoUtil.encryptData(jsonString, masterKey);

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    downloadFile(encryptedData, `Danhba_noibo_${stamp}.enc`, 'application/octet-stream');
  };

  // Sao lưu JSON không mã hoá (phòng khi mất Master Key / chuyển máy)
  const handleBackupJson = () => {
    const backup = { version: 1, datasetName, exportedAt: new Date().toISOString(), departments, people };
    downloadFile(JSON.stringify(backup, null, 2), `Danhba_backup_${Date.now()}.json`, 'application/json');
  };

  const handleRestoreJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.departments) || !Array.isArray(data.people)) {
          throw new Error('Thiếu departments/people');
        }
        if (window.confirm(`File sao lưu chứa ${data.departments.length} phòng ban và ${data.people.length} nhân sự.\n\nGHI ĐÈ toàn bộ dữ liệu hiện tại?`)) {
          if (data.datasetName) updateDatasetName(data.datasetName);
          saveDepts(data.departments);
          savePeople(data.people);
          alert('Đã khôi phục dữ liệu từ file sao lưu!');
        }
      } catch (err) {
        alert('File sao lưu không hợp lệ: ' + err.message);
      }
      e.target.value = '';
    };
    reader.onerror = () => {
      alert('Không đọc được file');
      e.target.value = '';
    };
    reader.readAsText(file);
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
            File .enc sau khi xuất đã được mã hóa AES-256-GCM. Chỉ thiết bị có mã kích hoạt mới có thể đọc (Import trên app iOS).
          </p>
          <div className="mb-4">
            <label className="text-sm text-muted mb-2" style={{display: 'block'}}>Tên tập dữ liệu (hiển thị trên app):</label>
            <input
              value={datasetName}
              onChange={e => updateDatasetName(e.target.value)}
              placeholder="VD: Danh bạ chính"
            />
          </div>
          <button onClick={handleExport} className="w-full justify-center accent">
            <Download size={18}/> Tải file .enc (mã hóa)
          </button>
          <div className="border-t mt-4 pt-4">
            <p className="text-sm text-muted mb-2">Sao lưu dữ liệu không mã hóa (dùng khi khôi phục / chuyển máy):</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleBackupJson} className="secondary">
                <FileJson size={16}/> Tải backup JSON
              </button>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                ref={jsonBackupRef}
                onChange={handleRestoreJson}
              />
              <button className="secondary" onClick={() => jsonBackupRef.current?.click()}>
                <Upload size={16}/> Khôi phục từ backup
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <h2><KeyRound size={20} className="text-accent"/> Cấp Mã Kích Hoạt</h2>
          <p className="subtitle mb-4">
            Nhập Device ID của thiết bị cần cấp quyền truy cập. (Trên app: màn hình Nhập dữ liệu → chạm để copy Mã thiết bị)
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
              <div className="text-muted text-sm mb-2">Mã kích hoạt (gửi cho người dùng này):</div>
              <div className="text-lg font-mono" style={{wordBreak: 'break-all'}}>{activationCode}</div>
              <button className="secondary mt-4" onClick={() => navigator.clipboard.writeText(activationCode)}>
                <Copy size={16}/> Copy mã
              </button>
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
        <p className="text-sm text-warning mb-4 flex gap-2">
          <AlertTriangle size={16} style={{flexShrink: 0, marginTop: '2px'}}/>
          <span><b>Quan trọng:</b> Nếu mất Master Key, mọi file .enc đã phát hành sẽ <b>không thể giải mã vĩnh viễn</b>, kể cả khi có dữ liệu trong trang này. Hãy Copy và lưu nơi an toàn ngay bây giờ.</span>
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
