const chokidar = require('chokidar');
const path = require('path');

/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
module.exports.bootstrap = function(cb) {

    let watcher = chokidar.watch(path.join(__dirname, '../uploads'), {
        'ignored': /(^|[\/\\])\../,
        'persistent': true,
        'ignoreInitial': true
    });

    watcher.on('add', filePath => {

        let fileName = path.basename(filePath);

        SPService.uploadDocument({'fileName': fileName }, function() {

            sails.log.info(`File ${fileName} has been added`);

        });

    });

    cb();

};
