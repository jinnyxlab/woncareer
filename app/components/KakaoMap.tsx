'use client';

import { useEffect, useRef } from 'react';

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

interface KakaoMapProps {
  selectedSigungu: string;
}

export default function KakaoMap({ selectedSigungu }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
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

  useEffect(() => {
    if (!selectedSigungu || !mapInstance.current) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const loadChildcare = async () => {
      const res = await fetch(`/api/childcare?arcode=${selectedSigungu}`);
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
              content: `<div style="padding:8px;font-size:12px;min-width:150px;">
                <b style="color:#16a34a;">${item.name}</b><br/>
                <span style="color:#666;">${item.address}</span><br/>
                <span style="color:#666;">${item.tel}</span>
              </div>`,
            });

            window.kakao.maps.event.addListener(marker, 'click', () => {
              infowindow.open(mapInstance.current, marker);
            });

            markersRef.current.push(marker);

            // 첫 번째 마커로 지도 이동
            if (markersRef.current.length === 1) {
              mapInstance.current.setCenter(coords);
              mapInstance.current.setLevel(7);
            }
          }
        });
      });
    };

    loadChildcare();
  }, [selectedSigungu]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}