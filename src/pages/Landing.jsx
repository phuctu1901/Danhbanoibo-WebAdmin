import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Key, Smartphone, ArrowRight, CheckCircle2, XCircle, Clock, UserX,
  ShieldAlert, Search, Phone, Cake, Star, Building2, WifiOff, FileSpreadsheet,
  FileJson, Database, Zap, Cpu, ServerOff, Apple, Play, RotateCcw, Loader2,
  Github, FileLock, Fingerprint, RefreshCw, Ban, Layers, ShieldCheck, AlertTriangle, KeyRound, MapPin, Timer, FlaskConical
} from 'lucide-react';
import { CryptoUtil } from '../CryptoUtil';

// TODO: Điền link khi sẵn sàng (hiện repo đang private — sửa sau)
const APP_STORE_URL = '';
const GITHUB_ADMIN_URL = 'https://github.com/phuctu1901/Danhbanoibo-WebAdmin';
const GITHUB_IOS_URL = 'https://github.com/phuctu1901/Danhbanoibo-iOS';

const SAMPLE_DEVICE_ID = '7F3D9A21-5C44-4B0E-9E1A-3D2F6B8C4A90';
const SAMPLE_JSON = '{"version":1,"datasetName":"Danh bạ demo","departments":[{"id":"DEPT_1","name":"Văn phòng","icon":null}],"people":[{"id":"P_1","fullName":"Nguyễn Văn A","gender":"Nam","phone":"0901234567","departmentId":"DEPT_1","position":"Chuyên viên"},{"id":"P_2","fullName":"Trần Thị B","gender":"Nữ","phone":"0912345678","departmentId":"DEPT_1","position":"Trưởng phòng"}]}';

const HEX_POOL = '0123456789abcdef';
const B64_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const JSON_POOL = '{}[]":,0123456789abcdeABCDEF\n';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const toHex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
const trunc = (s, n) => (s.length > n ? s.slice(0, n) + '…' : s);

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Nút App Store — hiện trỏ tạm đến mô phỏng cho đến khi điền APP_STORE_URL
const AppStoreBtn = ({ ghost = false }) => {
  const cls = ghost ? 'landing-btn-ghost' : 'landing-btn-primary';
  return (
    <a
      className={cls}
      href={APP_STORE_URL || '#mo-phong'}
      target={APP_STORE_URL ? '_blank' : undefined}
      rel={APP_STORE_URL ? 'noopener noreferrer' : undefined}
      onClick={APP_STORE_URL ? undefined : (e) => { e.preventDefault(); scrollToId('mo-phong'); }}
    >
      <Apple size={18} /> Tải app trên App Store
    </a>
  );
};

// Hiệu ứng hiện dần khi cuộn tới
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

/* ============ NỘI DUNG ============ */

const PAINS = [
  {
    icon: <FileSpreadsheet size={22} />,
    title: 'File Excel bắn nhóm chat',
    desc: 'Bản danh bạ đầy đủ số riêng tư của cán bộ nằm lòng vòng trong các nhóm Zalo — không biết ai đang giữ, ai chia tiếp.',
  },
  {
    icon: <Clock size={22} />,
    title: '5 phút sau đã lỗi thời',
    desc: 'Cán bộ chuyển công tác, đổi số điện thoại là bản in / bản PDF cũ ngay. In lại, gửi lại, nhắc nhau thay thế — vô tận.',
  },
  {
    icon: <UserX size={22} />,
    title: 'Nhập tay từng số một',
    desc: 'Mỗi người tự bấm lưu hàng trăm số vào máy — mất cả buổi, sai sót tùy tay, và chẳng bao giờ đồng bộ với nhau.',
  },
  {
    icon: <ShieldAlert size={22} />,
    title: 'Lộ là lộ vĩnh viễn',
    desc: 'Không có cơ chế thu hồi: một khi file đã nằm ở máy người ngoài thì không cách nào vô hiệu hoá bản sao đó.',
  },
];

const SOLUTIONS = [
  {
    icon: <RefreshCw size={22} />,
    title: 'Cập nhật 1 lần, cả tổ chức có ngay',
    desc: 'Quản trị sửa trên web, xuất file .enc — người dùng import trong 30 giây là có bản mới nhất.',
  },
  {
    icon: <Lock size={22} />,
    title: 'Mã hoá AES-256-GCM đầu-cuối',
    desc: 'File phát hành là mật mã. Rơi vào tay người ngoài cũng chỉ là chuỗi byte vô nghĩa.',
  },
  {
    icon: <Ban size={22} />,
    title: 'Thu hồi quyền bằng một cú click',
    desc: 'Ngừng cấp mã / đổi Master Key — toàn bộ mã kích hoạt cũ vô hiệu ngay lập tức.',
  },
  {
    icon: <ServerOff size={22} />,
    title: 'Không server, không database',
    desc: 'Không có điểm rò rỉ tập trung. Mọi phép tính chạy trong trình duyệt và trên điện thoại.',
  },
];

