'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('API KEY:', process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
    
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=c29ac7ceccc3c3a7b4828a437ac9ee83&autoload=false`;
    
    script.onload = () => {
      console.log('스크립트 로드 완료');
      window.kakao.maps.load(() => {
        console.log('카카오맵 로드 완료');
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 8,
        };
        new window.kakao.maps.Map(mapRef.current, options);
      });
    };

    script.onerror = () => {
      console.log('스크립트 로드 실패');
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
  );
}