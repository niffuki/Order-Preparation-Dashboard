import { useEffect, useMemo, useState } from 'react';
import { db } from './firebase';
import { PackageCheck, Clock, PackageOpen, Check, CheckCircle, CheckCircle2, RotateCcw, ListOrdered, History, CheckCheck, Info } from 'lucide-react';

const timeLabel = (timestamp) => new Date(timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
const clockLabel = (date) => date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const dateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const orderDateValue = (timestamp) => dateInputValue(new Date(timestamp));

const iconMap = { 'package-check': PackageCheck, clock: Clock, 'package-open': PackageOpen, check: Check, 'check-circle': CheckCircle, 'check-circle-2': CheckCircle2, 'rotate-ccw': RotateCcw, 'list-ordered': ListOrdered, history: History, 'check-check': CheckCheck, info: Info };

function Icon({ name, className = 'w-4 h-4' }) {
  const LucideIcon = iconMap[name];
  return LucideIcon ? <LucideIcon className={className} aria-hidden="true" /> : null;
}

function OrderCard({ order, onToggleItem, onCheckAll, onComplete }) {
  const total = order.items.length;
  const checked = order.items.filter((item) => item.checked).length;
  const progress = total ? Math.round((checked / total) * 100) : 0;
  const allChecked = checked === total;
  const preparing = order.status === 'preparing';

  return (
    <article className={`bg-white rounded-2xl border ${preparing ? 'border-blue-300' : 'border-slate-200'} shadow-sm overflow-hidden transition-all flex flex-col justify-between shrink-0 w-[330px] sm:w-[370px] snap-start`}>
      <div>
        <div className="p-4 sm:px-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="px-3.5 py-1.5 rounded-xl font-bold text-base sm:text-lg bg-slate-900 text-white">{order.displayId}</div>
          {preparing ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800"><Icon name="package-open" /> กำลังจัดของ ({checked}/{total})</span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800"><Icon name="clock" /> รอจัดเตรียม</span>
          )}
        </div>
        <div className="w-full bg-slate-100 h-1.5"><div className="h-1.5 bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
        <div className="p-4 sm:px-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>รายการที่ต้องจัดเตรียม ({total} รายการ)</span>
            <button onClick={() => onCheckAll(order.id)} className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">{allChecked ? 'ยกเลิกติ๊กทั้งหมด' : 'ติ๊กครบทุกรายการ'}</button>
          </div>
          <div className="space-y-2">
            {order.items.map((item) => (
              <button type="button" key={item.id} onClick={() => onToggleItem(order.id, item.id)} className={`w-full text-left flex items-center justify-between p-3 rounded-xl border transition select-none cursor-pointer hover:border-blue-300 ${item.checked ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-2xs'}`}>
                <span className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>{item.checked && <Icon name="check" className="w-4 h-4 stroke-[3]" />}</span>
                  <span className={`text-sm sm:text-base font-medium ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.name}</span>
                </span>
                <span className={`shrink-0 ml-3 inline-flex items-center justify-center px-3 py-1 rounded-xl text-sm sm:text-base font-bold ${item.checked ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>x{item.qty}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">จัดเตรียมแล้ว <strong>{checked}</strong> จาก <strong>{total}</strong> รายการ</span>
        <button disabled={!allChecked || order.saving} onClick={() => onComplete(order.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${allChecked ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}>
          <Icon name="check-circle" /> <span>{order.saving ? 'กำลังบันทึก...' : 'เสิร์ฟแล้ว'}</span>
        </button>
      </div>
    </article>
  );
}

function HistoryRow({ order, onReopen, isReopening }) {
  const summary = order.items.map((item) => `${item.name} (x${item.qty})`).join(', ');
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="px-3 py-1.5 rounded-xl font-bold text-base bg-emerald-100 text-emerald-800 shrink-0">{order.displayId}</div>
        <div className="min-w-0">
          <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1"><Icon name="check-circle-2" className="w-3.5 h-3.5" /> เสร็จเวลา {timeLabel(order.completedAt)} น.</span>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">{summary}</p>
        </div>
      </div>
      <button
        type="button"
        disabled={isReopening}
        onClick={() => onReopen(order.id)}
        className="shrink-0 self-end sm:self-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer disabled:cursor-wait"
      >
        <Icon name="rotate-ccw" className="w-3.5 h-3.5" />
        {isReopening ? 'กำลังดึงกลับ...' : 'ดึงกลับเข้าคิว'}
      </button>
    </div>
  );
}

export default function App() {
  const [billOrders, setBillOrders] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [savingOrders, setSavingOrders] = useState({});
  const [reopeningOrders, setReopeningOrders] = useState({});
  const [connection, setConnection] = useState('connecting');
  const [firebaseError, setFirebaseError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedDate, setSelectedDate] = useState(() => dateInputValue(new Date()));
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Read MKPOS bills only. The dashboard does not modify this collection.
  useEffect(() => {
    setConnection('connecting');
    const unsubscribe = db.collection('bills').onSnapshot((snapshot) => {
      // Only show bills that have an assigned queue. Bills with queue disabled
      // (missing, null, false, or empty queue value) are intentionally excluded.
      const nextOrders = snapshot.docs
        .filter((document) => {
          const bill = document.data();
          return bill.queue !== null
            && bill.queue !== undefined
            && bill.queue !== false
            && String(bill.queue).trim() !== ''
            && String(bill.queue).trim() !== '-';
        })
        .map((document) => {
        const bill = document.data();
        const createdAt = bill.createdAt?.toMillis
          ? bill.createdAt.toMillis()
          : bill.createdAt?.seconds
            ? bill.createdAt.seconds * 1000
            : Date.now();

        return {
          id: document.id,
          displayId: bill.queue ?? document.id,
          createdAt,
          date: bill.date ?? '',
          time: bill.time ?? '',
          total: Number(bill.total ?? 0),
          paymentMethod: bill.paymentMethod ?? '',
          items: (Array.isArray(bill.items) ? bill.items : []).map((item, index) => ({
            id: `${document.id}-${index}`,
            name: item.name ?? 'สินค้าไม่ระบุชื่อ',
            qty: Number(item.qty ?? 0),
            total: Number(item.total ?? 0),
          })),
        };
      });
      setBillOrders(nextOrders);
      setConnection('connected');
      setFirebaseError('');
    }, (error) => {
      console.error('Firestore bills listener:', error);
      setConnection('error');
      setFirebaseError(error.message || 'ไม่สามารถอ่านข้อมูลจาก Firestore ได้');
    });

    return () => unsubscribe();
  }, []);

  // Read completed-order history only. No preparation progress is written.
  useEffect(() => {
    const unsubscribe = db.collection('order_preparation').onSnapshot((snapshot) => {
      const history = snapshot.docs.map((document) => {
        const saved = document.data();
        const completedAt = saved.completedAt?.toMillis
          ? saved.completedAt.toMillis()
          : saved.completedAt?.seconds
            ? saved.completedAt.seconds * 1000
            : Number(saved.completedAtMs || 0);
        return { ...saved, id: document.id, completedAt };
      });
      setCompletedHistory(history);
    }, (error) => {
      console.error('Firestore history listener:', error);
      setConnection('error');
      setFirebaseError(error.message || 'ไม่สามารถอ่านประวัติจาก Firestore ได้');
    });
    return () => unsubscribe();
  }, []);

  // Bills are read-only. Checked items remain local to this browser until completion.
  const completedIds = useMemo(() => new Set(completedHistory.map((order) => order.id)), [completedHistory]);
  const orders = useMemo(() => billOrders.map((order) => ({
    ...order,
    status: completedIds.has(order.id) ? 'completed' : 'pending',
    items: order.items.map((item, index) => ({
      ...item,
      checked: Boolean(checkedItems[order.id]?.[index]),
    })),
  })), [billOrders, completedIds, checkedItems]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const ordersForSelectedDate = useMemo(
    () => orders.filter((order) => orderDateValue(order.createdAt) === selectedDate),
    [orders, selectedDate],
  );
  const activeOrders = useMemo(() => ordersForSelectedDate
    .filter((order) => order.status !== 'completed')
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((order) => ({ ...order, saving: Boolean(savingOrders[order.id]) })), [ordersForSelectedDate, savingOrders]);
  const completedOrders = useMemo(() => completedHistory
    .filter((order) => order.completedAt && orderDateValue(order.completedAt) === selectedDate)
    .sort((a, b) => b.completedAt - a.completedAt), [completedHistory, selectedDate]);

  const notify = (message, type = 'success') => setToast({ message, type });

  const toggleItem = (orderId, itemId) => {
    const order = orders.find((entry) => entry.id === orderId);
    const itemIndex = order?.items.findIndex((item) => item.id === itemId);
    if (itemIndex == null || itemIndex < 0) return;
    setCheckedItems((current) => ({
      ...current,
      [orderId]: { ...current[orderId], [itemIndex]: !current[orderId]?.[itemIndex] },
    }));
  };

  const checkAll = (orderId) => {
    const order = orders.find((entry) => entry.id === orderId);
    if (!order) return;
    const allChecked = order.items.every((item) => item.checked);
    setCheckedItems((current) => ({
      ...current,
      [orderId]: Object.fromEntries(order.items.map((item, index) => [index, !allChecked])),
    }));
  };

  const completeOrder = async (orderId) => {
    const order = orders.find((entry) => entry.id === orderId);
    if (!order || completedIds.has(orderId) || savingOrders[orderId]) return;
    setSavingOrders((current) => ({ ...current, [orderId]: true }));
    const completedAtMs = Date.now();
    const historyRecord = {
      orderId,
      displayId: order.displayId,
      createdAt: window.firebase.firestore.Timestamp.fromMillis(order.createdAt),
      completedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      completedAtMs,
      items: order.items.map(({ name, qty, total }) => ({ name, qty, total })),
      orderTotal: order.total,
      paymentMethod: order.paymentMethod,
    };

    try {
      await db.collection('order_preparation').doc(orderId).set(historyRecord);
      notify(`บันทึกประวัติคิว ${order.displayId} เรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Unable to save completed order history:', error);
      notify('บันทึกประวัติลง Firebase ไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firestore', 'error');
    } finally {
      setSavingOrders((current) => ({ ...current, [orderId]: false }));
    }
  };

  const reopenOrder = async (orderId) => {
    const historyOrder = completedHistory.find((entry) => entry.id === orderId);
    if (!historyOrder || reopeningOrders[orderId]) return;

    setReopeningOrders((current) => ({ ...current, [orderId]: true }));
    try {
      // Remove only the completion marker. The original MKPOS bill remains untouched.
      await db.collection('order_preparation').doc(orderId).delete();
      setCheckedItems((current) => {
        const next = { ...current };
        delete next[orderId];
        return next;
      });
      notify(`นำคิว ${historyOrder.displayId} กลับเข้าคิวจัดเตรียมแล้ว`, 'info');
    } catch (error) {
      console.error('Unable to reopen order:', error);
      notify('ดึงออเดอร์กลับไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firestore', 'error');
    } finally {
      setReopeningOrders((current) => ({ ...current, [orderId]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm"><Icon name="package-check" className="w-6 h-6" /></div>
            <div><h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">ระบบจัดเตรียมออเดอร์ (Order Prep)</h1><p className="text-xs text-slate-500 hidden sm:block">หน้าจอแสดงรายการสินค้าและคิวงานที่ต้องแพ็คแบบเรียลไทม์</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${connection === 'connected' ? 'text-emerald-600' : connection === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
              <span className={`w-2 h-2 rounded-full ${connection === 'connected' ? 'bg-emerald-500' : connection === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
              {connection === 'connected' ? 'Firestore เชื่อมต่อแล้ว' : connection === 'error' ? 'เชื่อมต่อไม่สำเร็จ' : 'กำลังเชื่อมต่อ'}
            </span>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700"><Icon name="clock" className="w-4 h-4 text-blue-600" /><span>{clockLabel(now)}</span></div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <h2 className="font-bold text-slate-800">เลือกวันที่ของออเดอร์</h2>
            <p className="text-xs text-slate-500 mt-1">แสดงคิวและประวัติเฉพาะวันที่เลือก</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="order-date" className="text-sm font-medium text-slate-600">วันที่</label>
            <input
              id="order-date"
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setSelectedDate(dateInputValue(new Date()))}
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
            >วันนี้</button>
          </div>
        </div>
        <div className="bg-slate-200/70 p-1.5 rounded-2xl grid grid-cols-2 gap-1.5 max-w-2xl mx-auto w-full">
          <button onClick={() => setActiveTab('active')} className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <Icon name="list-ordered" className="w-4 h-4 text-blue-600" /><span>คิวที่ต้องจัดเตรียม</span><span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-bold">{activeOrders.length}</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <Icon name="history" className="w-4 h-4 text-emerald-600" /><span>ประวัติที่จัดเสร็จแล้ว</span><span className="px-2 py-0.5 text-xs rounded-full bg-slate-300/70 text-slate-700 font-bold">{completedOrders.length}</span>
          </button>
        </div>

        {connection === 'error' && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>อ่านข้อมูลจาก Firestore ไม่สำเร็จ</strong>
            <p className="mt-1">{firebaseError}</p>
            <p className="mt-1 text-xs">ตรวจสอบ Firestore Rules ให้อ่าน collection "bills" และอ่าน/เพิ่มประวัติใน "order_preparation" ได้ โดยไม่แก้ไขสิทธิ์การเขียนของ MKPOS</p>
          </div>
        )}

        {activeTab === 'active' ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-base sm:text-lg font-bold text-slate-800">รายการคิวจัดเตรียมสินค้า</h2><span className="text-xs text-slate-500">ติ๊กถูกที่รายการสินค้าเพื่อเช็คของครบ</span></div>
            <div className="flex flex-row items-stretch gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {connection === 'connecting' ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center w-full text-sm text-slate-500">กำลังโหลดออเดอร์จาก Firestore...</div>
              ) : activeOrders.length ? activeOrders.map((order) => <OrderCard key={order.id} order={order} onToggleItem={toggleItem} onCheckAll={checkAll} onComplete={completeOrder} />) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center w-full"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3"><Icon name="check-check" className="w-6 h-6" /></div><h3 className="text-base font-bold text-slate-800">จัดเตรียมครบทุกคิวแล้ว!</h3><p className="text-sm text-slate-500 mt-1">ยังไม่มีคิวใหม่เข้ามาในขณะนี้</p></div>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between"><h2 className="text-base sm:text-lg font-bold text-slate-800">ประวัติออเดอร์ที่จัดเสร็จแล้ว</h2><span className="text-xs text-slate-500">รายการที่แพ็คเสร็จสมบูรณ์แล้ว</span></div>
            <div className="space-y-2.5">
              {completedOrders.length ? completedOrders.map((order) => <HistoryRow key={order.id} order={order} onReopen={reopenOrder} isReopening={Boolean(reopeningOrders[order.id])} />) : <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-sm text-slate-500">ยังไม่มีประวัติออเดอร์ที่จัดเสร็จแล้ว</div>}
            </div>
          </section>
        )}
      </main>

      {toast && <div className="fixed bottom-5 right-5 z-50 pointer-events-none"><div className={`${toast.type === 'success' ? 'bg-slate-900' : 'bg-blue-600'} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-medium`}><Icon name={toast.type === 'success' ? 'check-circle' : 'info'} className="w-4 h-4 text-emerald-400 shrink-0" />{toast.message}</div></div>}
    </div>
  );
}