const USER_FEATURES = [
  { icon: <Search size={20} />, title: 'Tìm kiếm thông minh', desc: 'Gõ không dấu "nguyenvana" vẫn ra đúng người — chuẩn hoá tiếng Việt tự động. Lọc theo phòng ban, giới tính.' },
  { icon: <Phone size={20} />, title: 'Liên hệ 1 chạm', desc: 'Gọi, SĐT phụ, Zalo, Telegram, Facebook, Signal, Signet, Email — tất cả ngay trong hồ sơ.' },
  { icon: <Building2 size={20} />, title: 'Theo cơ cấu tổ chức', desc: 'Duyệt danh bạ theo sơ đồ phòng ban thay vì danh sách phẳng dài dằng dặc.' },
  { icon: <Cake size={20} />, title: 'Nhắc sinh nhật', desc: 'Sinh nhật trong tháng và sắp tới hiện sẵn — không quên lời chúc đồng nghiệp.' },
  { icon: <Star size={20} />, title: 'Yêu thích', desc: 'Ghim người hay liên lạc lên đầu danh sách, bấm sao để lưu.' },
  { icon: <WifiOff size={20} />, title: 'Offline 100%', desc: 'Dữ liệu nằm ngay trên máy — không cần mạng sau khi import, dùng trong hầm cũng được.' },
];

const ADMIN_FEATURES = [
  { icon: <FileSpreadsheet size={20} />, title: 'Nhập liệu bảng tính', desc: 'Gõ trực tiếp kiểu Excel ngay trên web, hoặc tải form mẫu .xlsx điền hàng loạt rồi upload lại.' },
  { icon: <Layers size={20} />, title: 'Nhiều danh bạ song song', desc: 'Từng đơn vị / chi nhánh một tập riêng — phát hành & cập nhật độc lập. App iOS quản lý nhiều danh bạ cùng lúc, nhập trùng tên là tự cập nhật.' },
  { icon: <Lock size={20} />, title: 'Xuất file .enc', desc: 'Một nút phát hành — JSON được mã hoá AES-256-GCM thành file .enc.' },
  { icon: <Key size={20} />, title: 'Cấp mã theo thiết bị', desc: 'Dán Device ID nhận mã kích hoạt riêng. Mỗi máy một mã, máy nào lộ cũng không dùng được sang máy khác.' },
  { icon: <ShieldCheck size={20} />, title: 'Kiểm tra file trước khi phát hành', desc: 'Giả lập đúng như trên iPhone: giải mã thử file .enc bằng cặp Device ID + mã kích hoạt sẽ gửi cho người dùng.' },
  { icon: <FileJson size={20} />, title: 'Backup JSON', desc: 'Sao lưu / khôi phục dữ liệu không mã hoá khi đổi máy, cùng cảnh báo mất Master Key.' },
];

const STEPS = [
  {
    icon: <Database size={28} />,
    title: '1. Nhập dữ liệu',
    desc: 'Quản trị viên nhập phòng ban & nhân sự trên trang Admin (hoặc upload Excel). Dữ liệu chỉ nằm trong trình duyệt — không gửi lên server nào.',
    code: '{ departments: [...], people: [...] }',
  },
  {
    icon: <Lock size={28} />,
    title: '2. Mã hoá file',
    desc: 'Dữ liệu đóng gói JSON rồi mã hoá AES-256-GCM bằng Master Key 32 byte. Nonce 12 byte ngẫu nhiên mỗi lần xuất, Tag 16 byte bảo vệ tính toàn vẹn.',
    code: 'File.enc = Nonce(12) ‖ Ciphertext ‖ Tag(16)\nCiphertext = AES-GCM(K_chủ, JSON)',
  },
  {
    icon: <Fingerprint size={28} />,
    title: '3. Cấp mã kích hoạt',
    desc: 'Mỗi thiết bị một mã riêng, tạo bằng cách trộn Master Key với hash Device ID — đánh cắp mã của máy này cũng vô dụng trên máy khác.',
    code: 'Mã_kích_hoạt = Base64( K_chủ ⊕ SHA-256(DeviceID) )',
  },
  {
    icon: <Smartphone size={28} />,
    title: '4. Giải mã trên app',
    desc: 'App iOS tự tính SHA-256(DeviceID), XOR ngược với mã kích hoạt để thu lại Master Key rồi giải mã. Nhờ XOR tự nghịch đảo, không khóa nào đi qua mạng lần nào.',
    code: 'K_chủ = Mã_kích_hoạt ⊕ SHA-256(DeviceID)\nJSON = AES-GCM⁻¹(K_chủ, File.enc)',
  },
];

