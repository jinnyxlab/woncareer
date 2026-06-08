import { createClient } from '@supabase/supabase-js';
import { SIGUNGU_LIST } from '../app/data/sigungu';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_KEY_030 = process.env.NEXT_PUBLIC_CHILDCARE_API_KEY_030!;
const API_KEY_021 = process.env.NEXT_PUBLIC_CHILDCARE_API_KEY!;
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY!;

const SIGUNGU_CODES = Object.values(SIGUNGU_LIST).flat().map(s => s.code);

function parseItems030(text: string, arcode: string) {
  return [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => {
    const item = match[1];
    const get = (tag: string) => item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'i'))?.[1]?.trim() || '';
    const num = (tag: string) => parseInt(get(tag)) || 0;
    const lat = parseFloat(get('la'));
    const lng = parseFloat(get('lo'));

    return {
      code: get('stcode'),
      name: get('crname'),
      type: get('crtypename'),
      status: get('crstatusname'),
      address: get('craddr'),
      zipcode: get('zipcode'),
      tel: get('crtelno'),
      capacity: num('crcapat'),
      capacity_current: num('crchcnt'),
      homepage: get('crhome'),
      representative: get('crrepname'),
      cctv_count: num('cctvinstlcnt'),
      teacher_count: num('chcrtescnt'),
      room_count: num('nrtrroomcnt'),
      playground_count: num('plgrdco'),
      shuttle_bus: get('crcargbname'),
      approved_date: get('crcnfmdt'),
      // 근속년수
      em_cnt_0y: num('em_cnt_0y'),
      em_cnt_1y: num('em_cnt_1y'),
      em_cnt_2y: num('em_cnt_2y'),
      em_cnt_4y: num('em_cnt_4y'),
      em_cnt_6y: num('em_cnt_6y'),
      // 입소대기
      ew_cnt_00: num('ew_cnt_00'),
      ew_cnt_01: num('ew_cnt_01'),
      ew_cnt_02: num('ew_cnt_02'),
      ew_cnt_03: num('ew_cnt_03'),
      ew_cnt_04: num('ew_cnt_04'),
      ew_cnt_05: num('ew_cnt_05'),
      ew_cnt_m6: num('ew_cnt_m6'),
      ew_cnt_tot: num('ew_cnt_tot'),
      // 반수/아동수 총계
      class_cnt_tot: num('class_cnt_tot'),
      child_cnt_tot: num('child_cnt_tot'),
      lat: isNaN(lat) ? null : lat,
      lng: isNaN(lng) ? null : lng,
      sigungu_code: arcode,
      sido_code: arcode.slice(0, 2),
    };
  }).filter(i => i.code);
}

function parseItems021(text: string, arcode: string) {
  return [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => {
    const item = match[1];
    const get = (tag: string) => item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'i'))?.[1]?.trim() || '';
    return {
      code: get('stcode'),
      name: get('crname'),
      address: get('craddr'),
      tel: get('crtelno') || get('crtel'),
      capacity: parseInt(get('crcapat')) || 0,
      homepage: get('crhome'),
      lat: null,
      lng: null,
      sigungu_code: arcode,
      sido_code: arcode.slice(0, 2),
    };
  }).filter(i => i.code);
}

async function fetchChildcare(arcode: string) {
  try {
    const [res030, res021] = await Promise.all([
      fetch(`http://api.childcare.go.kr/mediate/rest/cpmsapi030/cpmsapi030/request?key=${API_KEY_030}&arcode=${arcode}`),
      fetch(`http://api.childcare.go.kr/mediate/rest/cpmsapi021/cpmsapi021/request?key=${API_KEY_021}&arcode=${arcode}`),
    ]);

    const [text030, text021] = await Promise.all([res030.text(), res021.text()]);

    const items030 = parseItems030(text030, arcode);
    const items021 = parseItems021(text021, arcode);

    // 030에 없는 기관만 021에서 추가
    const codes030 = new Set(items030.map(i => i.code));
    const extra = items021.filter(i => !codes030.has(i.code));

    return [...items030, ...extra];
  } catch (e) {
    console.error(`API 호출 오류 (${arcode}):`, e);
    return [];
  }
}

async function getCoords(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } }
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

    await new Promise(r => setTimeout(r, 10));
  }

  console.log(`\n🎉 좌표 적재 완료! 성공 ${success}건 / 실패 ${failed}건`);
}

const command = process.argv[2];
if (command === 'coords') {
  seedCoords();
} else {
  seed();
}