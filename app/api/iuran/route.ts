import { supabaseServer } from '@/lib/supabaseServer';

/**
 * Backend API Route Handler: /api/iuran
 * Dijalankan otomatis sebagai Vercel Serverless Function
 */

// GET /api/iuran?tahun=2026
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahun = parseInt(searchParams.get('tahun') || '2026', 10);

    const { data, error } = await supabaseServer
      .from('iuran')
      .select('*, warga:warga_id(blok_rumah, nama_lengkap, no_hp)')
      .eq('tahun', tahun)
      .order('bulan', { ascending: true });

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }

    // Kalkulasi agregasi ringkasan di sisi backend serverless
    const totalTerkumpul = data.reduce((sum: number, item: any) => {
      return item.status_bayar === 'Lunas' ? sum + Number(item.jumlah_bayar) : sum;
    }, 0);

    return Response.json({
      success: true,
      tahun,
      totalTerkumpul,
      totalTransaksi: data.length,
      data,
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/iuran - Catat pembayaran iuran baru & generate kuitansi di backend
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warga_id, tahun, bulan, jumlah_bayar, metode_bayar, keterangan } = body;

    // Validasi bulan
    if (!warga_id || !tahun || !bulan) {
      return Response.json({ success: false, error: 'warga_id, tahun, dan bulan wajib disertakan' }, { status: 400 });
    }

    if (bulan < 1 || bulan > 12) {
      return Response.json({ success: false, error: 'Bulan harus bernilai antara 1 s.d. 12' }, { status: 400 });
    }

    // Generate nomor kuitansi unik di sisi server
    const padBulan = String(bulan).padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorKuitansi = `KWT-${tahun}-${padBulan}-${randomSuffix}`;
    const tanggalBayar = new Date().toISOString().split('T')[0];

    // Upsert catatan iuran ke Supabase
    const { data, error } = await supabaseServer
      .from('iuran')
      .upsert(
        {
          warga_id,
          tahun,
          bulan,
          jumlah_bayar: jumlah_bayar || 100000,
          status_bayar: 'Lunas',
          tanggal_bayar: tanggalBayar,
          metode_bayar: metode_bayar || 'Transfer',
          nomor_kuitansi: nomorKuitansi,
          dicatat_oleh: 'Bendahara RT (via Vercel Backend)',
          keterangan: keterangan || `Lunas iuran bulan ${bulan}/${tahun}`,
        },
        { onConflict: 'warga_id,tahun,bulan' }
      )
      .select()
      .single();

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: 'Pembayaran iuran berhasil dicatat oleh backend',
      data,
    });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
