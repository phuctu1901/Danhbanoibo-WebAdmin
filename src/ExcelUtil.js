import * as XLSX from 'xlsx';

export const ExcelUtil = {
  // 1. Download Template
  downloadTemplate: () => {
    // Sheet 1: Phong Ban
    const deptHeaders = [['ID', 'TenPhongBan', 'Icon_SFSymbol']];
    const deptData = [
      ['DEPT_1', 'Ban Giám Đốc', 'building.2'],
      ['DEPT_2', 'Phòng Kỹ Thuật', 'desktopcomputer']
    ];
    const wsDept = XLSX.utils.aoa_to_sheet([...deptHeaders, ...deptData]);

    // Sheet 2: Nhan Su
    const personHeaders = [[
      'HoTen', 'PhongBan_ID', 'ChucVu', 'SoDienThoai', 'Email', 
      'GioiTinh', 'NgaySinh', 'SoDienThoaiPhu', 'BiDanh', 
      'PhongLamViec', 'SoMayLe', 'Zalo', 'Telegram', 
      'Facebook', 'Signal', 'Signet', 'GhiChu'
    ]];
    const personData = [
      [
        'Nguyễn Văn A', 'DEPT_1', 'Giám Đốc', '0987654321', 'nguyenvana@gmail.com', 
        'Nam', '01/01/1980', '', '', 
        'Phòng 101', '101', '0987654321', '@nguyenvana', 
        '', '', '', 'Sếp lớn'
      ]
    ];
    const wsPerson = XLSX.utils.aoa_to_sheet([...personHeaders, ...personData]);

    // Create workbook and append sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsDept, "PhongBan");
    XLSX.utils.book_append_sheet(wb, wsPerson, "NhanSu");

    // Write file
    XLSX.writeFile(wb, "FormMau_DanhBa.xlsx");
  },

  // 2. Parse Excel File
  parseExcel: (file, onComplete, onError) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let newDepts = [];
        let newPeople = [];

        // Parse PhongBan sheet
        if (workbook.Sheets["PhongBan"]) {
          const deptJson = XLSX.utils.sheet_to_json(workbook.Sheets["PhongBan"]);
          newDepts = deptJson.map(row => ({
            id: row.ID || `D_${Date.now()}_${Math.random()}`,
            name: row.TenPhongBan || 'Chưa đặt tên',
            icon: row.Icon_SFSymbol || ''
          }));
        }

        // Parse NhanSu sheet
        if (workbook.Sheets["NhanSu"]) {
          const personJson = XLSX.utils.sheet_to_json(workbook.Sheets["NhanSu"]);
          newPeople = personJson.map(row => ({
            id: `P_${Date.now()}_${Math.random()}`,
            fullName: row.HoTen || 'Chưa có tên',
            departmentId: row.PhongBan_ID || (newDepts[0] ? newDepts[0].id : ''),
            position: row.ChucVu || '',
            phone: row.SoDienThoai ? String(row.SoDienThoai) : '',
            email: row.Email || '',
            gender: row.GioiTinh || 'Nam',
            birthday: row.NgaySinh ? String(row.NgaySinh) : '',
            secondaryPhone: row.SoDienThoaiPhu ? String(row.SoDienThoaiPhu) : '',
            alias: row.BiDanh || '',
            officeRoom: row.PhongLamViec || '',
            extensionNumber: row.SoMayLe ? String(row.SoMayLe) : '',
            zalo: row.Zalo ? String(row.Zalo) : '',
            telegram: row.Telegram || '',
            facebook: row.Facebook || '',
            signal: row.Signal ? String(row.Signal) : '',
            signet: row.Signet || '',
            note: row.GhiChu || ''
          }));
        }

        onComplete(newDepts, newPeople);
      } catch (err) {
        onError(err.message);
      }
    };
    reader.onerror = () => onError("File read failed");
    reader.readAsArrayBuffer(file);
  }
};
