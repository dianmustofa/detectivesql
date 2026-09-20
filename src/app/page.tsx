"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  MapPin,
  Camera,
  AlertCircle,
  Play,
  Database,
  Table as TableIcon,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  HelpCircle,
  BookOpen,
  Eye,
  EyeOff,
  Code2,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Columns,
  Layers,
  Terminal,
  LayoutGrid,
} from "lucide-react";

import { initializeDatabase, executeQuery } from "@/lib/sqlEngine";

interface NodeItem {
  id: string;
  title: string;
  type: "suspect" | "location" | "clue";
  details: string;
  x: number;
  y: number;
  status: "cleared" | "suspicious" | "target";
  isUnlocked: boolean;
  unlockConditionHint: string;
}

const CASES_DATA = [
  {
    caseId: 1,
    caseTitle: "Kasus #1: Pembobolan Ruang Server Utama",
    culpritName: "Budi Santoso",
    schema: [
      {
        tableName: "pengunjung",
        columns: [
          { name: "id", type: "INT" },
          { name: "nama", type: "TEXT" },
          { name: "peran", type: "TEXT" },
          { name: "jam_masuk", type: "TEXT" },
        ],
      },
      {
        tableName: "log_cctv",
        columns: [
          { name: "id", type: "INT" },
          { name: "lokasi", type: "TEXT" },
          { name: "status_Akses", type: "TEXT" },
        ],
      },
    ],
    seedQueries: [
      `CREATE TABLE IF NOT EXISTS pengunjung (id INT, nama TEXT, peran TEXT, jam_masuk TEXT);`,
      `INSERT INTO pengunjung VALUES (1, 'Budi Santoso', 'Pengunjung', '22:10');`,
      `INSERT INTO pengunjung VALUES (2, 'Siti Rahma', 'Admin Server', '22:00');`,
      `INSERT INTO pengunjung VALUES (3, 'Eko Wijaya', 'Keamanan', '21:30');`,
      `CREATE TABLE IF NOT EXISTS log_cctv (id INT, lokasi TEXT, status_Akses TEXT);`,
      `INSERT INTO log_cctv VALUES (101, 'Ruang Server Utama', 'Terdeteksi Akses Ilegal');`,
      `INSERT INTO log_cctv VALUES (102, 'Lobi Depan', 'Aman');`,
    ],
    initialNodes: [
      {
        id: "1",
        title: "TKP: Ruang Server",
        type: "location" as const,
        details: "Akses tidak sah terdeteksi di log_cctv pukul 22:15 WIB.",
        x: 22,
        y: 28,
        status: "target" as const,
        isUnlocked: true,
        unlockConditionHint: "Periksa catatan tabel log_cctv",
      },
      {
        id: "2",
        title: "Tersangka: Budi",
        type: "suspect" as const,
        details: "Tercatat di tabel pengunjung jam 22:10 WIB tanpa alibi.",
        x: 55,
        y: 22,
        status: "suspicious" as const,
        isUnlocked: false,
        unlockConditionHint: "Cari daftar semua orang di tabel pengunjung",
      },
      {
        id: "3",
        title: "Bukti: Transfer Rp 50M",
        type: "clue" as const,
        details:
          "Transfer misterius yang terhubung dengan akses jam 22:00 ke atas.",
        x: 78,
        y: 60,
        status: "suspicious" as const,
        isUnlocked: false,
        unlockConditionHint:
          "Filter pengunjung yang masuk di atas atau sama dengan jam '22:00'",
      },
      {
        id: "4",
        title: "Siti Rahma (Clean)",
        type: "suspect" as const,
        details: "Admin Server. Alibi terverifikasi berada di pos keamanan.",
        x: 28,
        y: 72,
        status: "cleared" as const,
        isUnlocked: false,
        unlockConditionHint:
          "Cari status lokasi di log_cctv yang bernilai 'Aman'",
      },
    ],
    cluesList: [
      {
        id: 1,
        title: "Misi 1: Identifikasi Pengunjung",
        story:
          "Ada beberapa orang yang masuk ke gedung malam ini. Tampilkan seluruh data dari tabel pengunjung untuk mengidentifikasi siapa saja mereka.",
        sqlHint: "SELECT * FROM pengunjung;",
      },
      {
        id: 2,
        title: "Misi 2: Pengunjung di Atas Jam 22:00",
        story:
          "Pembobolan terjadi pukul 22:15 WIB. Gunakan filter WHERE pada kolom jam_masuk untuk menemukan orang yang tiba jam 22:00 ke atas.",
        sqlHint: "SELECT * FROM pengunjung WHERE jam_masuk >= '22:00';",
      },
      {
        id: 3,
        title: "Misi 3: Verifikasi Area Aman",
        story:
          "Cari lokasi di tabel log_cctv yang tercatat aman untuk memverifikasi alibi tersangka lainnya.",
        sqlHint: "SELECT * FROM log_cctv WHERE status_Akses = 'Aman';",
      },
    ],
  },
  {
    caseId: 2,
    caseTitle: "Kasus #2: Transaksi Gelap Duit Kripto",
    culpritName: "Rian Kripto",
    schema: [
      {
        tableName: "transaksi",
        columns: [
          { name: "id", type: "INT" },
          { name: "pengirim", type: "TEXT" },
          { name: "jumlah", type: "INT" },
          { name: "tipe", type: "TEXT" },
        ],
      },
    ],
    seedQueries: [
      `CREATE TABLE IF NOT EXISTS transaksi (id INT, pengirim TEXT, jumlah INT, tipe TEXT);`,
      `INSERT INTO transaksi VALUES (1, 'Rian Kripto', 15000, 'Ilegal');`,
      `INSERT INTO transaksi VALUES (2, 'Dewi Fortuna', 500, 'Legal');`,
      `INSERT INTO transaksi VALUES (3, 'Rian Kripto', 20000, 'Ilegal');`,
    ],
    initialNodes: [
      {
        id: "101",
        title: "Dompet Digital Suspek",
        type: "location" as const,
        details:
          "Aktivitas alur kuis ilegal terdeteksi di server pencucian uang.",
        x: 30,
        y: 35,
        status: "target" as const,
        isUnlocked: true,
        unlockConditionHint: "Periksa transaksi ilegal",
      },
      {
        id: "102",
        title: "Tersangka Utama: Rian",
        type: "suspect" as const,
        details: "Pengirim dana terbesar berlabel 'Ilegal'.",
        x: 70,
        y: 50,
        status: "suspicious" as const,
        isUnlocked: false,
        unlockConditionHint: "Filter tabel transaksi dengan tipe 'Ilegal'",
      },
    ],
    cluesList: [
      {
        id: 101,
        title: "Misi 1: Lacak Transaksi Ilegal",
        story:
          "Terdapat transaksi keuangan yang mencurigakan. Tampilkan seluruh transaksi yang berlabel 'Ilegal'.",
        sqlHint: "SELECT * FROM transaksi WHERE tipe = 'Ilegal';",
      },
    ],
  },
];

