const request = require('request');
const path = require('path');
const fs = require('fs');
const base64 = require('base-64');

/**
 * Sharepoint Services
 * @type {Object}
 */
module.exports = {

    /**
     * Submit image for processing to ABBYY api
     * @param  {[type]}   opts [description]
     * @param  {Function} done [description]
     * @return {[type]}        [description]
     */
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
                'Authorization': 'Basic ' + base64.encode(`${opts.username}:${opts.password}`)
            }
        };

        request(options, function(error, response, body) {
            if (error) return done(error);
            return done(body);
        });
    },

    /**
     * Get task status
     * @param  {[type]}   opts [description]
     * @param  {Function} done [description]
     * @return {[type]}        [description]
     */
    getTaskStatus: function(opts, done) {

        let options = {
            url: `${sails.config.abbyy_api_url}/getTaskStatus?taskId=${opts.task_id}`,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + base64.encode(`${opts.username}:${opts.password}`)
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);
            return done(body);
        });
    },

    /**
     * Process uploaded document fields for LAD
     * @param  {[type]}   opts [description]
     * @param  {Function} done [description]
     * @return {[type]}        [description]
     */
    processFields: function(opts, done) {

        let templatePath = path.join(__dirname, `../../assets/uploads/ocr/${opts.folder_name}/templates/${opts.current_template}`),
            options = {
                url: `${sails.config.abbyy_api_url}/processFields`,
                method: 'POST',
                formData: {
                    'taskId': opts.task_id,
                    'file': fs.createReadStream(templatePath)
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + base64.encode(`${opts.username}:${opts.password}`)
                }
            };

        request(options, function(error, response, body) {
            if (error) return done(error);
            return done(body);
        });


    }

}
