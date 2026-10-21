function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
}

module.exports = errorHandler;
