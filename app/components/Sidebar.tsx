'use client';

import { SIDO_LIST, SIGUNGU_LIST } from '../data/sigungu';

interface SidebarProps {
  selectedSido: string;
  selectedSigungu: string;
  onSidoChange: (code: string) => void;
  onSigunguChange: (code: string) => void;
}

export default function Sidebar({ selectedSido, selectedSigungu, onSidoChange, onSigunguChange }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col p-4 gap-4 fixed left-0 top-14 z-10 overflow-y-auto">
      {/* 검색 타이틀 */}
      <div>
        <h2 className="text-sm font-bold text-gray-700">기관 검색</h2>
        <p className="text-xs text-gray-400 mt-1">지역을 선택하면 어린이집이 표시됩니다</p>
      </div>

      {/* 시/도 선택 */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">시/도</label>
        <select
          value={selectedSido}
          onChange={(e) => onSidoChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-green-400"
        >
          <option value="">시/도 선택</option>
          {SIDO_LIST.map(sido => (
            <option key={sido.code} value={sido.code}>{sido.name}</option>
          ))}
        </select>
      </div>

      {/* 시/구 선택 */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">시/구</label>
        <select
          value={selectedSigungu}
          onChange={(e) => onSigunguChange(e.target.value)}
          disabled={!selectedSido}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-green-400 disabled:bg-gray-50 disabled:text-gray-300"
        >
          <option value="">시/구 선택</option>
          {(SIGUNGU_LIST[selectedSido] || []).map(sigungu => (
            <option key={sigungu.code} value={sigungu.code}>{sigungu.name}</option>
          ))}
        </select>
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-100" />

      {/* 필터 */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-500">기관 유형</label>
        {['국공립', '민간', '가정', '직장'].map(type => (
          <label key={type} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="accent-green-500" defaultChecked />
            {type}
          </label>
        ))}
      </div>
    </aside>
  );
}