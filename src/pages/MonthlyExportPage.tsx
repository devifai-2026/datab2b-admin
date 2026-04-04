import React, { useMemo, useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import * as XLSX from 'xlsx';
import invoiceService from '../services/invoiceService';

type MonthRow = {
  monthIndex: number; // 0-11
  monthName: string;
  year: number;
  items: Array<Record<string, any>>;
};

const MONTH_NAMES = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

function generateSampleMonth(year: number, monthIndex: number): MonthRow {
  const items = [] as Array<Record<string, any>>;
  const count = Math.floor(Math.random() * 8) + 2;
  for (let i = 0; i < count; i++) {
    items.push({
      id: `${year}-${monthIndex + 1}-${i + 1}`,
      date: `${year}-${String(monthIndex + 1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`,
      description: `Sample entry ${i + 1}`,
      amount: Math.round(Math.random() * 10000) / 100,
    });
  }
  return { monthIndex, monthName: MONTH_NAMES[monthIndex], year, items };
}

export default function MonthlyExportPage() {
  // For demo we create sample data for current year and previous year (24 rows)
  const [data, setData] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchMonth, setSearchMonth] = useState<string>('');
  const [searchYear, setSearchYear] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const invoices = await invoiceService.getInvoices();
        // Group invoices by year-month
        const map = new Map<string, MonthRow>();
        for (const inv of invoices) {
          const date = inv.createdAt ? new Date(inv.createdAt) : new Date();
          const year = date.getFullYear();
          const monthIndex = date.getMonth();
          const key = `${year}-${monthIndex}`;
          const item = {
            id: inv._id || inv.id || `${year}-${monthIndex}-${Math.random()}`,
            date: date.toISOString(),
            description: inv.productName || inv.description || '',
            amount: inv.amount || inv.total || 0,
            status: inv.status || '',
            user: inv.user?.name || inv.user || '',
          } as Record<string, any>;

          if (!map.has(key)) {
            map.set(key, { monthIndex, monthName: MONTH_NAMES[monthIndex], year, items: [item] });
          } else {
            map.get(key)!.items.push(item);
          }
        }

        const rows = Array.from(map.values()).sort((a, b) => (a.year - b.year) || (a.monthIndex - b.monthIndex));
        if (mounted) setData(rows);
        if (mounted) setLoading(false);
      } catch (err) {
        // fallback: use sample data for current and previous year
        const now = new Date();
        const currYear = now.getFullYear();
        const rows: MonthRow[] = [];
        for (let y = currYear - 1; y <= currYear; y++) {
          for (let m = 0; m < 12; m++) rows.push(generateSampleMonth(y, m));
        }
        if (mounted) setData(rows);
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (searchMonth) {
        const match = r.monthName.toLowerCase().startsWith(searchMonth.toLowerCase());
        if (!match) return false;
      }
      if (searchYear) {
        if (String(r.year) !== String(searchYear)) return false;
      }
      return true;
    });
  }, [data, searchMonth, searchYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const exportMonth = (row: MonthRow) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(row.items);
    XLSX.utils.book_append_sheet(wb, ws, `${row.monthName}-${row.year}`);
    XLSX.writeFile(wb, `${row.monthName}-${row.year}.xlsx`);
  };

  return (
    <AdminLayout title="Monthly Export">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Monthly Data</h2>
            <p className="text-sm text-stone-600">Browse monthly summaries, search by month/year, and export to Excel.</p>
          </div>
          {/* export filtered button removed */}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Month:</label>
            <select value={searchMonth} onChange={(e)=>{setSearchMonth(e.target.value); setPage(1);}} className="px-3 py-2 border rounded w-full sm:w-auto">
              <option value="">All</option>
              {MONTH_NAMES.map((m)=> <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Year:</label>
            <input type="text" value={searchYear} onChange={(e)=>{setSearchYear(e.target.value); setPage(1);}} placeholder="e.g. 2026" className="px-3 py-2 border rounded w-full sm:w-24" />
          </div>

          <div className="ml-0 sm:ml-auto text-sm text-stone-600">Showing {filtered.length} results</div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-stone-600">Loading monthly data...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-stone-600">No monthly data found.</div>
          ) : (
            <>
              {/* Table for md+ screens */}
              <div className="hidden md:block">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="text-left text-sm text-stone-600 border-b">
                      <th className="py-3">Month</th>
                      <th className="py-3">Year</th>
                      <th className="py-3">Entries</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((r) => (
                      <tr key={`${r.year}-${r.monthIndex}`} className="border-b last:border-b-0">
                        <td className="py-3">{r.monthName}</td>
                        <td className="py-3">{r.year}</td>
                        <td className="py-3">{r.items.length}</td>
                        <td className="py-3">
                          <button onClick={()=>exportMonth(r)} className="bg-stone-800 text-white px-3 py-1 rounded">Export</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards for small screens */}
              <div className="md:hidden space-y-3">
                {pageItems.map((r) => (
                  <div key={`${r.year}-${r.monthIndex}`} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{r.monthName} {r.year}</div>
                      <div className="text-xs text-stone-500">Entries: {r.items.length}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button onClick={()=>exportMonth(r)} className="bg-stone-800 text-white px-3 py-1 rounded w-full sm:w-auto">Export</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-stone-600">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={()=>setPage((p)=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 border rounded">Prev</button>
            <button onClick={()=>setPage((p)=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
