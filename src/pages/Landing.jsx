import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Key, Smartphone, ArrowRight, CheckCircle2,
  FileLock, Fingerprint, Database, Zap, Cpu, ServerOff
} from 'lucide-react';

const steps = [
  {
    icon: <Database size={28} />,
    title: '1. Nhập dữ liệu',
    desc: 'Quản trị viên nhập phòng ban & nhân sự trên trang Admin (hoặc upload Excel). Dữ liệu chỉ nằm trong trình duyệt của bạn — không gửi lên bất kỳ server nào.',
    code: '{ departments: [...], people: [...] }'
  },
  {
    icon: <Lock size={28} />,
    title: '2. Mã hóa file',
    desc: 'Toàn bộ dữ liệu được đóng gói thành JSON rồi mã hóa bằng AES-256-GCM với Master Key 32 byte. Nonce 12 byte ngẫu nhiên cho mỗi lần xuất file, Tag 16 byte bảo vệ tính toàn vẹn.',
    code: 'File.enc = Nonce(12) ‖ Ciphertext ‖ Tag(16)\nCiphertext = AES-GCM(K_chủ, JSON)'
  },
  {
    icon: <Fingerprint size={28} />,
    title: '3. Cấp mã kích hoạt',
    desc: 'Mỗi thiết bị nhận một mã riêng. Mã được tạo bằng cách trộn Master Key với hash Device ID — đánh cắp mã của thiết bị này cũng vô dụng trên thiết bị khác.',
    code: 'Mã_kích_hoạt = Base64( K_chủ ⊕ SHA-256(DeviceID) )'
  },
  {
    icon: <Smartphone size={28} />,
    title: '4. Giải mã trên app',
    desc: 'App iOS tự tính SHA-256(DeviceID) của máy, XOR ngược với mã kích hoạt để thu lại Master Key, rồi giải mã file. Nhờ tính chất tự nghịch đảo của XOR, không cần gửi khóa qua mạng lần nào.',
    code: 'K_chủ = Mã_kích_hoạt ⊕ SHA-256(DeviceID)\nJSON = AES-GCM⁻¹(K_chủ, File.enc)'
  }
];

const features = [
  { icon: <Shield size={22} />, title: 'Mã hoá đầu-cuối', desc: 'AES-256-GCM (AEAD) — chuẩn được ngân hàng & chính phủ tin dùng. Tag xác thực phát hiện ngay nếu file bị chỉnh sửa.' },
  { icon: <ServerOff size={22} />, title: 'Zero-server', desc: 'Không có máy chủ lưu dữ liệu danh bạ. Mọi thứ xử lý ngay trong trình duyệt bằng Web Crypto API.' },
  { icon: <Key size={22} />, title: 'Khóa theo thiết bị', desc: 'Mã kích hoạt gắn cứng với Device ID. Thu hồi quyền = ngừng cấp mã, đổi khóa = vô hiệu toàn bộ mã cũ.' },
  { icon: <Zap size={22} />, title: 'Nhập liệu tốc độ', desc: 'Nhập kiểu bảng tính ngay trên web, hoặc tải form mẫu Excel điền hàng loạt rồi upload lại.' }
];

export default function Landing() {
  return (
    <div className="landing">
      {/* ===== HERO ===== */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <Shield size={26} className="text-accent" />
            <span>Danh bạ nội bộ</span>
          </div>
          <Link to="/admin" className="landing-nav-cta">
            Vào trang quản trị <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-glow" aria-hidden="true"></div>
        <div className="hero-badge">
          <Cpu size={14} /> AES-256-GCM · Web Crypto · Zero-server
        </div>
        <h1>
          Danh bạ nội bộ <span className="hero-gradient-text">mã hoá đầu-cuối</span>
        </h1>
        <p className="hero-subtitle">
          Công cụ nhập liệu &amp; phát hành dữ liệu danh bạ cho tổ chức.
          Dữ liệu được mã hoá ngay trong trình duyệt — chỉ thiết bị được cấp
          <b> mã kích hoạt riêng</b> mới giải mã được trên app iOS.
        </p>
        <div className="hero-actions">
          <Link to="/admin" className="landing-btn-primary">
            <FileLock size={18} /> Bắt đầu xuất file .enc
          </Link>
          <a href="#thuat-toan" className="landing-btn-ghost">
            Xem thuật toán <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="landing-section">
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ALGORITHM ===== */}
      <section className="landing-section" id="thuat-toan">
        <div className="section-heading">
          <h2>Thuật toán hoạt động thế nào?</h2>
          <p>Bốn bước từ bảng tính đến điện thoại người dùng — không có khóa nào đi qua mạng.</p>
        </div>

        <div className="steps-flow">
          {steps.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-head">
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
              </div>
              <p>{s.desc}</p>
              <pre className="step-code"><code>{s.code}</code></pre>
              {i < steps.length - 1 && <div className="step-arrow" aria-hidden="true">↓</div>}
            </div>
          ))}
        </div>

        <div className="algo-notes glass-panel">
          <h3><CheckCircle2 size={20} className="text-success" /> Vì sao thiết kế này an toàn?</h3>
          <ul className="notes-list">
            <li>
              <b>AES-256-GCM là mã hoá có xác thực (AEAD):</b> ngoài việc giấu nội dung,
              Tag 16 byte đảm bảo file không bị sửa bởi kẻ đứng giữa (MITM) — sai 1 bit là giải mã thất bại ngay.
            </li>
            <li>
              <b>XOR tự nghịch đảo (A ⊕ B ⊕ B = A):</b> nên cùng một phép XOR vừa "khoá" Master Key vào mã kích hoạt,
              vừa "mở khoá" ngược lại trên thiết bị — không cần thuật toán riêng chiều giải mã.
            </li>
            <li>
              <b>Mã kích hoạt vô dụng trên thiết bị khác:</b> vì trộn với SHA-256(DeviceID),
              mã kích hoạt bị lộ cũng chỉ khai thác được trên đúng máy đó.
            </li>
            <li>
              <b>Nonce ngẫu nhiên 12 byte mỗi lần mã hoá:</b> hai lần xuất cùng dữ liệu cho hai ciphertext khác nhau,
              chống phân tích so sánh (CPA-safe).
            </li>
            <li>
              <b>Master Key sinh bằng CSPRNG (32 byte):</b> không phải mật khẩu do người tự chọn nên có đủ entropy — không thể dò tìm vũ phu (brute-force).
            </li>
          </ul>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="landing-section">
        <div className="cta-panel">
          <h2>Sẵn sàng phát hành danh bạ?</h2>
          <p>Nhập dữ liệu → xuất file .enc → cấp mã kích hoạt cho từng thiết bị. Vận hành trong 5 phút.</p>
          <Link to="/admin" className="landing-btn-primary">
            <Shield size={18} /> Mở Admin Portal
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Danh bạ nội bộ · Admin Portal — dữ liệu của bạn không rời khỏi trình duyệt.</p>
      </footer>
    </div>
  );
}
