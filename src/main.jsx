import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

// Tích hợp Firebase Firestore
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch
} from "firebase/firestore";

const C = {
  drink: { label: "NƯỚC UỐNG", icon: "🥤", color: "#4da3ff" },
  food: { label: "ĐỒ ĂN", icon: "🍜", color: "#f5c84b" },
  snack: { label: "ĐỒ ĂN VẶT", icon: "🍿", color: "#ed65b8" }
};

const R = {
  green: { label: "Bình Thường", short: "Bình Thường", color: "#55c46a", glow: "#55c46a88" },
  blue: { label: "Khá", short: "Khá", color: "#4da3ff", glow: "#4da3ff88" },
  purple: { label: "Hơi Hiếm", short: "Hơi Hiếm", color: "#a66cff", glow: "#a66cff88" },
  pink: { label: "Hiếm", short: "Hiếm", color: "#ed65b8", glow: "#ed65b888" },
  red: { label: "Đỉnh Cao", short: "Đỉnh Cao", color: "#ef4444", glow: "#ef444488" },
  gold: { label: "Đẳng Cấp LUXURY", short: "LUXURY", color: "#ffd447", glow: "#ffd44788" }
};

const m = (name, category, rarity, weight) => ({
  id: crypto.randomUUID(),
  name,
  image: "",
  category,
  rarity,
  weight,
  enabled: true
});

const D = [
  m("Coca-Cola", "drink", "green", 40),
  m("Pepsi", "drink", "blue", 30),
  m("Sting", "drink", "purple", 20),
  m("Red Bull", "drink", "gold", 10),
  m("Mì ly", "food", "green", 45),
  m("Xúc xích", "food", "blue", 30),
  m("Bánh mì", "food", "purple", 25),
  m("Snack", "snack", "green", 40),
  m("Rong biển", "snack", "blue", 30),
  m("Bánh quy", "snack", "purple", 20),
  m("Bắp rang", "snack", "gold", 10)
];

const cat = i => (C[i.category] ? i.category : "food");

function pick(a) {
  let p = a.filter(x => x.enabled && +x.weight > 0),
    n = Math.random() * p.reduce((s, x) => s + +x.weight, 0);
  for (const x of p) {
    if ((n -= +x.weight) <= 0) return x;
  }
  return p.at(-1);
}

function Visual({ item, large }) {
  let r = R[item.rarity] || R.green;
  return (
    <div className={'item-visual ' + (large ? 'large' : '')}>
      {item.image ? (
        <img src={item.image} alt={item.name} onError={e => (e.currentTarget.style.display = 'none')} />
      ) : (
        <div className="item-placeholder" style={{ '--rarity': r.color }}>
          <span className="weapon-icon">{C[cat(item)].icon}</span>
          <span>{r.short}</span>
        </div>
      )}
    </div>
  );
}

