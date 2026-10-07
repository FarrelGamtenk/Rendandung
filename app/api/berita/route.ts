import { supabaseServer } from '@/lib/supabaseServer';

/**
 * Backend API Route Handler: /api/berita
 * Dijalankan otomatis sebagai Vercel Serverless Function
 */

// GET /api/berita - Mengambil daftar pengumuman & berita RT
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');

    let query = supabaseServer
      .from('berita')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('tanggal', { ascending: false });

    if (kategori && kategori !== 'all') {
      query = query.eq('kategori', kategori);
    }

    const { data, error } = await query;

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }

    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/berita - Menerbitkan pengumuman baru dari pengurus RT
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { judul, kategori, isi, ringkasan, penulis, is_pinned } = body;

    if (!judul || !isi || !kategori) {
      return Response.json({ success: false, error: 'Judul, kategori, dan isi pengumuman wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('berita')
      .insert([
        {
          judul,
          kategori,
          isi,
          ringkasan: ringkasan || isi.slice(0, 160),
          tanggal: new Date().toISOString().split('T')[0],
          penulis: penulis || 'Pengurus RT 04',
          is_pinned: Boolean(is_pinned),
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }

    return Response.json({ success: true, message: 'Pengumuman berhasil diterbitkan', data }, { status: 201 });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
