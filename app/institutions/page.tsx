'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import KakaoMap from '../components/KakaoMap';

export default function InstitutionsPage() {
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSigungu, setSelectedSigungu] = useState('');

  const handleSidoChange = (code: string) => {
    setSelectedSido(code);
    setSelectedSigungu('');
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <Sidebar
          selectedSido={selectedSido}
          selectedSigungu={selectedSigungu}
          onSidoChange={handleSidoChange}
          onSigunguChange={setSelectedSigungu}
        />
        <main className="ml-64 flex-1 h-full">
          <KakaoMap selectedSigungu={selectedSigungu} />
        </main>
      </div>
    </div>
  );
}