export default function SQLDetectivePage() {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const currentCase = CASES_DATA[currentCaseIndex];

  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<Record<string, unknown>[]>([]);
  const [queryColumns, setQueryColumns] = useState<string[]>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionSuccess, setExecutionSuccess] = useState(false);
  const [unlockedMessage, setUnlockedMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"board" | "table">("board");
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [visibleHints, setVisibleHints] = useState<Record<number, boolean>>({});

  const [nodes, setNodes] = useState<NodeItem[]>(currentCase.initialNodes);
  const [isCaseCompleted, setIsCaseCompleted] = useState(false);

  useEffect(() => {
    async function setupDB() {
      setIsInitializing(true);
      setNodes(currentCase.initialNodes);
      setIsCaseCompleted(false);
      setSqlQuery("");
      setQueryResult([]);
      setQueryColumns([]);

      const res = await initializeDatabase(currentCase.seedQueries);
      if (res.success) {
        setIsInitializing(false);
      } else {
        setIsInitializing(false);
        setInitError(res.error || "Gagal menginisialisasi SQLite WASM.");
      }
    }
    setupDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCaseIndex]);

  const toggleHint = (id: number) => {
    setVisibleHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const runSQL = (queryToExecute: string) => {
    setExecutionError(null);
    setExecutionSuccess(false);
    setUnlockedMessage(null);

    const res = executeQuery(queryToExecute);

    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      setQueryResult(data);

      if (data.length > 0 && data[0] && typeof data[0] === "object") {
        setQueryColumns(Object.keys(data[0]));
      } else {
        setQueryColumns([]);
      }
      setExecutionSuccess(true);

      checkUnlockProgress(queryToExecute, data);
    } else {
      setQueryResult([]);
      setQueryColumns([]);
      setExecutionError(res.error || "Terjadi kesalahan kueri SQL.");
    }
  };

  const checkUnlockProgress = (
    query: string,
    resultData: Record<string, unknown>[]
  ) => {
    const cleanQuery = query.toLowerCase();
    let newlyUnlockedTitle: string | null = null;

    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((node) => {
        if (node.isUnlocked) return node;

        let shouldUnlock = false;

        if (currentCase.caseId === 1) {
          if (node.id === "2" && cleanQuery.includes("pengunjung"))
            shouldUnlock = true;
          if (
            node.id === "3" &&
            cleanQuery.includes("pengunjung") &&
            cleanQuery.includes("22:00") &&
            resultData.length > 0
          )
            shouldUnlock = true;
          if (
            node.id === "4" &&
            cleanQuery.includes("log_cctv") &&
            cleanQuery.includes("aman") &&
            resultData.length > 0
          )
            shouldUnlock = true;
        }

        if (currentCase.caseId === 2) {
          if (
            node.id === "102" &&
            cleanQuery.includes("transaksi") &&
            cleanQuery.includes("ilegal") &&
            resultData.length > 0
          )
            shouldUnlock = true;
        }

        if (shouldUnlock) {
          newlyUnlockedTitle = node.title;
          return { ...node, isUnlocked: true };
        }

        return node;
      });

      const allUnlocked = updatedNodes.every((n) => n.isUnlocked);
      if (allUnlocked) {
        setTimeout(() => setIsCaseCompleted(true), 600);
      }

      return updatedNodes;
    });

    if (newlyUnlockedTitle) {
      setUnlockedMessage(`🎉 Petunjuk Terbuka: ${newlyUnlockedTitle}`);
    }
  };

  const handleNextCase = () => {
    if (currentCaseIndex < CASES_DATA.length - 1) {
      setCurrentCaseIndex((prev) => prev + 1);
    } else {
      setCurrentCaseIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 flex flex-col font-sans relative selection:bg-orange-100 selection:text-orange-900">
      <header className="border-b border-sky-100 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 border border-sky-200/60 rounded-2xl text-sky-500 shadow-2xs">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-wide text-slate-800 flex items-center gap-2">
              SQL HUNTER{" "}
              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-orange-100/80 text-orange-600 border border-orange-200/60 font-semibold">
                Pastel Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              {currentCase.caseTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-sky-50/70 border border-sky-100 px-3 py-1.5 rounded-full text-slate-600">
          <Database className="w-3.5 h-3.5 text-sky-500" />
          <span className="hidden sm:inline">Status DB:</span>
          {isInitializing ? (
            <span className="text-orange-500 animate-pulse font-medium">
              Loading...
            </span>
          ) : initError ? (
            <span className="text-rose-500">Error DB</span>
          ) : (
            <span className="text-sky-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> Ready
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto w-full">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-orange-50/40 border border-orange-200/60 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-orange-200/40 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                  Skema Database
                </h3>
              </div>
              <span className="text-[10px] bg-orange-100 text-orange-700 font-semibold px-2.5 py-0.5 rounded-full border border-orange-200/80">
                {currentCase.schema.length} Tabel
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
              {currentCase.schema.map((table) => (
                <div
                  key={table.tableName}
                  className="bg-white p-3 rounded-xl border border-orange-100 shadow-2xs flex flex-col gap-2"
                >
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <TableIcon className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {table.tableName}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {table.columns.map((col) => (
                      <li
                        key={col.name}
                        className="flex items-center justify-between text-[11px] font-mono text-slate-600"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Columns className="w-3 h-3 text-slate-300 shrink-0" />
                          {col.name}
                        </span>
                        <span className="text-[9px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-sans border border-sky-100 font-medium">
                          {col.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-sky-100 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-500" /> Terminal SQL
              </label>
              <button
                onClick={() => {
                  setSqlQuery("");
                  setQueryResult([]);
                  setQueryColumns([]);
                  setExecutionError(null);
                  setExecutionSuccess(false);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Bersihkan
              </button>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Ketik kueri SQL di sini (misal: SELECT * FROM pengunjung;)"
              rows={4}
              className="w-full bg-slate-50 text-slate-800 font-mono text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200 resize-none placeholder:text-slate-400"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="text-xs">
                {executionError && (
                  <span className="text-rose-500 font-medium">
                    ⚠️ {executionError}
                  </span>
                )}
                {executionSuccess && !unlockedMessage && (
                  <span className="text-emerald-600 font-medium">
                    ✓ Kueri berhasil dieksekusi
                  </span>
                )}
                {unlockedMessage && (
                  <span className="text-orange-500 font-bold flex items-center gap-1 animate-bounce">
                    <Sparkles className="w-3.5 h-3.5" /> {unlockedMessage}
                  </span>
                )}
              </div>
              <button
                onClick={() => runSQL(sqlQuery)}
                disabled={isInitializing || !sqlQuery.trim()}
                className="bg-orange-400 hover:bg-orange-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-xs hover:shadow disabled:opacity-40 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Eksekusi SQL
              </button>
            </div>
          </div>

          <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-sky-100 pb-2">
              <BookOpen className="w-4 h-4 text-sky-500" />
              <h3 className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                Misi Investigasi
              </h3>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              {currentCase.cluesList.map((clue) => {
                const isHintVisible = !!visibleHints[clue.id];

                return (
                  <div
                    key={clue.id}
                    className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-2xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        {clue.title}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {clue.story}
                    </p>

                    <div className="pt-1 flex flex-col gap-1.5">
                      <button
                        onClick={() => toggleHint(clue.id)}
                        className="self-start text-[10px] font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1 bg-slate-100 hover:bg-orange-50 px-2.5 py-1 rounded-lg transition border border-slate-200/60 cursor-pointer"
                      >
                        {isHintVisible ? (
                          <>
                            <EyeOff className="w-3 h-3 text-rose-500" />{" "}
                            Sembunyikan Bantuan
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 text-orange-500" /> Lihat
                            Bantuan SQL
                          </>
                        )}
                      </button>

                      {isHintVisible && (
                        <div className="bg-slate-900 text-sky-300 font-mono text-[11px] p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                          <code className="truncate">
                            <Code2 className="w-3 h-3 inline mr-1 text-slate-400" />
                            {clue.sqlHint}
                          </code>
                          <button
                            onClick={() => setSqlQuery(clue.sqlHint)}
                            className="text-[9px] bg-sky-600/30 hover:bg-sky-600 text-sky-100 px-2 py-0.5 rounded transition shrink-0 border border-sky-500/30 cursor-pointer font-sans"
                          >
                            Gunakan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex justify-between items-center bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex gap-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("board")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  activeTab === "board"
                    ? "bg-sky-500 text-white shadow-2xs"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Papan Investigasi
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  activeTab === "table"
                    ? "bg-sky-500 text-white shadow-2xs"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <TableIcon className="w-4 h-4" /> Hasil Tabel (
                {queryResult.length})
              </button>
            </div>
          </div>

          {activeTab === "board" ? (
            <div className="w-full bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 relative overflow-hidden flex flex-col shadow-2xs">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-700 tracking-wider flex items-center gap-2 uppercase">
                  <Search className="w-4 h-4 text-orange-400" /> Papan Pemetaan
                  Bukti
                </h2>
                <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full font-semibold border border-sky-100">
                  {nodes.filter((n) => n.isUnlocked).length} / {nodes.length}{" "}
                  Terbuka
                </span>
              </div>

              <div className="relative w-full h-[360px] sm:h-[450px] bg-slate-50/80 rounded-xl border border-slate-200/70 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {nodes[0]?.isUnlocked && nodes[1]?.isUnlocked && (
                    <line
                      x1={`${nodes[0].x}%`}
                      y1={`${nodes[0].y}%`}
                      x2={`${nodes[1].x}%`}
                      y2={`${nodes[1].y}%`}
                      stroke="#fb923c"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      className="animate-pulse"
                    />
                  )}
                  {nodes[1]?.isUnlocked && nodes[2]?.isUnlocked && (
                    <line
                      x1={`${nodes[1].x}%`}
                      y1={`${nodes[1].y}%`}
                      x2={`${nodes[2].x}%`}
                      y2={`${nodes[2].y}%`}
                      stroke="#fb923c"
                      strokeWidth="2"
                    />
                  )}
                </svg>

                {nodes.map((item) => {
                  const isSelected = selectedNode?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => item.isUnlocked && setSelectedNode(item)}
                      style={{ left: `${item.x}%`, top: `${item.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 ${
                        item.isUnlocked
                          ? "cursor-pointer hover:scale-105"
                          : "opacity-60 cursor-not-allowed"
                      } ${isSelected ? "scale-105 z-20" : ""}`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs mx-auto -mb-1.5 z-30 relative ${
                          item.isUnlocked ? "bg-orange-400" : "bg-slate-300"
                        }`}
                      />

                      {item.isUnlocked ? (
                        <div
                          className={`w-32 sm:w-40 p-2.5 sm:p-3 rounded-2xl shadow-xs text-xs transition-all border ${
                            item.status === "suspicious"
                              ? "bg-amber-50/90 text-amber-900 border-amber-200"
                              : item.status === "target"
                              ? "bg-orange-50/90 text-orange-900 border-orange-200 ring-2 ring-orange-200/50"
                              : "bg-emerald-50/90 text-emerald-900 border-emerald-200"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-black/5 pb-1 mb-1 text-[11px] font-semibold">
                            <span className="flex items-center gap-1 truncate">
                              {item.type === "suspect" && (
                                <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              )}
                              {item.type === "location" && (
                                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                              )}
                              {item.type === "clue" && (
                                <Camera className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                              {item.title}
                            </span>
                            <Unlock className="w-3 h-3 text-sky-500 shrink-0" />
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                            {item.details}
                          </p>
                        </div>
                      ) : (
                        <div className="w-28 sm:w-36 p-2 sm:p-3 rounded-2xl bg-white/90 border border-slate-200 text-slate-400 text-center flex flex-col items-center gap-1 shadow-2xs">
                          <Lock className="w-3.5 h-3.5 text-slate-400 my-0.5" />
                          <span className="text-[10px] font-medium text-slate-500">
                            Terkunci
                          </span>
                          <span className="text-[9px] text-slate-400 leading-tight hidden sm:block">
                            {item.unlockConditionHint}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedNode && (
                <div className="mt-3 p-3 bg-sky-50/80 border border-sky-100 rounded-xl flex justify-between items-center text-slate-700 animate-fadeIn shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {selectedNode.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedNode.details}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-xs bg-white hover:bg-sky-100 text-sky-600 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer border border-sky-200/60"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              {queryResult.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-mono">
                  Tidak ada data untuk ditampilkan. Jalankan kueri SQL kamu!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-sky-50/70 text-sky-900 border-b border-sky-100">
                        {queryColumns.map((col) => (
                          <th
                            key={col}
                            className="p-3 font-mono font-bold uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {queryResult.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-orange-50/30 transition"
                        >
                          {queryColumns.map((col) => (
                            <td key={col} className="p-3 font-mono">
                              {String(row[col] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {isCaseCompleted && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-orange-100 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center border-4 border-orange-50 shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Investigasi Selesai!
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">
                Pencuri Berhasil Ditangkap! 🎉
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Analisis kueri SQL kamu tepat sasaran! Pelaku utama{" "}
                <strong className="text-orange-600">
                  {currentCase.culpritName}
                </strong>{" "}
                berhasil diidentifikasi dan ditangkap oleh tim kepolisian.
              </p>
            </div>

            <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-3.5 w-full text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="text-xs text-orange-950">
                <p className="font-bold">Laporan Kasus Ditutup</p>
                <p className="text-[11px] text-orange-800/80 leading-snug">
                  Seluruh bukti & alibi dari kueri SQL telah terverifikasi
                  secara sah.
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={() => setIsCaseCompleted(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Tinjau Papan
              </button>
              <button
                onClick={handleNextCase}
                className="flex-1 py-2.5 bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                Kasus Berikutnya <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
