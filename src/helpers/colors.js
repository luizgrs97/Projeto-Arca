const fs = require('fs');
const path = require('path');

const baseColors = {
    c0: '#989898',
    c1: '#84E050',
    c2: '#E05084',
    c3: '#E0AC50',
    c6: '#50E064',
    c7: '#E06450',
    c8: '#e0d050',
    c9: '#5084E0',
};

const defaultTargetPath = path.join(__dirname, '..', '..', 'public', 'assets', 'css', 'style.css');

function buildColorVariables(colors = baseColors) {
    const colorSteps = [
        ['0', (hex) => `color-mix(in srgb, ${hex} 0%, #ffffff)`],
        ['25', (hex) => `color-mix(in srgb, ${hex} 5%, #ffffff)`],
        ['50', (hex) => `color-mix(in srgb, ${hex} 10%, #ffffff)`],
        ['100', (hex) => `color-mix(in srgb, ${hex} 20%, #ffffff)`],
        ['200', (hex) => `color-mix(in srgb, ${hex} 40%, #ffffff)`],
        ['300', (hex) => `color-mix(in srgb, ${hex} 60%, #ffffff)`],
        ['400', (hex) => `color-mix(in srgb, ${hex} 80%, #ffffff)`],
        ['500', (hex) => hex],
        ['600', (hex) => `color-mix(in srgb, ${hex} 80%, #000000)`],
        ['700', (hex) => `color-mix(in srgb, ${hex} 60%, #000000)`],
        ['800', (hex) => `color-mix(in srgb, ${hex} 40%, #000000)`],
        ['900', (hex) => `color-mix(in srgb, ${hex} 20%, #000000)`],
        ['950', (hex) => `color-mix(in srgb, ${hex} 10%, #000000)`],
        ['975', (hex) => `color-mix(in srgb, ${hex} 5%, #000000)`],
        ['1000', (hex) => `color-mix(in srgb, ${hex} 0%, #000000)`],
    ];

    const variables = Object.entries(colors).flatMap(([name, hex]) => {
        return colorSteps.map(([step, getValue]) => `    --${name}-${step}: ${getValue(hex)};`);
    });

    return `:root {\n${variables.join('\n')}\n}\n`;
}

function findRootBlock(css) {
    return /:root\s*\{[\s\S]*?\}\r?\n?/.exec(css);
}

function writeColorsCss(targetPath = defaultTargetPath) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    const currentCss = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
    const generatedCss = buildColorVariables();
    const rootBlock = findRootBlock(currentCss);
    let nextCss;

    if (rootBlock) {
        const beforeRootBlock = currentCss.slice(0, rootBlock.index);
        const afterRootBlock = currentCss.slice(rootBlock.index + rootBlock[0].length);

        nextCss = `${beforeRootBlock}${generatedCss}${afterRootBlock}`;
    } else {
        nextCss = currentCss.trim() ? `${generatedCss}\n${currentCss}` : generatedCss;
    }

    if (nextCss === currentCss) {
        return false;
    }

    fs.writeFileSync(targetPath, nextCss);
    return true;
}

module.exports = {
    baseColors,
    buildColorVariables,
    writeColorsCss,
};
