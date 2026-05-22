import { supabase } from '../../../lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('조회 id:', id);

  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', id)
    .single();

  console.log('data:', data);
  console.log('error:', error);

  if (error) {
    return Response.json({ error: '기관 정보를 찾을 수 없습니다.' }, { status: 404 });
  }

  return Response.json(data);
}