function App() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('home');
  const [box, setBox] = useState('food');
  const [tab, setTab] = useState('drink');
  const [q, setQ] = useState('');
  const [rar, setRar] = useState('all');
  const [edit, setEdit] = useState(null);
  const [roll, setRoll] = useState(false);
  const [reel, setReel] = useState([]);
  const [off, setOff] = useState(0);
  const [key, setKey] = useState(0);
  const [result, setResult] = useState(null);

  // 1. Tự động đồng bộ danh sách món ăn từ Firebase Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "items"), snapshot => {
      if (snapshot.empty) {
        // Tự động tạo dữ liệu mẫu nếu Firestore chưa có dữ liệu
        D.forEach(async item => {
          await setDoc(doc(db, "items", item.id), item);
        });
      } else {
        const loadedItems = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setItems(loadedItems);
      }
    });
    return () => unsub();
  }, []);

  // 2. Tự động đồng bộ lịch sử mở hòm từ Firebase Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "history"), snapshot => {
      const loadedHistory = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      loadedHistory.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
      setHistory(loadedHistory.slice(0, 30));
    });
    return () => unsub();
  }, []);

  let pool = useMemo(() => items.filter(i => cat(i) === box), [items, box]);
  let shown = useMemo(
    () => items.filter(i => cat(i) === tab && (rar === 'all' || i.rarity === rar) && i.name.toLowerCase().includes(q.toLowerCase())),
    [items, tab, rar, q]
  );

  function spin() {
    if (roll) return;
    let win = pick(pool);
    if (!win) return;
    let enabled = pool.filter(i => i.enabled),
      a = Array.from({ length: 50 }, () => enabled[Math.floor(Math.random() * enabled.length)]);
    a[43] = win;
    setResult(null);
    setRoll(true);
    setReel(a);
    setOff(0);
    setKey(x => x + 1);
    requestAnimationFrame(() => requestAnimationFrame(() => setOff(43 * 154 - 359)));

    setTimeout(async () => {
      let won = { ...win, category: cat(win), receivedAt: new Date().toISOString() };
      delete won.id;
      // Lưu lượt quay vào Firestore Database chung
      await addDoc(collection(db, "history"), won);
      setResult(won);
      setRoll(false);
    }, 5000);
  }

  function changeBox(x) {
    if (!roll) {
      setBox(x);
      setResult(null);
      setReel([]);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('home')}>
          <span className="brand-mark">◆</span>
          <span>FOOD<span>RANDOM</span></span>
          <small>Special</small>
        </button>
        <nav>
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>MỞ HÒM</button>
          <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>QUẢN LÝ VẬT PHẨM</button>
        </nav>
      </header>
      {view === 'home' ? (
        <main className="main">
          <section className="case-selector">
            {Object.entries(C).map(([k, c]) => (
              <button key={k} className={'case-choice ' + (box === k ? 'selected' : '')} onClick={() => changeBox(k)} style={{ '--case-color': c.color }}>
                <span>{c.icon}</span>
                <b>HÒM {c.label}</b>
                <small>{k === 'drink' ? 'Giải khát ngẫu nhiên' : k === 'snack' ? 'Ăn vui, mở hòm vui' : 'Thơm ngon mời bạn ăn nha'}</small>
                <em>MỞ HÒM</em>
              </button>
            ))}
          </section>
          <section className="hero">
            <div className="case-card">
              <div className="case-glow" style={{ background: C[box].color }} />
              <div className="case-box">
                <div className="case-lock">{C[box].icon}</div>
                <div><b>Hòm {C[box].label}</b><span>RANDOM FOOD</span></div>
              </div>
              <p>Random theo tỉ lệ weight</p>
            </div>
            <div className="roulette-area">
              <div className="roulette-header">
                <span>Vòng quay may mắn — {C[box].label}</span>
                <span className="status">{roll ? 'ĐANG QUAY...' : 'SẴN SÀNG'}</span>
              </div>
              <div className="roulette-frame">
                <div className="pointer" />
                <div className="reel-window">
                  <div key={key} className="reel-track" style={{ transform: `translate3d(-${off}px,0,0)`, transition: roll ? 'transform 4.8s cubic-bezier(.08,.72,.1,1)' : 'none' }}>
                    {reel.map((i, n) => (
                      <div key={n} className="reel-card" style={{ '--rarity': R[i.rarity].color }}>
                        <Visual item={i} />
                        <div className="reel-name">{i.name}</div>
                        <div className="rarity-label">{R[i.rarity].short}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button className={'spin-button ' + (roll ? 'disabled' : '')} onClick={spin} disabled={roll || !pool.some(i => i.enabled && +i.weight > 0)}>
                <span>MỞ HÒM {C[box].label}</span>
                <small>{roll ? 'ĐANG XỬ LÝ...' : 'RANDOM THEO TỈ LỆ WEIGHT'}</small>
              </button>
              {result && (
                <div className={'result-card rarity-' + result.rarity} style={{ '--rarity': R[result.rarity].color, '--glow': R[result.rarity].glow }}>
                  <div className="result-kicker">BẠN NHẬN ĐƯỢC</div>
                  <Visual item={result} large />
                  <div className="result-info">
                    <div className="result-rarity">{R[result.rarity].label}</div>
                    <h2>{result.name}</h2>
                    <button onClick={spin}>MỞ LẠI</button>
                  </div>
                </div>
              )}
            </div>
          </section>
          <History history={history} />
        </main>
      ) : (
        <Admin {...{ items, shown, q, setQ, rar, setRar, edit, setEdit, tab, setTab }} />
      )}
      <footer>namngo05 copyright@</footer>
    </div>
  );
}

function History({ history }) {
  return (
    <section className="history-section">
      <div className="section-title">
        <div><span className="eyebrow">RECENT DROPS</span><h2>LỊCH SỬ</h2></div>
        <span>{history.length}/30</span>
      </div>
      {history.length ? (
        <div className="history-grid">
          {history.map(i => (
            <div className="history-card" key={i.id} style={{ '--rarity': R[i.rarity].color }}>
              <Visual item={i} />
              <div className="history-meta">
                <b>{i.name}</b>
                <span>{C[cat(i)].label} · {R[i.rarity].label}</span>
                <small>{new Date(i.receivedAt).toLocaleString('vi-VN')}</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">Chưa có vật phẩm nào. Hãy ấn để bắt đầu.</div>
      )}
    </section>
  );
}

function Admin({ items, shown, q, setQ, rar, setRar, edit, setEdit, tab, setTab }) {
  let blank = { id: null, name: '', image: '', category: tab, rarity: 'green', weight: 10, enabled: true };

  // Thêm / Cập nhật vật phẩm trực tiếp lên Firestore
  async function submit(e) {
    e.preventDefault();
    let f = new FormData(e.currentTarget);
    let itemId = edit.id || crypto.randomUUID();
    let x = {
      id: itemId,
      name: f.get('name').trim(),
      image: f.get('image').trim(),
      category: f.get('category'),
      rarity: f.get('rarity'),
      weight: Math.max(0, +f.get('weight') || 0),
      enabled: f.get('enabled') === 'on'
    };

    if (x.name) {
      await setDoc(doc(db, "items", itemId), x);
    }
    setEdit(null);
  }

  // Xóa vật phẩm trên Firestore
  async function handleDelete(item) {
    if (confirm(`Xóa "${item.name}"?`)) {
      await deleteDoc(doc(db, "items", item.id));
    }
  }

  // Khôi phục vật phẩm mẫu trên Firestore
  async function handleRestore() {
    if (confirm('Khôi phục toàn bộ vật phẩm mẫu?')) {
      const batch = writeBatch(db);
      items.forEach(i => batch.delete(doc(db, "items", i.id)));
      D.forEach(item => batch.set(doc(db, "items", item.id), item));
      await batch.commit();
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-head">
        <div>
          <span className="eyebrow">CONTROL PANEL</span>
          <h1>QUẢN LÝ VẬT PHẨM</h1>
          <p>Dữ liệu được lưu trực tiếp trên Firebase Cloud Database (đồng bộ toàn bộ thiết bị).</p>
        </div>
        <div className="admin-actions">
          <button className="secondary" onClick={() => setEdit(blank)}>+ THÊM VẬT PHẨM</button>
          <button className="ghost" onClick={handleRestore}>KHÔI PHỤC MẪU</button>
        </div>
      </div>
      <div className="admin-tabs">
        {Object.entries(C).map(([k, c]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => { setTab(k); setEdit(null); }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div className="admin-toolbar">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm kiếm vật phẩm..." />
        <select value={rar} onChange={e => setRar(e.target.value)}>
          <option value="all">Tất cả độ hiếm</option>
          {Object.entries(R).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vật phẩm</th>
              <th>Category</th>
              <th>Độ hiếm</th>
              <th>Weight</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map(i => (
              <tr key={i.id}>
                <td>
                  <div className="table-item">
                    <Visual item={i} />
                    <b>{i.name}</b>
                  </div>
                </td>
                <td>{C[cat(i)].label}</td>
                <td><span className="rarity-pill" style={{ '--rarity': R[i.rarity].color }}>{R[i.rarity].label}</span></td>
                <td>{(+i.weight).toFixed(3)}</td>
                <td><span className={i.enabled ? 'enabled' : 'disabled'}>{i.enabled ? 'Hiển thị' : 'Ẩn'}</span></td>
                <td className="row-actions">
                  <button onClick={() => setEdit({ ...i, category: cat(i) })}>Sửa</button>
                  <button className="danger" onClick={() => handleDelete(i)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setEdit(null)}>
          <form className="modal" onSubmit={submit}>
            <div className="modal-head">
              <h2>{edit.id ? 'SỬA' : 'THÊM'} VẬT PHẨM</h2>
              <button type="button" onClick={() => setEdit(null)}>×</button>
            </div>
            <label>Tên vật phẩm<input name="name" defaultValue={edit.name} required /></label>
            <label>URL hình ảnh<input name="image" defaultValue={edit.image} placeholder="https://..." /></label>
            <label>Category<select name="category" defaultValue={edit.category}>{Object.entries(C).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}</select></label>
            <label>Độ hiếm<select name="rarity" defaultValue={edit.rarity}>{Object.entries(R).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}</select></label>
            <label>Tỉ lệ / Weight<input name="weight" type="number" step="0.001" min="0" defaultValue={edit.weight} required /></label>
            <label className="check"><input name="enabled" type="checkbox" defaultChecked={edit.enabled} /> Hiển thị trong roulette</label>
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => setEdit(null)}>HỦY</button>
              <button className="secondary">LƯU</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);