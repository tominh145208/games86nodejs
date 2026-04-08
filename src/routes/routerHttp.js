module.exports = function(app, redT) {
    // Home: keep traffic on local server instead of external expired domain.
    app.get('/', function(req, res) {
        const ua = String(req.headers['user-agent'] || '').toLowerCase();
        const isMobile = /mobile|android|iphone|ipad|ipod/.test(ua);
        return res.redirect(isMobile ? '/mobile/' : '/web/');
    });

    // Sign API
    require('./api')(app, redT); // load routes API
};
