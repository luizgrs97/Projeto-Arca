const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const { writeColorsCss } = require('./helpers/colors');

const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, '..', 'public');
const lastPageCookieName = 'arca_last_page';
const userCookieName = 'arca_user';
const fallbackPage = 'home';
const port = process.env.PORT || 3001;
const allowedUsers = {
    tutor: {
        password: '123456',
        role: 'tutor',
        label: 'Tutor',
    },
    candidato: {
        password: 'cand!098',
        role: 'candidato',
        label: 'Candidato',
    },
    ong: {
        password: 'ong$-135',
        role: 'ong',
        label: 'ONG',
    },
    prefeitura: {
        password: 'pref@456',
        role: 'prefeitura',
        label: 'Prefeitura',
    },
};

writeColorsCss();

app.set('view engine', 'ejs');

app.set('views', viewsPath);

app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: false }));

function getCookieValue(req, cookieName) {
    const cookies = req.headers.cookie ?? '';
    const cookie = cookies
        .split(';')
        .map((value) => value.trim())
        .find((value) => value.startsWith(`${cookieName}=`));

    if (!cookie) {
        return null;
    }

    try {
        return decodeURIComponent(cookie.split('=').slice(1).join('='));
    } catch {
        return null;
    }
}

function getAuthenticatedUser(req) {
    const username = getCookieValue(req, userCookieName);
    const user = username ? allowedUsers[username] : null;

    if (!user) {
        return null;
    }

    return {
        username,
        role: user.role,
        label: user.label,
    };
}

function normalizeUsername(value) {
    return String(value ?? '').trim().toLowerCase();
}

app.use((req, res, next) => {
    res.locals.currentUser = getAuthenticatedUser(req);
    res.locals.showProfilePopover = req.query.profile === '1';
    res.locals.profilePopoverClosePath = req.path || '/home';
    next();
});

function getRootViewPages() {
    return fs
        .readdirSync(viewsPath, { withFileTypes: true })
        .filter((item) => item.isFile() && path.extname(item.name) === '.ejs')
        .map((item) => path.basename(item.name, '.ejs'));
}

function getSavedPage(req, availablePages) {
    const page = getCookieValue(req, lastPageCookieName);

    return availablePages.includes(page) ? page : null;
}

app.get('/login', (req, res) => {
    if (res.locals.currentUser) {
        return res.redirect('/home?profile=1');
    }

    return res.render('login', {
        authError: null,
        loginUsername: '',
    });
});

app.post('/login', (req, res) => {
    const username = normalizeUsername(req.body.usuario ?? req.body.email);
    const password = String(req.body.senha ?? '');
    const user = allowedUsers[username];

    if (!user || user.password !== password) {
        return res.status(401).render('login', {
            authError: 'Usuário ou senha inválidos.',
            loginUsername: username,
        });
    }

    res.cookie(userCookieName, username, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        path: '/',
        sameSite: 'lax',
    });

    return res.redirect('/home');
});

app.post('/logout', (req, res) => {
    res.clearCookie(userCookieName, {
        path: '/',
        sameSite: 'lax',
    });

    return res.redirect('/login');
});

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

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
