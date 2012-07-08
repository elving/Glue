var fs = require('fs'),
    path = require('path'),
    colors = {
    	red: 31,
    	green: 32,
    	blue: 34,
    	reset: 0
    };

module.exports.log = function (type, text) {
	var date = new Date().toDateString() + ' ' + new Date().toLocaleTimeString();
	type === 'success' ? console.log(date + '    ' + text) : console.error(date + '    ' + text);
};

module.exports.colorize = function (color, text) {
	return '\033[' + colors[color] + 'm' + text + '\033[' + colors.reset + 'm';
};

module.exports.cleanURL = function (url) {
	if (url.charAt(0) === '\'' || url.charAt(0) === '"') url = url.substring(1, url.length - 1);
	return url.replace(/^\/|\/$/, '');
};

module.exports.createStructure = function (_path) {
    var src, build;
    _path = _path || process.cwd();
    src = path.join(_path, 'src');
    build = path.join(_path, 'build');

    if (!fs.existsSync(_path)) fs.mkdirSync(_path);
    if (!fs.existsSync(src)) fs.mkdirSync(src);
    if (!fs.existsSync(path.join(src, 'modules'))) fs.mkdirSync(path.join(src, 'modules'));
    if (!fs.existsSync(build)) fs.mkdirSync(build);

    fs.writeFileSync(
        path.join(src, 'main.css'),
        '/* CSS Reset */ \n @import url(\'reset.css\'); \n\n /* Base Styles */ \n @import url(\'base.css\'); \n\n /* Layout Styles */ \n @import url(\'layout.css\'); \n\n /* Modules */ \n @import url(\'modules/module.css\'); \n\n /* Module States */ \n @import url(\'states.css\'); \n\n /* Helper Classes */ \n @import url(\'helpers.css\');',
        'utf8'
    );

    fs.writeFileSync(path.join(src, 'reset.css'), '', 'utf8');
    fs.writeFileSync(path.join(src, 'base.css'), '', 'utf8');
    fs.writeFileSync(path.join(src, 'layout.css'), '', 'utf8');
    fs.writeFileSync(path.join(src, 'states.css'), '', 'utf8');
    fs.writeFileSync(path.join(src, 'modules/module.css'), '', 'utf8');
    fs.writeFileSync(path.join(src, 'helpers.css'), '', 'utf8');
}