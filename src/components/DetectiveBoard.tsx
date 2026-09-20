"use client";

import React, { useState } from "react";
import { User, MapPin, Camera, AlertCircle, Search } from "lucide-react";

export interface NodeItem {
  id: string;
  title: string;
  type: "suspect" | "location" | "clue";
  details: string;
  x: number;
  y: number;
  status?: "cleared" | "suspicious" | "target";
}

interface DetectiveBoardProps {
  data: Record<string, unknown>[];
  onNodeClick?: (item: NodeItem) => void;
}

export default function DetectiveBoard({
  data,
  onNodeClick,
}: DetectiveBoardProps) {
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);

  const nodes: NodeItem[] = [
    {
      id: "1",
      title: "TKP: Ruang Server",
      type: "location",
      details: "Akses ilegal terdeteksi pukul 22:15 WIB.",
      x: 20,
      y: 25,
      status: "target",
    },
    {
      id: "2",
      title: "Budi (Pengunjung)",
      type: "suspect",
      details: "Tercatat di log_cctv jam 22:10 WIB. ID: P001",
      x: 50,
      y: 20,
      status: "suspicious",
    },
    {
      id: "3",
      title: "Log Transaksi Rp 50M",
      type: "clue",
      details: "Transfer tidak dikenal setelah server terkunci.",
      x: 75,
      y: 60,
      status: "suspicious",
    },
    {
      id: "4",
      title: "Siti (Admin)",
      type: "suspect",
      details: "Alibi terverifikasi di pos satpam pukul 22:00-22:30.",
      x: 30,
      y: 70,
      status: "cleared",
    },
  ];

  return (
    <div className="w-full bg-[#2b1d0c] p-4 rounded-xl shadow-2xl border-4 border-[#1e1307] relative overflow-hidden">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-amber-900/50">
        <h2 className="text-xl font-bold text-amber-200 tracking-wider flex items-center gap-2">
          <Search className="w-5 h-5 text-amber-400" /> PAPAN INVESTIGASI KASUS
        </h2>
        <span className="text-xs bg-amber-900/60 text-amber-300 px-3 py-1 rounded-full border border-amber-700/50">
          Hasil Kueri: {data?.length || 0} Record Terdeteksi
        </span>
      </div>

      <div className="relative w-full h-[450px] bg-[#3a2818] rounded-lg border border-amber-900/80 shadow-inner overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#d97706 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <line
            x1="20%"
            y1="25%"
            x2="50%"
            y2="20%"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
          <line
            x1="50%"
            y1="20%"
            x2="75%"
            y2="60%"
            stroke="#ef4444"
            strokeWidth="2"
          />
          <line
            x1="20%"
            y1="25%"
            x2="30%"
            y2="70%"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
        </svg>

        {nodes.map((item) => {
          const isSelected = selectedNode?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedNode(item);
                if (onNodeClick) onNodeClick(item);
              }}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 hover:scale-110 ${
                isSelected ? "scale-110 z-20" : ""
              }`}
            >
              <div className="w-3 h-3 bg-red-600 rounded-full border border-red-900 shadow-md mx-auto -mb-1 z-30 relative" />

              <div
                className={`w-40 p-2.5 rounded shadow-lg backdrop-blur-sm text-xs font-sans transition-all border ${
                  item.status === "suspicious"
                    ? "bg-amber-100 text-slate-900 border-amber-400 rotate-1"
                    : item.status === "target"
                    ? "bg-red-100 text-red-950 border-red-400 -rotate-2 ring-2 ring-red-500/50"
                    : "bg-stone-200 text-stone-700 border-stone-300 rotate-2 opacity-80"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold border-b border-black/10 pb-1 mb-1">
                  {item.type === "suspect" && (
                    <User className="w-3.5 h-3.5 text-red-600" />
                  )}
                  {item.type === "location" && (
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  {item.type === "clue" && (
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span className="truncate">{item.title}</span>
                </div>
                <p className="text-[10px] text-slate-700 line-clamp-2 leading-tight">
                  {item.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedNode && (
        <div className="mt-3 p-3 bg-amber-950/80 border border-amber-700/60 rounded-lg flex justify-between items-center text-amber-100 animate-fadeIn">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300">
                {selectedNode.title}
              </p>
              <p className="text-xs text-amber-100/80">
                {selectedNode.details}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-xs bg-amber-800 hover:bg-amber-700 px-2 py-1 rounded text-amber-200"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
