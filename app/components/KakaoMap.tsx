'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface Institution {
  id: string;
  code: string;
  name: string;
  address: string;
  tel: string;
  capacity: number;
  lat: number;
  lng: number;
}

interface KakaoMapProps {
  selectedSigungu: string;
}

export default function KakaoMap({ selectedSigungu }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`;
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

  useEffect(() => {
    if (!selectedSigungu || !mapInstance.current) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const loadInstitutions = async () => {
      const res = await fetch(`/api/childcare?arcode=${selectedSigungu}`);
      const items: Institution[] = await res.json();

      items.forEach((item) => {
        if (!item.lat || !item.lng) return;

        const coords = new window.kakao.maps.LatLng(item.lat, item.lng);
        const marker = new window.kakao.maps.Marker({
          map: mapInstance.current,
          position: coords,
          title: item.name,
        });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px;font-size:12px;min-width:200px;line-height:1.8;">
            <b style="color:#16a34a;">${item.name}</b><br/>
            <span style="color:#666;">${item.address}</span><br/>
            <span style="color:#666;">${item.tel}</span><br/>
            <a href="/institutions/${item.id}" style="color:#16a34a;font-size:11px;font-weight:bold;">상세보기 →</a>
          </div>`,
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(mapInstance.current, marker);
        });

        markersRef.current.push(marker);

        if (markersRef.current.length === 1) {
          mapInstance.current.setCenter(coords);
          mapInstance.current.setLevel(7);
        }
      });
    };

    loadInstitutions();
  }, [selectedSigungu]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}