const PIPELINE = [
  { icon: <Database size={26} />, title: 'Admin Web', sub: 'Nhập liệu · trình duyệt' },
  { icon: <Lock size={26} />, title: 'AES-256-GCM', sub: 'Mã hoá đầu-cuối', variant: 'lock' },
  { icon: <Smartphone size={26} />, title: 'App iOS', sub: 'Import file .enc' },
  { icon: <Shield size={26} />, title: 'Danh bạ mở khoá', sub: 'Dùng ngay offline', variant: 'success' },
];
const PIPE_LINKS = ['JSON', 'File .enc', 'Mã kích hoạt ⊕ DeviceID'];

// Sơ đồ fan-in: 3 đường cong hội tụ về đúng đỉnh card iPhone (viewBox 900×120)
const FAN_PATHS = [
  'M146 0 C146 72 450 44 450 120',
  'M450 0 L450 120',
  'M754 0 C754 72 450 44 450 120',
];

/* ============ MÔ PHỎNG MÃ HOÁ (chạy thật bằng Web Crypto) ============ */

// Hiệu ứng "chữ chạy": xoay ký tự ngẫu nhiên khi đang chạy, chốt đúng giá trị khi xong
function useScramble(finalText, running, pool) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!running) {
      setText(finalText);
      return;
    }
    const chars = pool || HEX_POOL;
    const len = Math.min(Math.max(finalText.length, 32), 120);
    const t = setInterval(() => {
      let s = '';
      for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
      setText(s);
    }, 55);
    return () => clearInterval(t);
  }, [running, finalText, pool]);
  return running ? text : finalText;
}

const SimStep = ({ index, phase, title, hint, children }) => {
  const state = phase > index ? 'done' : phase === index ? 'running' : 'idle';
  return (
    <div className={`sim-step ${state}`}>
      <div className="sim-badge">
        {state === 'running' ? (
          <Loader2 size={15} className="spin" />
        ) : state === 'done' ? (
          <CheckCircle2 size={15} />
        ) : (
          <span>{index}</span>
        )}
      </div>
      <div className="sim-body">
        <h4>{title}</h4>
        {hint && <p className="sim-hint">{hint}</p>}
        <div className="sim-out">{children}</div>
      </div>
    </div>
  );
};

function LiveSimulator() {
  const [phase, setPhase] = useState(0); // 0 = chưa chạy, 1..5 = đang chạy bước n, 6 = xong
  const [r, setR] = useState(null);
  const wrapRef = useRef(null);
  const runningRef = useRef(false);
  const startedRef = useRef(false);

  const running = phase > 0 && phase <= 5;

  const run = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setR(null);
    setPhase(1);
    const mk = CryptoUtil.generateMasterKey();
    await wait(1100);
    setR({ mk });
    setPhase(2);
    await wait(1300);
    setPhase(3);
    const enc = await CryptoUtil.encryptData(SAMPLE_JSON, mk);
    await wait(1500);
    setR((x) => ({ ...x, enc }));
    setPhase(4);
    const code = await CryptoUtil.generateActivationCode(mk, SAMPLE_DEVICE_ID);
    await wait(1300);
    setR((x) => ({ ...x, code }));
    setPhase(5);
    const dek = await CryptoUtil.recoverKey(code, SAMPLE_DEVICE_ID);
    const dec = await CryptoUtil.decryptData(enc, dek);
    await wait(1400);
    setR((x) => ({ ...x, dec, ok: dec === SAMPLE_JSON }));
    setPhase(6);
    runningRef.current = false;
  };

  // Tự chạy 1 lần khi người dùng cuộn tới
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          io.disconnect();
          run();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const mkScr = useScramble(r?.mk ? CryptoUtil.bytesToBase64(r.mk) : '', phase === 1, B64_POOL);
  const jsonScr = useScramble(SAMPLE_JSON, phase === 2, JSON_POOL);
  const nonceScr = useScramble(r?.enc ? toHex(r.enc.slice(0, 12)) : '', phase === 3, HEX_POOL);
  const ctScr = useScramble(r?.enc ? toHex(r.enc.slice(12, -16)) : '', phase === 3, HEX_POOL);
  const tagScr = useScramble(r?.enc ? toHex(r.enc.slice(-16)) : '', phase === 3, HEX_POOL);
  const codeScr = useScramble(r?.code || '', phase === 4, B64_POOL);
  const decScr = useScramble(r?.dec || '', phase === 5, JSON_POOL);

  const progress = phase <= 0 ? 0 : phase >= 6 ? 100 : ((phase - 1) / 5) * 100;

  return (
    <div className="sim glass-panel" ref={wrapRef}>
      <div className="sim-progress"><span style={{ width: `${progress}%` }} /></div>

      <div className="sim-head">
        <div>
          <h3><Cpu size={20} className="text-accent" /> Mô phỏng mã hoá — chạy thật</h3>
          <p className="sim-sub">
            Toàn bộ phép tính dưới đây dùng Web Crypto API thật ngay trong trình duyệt này với dữ liệu mẫu.
          </p>
        </div>
        <button className="landing-btn-primary sim-btn" onClick={run} disabled={running}>
          {running ? <Loader2 size={16} className="spin" /> : phase >= 6 ? <RotateCcw size={16} /> : <Play size={16} />}
          {running ? 'Đang chạy…' : phase >= 6 ? 'Chạy lại' : 'Chạy mô phỏng'}
        </button>
      </div>

      <div className="sim-steps">
        <SimStep index={1} phase={phase} title="Sinh Master Key" hint="32 byte ngẫu nhiên từ CSPRNG">
          <code className="c-key">{mkScr || '…'}</code>
        </SimStep>

        <SimStep index={2} phase={phase} title="Dữ liệu danh bạ mẫu (JSON)">
          <code className="c-json">{jsonScr || '…'}</code>
        </SimStep>

        <SimStep index={3} phase={phase} title="Mã hoá AES-256-GCM" hint="File.enc = Nonce ‖ Ciphertext ‖ Tag">
          <div className="sim-row"><span className="chip chip-nonce">Nonce 12B</span><code className="c-nonce">{nonceScr || '…'}</code></div>
          <div className="sim-row"><span className="chip chip-ct">Ciphertext</span><code className="c-ct">{trunc(ctScr, 96) || '…'}</code></div>
          <div className="sim-row"><span className="chip chip-tag">Tag 16B</span><code className="c-tag">{tagScr || '…'}</code></div>
        </SimStep>

        <SimStep index={4} phase={phase} title="Cấp mã kích hoạt" hint={`Thiết bị: ${SAMPLE_DEVICE_ID.slice(0, 13)}…`}>
          <code className="c-key">{codeScr || '…'}</code>
        </SimStep>

        <SimStep index={5} phase={phase} title="Thiết bị giải mã" hint="XOR ngược lấy lại Master Key → AES-GCM⁻¹ → kiểm tra Tag">
          <code className="c-json">{decScr || '…'}</code>
          {phase >= 6 && (
            <div className={`sim-verdict ${r?.ok ? 'ok' : 'fail'}`}>
              {r?.ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              {r?.ok ? 'Giải mã thành công — JSON khớp 100% dữ liệu gốc, Tag hợp lệ' : 'Kiểm tra thất bại'}
            </div>
          )}
        </SimStep>
      </div>
    </div>
  );
}

