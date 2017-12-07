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
    },

    getTaskStatus: function(opts, done) {

        let options = {
            url: sails.config.abbyy_api_url + '/getTaskStatus?taskId=' + opts.task_id,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(opts.username + ':' + opts.password)
            }
        };

        setTimeout(function() {
            request(options, function(error, response, body) {
                if (error) sails.log.error(error);
                sails.log.info(opts.task_id, body);
                return done(body);
            });
        }, 2000);
    },

    processFields: function(opts, done) {

        let templatePath = path.join(__dirname, `../../assets/uploads/ocr/${opts.folder_name}/templates/${opts.current_template}`);

        let formData = {
            'taskId': opts.task_id,
            'file': fs.createReadStream(templatePath)
        };

        let options = {
            url: sails.config.abbyy_api_url + '/processFields',
            method: 'POST',
            formData: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + base64.encode(opts.username + ':' + opts.password)
            }
        };

        setTimeout(function() {
            request(options, function(error, response, body) {
                if (error) sails.log.error(error);
                return done(body);
            });
        }, 2000);

    }


}
