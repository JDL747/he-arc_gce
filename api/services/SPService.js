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
     */
    updateFileMetaData: function(opts, done) {

        this._getFileInfoFromSP(opts, function(fileInfo) {

            let url = `${opts.group.sp_url}/Web/Lists/getByTitle('${opts.group.sp_document_library_name}')/Items(${fileInfo.item_id})`;

            let options = {
                url: url,
                method: 'POST',
                body: JSON.stringify({
                    '__metadata': { type: fileInfo.type },
                    fileInfo.xmlContent,
                    'ContentTypeId': fileInfo.contentType
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
                return done();
            });

        });

    },

    /**
     * Get file info for the uploaded file
     */
    _getFileInfoFromSP: function(opts, done) {

        let options = {
            url: opts.doc.sp_list_item_all_fields,
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': opts.formDigestToken,
                'Authorization': `Basic ${base64.encode(opts.group.sp_user + ':' + opts.group.sp_password)}`
            }
        };

        this._getContentTypes(opts, function(currentContentType) {

            request(options, function(error, response, body) {
                if (error) sails.log.error(error);
                let result = JSON.parse(body).d;
                let fileInfo = {
                    'item_id': result.Id,
                    'type': result.__metadata.type,
                    'etag': result.__metadata.etag,
                    'contentType': currentContentType,
                    'xmlContent': { 'Company1': 'Time to test' }
                };
                return done(fileInfo);
            });

        });

    },

    _processXML: function(opts, done) {
        console.log('_processXML')
    },

    /**
     * Get content type based on group current template
     */
    _getContentTypes: function(opts, done) {

        let url = `${opts.group.sp_url}/Web/Lists/getByTitle('${opts.group.sp_document_library_name}')/contenttypes`;

        let options = {
            url: url,
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'X-RequestDigest': opts.formDigestToken,
                'Authorization': `Basic ${base64.encode(opts.group.sp_user + ':' + opts.group.sp_password)}`
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);

            let contentTypes = [];
            let results = JSON.parse(body).d.results;

            results.forEach(function(item, index) {
               if (item.Group === 'Types de contenu personnalisés') {
                    let contentType = { 'name': item.Name, 'description': item.Description , 'id': item.StringId };
                    contentTypes.push(contentType);
               }
            });

            Group.update(opts.group.id, { 'sp_library_content_type': contentTypes })
                .then(function(group) {
                    if (group.current_template === 'template_1.xml') {
                        return done(group[0].sp_library_content_type[0].id);
                    } else if (group[0].current_template === 'template_2.xml') {
                        return done(group[0].sp_library_content_type[1].id);
                    } else if (group[0].current_template === 'template_3.xml') {
                        return done(group[0].sp_library_content_type[2].id);
                    }
                });

        });
    }

}
