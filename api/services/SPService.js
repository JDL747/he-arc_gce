const path = require('path');
const fs = require('fs');
let request = require('request');
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

    /**
     * Update uploaded file metadata
     * @param  {[type]}   opts [description]
     * @param  {Function} done [description]
     * @return {[type]}        [description]
     */
    updateFileMetaData: function(opts, done) {

        this._getFileInfoFromSP(opts, function(fileInfo) {

            let url = `${opts.group.sp_url}/Web/Lists/getByTitle('${opts.group.sp_document_library_name}')/Items(${fileInfo.item_id})`;

            let options = {
                url: url,
                method: 'POST',
                body: JSON.stringify({
                    '__metadata': { type: fileInfo.type },
                    'Product_x0020_Name0': 'Hello'
                }),
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'Authorization': `Basic ${base64.encode(opts.group.sp_user + ':' + opts.group.sp_password)}`,
                    'X-RequestDigest': opts.formDigestToken,
                    'IF-MATCH': fileInfo.etag,
                    'X-Http-Method': 'MERGE'
                }
            };
            request(options, function(error, response, body) {
                if (error) sails.log.error(error);
                console.log(error)
                console.log(body)
                return done();
            });

        });

    },

    /**
     * Get file info for the uploaded file
     * @param  {[type]}   opts [description]
     * @param  {Function} done callback function
     * @return {[type]}        [description]
     */
    _getFileInfoFromSP: function(opts, done) {

        let options = {
            url: opts.doc.sp_list_item_all_fields,
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'Authorization': `Basic ${base64.encode(opts.group.sp_user + ':' + opts.group.sp_password)}`
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);

            let result = JSON.parse(body).d;
            let fileInfo = {
                'item_id': result.Id,
                'type': result.__metadata.type,
                'etag': result.__metadata.etag
            };

            return done(fileInfo);

        });

    },

    _processXML: function(opts, done) {
        console.log('_processXML')
    }

}
