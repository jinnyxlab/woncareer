import { supabase } from '../../lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sigungu_code = searchParams.get('arcode');

  if (!sigungu_code) {
    return Response.json([]);
  }

  const { data, error } = await supabase
    .from('institutions')
    .select('id, code, name, address, tel, capacity, lat, lng')
    .eq('sigungu_code', sigungu_code);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}