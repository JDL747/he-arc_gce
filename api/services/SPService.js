let request = require('request');
const path = require('path');
const fs = require('fs');
const base64 = require('base-64');

/**
 * Sharepoint Services
 * @type {Object}
 */
module.exports = {

    /**
     * Refresh Form Digest Token
     * @param {[type]}   opts options parameteres
     * @param {Function} done Callback
     */
    refreshFormDigestToken: function(opts, done) {

        let options = {
            url: opts.sp_url + '/contextinfo',
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'Authorization': `Basic ${base64.encode(opts.sp_user + ':' + opts.sp_password)}`
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);
            let formDigestToken = JSON.parse(body).d.GetContextWebInformation.FormDigestValue
            return done(formDigestToken);
        });

    },

    updateFileMetaData: function(opts, done) {

        let options = {
            url: opts.sp_url + '/contextinfo',
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'Authorization': `Basic ${base64.encode(opts.sp_user + ':' + opts.sp_password)}`
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);
            let formDigestToken = JSON.parse(body).d.GetContextWebInformation.FormDigestValue
            return done(formDigestToken);
        });

        this._getFileInfoFromSP(function() {

        });

        // let url = opts.sp_url + "/_api/Web/Lists/getByTitle('Project Documents')/Items(" + item.Id + ")";

        /*let options = {
            url: url,
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'Authorization': `Basic ${base64.encode(opts.sp_user + ':' + opts.sp_password)}`
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);
            let formDigestToken = JSON.parse(body).d.GetContextWebInformation.FormDigestValue
            return done(formDigestToken);
        });*/

    },

    _getFileInfoFromSP: function(opts, done) {
        console.log('_getFileInfoFromSP')
    },

    _processXML: function(opts, done) {
        console.log('_processXML')
    }

}
