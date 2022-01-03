var forever = require('forever');

const FILE = 'index.js';

var child = new (forever.Monitor)(FILE, { silent: true });

child.on('exit', function () {
    console.log(FILE+' has exited!');
});
child.on('restart', function () {
    console.log(FILE+' has restarted!');
});
child.on('watch:restart', function () {
    console.log(FILE+' has restarted, because the script changed!');
});

child.start();
forever.startServer(child);