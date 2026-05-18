export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const arcode = searchParams.get('arcode') || '11380';

  const response = await fetch(
    `http://api.childcare.go.kr/mediate/rest/cpmsapi021/cpmsapi021/request?key=${process.env.NEXT_PUBLIC_CHILDCARE_API_KEY}&arcode=${arcode}`
  );

  const text = await response.text();

  // XML 파싱
  const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => {
    const item = match[1];
    const get = (tag: string) => item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`))?.[1] || '';
    return {
      code: get('stcode'),
      name: get('crname'),
      address: get('craddr'),
      tel: get('crtelno') || get('crtel'),
      capacity: get('crcapat'),
    };
  });

  return Response.json(items);
}