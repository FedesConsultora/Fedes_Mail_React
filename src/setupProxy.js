const { createProxyMiddleware } = require('http-proxy-middleware');
console.log('✅ setupProxy.js cargado');
module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://fedes-hub-fedeshub-nuevascaracteristicas-17888947.dev.odoo.com/FedesMail/api',
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req) => {
        const forzada = 'session_id=ed96FUW2JcfmLX9-Oh8cAU9yrbNp4bqvbbZBoZ9a7XLHEhw_4uhOkYpKEnx9mYCYYsCHAjEkJ52JvPS2Z90G';

        console.table({
          'Cookie original (desde el navegador)': req.headers.cookie || '❌ No enviada',
          'Cookie forzada al backend': forzada
        });

        proxyReq.removeHeader('cookie');
        proxyReq.setHeader('Cookie', forzada);
      },
    })
  );
};
