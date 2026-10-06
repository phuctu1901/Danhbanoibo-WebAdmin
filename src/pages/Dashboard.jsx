import React, { useState, useRef, useEffect } from 'react';
import { CryptoUtil } from '../CryptoUtil';
import { ExcelUtil } from '../ExcelUtil';
import {
  Download, KeyRound, Smartphone, Database, ShieldCheck, Key, Copy, Save,
  FileSpreadsheet, Upload, FileJson, AlertTriangle, Layers, Plus, Trash2, ScanSearch, RefreshCw
} from 'lucide-react';

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

const slugify = (s) => (s || 'danhba').trim().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_|_$/g, '') || 'danhba';

export default function Dashboard({
  masterKey, setMasterKey,
  datasets, activeDataset,
  switchDataset, createDataset, renameDataset, deleteDataset, replaceAllDatasets,
  saveDepts, savePeople
}) {
  const [deviceId, setDeviceId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [importKeyInput, setImportKeyInput] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyDevice, setVerifyDevice] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const fileInputRef = useRef(null);
  const jsonBackupRef = useRef(null);
  const encFileRef = useRef(null);

  // Vân tay Master Key: 6 byte đầu của SHA-256(key) — so sánh nhanh giữa các máy
  useEffect(() => {
    (async () => {
      try {
        const h = new Uint8Array(await crypto.subtle.digest('SHA-256', masterKey));
        setFingerprint(Array.from(h.slice(0, 6)).map((b) => b.toString(16).padStart(2, '0')).join(' '));
      } catch { setFingerprint(''); }
    })();
  }, [masterKey]);

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    if (!deviceId) return;
    const code = await CryptoUtil.generateActivationCode(masterKey, deviceId.trim());
    setActivationCode(code);
  };

  // Đóng gói đúng cấu trúc ExportData mà app iOS giải mã (JSONDecoder strict key)
  const buildExportData = (ds) => ({
    version: 1,
    datasetName: ds.name || 'Danh bạ',
    departments: ds.departments.map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.icon || null // chuỗi rỗng sẽ làm iOS hiển thị icon lỗi, phải để null
    })),
    people: ds.people.map((p) => ({
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
    const { people, departments, name } = activeDataset;
    // Cảnh báo các dòng thiếu dữ liệu bắt buộc trước khi xuất
    const invalid = people.filter((p) => !p.fullName?.trim() || !p.phone?.trim() || !p.departmentId || !p.position?.trim());
    const orphanDepts = people.filter((p) => p.departmentId && !departments.some((d) => d.id === p.departmentId));
    const problems = [];
    if (invalid.length > 0) problems.push(`${invalid.length} nhân sự thiếu Họ tên / SĐT / Phòng ban / Chức vụ`);
    if (orphanDepts.length > 0) problems.push(`${orphanDepts.length} nhân sự thuộc phòng ban không tồn tại`);
    if (people.length === 0) {
      alert('Danh bạ này chưa có nhân sự để xuất file.');
      return;
    }
    if (problems.length > 0 && !window.confirm(`Cảnh báo trước khi xuất "${name}":\n\n- ${problems.join('\n- ')}\n\nCác dòng này vẫn sẽ nằm trong file nhưng có thể hiển thị thiếu trên app. Tiếp tục xuất file?`)) {
      return;
    }

    const jsonString = JSON.stringify(buildExportData(activeDataset));
    const encryptedData = await CryptoUtil.encryptData(jsonString, masterKey);

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    downloadFile(encryptedData, `${slugify(name)}_${stamp}.enc`, 'application/octet-stream');
  };

  // ===== Bảo mật: kiểm tra file .enc giả lập như trên iPhone =====
  const handleVerify = async () => {
    setVerifyResult(null);
    if (!verifyFile || !verifyDevice.trim() || !verifyCode.trim()) {
      setVerifyResult({ ok: false, msg: 'Cần chọn file .enc và nhập đủ Device ID + Mã kích hoạt.' });
      return;
    }
    setVerifying(true);
    try {
      const buf = new Uint8Array(await verifyFile.arrayBuffer());
      const dek = await CryptoUtil.recoverKey(verifyCode.trim(), verifyDevice.trim());
      const json = await CryptoUtil.decryptData(buf, dek);
      const data = JSON.parse(json);
      setVerifyResult({
        ok: true,
        msg: `Giải mã thành công — danh bạ "${data.datasetName || '(không tên)'}": ${data.departments?.length ?? 0} phòng ban, ${data.people?.length ?? 0} nhân sự. Cặp Device ID + Mã kích hoạt này dùng được cho file này.`
      });
    } catch {
      setVerifyResult({ ok: false, msg: 'Giải mã thất bại: mã kích hoạt không đúng cho Device ID này, hoặc file không phải .enc hợp lệ. Đừng gửi file cho người dùng này trước khi kiểm tra lại.' });
    }
    setVerifying(false);
  };

  // ===== Sao lưu (KHÔNG mã hoá, KHÔNG chứa Master Key) =====
  const handleBackupJson = () => {
    const backup = { version: 2, exportedAt: new Date().toISOString(), datasets };
    downloadFile(JSON.stringify(backup, null, 2), `Danhba_backup_${Date.now()}.json`, 'application/json');
  };

  const handleRestoreJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        let list;
        if (Array.isArray(data.datasets) && data.datasets.length > 0) {
          // Định dạng mới: nhiều danh bạ
          list = data.datasets.map((d) => ({
            id: d.id || `DS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: d.name || 'Danh bạ không tên',
            departments: Array.isArray(d.departments) ? d.departments : [],
            people: Array.isArray(d.people) ? d.people : [],
            updatedAt: d.updatedAt || new Date().toISOString(),
          }));
        } else if (Array.isArray(data.departments) || Array.isArray(data.people)) {
          // Định dạng cũ: 1 danh bạ phẳng
          list = [{ id: `DS_${Date.now()}`, name: data.datasetName || 'Danh bạ khôi phục', departments: data.departments || [], people: data.people || [], updatedAt: new Date().toISOString() }];
        } else {
          throw new Error('Không thấy departments/people/datasets trong file');
        }
        if (window.confirm(`File sao lưu chứa ${list.length} danh bạ (tổng ${list.reduce((s, d) => s + d.people.length, 0)} nhân sự).\n\nGHI ĐÈ toàn bộ danh bạ hiện tại? (Master Key không đổi)`)) {
          replaceAllDatasets(list);
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

  // ===== Excel: ghi đè vào danh bạ đang mở =====
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    ExcelUtil.parseExcel(file, (newDepts, newPeople) => {
      if (window.confirm(`Đã tìm thấy ${newDepts.length} phòng ban và ${newPeople.length} nhân sự trong file Excel.\n\nGHI ĐÈ vào danh bạ đang mở "${activeDataset.name}"? (Dữ liệu cũ của danh bạ này sẽ bị xóa)`)) {
        saveDepts(newDepts);
        savePeople(newPeople);
        alert('Nhập dữ liệu thành công!');
      }
      e.target.value = ''; // reset input
    }, (error) => {
      alert('Lỗi khi đọc file Excel: ' + error);
      e.target.value = '';
    });
  };

  // ===== Danger zone =====
  const handleWipe = () => {
    if (!window.confirm('XOÁ TOÀN BỘ dữ liệu trên trình duyệt này?\n\nBao gồm: mọi danh bạ + Master Key. File .enc đã phát hành và app người dùng KHÔNG bị ảnh hưởng.')) return;
    if (!window.confirm('Chắc chắn? Không thể hoàn tác. Đã sao lưu Master Key chưa?')) return;
    ['danhba_master_key', 'danhba_datasets_v1', 'danhba_active_dataset', 'danhba_depts', 'danhba_people', 'danhba_dataset_name'].forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const totalPeople = datasets.reduce((s, d) => s + d.people.length, 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Tổng Quan Hệ Thống</h1>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <Database className="stat-icon text-primary" size={32} />
          <div className="stat-value">{activeDataset.departments.length}</div>
          <div className="stat-label">Phòng Ban · {activeDataset.name}</div>
        </div>
        <div className="stat-card glass-panel">
          <Database className="stat-icon text-primary" size={32} />
          <div className="stat-value">{activeDataset.people.length}</div>
          <div className="stat-label">Nhân Sự · {activeDataset.name}</div>
        </div>
        <div className="stat-card glass-panel">
          <Layers className="stat-icon text-accent" size={32} />
          <div className="stat-value">{datasets.length}</div>
          <div className="stat-label">Danh Bạ · {totalPeople} NS toàn bộ</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-panel">
          <h2><Download size={20} className="text-accent"/> Xuất File Dữ Liệu</h2>
          <p className="subtitle mb-4">
            Xuất danh bạ <b>{activeDataset.name}</b> thành file .enc (AES-256-GCM). Trên app iOS, người dùng nhập tên danh bạ trùng tên cũ thì app tự cập nhật thay vì tạo mới.
          </p>
          <div className="mb-4">
            <label className="text-sm text-muted mb-2" style={{display: 'block'}}>Tên danh bạ (ghi vào file):</label>
            <input
              value={activeDataset.name}
              onChange={(e) => renameDataset(activeDataset.id, e.target.value)}
              placeholder="VD: Danh bạ chính"
            />
          </div>
          <button onClick={handleExport} className="w-full justify-center accent">
            <Download size={18}/> Tải file .enc (mã hóa)
          </button>
          <div className="border-t mt-4 pt-4">
            <p className="text-sm text-muted mb-2">Sao lưu dữ liệu không mã hóa (dùng khi khôi phục / chuyển máy — <b>không chứa Master Key</b>):</p>
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

      {/* ===== MULTI DANH BẠ ===== */}
      <div className="glass-panel mt-4">
        <h2><Layers size={20} className="text-accent"/> Quản Lý Tập Danh Bạ</h2>
        <p className="subtitle mb-4">
          Mỗi đơn vị / chi nhánh một danh bạ riêng — xuất file và cấp mã độc lập. Danh bạ đang mở cũng đổi được nhanh ở sidebar bên trái.
        </p>
        <div className="ds-list">
          {datasets.map((d) => (
            <div key={d.id} className={`ds-row ${d.id === activeDataset.id ? 'active' : ''}`}>
              <input
                value={d.name}
                onChange={(e) => renameDataset(d.id, e.target.value)}
                title="Sửa tên danh bạ"
              />
              <span className="ds-count">{d.departments.length} PB · {d.people.length} NS</span>
              {d.id === activeDataset.id ? (
                <span className="chip-active">Đang mở</span>
              ) : (
                <button className="secondary" onClick={() => switchDataset(d.id)}>Mở</button>
              )}
              <button
                className="icon-btn danger"
                title="Xoá danh bạ này"
                onClick={() => deleteDataset(d.id)}
              >
                <Trash2 size={15}/>
              </button>
            </div>
          ))}
        </div>
        <button
          className="secondary mt-4"
          onClick={() => {
            const name = window.prompt('Tên danh bạ mới (VD: Danh bạ Chi nhánh Bắc):');
            if (name && name.trim()) createDataset(name.trim());
          }}
        >
          <Plus size={16}/> Thêm danh bạ mới
        </button>
      </div>

      {/* ===== BẢO MẬT: KIỂM TRA FILE ===== */}
      <div className="glass-panel mt-4">
        <h2><ScanSearch size={20} className="text-accent"/> Kiểm Tra File .enc Trước Khi Phát Hành</h2>
        <p className="subtitle mb-4">
          Giả lập y như trên iPhone: dùng đúng Device ID + Mã kích hoạt bạn định gửi để giải mã thử file. Nên chạy bước này mỗi lần phát hành.
        </p>
        <div className="grid-2">
          <div>
            <input
              type="file"
              accept=".enc,.directory"
              style={{ display: 'none' }}
              ref={encFileRef}
              onChange={(e) => {
                setVerifyFile(e.target.files[0] || null);
                setVerifyResult(null);
              }}
            />
            <button className="secondary w-full justify-center" onClick={() => encFileRef.current?.click()}>
              <Upload size={16}/> {verifyFile ? verifyFile.name : 'Chọn file .enc'}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              placeholder="Device ID của người dùng"
              value={verifyDevice}
              onChange={(e) => setVerifyDevice(e.target.value)}
            />
            <input
              placeholder="Mã kích hoạt (Base64)"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              className="font-mono"
            />
            <button className="accent" onClick={handleVerify} disabled={verifying}>
              {verifying ? 'Đang giải mã…' : 'Giải mã thử'}
            </button>
          </div>
        </div>
        {verifyResult && (
          <div className={`verify-box mt-4 ${verifyResult.ok ? 'ok' : 'fail'}`}>
            {verifyResult.ok ? <ShieldCheck size={18}/> : <AlertTriangle size={18}/>}
            <span>{verifyResult.msg}</span>
          </div>
        )}
      </div>

      <div className="glass-panel mt-4 border-dashed" style={{ borderColor: 'var(--success)' }}>
        <h2><FileSpreadsheet size={20} className="text-success"/> Quản Lý Dữ Liệu bằng Excel</h2>
        <p className="subtitle mb-4">
          Nhập liệu toàn bộ danh bạ bằng Microsoft Excel thay vì nhập tay trên web. Dữ liệu từ Excel sẽ ghi đè lên danh bạ đang mở <b>{activeDataset.name}</b>.
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

        <p className="text-sm text-muted mb-2">
          Vân tay khóa (6 byte đầu SHA-256): <span className="font-mono" style={{color: 'var(--accent)'}}>{fingerprint || '…'}</span>
          {' '}— khớp vân tay trên máy khác nghĩa là đang dùng cùng một Master Key.
        </p>

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

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted mb-2">Đổi khóa mới (dùng khi nghi lộ mã / cách ly thiết bị):</p>
          <button
            className="danger"
            onClick={() => {
              if (!window.confirm('ĐỔI SANG MASTER KEY MỚI?\n\nHậu quả:\n- Mọi mã kích hoạt đã cấp sẽ KHÔNG dùng được cho file xuất sau này.\n- Bạn phải xuất file .enc mới và cấp lại mã cho từng thiết bị.\n- File .enc cũ trên máy người dùng vẫn đọc được bằng mã cũ (cho tới khi họ import bản mới).\n\nTiếp tục?')) return;
              if (!window.confirm('Đã lưu Master Key cũ chưa? Nếu sau này cần phát hành tiếp file CŨ thì phải có key cũ. Đổi bây giờ?')) return;
              const k = CryptoUtil.generateMasterKey();
              setMasterKey(k);
              localStorage.setItem('danhba_master_key', CryptoUtil.bytesToBase64(k));
              alert('Đã đổi Master Key. Copy lưu key mới, xuất file .enc mới, rồi cấp lại mã kích hoạt cho từng thiết bị.');
            }}
          >
            <RefreshCw size={16}/> Đổi Master Key mới (rotate)
          </button>
        </div>
      </div>

      {/* ===== DANGER ZONE ===== */}
      <div className="glass-panel mt-4 danger-zone">
        <h2><AlertTriangle size={20} style={{color: 'var(--danger)'}}/> Vùng Nguy Hiểm</h2>
        <p className="subtitle mb-4">
          Xoá sạch mọi danh bạ và Master Key khỏi trình duyệt này (dùng khi hết nhu cầu trên máy công cộng). File .enc đã phát hành và app người dùng không bị ảnh hưởng.
        </p>
        <button className="danger" onClick={handleWipe}>
          <Trash2 size={16}/> Xoá toàn bộ dữ liệu trình duyệt
        </button>
      </div>
    </div>
  );
}
