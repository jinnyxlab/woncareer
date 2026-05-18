'use client';

import { useEffect, useRef, useState } from 'react';
import { SIDO_LIST, SIGUNGU_LIST } from '../data/sigungu';

declare global {
  interface Window {
    kakao: any;
  }
}

interface Childcare {
  code: string;
  name: string;
  address: string;
  tel: string;
  capacity: string;
}

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSigungu, setSelectedSigungu] = useState('');
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const options = {
          center: new window.kakao.maps.LatLng(36.5, 127.5),
          level: 13,
        };
        mapInstance.current = new window.kakao.maps.Map(mapRef.current, options);
      });
    };
    document.head.appendChild(script);
  }, []);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  const loadChildcare = async (arcode: string) => {
    clearMarkers();
    const res = await fetch(`/api/childcare?arcode=${arcode}`);
    const items: Childcare[] = await res.json();
    const geocoder = new window.kakao.maps.services.Geocoder();

    items.forEach((item) => {
      geocoder.addressSearch(item.address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          const marker = new window.kakao.maps.Marker({
            map: mapInstance.current,
            position: coords,
            title: item.name,
          });

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">
              <b>${item.name}</b><br/>
              ${item.address}<br/>
              ${item.tel}
            </div>`,
          });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(mapInstance.current, marker);
          });

          markersRef.current.push(marker);
        }
      });
    });
  };

  const handleSidoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSido(e.target.value);
    setSelectedSigungu('');
    clearMarkers();
  };

  const handleSigunguChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedSigungu(code);
    if (code) loadChildcare(code);
  };

  return (
    <div className="relative w-full h-screen">
      {/* 드롭다운 */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <select
          value={selectedSido}
          onChange={handleSidoChange}
          className="px-3 py-2 rounded shadow bg-white text-sm"
        >
          <option value="">시/도 선택</option>
          {SIDO_LIST.map(sido => (
            <option key={sido.code} value={sido.code}>{sido.name}</option>
          ))}
        </select>

        <select
          value={selectedSigungu}
          onChange={handleSigunguChange}
          className="px-3 py-2 rounded shadow bg-white text-sm"
          disabled={!selectedSido}
        >
          <option value="">시/구 선택</option>
          {(SIGUNGU_LIST[selectedSido] || []).map(sigungu => (
            <option key={sigungu.code} value={sigungu.code}>{sigungu.name}</option>
          ))}
        </select>
      </div>

      <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
}