
const express = require('express');
const cors = require('cors');
const db = require('../db/connection');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const path = require('path');


// Tüm riskleri getir
app.get('/api/riskler', (req, res) => {
  db.query('SELECT * FROM riskler', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Yeni risk ekle
app.post('/api/riskler', (req, res) => {
  const { tanim, olasilik, etki, risk_seviyesi, kontrol_var_mi, durum } = req.body;
  const sql = 'INSERT INTO riskler (tanim, olasilik, etki, risk_seviyesi, kontrol_var_mi, durum) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [tanim, olasilik, etki, risk_seviyesi, kontrol_var_mi, durum], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: results.insertId });
  });
});

// Risk güncelle
app.put('/api/riskler/:id', (req, res) => {
  const { id } = req.params;
  const { tanim, olasilik, etki, risk_seviyesi, kontrol_var_mi, durum } = req.body;
  const sql = 'UPDATE riskler SET tanim=?, olasilik=?, etki=?, risk_seviyesi=?, kontrol_var_mi=?, durum=? WHERE id=?';
  db.query(sql, [tanim, olasilik, etki, risk_seviyesi, kontrol_var_mi, durum, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Risk sil
app.delete('/api/riskler/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM riskler WHERE id=?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// Denetimleri getir
app.get('/api/denetimler', (req, res) => {
  db.query('SELECT * FROM denetimler ORDER BY tarih DESC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Yeni denetim ekle
app.post('/api/denetimler', (req, res) => {
  const { konu, sorumlu_personel, tarih, sonuc } = req.body;
  db.query(
    'INSERT INTO denetimler (konu, sorumlu_personel, tarih, sonuc) VALUES (?, ?, ?, ?)',
    [konu, sorumlu_personel, tarih, sonuc],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Denetim sil
app.delete('/api/denetimler/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM denetimler WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send({ error: 'Kayıt bulunamadı' });
    res.json({ success: true });
  });
});

// Denetim güncelle
app.put('/api/denetimler/:id', (req, res) => {
  const id = req.params.id;
  const { konu, sorumlu_personel, tarih, sonuc } = req.body;
  db.query(
    'UPDATE denetimler SET konu = ?, sorumlu_personel = ?, tarih = ?, sonuc = ? WHERE id = ?',
    [konu, sorumlu_personel, tarih, sonuc, id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).send({ error: 'Kayıt bulunamadı' });
      res.json({ success: true });
    }
  );
});

// Tüm varlıkları getir
app.get('/api/varliklar', (req, res) => {
  db.query('SELECT * FROM varliklar', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Yeni varlık ekle
app.post('/api/varliklar', (req, res) => {
  const { varlik_adi, varlik_turu, kritiklik, sahip } = req.body;
  const sql = 'INSERT INTO varliklar (varlik_adi, varlik_turu, kritiklik, sahip) VALUES (?, ?, ?, ?)';
  db.query(sql, [varlik_adi, varlik_turu, kritiklik, sahip], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: results.insertId });
  });
});

// Varlık güncelle
app.put('/api/varliklar/:id', (req, res) => {
  const { id } = req.params;
  const { varlik_adi, varlik_turu, kritiklik, sahip } = req.body;
  const sql = 'UPDATE varliklar SET varlik_adi=?, varlik_turu=?, kritiklik=?, sahip=? WHERE id=?';
  db.query(sql, [varlik_adi, varlik_turu, kritiklik, sahip, id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Varlık sil
app.delete('/api/varliklar/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM varliklar WHERE id=?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// 1. Risk Dağılımı
app.get('/api/dashboard/risk-dagilim', (req, res) => {
  const query = `SELECT risk_seviyesi, COUNT(*) as adet FROM riskler GROUP BY risk_seviyesi ORDER BY risk_seviyesi`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 2. Denetim Sonuçları
app.get('/api/dashboard/denetim-sonuclari', (req, res) => {
  const query = `SELECT sonuc, COUNT(*) as adet FROM denetimler GROUP BY sonuc`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 3. Varlık Türleri Dağılımı
app.get('/api/dashboard/varlik-turleri', (req, res) => {
  const query = `SELECT varlik_turu, COUNT(*) as adet FROM varliklar GROUP BY varlik_turu`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 4. Kontrol Durumu
app.get('/api/dashboard/kontrol-durumu', (req, res) => {
  const query = `SELECT kontrol_var_mi, COUNT(*) as adet FROM riskler GROUP BY kontrol_var_mi`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 5. Aylık Denetim Raporu
app.get('/api/dashboard/aylik-denetim', (req, res) => {
  const query = `
    SELECT DATE_FORMAT(tarih, '%Y-%m') as ay, COUNT(*) as adet, sonuc FROM denetimler WHERE tarih >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY ay ORDER BY ay;`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 6. Örnek: Toplam Risk Sayısı
app.get('/api/dashboard/toplam-risk', (req, res) => {
  const query = `SELECT COUNT(*) as toplam FROM riskler`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]);
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API sunucusu ${PORT} portunda çalışıyor.`);
});

app.get('/', (req, res) => {
  res.send('API çalışıyor');
});
