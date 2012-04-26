var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    cleanCSS = require('clean-css'),
    utils = require('./utils'),
    currentDir = process.cwd(),
    srcDir = '',
    srcCSS = '',
    buildDir = '',
    buildCSS = '',
    files = [],
    watched = [],
    firstTime = true,
    options = {},
    code = {
        original: '',
        intermediate: '',
        glued: '',
        gluedMini: ''
    },
    regexs = {
        importRegex: /\@import\s+(url\()?\s*([^);]+)\s*(\))?([\w, ]*)(;)?/,
        urlRegex: /\url\(\s*([^\)]+)\s*\)?/,
        fileRegex: /("|')(.*?)(?!\\)(\1)/
    };

function findImports(css) {
    var hasImports = false;

    while(!hasImports) {
        glueCSS(css);
        code.glued = code.intermediate;
        code.intermediate = '';
        hasImports = true;
        if (!regexs.importRegex.test(code.glued)) hasImports = true; // Check if there are more @imports to glue
    }

    createFiles();
    if (!firstTime && options.watch) checkUnwatched();
    files = [];
    firstTime = false;
}

function glueCSS(css) {
    css.split('\n').forEach(function(line) { // Go through each line of CSS
        var fileUrl = '',
            _file = '',
            newFiles = false;

        if (regexs.importRegex.test(line)) { // Check for @imports
            _file = utils.cleanURL(line.match(regexs.fileRegex)[0]);
            fileUrl = path.join(srcDir, _file);

            if (path.existsSync(fileUrl)) {
                files.push(_file);

                if(options.watch && watched.indexOf(_file) === -1) newFiles = true;

                code.intermediate += fs.readFileSync(fileUrl, 'utf8') + '\n';

                if (options.watch && newFiles) { // If the watch option is enabled, watch for changes in the file to run Glue each time
                    if (!firstTime) console.log('');
                    utils.log('success', utils.colorize('blue', 'Glue ') + 'is ' + utils.colorize('green', 'watching ') + _file);
                    if (!firstTime) console.log('');
                    watchFile(fileUrl);
                    watched.push(_file);
                }
            } else {
                utils.log('error', utils.colorize('red', 'Could\'t find ' + fileUrl));
            }
        } else { // If there's no @import in the line, use the CSS line as is
            code.intermediate += line + '\n';
        }
    });
}

function checkUnwatched() {
    watched.forEach(function (file) {
        if (file !== 'main.css' && files.indexOf(file) === -1) {
            fs.unwatchFile(path.join(srcDir, file));
            delete watched[watched.indexOf(file)];
            console.log('');
            utils.log('success', utils.colorize('blue', 'Glue ') + utils.colorize('red', 'stoped') + ' watching ' + file);
            console.log('');
        }
    });
}

function watchFile(file) {
    fs.watchFile(file, { persistent: true, interval: 100 }, function (curr, prev) {
        if (curr.mtime.getTime() !== prev.mtime.getTime()) findImports(fs.readFileSync(srcCSS, 'utf8'));
    });
}

function createFiles() {
    if (firstTime) console.log('');

    if (!path.existsSync(buildDir)) fs.mkdirSync('build');

    fs.writeFileSync(buildCSS, code.glued, 'utf8');
    utils.log('success', utils.colorize('blue', 'Glue ') + utils.colorize('green', firstTime ? 'created' : 'updated') + ' build/main.css');

    if (options.mini) {
        code.gluedMini = cleanCSS.process(code.glued); // Minify glued CSS
        fs.writeFileSync(path.join(buildDir, 'main.min.css'), code.gluedMini, 'utf8');
        utils.log('success', utils.colorize('blue', 'Glue ') + utils.colorize('green', firstTime ? 'created' : 'updated') + ' build/main.min.css');
    }
}

module.exports = function(_options) {
    options = _options;

    if (options.new) {
        utils.createStructure(path.join(options.path));
        utils.log('success', utils.colorize('blue', 'Glue ') + utils.colorize('green', 'created ') + path.join(currentDir, options.path));
        if (!options.watch) process.exit(0);
    }

    srcDir = options.path !== currentDir ? path.join(currentDir, options.path, 'src') : path.join(currentDir, 'src');
    srcCSS = path.join(srcDir, 'main.css');

    buildDir = options.path !== currentDir ? path.join(currentDir, options.path, 'build') : path.join(currentDir, 'build');
    buildCSS = path.join(buildDir, 'main.css')


    if (!path.existsSync(srcDir)) {
        utils.log('error', utils.colorize('red', 'Couldn\'t find directory: ' + srcDir));
        process.exit(1);
    }

    if (!path.existsSync(srcCSS)) {
        utils.log('error', utils.colorize('red', 'Couldn\'t find the main.css file.'));
        process.exit(1);
    }

    // If nothing went wrong then start the gluing process
    fs.readFile(srcCSS, 'utf8', function(error, css) {
        if (error) {
            utils.log('error', utils.colorize('red', 'There was a problem while reading the file. \n Please try again.'));
            process.exit(1);
        }

        if (firstTime) console.log('');

        if (options.watch) {
            utils.log('success', utils.colorize('blue', 'Glue ') + 'is ' + utils.colorize('green', 'watching ') + 'main.css');
            watchFile(srcCSS);
            watched.push('main.css');
        }

        code.original = css;
        findImports(code.original);
    });
};