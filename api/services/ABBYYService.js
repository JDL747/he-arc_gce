const request = require('request');
const path = require('path');
const fs = require('fs');
const base64 = require('base-64');

/**
 * Sharepoint Services
 * @type {Object}
 */
module.exports = {

    submitImage: function(opts, done) {

        let filePath = path.join(__dirname, '../../' + opts.documentPath);

        let formData = {
            'exportFormat': 'pdfSearchable',
            'profile': 'documentArchiving',
            'file': fs.createReadStream(filePath)
        };

        let options = {
            url: sails.config.abbyy_api_url + '/processImage',
            method: 'POST',
            formData: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + base64.encode(opts.username + ':' + opts.password)
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);
            return done(body);

        });
    }


}