/* ============ TRANG ============ */

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing-grid-bg" aria-hidden="true" />

      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <Shield size={26} className="text-accent" />
            <span>Danh bạ nội bộ</span>
          </div>
          <div className="landing-nav-links">
            <button onClick={() => scrollToId('tinh-nang')}>Tính năng</button>
            <button onClick={() => scrollToId('mo-phong')}>Mô phỏng</button>
            <button onClick={() => scrollToId('thuat-toan')}>Thuật toán</button>
            <button onClick={() => scrollToId('kich-ban')}>Bảo mật</button>
          </div>
          <Link to="/admin" className="landing-nav-cta">
            Vào trang quản trị <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="landing-hero">
        <div className="orb orb-1" aria-hidden="true" />
        <div className="orb orb-2" aria-hidden="true" />
        <div className="orb orb-3" aria-hidden="true" />

        <div className="hero-badge">
          <Cpu size={14} /> AES-256-GCM · Web Crypto · Không server
        </div>
        <h1>
          Đừng để danh bạ cán bộ<br />
          nằm lòng vòng nhóm chat.{" "}
          <span className="hero-gradient-text">Mã hoá đầu-cuối.</span>
        </h1>
        <p className="hero-subtitle">
          Nhập liệu trên web → xuất file <b>.enc</b> mã hoá AES-256 → người dùng import vào app iOS
          bằng <b>mã kích hoạt riêng cho từng thiết bị</b>. Ai không được cấp — không đọc được. Hết quyền — thu hồi trong 1 giây.
          <b>Nhiều danh bạ song song</b> — mỗi đơn vị một tập riêng, phát hành &amp; cập nhật độc lập.
        </p>
        <div className="hero-actions">
          <Link to="/admin" className="landing-btn-primary">
            <FileLock size={18} /> Dùng thử trang quản trị
          </Link>
          <AppStoreBtn ghost />
          <button className="landing-btn-ghost" onClick={() => scrollToId('mo-phong')}>
            <Play size={16} /> Xem mô phỏng mã hoá
          </button>
        </div>
        <div className="hero-chips">
          <span className="hero-chip"><Layers size={13} /> Nhiều danh bạ song song</span>
          <span className="hero-chip"><Lock size={13} /> AES-256-GCM</span>
          <span className="hero-chip"><Fingerprint size={13} /> Mã theo thiết bị</span>
          <span className="hero-chip"><WifiOff size={13} /> Offline 100%</span>
          <span className="hero-chip"><Zap size={13} /> Import 30 giây</span>
        </div>
      </section>

      {/* ===== PAIN POINTS ===== */}
      <section className="landing-section" id="van-de">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-danger"><XCircle size={14} /> VẤN ĐỀ</div>
            <h2>Danh bạ truyền thống đang rò rỉ ngay trước mắt bạn</h2>
            <p>Quen thuộc đến mức chẳng ai nhận đấy là lỗ hổng bảo mật của cả tổ chức.</p>
          </div>
        </Reveal>
        <div className="features-grid pains">
          {PAINS.map((p, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="feature-card pain-card">
                <div className="feature-icon pain-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== SOLUTION ===== */}
      <section className="landing-section" id="giai-phap">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-success"><CheckCircle2 size={14} /> GIẢI PHÁP</div>
            <h2>Danh bạ nội bộ xử lý thế nào?</h2>
            <p>Mỗi pain ở trên có đúng một câu trả lời — bằng thuật toán, không bằng lời hứa.</p>
          </div>
        </Reveal>
        <div className="features-grid">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="feature-card solution-card">
                <div className="feature-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== TÍNH NĂNG CHI TIẾT ===== */}
      <section className="landing-section" id="tinh-nang">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-accent"><Zap size={14} /> TÍNH NĂNG</div>
            <h2>Bên trong ứng dụng</h2>
            <p>Một bên cho người dùng trên iPhone — một bên cho quản trị trên máy tính.</p>
          </div>
        </Reveal>
        <div className="split-2">
          <Reveal>
            <div className="split-col glass-panel">
              <h3 className="split-title"><Smartphone size={18} className="text-accent" /> App iOS — người dùng</h3>
              {USER_FEATURES.map((f, i) => (
                <div className="feat-row" key={i}>
                  <div className="feat-row-icon">{f.icon}</div>
                  <div>
                    <b>{f.title}</b>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="split-col glass-panel">
              <h3 className="split-title"><Database size={18} className="text-success" /> Web Admin — quản trị</h3>
              {ADMIN_FEATURES.map((f, i) => (
                <div className="feat-row" key={i}>
                  <div className="feat-row-icon admin">{f.icon}</div>
                  <div>
                    <b>{f.title}</b>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== MULTI DANH BẠ (CHI TIẾT) ===== */}
      <section className="landing-section" id="multi-danh-ba">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-accent"><Layers size={14} /> MULTI-DATASET</div>
            <h2>Một tổ chức — nhiều danh bạ, tách bạch tuyệt đối</h2>
            <p>
              Không nhồi tất cả vào một file duy nhất. Mỗi danh bạ là một tập dữ liệu độc lập:
              tên riêng, phòng ban riêng, nhân sự riêng — được xuất file, cập nhật và cấp quyền
              hoàn toàn tách biệt. Trên iPhone, một thiết bị giữ được nhiều danh bạ cùng lúc và
              chuyển đổi giữa chúng ngay trong app.
            </p>
          </div>
        </Reveal>

        {/* Sơ đồ fan-in: 3 danh bạ → 1 thiết bị */}
        <Reveal delay={80}>
          <div className="fanio">
            <div className="fanio-row">
              {[
                { icon: <Shield size={24} />, title: 'Danh bạ Ban Giám đốc', sub: 'Mật · chỉ lãnh đạo' },
                { icon: <Building2 size={24} />, title: 'Danh bạ Chi nhánh Bắc', sub: '21 phòng · 340 nhân sự' },
                { icon: <Building2 size={24} />, title: 'Danh bạ Chi nhánh Nam', sub: '17 phòng · 280 nhân sự' },
              ].map((n, i) => (
                <div className="fanio-card pipe-node" key={i}>
                  <div className="pipe-node-icon">{n.icon}</div>
                  <div className="pipe-node-title">{n.title}</div>
                  <div className="pipe-node-sub">{n.sub}</div>
                </div>
              ))}
            </div>
            <div className="fanio-links" aria-hidden="true">
              {/* Desktop: 3 đường cong hội tụ vào đỉnh iPhone, dot chạy theo đường cong */}
              <svg className="fanio-svg" viewBox="0 0 900 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {FAN_PATHS.map((d, i) => (
                  <path key={`p${i}`} className="fan-path" d={d} />
                ))}
                <text className="fan-label" x="146" y="22" textAnchor="middle">.enc riêng</text>
                <text className="fan-label" x="468" y="22">.enc riêng</text>
                <text className="fan-label" x="754" y="22" textAnchor="middle">.enc riêng</text>
                {FAN_PATHS.map((d, i) => (
                  <circle key={`a${i}`} className="fan-dot" r="4">
                    <animateMotion dur="2.6s" begin={`${-(i * 0.85)}s`} repeatCount="indefinite" path={d} />
                  </circle>
                ))}
                {FAN_PATHS.map((d, i) => (
                  <circle key={`b${i}`} className="fan-dot" r="4">
                    <animateMotion dur="2.6s" begin={`${-(i * 0.85 + 1.3)}s`} repeatCount="indefinite" path={d} />
                  </circle>
                ))}
                <circle className="fan-end" cx="450" cy="117" r="3.5" />
              </svg>
              {/* Mobile: 1 dây thẳng đứng duy nhất, căn giữa, chạm đỉnh iPhone */}
              <div className="fanio-link">
                <span className="vline" />
                <span className="vlabel">.enc riêng</span>
                <span className="fanio-dot" />
                <span className="fanio-dot d2" />
                <span className="fanio-dot d3" />
              </div>
            </div>
            <div className="fanio-phone">
              <div className="pipe-node-icon"><Smartphone size={24} /></div>
              <div className="pipe-node-title">Một chiếc iPhone — nhiều danh bạ</div>
              <div className="phone-line">Import từng file .enc, app quản lý các danh bạ độc lập và chuyển đổi ngay trong ứng dụng</div>
            </div>
          </div>
        </Reveal>

        {/* Use cases */}
        <div className="features-grid" style={{ marginTop: '2.5rem' }}>
          {[
            {
              icon: <ShieldAlert size={22} />,
              title: 'Cấp mật theo phạm vi',
              desc: 'Danh bạ Ban Giám đốc chứa số riêng tư của lãnh đạo — chỉ phát hành cho đúng nhóm đó. Danh bạ tác nghiệp chung thì phát rộng rãi. Mỗi tập một file, một danh sách người nhận: không ai phải giữ dữ liệu vượt quá quyền hạn của mình.',
            },
            {
              icon: <MapPin size={22} />,
              title: 'Tách theo đơn vị / địa lý',
              desc: 'Chi nhánh Bắc, Trung, Nam mỗi nơi một danh bạ. Chi nhánh nào thay đổi nhân sự thì chỉ phát hành lại đúng tập của chi nhánh đó — các chi nhánh còn lại không phải import lại gì cả, tránh xáo trộn dữ liệu đang chạy tốt.',
            },
            {
              icon: <Timer size={22} />,
              title: 'Dự án & nhiệm kỳ có thời hạn',
              desc: 'Đoàn công tác, hội nghị, dự án theo mùa — tạo một tập riêng, phát hành khi cần. Hết nhiệm kỳ: ngừng cấp mã và xoá bản nháp trên web, không để lại danh bạ "ma" vẫn lưu động ngoài kia.',
            },
            {
              icon: <FlaskConical size={22} />,
              title: 'Thử nghiệm an toàn trước khi phát hành',
              desc: 'Soạn tập "Danh bạ thử nghiệm", tự import vào máy của quản trị viên để kiểm tra hiển thị, tìm kiếm, sinh nhật — trước khi ra bản chính thức. Sai sót chỉ nằm trong sandbox, không chạm tới dữ liệu thật đã phát hành.',
            },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="feature-card">
                <div className="feature-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Quy trình vận hành 5 bước */}
        <Reveal>
          <div className="algo-notes glass-panel">
            <h3><Layers size={20} className="text-accent" /> Vận hành multi-danh bạ từ đầu đến cuối</h3>
            <ol className="playbook">
              <li>
                <b>Tạo tập &amp; đặt tên chuẩn:</b> bấm ➕ trong sidebar hoặc card "Quản Lý Tập Danh Bạ".
                Tên là danh tính của tập trên mọi thiết bị — đặt theo quy ước đơn vị (VD: <i>DB Trung ương 2026</i>)
                vì app iOS nhận diện cập nhật theo đúng tên này.
              </li>
              <li>
                <b>Nhập liệu riêng cho từng tập:</b> phòng ban và nhân sự luôn thuộc danh bạ đang mở.
                Upload Excel cũng chỉ ghi đè đúng tập đó — không có chuyện dữ liệu hai đơn vị trộn vào nhau.
              </li>
              <li>
                <b>Xuất file riêng từng tập:</b> mỗi lần xuất tạo một .enc độc lập, tên file gắn tên danh bạ
                (VD <i>DB_Trung_uong_20260106.enc</i>) — phát cho đúng nhóm người nhận, qua kênh riêng.
              </li>
              <li>
                <b>Cấp mã theo thiết bị — dùng chung cho mọi danh bạ:</b> mã kích hoạt gắn DeviceID chứ không gắn
                danh bạ, nên một thiết bị dùng một mã cho mọi file cùng khóa. Người dùng cần 2 danh bạ? Gửi 2 file,
                họ import 2 lần bằng đúng mã của máy họ.
              </li>
              <li>
                <b>Cập nhật &amp; khai tử:</b> sửa dữ liệu → xuất lại → người dùng import với đúng tên cũ, app tự
                <b> thay thế</b> tập cũ bằng bản mới. Muốn dừng hẳn một tập: ngừng phát hành, và đổi Master Key nếu nghi lộ.
              </li>
            </ol>
          </div>
        </Reveal>

        {/* Bảng so sánh */}
        <Reveal>
          <div className="compare glass-panel">
            <div className="compare-grid">
              <div className="cg-cell cg-head" />
              <div className="cg-cell cg-head bad">✗ Một file chung cho tất cả</div>
              <div className="cg-cell cg-head good">✓ Nhiều danh bạ song song</div>

              <div className="cg-cell cg-label">Khi cập nhật</div>
              <div className="cg-cell">Phát lại toàn bộ danh bạ, cả tổ chức phải import lại file khổng lồ</div>
              <div className="cg-cell">Chỉ phát lại đúng tập bị thay đổi, vài chục KB</div>

              <div className="cg-cell cg-label">Khi cấp quyền</div>
              <div className="cg-cell">Ai có file là có tất cả, không phân biệt cấp bậc</div>
              <div className="cg-cell">Nhóm nào nhận tập đó — tách được theo cấp mật, theo đơn vị</div>

              <div className="cg-cell cg-label">Khi file bị lộ</div>
              <div className="cg-cell">Mất toàn bộ danh bạ của tổ chức</div>
              <div className="cg-cell">Chỉ lộ đúng một tập, các tập khác nguyên vẹn</div>

              <div className="cg-cell cg-label">Khi thử nghiệm</div>
              <div className="cg-cell">Sửa gì cũng đụng dữ liệu thật</div>
              <div className="cg-cell">Soạn tập thử riêng, xong xoá — dữ liệu thật không bị chạm</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== PIPELINE CHẠY CHẠY ===== */}
      <section className="landing-section" id="hanh-trinh">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-accent"><ArrowRight size={14} /> HÀNH TRÌNH DỮ LIỆU</div>
            <h2>Từ bảng tính đến điện thoại — không khóa nào đi qua mạng</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="pipe">
            {PIPELINE.map((node, i) => (
              <React.Fragment key={i}>
                <div className={`pipe-node ${node.variant || ''}`}>
                  <div className="pipe-node-icon">{node.icon}</div>
                  <div className="pipe-node-title">{node.title}</div>
                  <div className="pipe-node-sub">{node.sub}</div>
                </div>
                {i < PIPE_LINKS.length && (
                  <div className="pipe-link">
                    <span className="pipe-label">{PIPE_LINKS[i]}</span>
                    <span className="pipe-line" />
                    <span className="pipe-dot d1" />
                    <span className="pipe-dot d2" />
                    <span className="pipe-dot d3" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ===== MÔ PHỎNG ===== */}
      <section className="landing-section" id="mo-phong">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-accent"><Cpu size={14} /> CHỨNG MINH</div>
            <h2>Đừng tin lời — nhìn nó chạy</h2>
            <p>Mô phỏng dùng thuật toán thật: sinh khóa thật, mã hoá thật, giải mã thật. Ngay trong trình duyệt bạn.</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <LiveSimulator />
        </Reveal>
      </section>

      {/* ===== THUẬT TOÁN ===== */}
      <section className="landing-section" id="thuat-toan">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-accent"><Shield size={14} /> THUẬT TOÁN</div>
            <h2>Bốn bước, không hơn</h2>
          </div>
        </Reveal>
        <div className="steps-flow">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="step-card">
                <div className="step-head">
                  <div className="step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                </div>
                <p>{s.desc}</p>
                <pre className="step-code"><code>{s.code}</code></pre>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="algo-notes glass-panel">
            <h3><CheckCircle2 size={20} className="text-success" /> Vì sao thiết kế này an toàn?</h3>
            <ul className="notes-list">
              <li>
                <b>AES-256-GCM là mã hoá có xác thực (AEAD):</b> ngoài việc giấu nội dung, Tag 16 byte
                đảm bảo file không bị sửa bởi kẻ đứng giữa (MITM) — sai 1 bit là giải mã thất bại ngay.
              </li>
              <li>
                <b>XOR tự nghịch đảo (A ⊕ B ⊕ B = A):</b> cùng một phép XOR vừa "khoá" Master Key vào mã
                kích hoạt, vừa "mở khoá" ngược lại trên thiết bị — không cần chiều giải mã riêng.
              </li>
              <li>
                <b>Mã kích hoạt vô dụng trên thiết bị khác:</b> đã trộn với SHA-256(DeviceID) nên mã bị lộ
                cũng chỉ khai thác được trên đúng máy được cấp.
              </li>
              <li>
                <b>Nonce ngẫu nhiên 12 byte mỗi lần mã hoá:</b> hai lần xuất cùng dữ liệu cho hai ciphertext
                khác nhau — chống phân tích so sánh (CPA-safe).
              </li>
              <li>
                <b>Master Key 32 byte từ CSPRNG:</b> không phải mật khẩu do người tự chọn nên có đủ entropy —
                không thể dò tìm vũ phu (brute-force).
              </li>
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ===== KỊCH BẢN XẤU: FILE .ENC BỊ LỘ ===== */}
      <section className="landing-section" id="kich-ban">
        <Reveal>
          <div className="section-heading">
            <div className="section-kicker text-danger"><AlertTriangle size={14} /> KỊCH BẢN XẤU</div>
            <h2>File .enc bị lộ ra ngoài thì sao?</h2>
            <p>Bốn tình huống thực tế — và câu trả lời của hệ thống ở từng mức.</p>
          </div>
        </Reveal>
        <div className="features-grid">
          {[
            {
              icon: <FileLock size={22} />,
              verdict: 'ok', verdictText: 'AN TOÀN',
              title: 'Chỉ file .enc bị lộ',
              desc: 'Gửi nhầm nhóm chat, email bị đọc, USB rơi mất — kẻ có file cũng chỉ giữ ciphertext AES-256-GCM. Không có mã kích hoạt thì đó là chuỗi byte ngẫu nhiên; dò vũ phu trên không gian 2^256 là vô nghĩa. Không cần làm gì cả.',
            },
            {
              icon: <AlertTriangle size={22} />,
              verdict: 'bad', verdictText: 'BỊ LỘ',
              title: 'File + mã kích hoạt lộ cùng lúc',
              desc: 'Đủ bộ file + mã + DeviceID là giải mã được. Vì vậy hãy gửi file và mã qua HAI KÊNH khác nhau (file qua email, mã qua tin nhắn riêng). Nếu đã xảy ra: nội dung bản đó coi như đã đọc được — phản ứng ngay theo quy trình bên dưới.',
            },
            {
              icon: <Smartphone size={22} />,
              verdict: 'warn', verdictText: 'GIỚI HẠN',
              title: 'Mã kích hoạt của 1 thiết bị bị lộ',
              desc: 'Mã đã trộn SHA-256(DeviceID) nên chỉ chạy trên đúng máy đó — các thiết bị khác hoàn toàn không ảnh hưởng. Muốn "khai tử" thiết bị: đổi Master Key + phát hành file mới, mã cũ tự vô hiệu với bản mới.',
            },
            {
              icon: <KeyRound size={22} />,
              verdict: 'warn', verdictText: 'RỦI RO CẬP NHẬT',
              title: 'Admin mất Master Key',
              desc: 'Các file .enc cũ vẫn chạy bình thường với mã đã cấp (không cần key để dùng). Nhưng không xuất được bản cập nhật cùng khóa — khôi phục key từ nơi đã lưu; nếu mất hẳn: sinh khóa mới và cả tổ chức import lại file mới.',
            },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="feature-card">
                <div className="feature-head">
                  <div className={`feature-icon verdict-${s.verdict}`}>{s.icon}</div>
                  <span className={`verdict v-${s.verdict}`}>{s.verdictText}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="algo-notes glass-panel">
            <h3><RotateCcw size={20} className="text-accent" /> Quy trình phản ứng trong 3 phút</h3>
            <ol className="playbook">
              <li><b>Đổi Master Key</b> ngay trong Admin Portal (nút "Đổi khóa mới") — mọi mã kích hoạt cũ vô hiệu với mọi bản phát hành tiếp theo.</li>
              <li><b>Xuất file .enc mới</b> với khóa mới. Nội dung bản cũ kẻ đã đọc thì đã đọc — không thu hồi được — nhưng quyền truy cập bản mới sạch hoàn toàn.</li>
              <li><b>Cấp lại mã mới</b> cho từng thiết bị, gửi qua kênh khác với file, rồi nhắc người dùng import đè lên bản cũ.</li>
            </ol>
            <p className="playbook-note">
              Nói thẳng cho rõ: hệ thống bảo vệ <b>quyền truy cập</b>, không "rút lại" được thứ người khác đã đọc.
              Vì vậy tách kênh gửi file / gửi mã ngay từ đầu là nước phòng thủ rẻ và hiệu quả nhất.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ===== CTA ===== */}
      <section className="landing-section">
        <Reveal>
          <div className="cta-panel">
            <h2>Sẵn sàng thay đổi cách tổ chức quản lý danh bạ?</h2>
            <p>Nhập dữ liệu → xuất file .enc → cấp mã kích hoạt. Vận hành trong 5 phút.</p>
            <div className="hero-actions">
              <Link to="/admin" className="landing-btn-primary">
                <Shield size={18} /> Mở Admin Portal
              </Link>
              <AppStoreBtn ghost />
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="landing-footer">
        <div className="footer-links">
          <a href={GITHUB_ADMIN_URL} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> Mã nguồn WebAdmin
          </a>
          <a href={GITHUB_IOS_URL} target="_blank" rel="noopener noreferrer">
            <Github size={15} /> Mã nguồn App iOS
          </a>
        </div>
        <p>Danh bạ nội bộ · Admin Portal — dữ liệu của bạn không rời khỏi trình duyệt.</p>
      </footer>
    </div>
  );
}
