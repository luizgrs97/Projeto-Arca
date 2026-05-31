const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, '..', 'public');
const lastPageCookieName = 'arca_last_page';
const fallbackPage = 'home';

app.set('view engine', 'ejs');

app.set('views', viewsPath);

app.use(express.static(publicPath));

function getRootViewPages() {
    return fs
        .readdirSync(viewsPath, { withFileTypes: true })
        .filter((item) => item.isFile() && path.extname(item.name) === '.ejs')
        .map((item) => path.basename(item.name, '.ejs'));
}

function getSavedPage(req, availablePages) {
    const cookies = req.headers.cookie ?? '';
    const cookie = cookies
        .split(';')
        .map((value) => value.trim())
        .find((value) => value.startsWith(`${lastPageCookieName}=`));

    if (!cookie) {
        return null;
    }

    let page;

    try {
        page = decodeURIComponent(cookie.split('=').slice(1).join('='));
    } catch {
        return null;
    }

    return availablePages.includes(page) ? page : null;
}

app.get('/', (req, res) => {
    const availablePages = getRootViewPages();
    const savedPage = getSavedPage(req, availablePages);
    const defaultPage = availablePages.includes(fallbackPage) ? fallbackPage : availablePages[0];

    if (!defaultPage) {
        return res.status(404).send('Nenhuma pagina encontrada em src/views.');
    }

    res.redirect(`/${savedPage ?? defaultPage}`);
});

app.get('/:page', (req, res, next) => {
    const availablePages = getRootViewPages();
    const page = req.params.page;

    if (!availablePages.includes(page)) {
        return next();
    }

    res.cookie(lastPageCookieName, page, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'lax',
    });

    return res.render(page);
});

app.listen(3001, () => {
    console.log('Servidor rodando em http://localhost:3001');
});
