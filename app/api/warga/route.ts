import { supabaseServer } from '@/lib/supabaseServer';

/**
 * Backend API Route Handler: /api/warga
 * Dijalankan otomatis sebagai Vercel Serverless Function
 */

// GET /api/warga - Mengambil seluruh data warga atau filter berdasarkan blok & query
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const blok = searchParams.get('blok') || '';

    let query = supabaseServer.from('warga').select('*').order('blok_rumah', { ascending: true });

    if (blok && blok !== 'all') {
      query = query.ilike('blok_rumah', `${blok}%`);
    }

    if (search) {
      query = query.or(`nama_lengkap.ilike.%${search}%,blok_rumah.ilike.%${search}%,no_hp.ilike.%${search}%`);
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

// POST /api/warga - Menambah data warga baru dengan validasi sisi backend
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blok_rumah, nama_lengkap, no_hp, status_penghuni, jumlah_anggota, pekerjaan, plat_nomor, catatan } = body;

    // Validasi backend
    if (!blok_rumah || !nama_lengkap || !no_hp || !status_penghuni) {
      return Response.json(
        { success: false, error: 'Kolom blok_rumah, nama_lengkap, no_hp, dan status_penghuni wajib diisi' },
        { status: 400 }
      );
    }

    // Insert ke database Supabase
    const { data, error } = await supabaseServer
      .from('warga')
      .insert([
        {
          blok_rumah,
          nama_lengkap,
          no_hp,
          status_penghuni,
          jumlah_anggota: jumlah_anggota || 1,
          pekerjaan: pekerjaan || null,
          plat_nomor: plat_nomor || null,
          catatan: catatan || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }

    return Response.json({ success: true, message: 'Data warga berhasil ditambahkan', data }, { status: 201 });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
