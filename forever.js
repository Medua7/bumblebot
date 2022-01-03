var forever = require('forever-monitor');

const FILE = 'index.js';

var child = new (forever.Monitor)(FILE, { silent: true });

child.on('exit', function () {
    console.log(FILE+' has exited after 3 restarts');
});

child.start();