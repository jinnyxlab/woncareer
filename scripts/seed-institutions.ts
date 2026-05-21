import { createClient } from '@supabase/supabase-js';
import { SIGUNGU_LIST } from '../app/data/sigungu';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CHILDCARE_API_KEY = process.env.NEXT_PUBLIC_CHILDCARE_API_KEY!;
const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY!;

const SIGUNGU_CODES = Object.values(SIGUNGU_LIST).flat().map(s => s.code);

async function fetchChildcare(arcode: string) {
  const res = await fetch(
    `http://api.childcare.go.kr/mediate/rest/cpmsapi021/cpmsapi021/request?key=${CHILDCARE_API_KEY}&arcode=${arcode}`
  );
  const text = await res.text();

  const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => {
    const item = match[1];
    const get = (tag: string) => item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`))?.[1]?.trim() || '';
    return {
      code: get('stcode'),
      name: get('crname'),
      address: get('craddr'),
      tel: get('crtelno') || get('crtel'),
      capacity: parseInt(get('crcapat')) || 0,
      homepage: get('crhome'),
      sigungu_code: arcode,
      sido_code: arcode.slice(0, 2),
    };
  });

  return items;
}

async function getCoords(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
    );
    const data = await res.json();
    if (data.documents?.length > 0) {
      return {
        lat: parseFloat(data.documents[0].y),
        lng: parseFloat(data.documents[0].x),
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function seed() {
  console.log('🌱 데이터 적재 시작...');
  let total = 0;
  let failed = 0;

  for (const code of SIGUNGU_CODES) {
    try {
      console.log(`📍 ${code} 조회 중...`);
      const items = await fetchChildcare(code);

      if (items.length === 0) {
        console.log(`⚠️  ${code} 데이터 없음`);
        continue;
      }

      const { error } = await supabase
        .from('institutions')
        .upsert(items, { onConflict: 'code' });

      if (error) {
        console.error(`❌ ${code} 적재 실패:`, error.message);
        failed++;
      } else {
        console.log(`✅ ${code} ${items.length}건 적재 완료`);
        total += items.length;
      }

      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.error(`❌ ${code} 오류:`, e);
      failed++;
    }
  }

  console.log(`\n🎉 완료! 총 ${total}건 적재 / 실패 ${failed}건`);
}

async function seedCoords() {
  console.log('🗺️  좌표 적재 시작...');

  const { data: institutions, error } = await supabase
    .from('institutions')
    .select('id, address')
    .is('lat', null);

  if (error || !institutions) {
    console.error('❌ 데이터 조회 실패:', error?.message);
    return;
  }

  console.log(`📊 좌표 없는 기관 ${institutions.length}건`);
  let success = 0;
  let failed = 0;

  for (const inst of institutions) {
    const coords = await getCoords(inst.address);

    if (coords) {
      const { error } = await supabase
        .from('institutions')
        .update({ lat: coords.lat, lng: coords.lng })
        .eq('id', inst.id);

      if (error) {
        failed++;
      } else {
        success++;
        if (success % 100 === 0) console.log(`✅ ${success}건 완료...`);
      }
    } else {
      failed++;
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n🎉 좌표 적재 완료! 성공 ${success}건 / 실패 ${failed}건`);
}

const command = process.argv[2];
if (command === 'coords') {
  seedCoords();
} else {
  seed();
}