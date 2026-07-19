import express from 'express';
import Transaction from '../models/Transaction.js';
import Shift from '../models/Shift.js';
import QRCode from 'qrcode';

const router = express.Router();

const page = (body) => `
<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pembayaran QRIS</title></head>
<body style="font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f5f5f5;margin:0">
<div style="background:#fff;padding:32px;border-radius:16px;text-align:center;max-width:340px;width:90%">
${body}
</div></body></html>`;

const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');
const baseFrom = (req) => `${req.protocol}://${req.get('host')}`;   


router.get('/:id', async (req, res) => {
    const trx = await Transaction.findById(req.params.id);
    if (!trx) return res.status(404).send(page('<h2>Transaksi tidak ditemukan</h2>'));

    if (trx.status === 'success') {
        return res.send(page(`<h2 style="color:#16a34a">✅ Sudah Dibayar</h2>
            <p>${trx.invoice_number}</p><h1>${rupiah(trx.total_amount)}</h1>`));
    }
    if (trx.status === 'voided') {
        return res.send(page('<h2 style="color:#dc2626">Transaksi dibatalkan</h2>'));
    }

    res.send(page(`
        <p style="color:#666;margin:0">${trx.invoice_number}</p>
        <h1 style="margin:8px 0 24px">${rupiah(trx.total_amount)}</h1>
        <a href="${baseFrom(req)}/pay/${trx._id}/confirm"
            style="display:block;padding:14px;font-size:16px;border-radius:10px;background:#2563eb;color:#fff;text-decoration:none">
            Bayar Sekarang
        </a>`));

});

const confirmHandler = async (req, res) => {
    const trx = await Transaction.findById(req.params.id);
    if (!trx) return res.status(404).send(page('<h2>Transaksi tidak ditemukan</h2>'));
    if (trx.status !== 'pending') {
        return res.send(page('<h2>Transaksi ini tidak bisa dibayar</h2>'));
    }

    trx.status = 'success';
    await trx.save();

    await Shift.updateOne({ _id: trx.shift_id }, { $inc: { total_qris_sales: trx.total_amount } });

    res.send(page(`<h2 style="color:#16a34a">✅ Pembayaran Berhasil</h2>
        <p>${trx.invoice_number}</p><h1>${rupiah(trx.total_amount)}</h1>`));
};

router.get('/:id/confirm', confirmHandler);
router.post('/:id/confirm', confirmHandler); 

router.get('/:id/qr.png', async (req, res) => {
    const trx = await Transaction.findById(req.params.id);
    if (!trx) return res.status(404).send('Transaksi tidak ditemukan');

    const baseUrl = baseFrom(req);
    const buffer = await QRCode.toBuffer(`${baseUrl}/pay/${trx._id}`, { width: 400, margin: 1 });

    res.type('png').send(buffer);
});


export default router;
