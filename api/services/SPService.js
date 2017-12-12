const path = require('path');
const fs = require('fs');
const request = require('request');
const base64 = require('base-64');
const parseString = require('xml2js').parseString;
const xml2js = require('xml2js');

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
            let metadata = fileInfo.metadata;

            metadata['__metadata'] = { 'type': fileInfo.type };

            let options = {
                url: url,
                method: 'POST',
                body: JSON.stringify(metadata),
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
                console.log(body)
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

        this._getContentTypes(opts, function(results) {

            request(options, function(error, response, body) {
                if (error) sails.log.error(error);
                let result = JSON.parse(body).d;
                let fileInfo = {
                    'item_id': result.Id,
                    'type': result.__metadata.type,
                    'etag': result.__metadata.etag,
                    'metadata': results.metadata
                };
                return done(fileInfo);
            });

        });

    },

    _processXML: function(opts, done) {

        let spLibContentTypeID = '';

        if (opts.group.current_template === 'template_1.xml') {
            spLibContentTypeID = opts.group.sp_library_content_type[0].id;
        } else if (opts.group.current_template === 'template_2.xml') {
            spLibContentTypeID = opts.group.sp_library_content_type[1].id;
        } else if (opts.group.current_template === 'template_3.xml') {
            spLibContentTypeID = opts.group.sp_library_content_type[2].id;
        }

        let documentPath = path.join(__dirname, `../../assets/uploads/ocr/${opts.group.folder_name}/docs/batch_${opts.group.batch_process_nb}/${opts.doc.id}_ocr.xml`);
        let parser = new xml2js.Parser();

        fs.readFile(documentPath, function(err, data) {

            parser.parseString(data, function (err, result) {

                let metadataArray = result.document.page[0].text;
                let data = {};

                String.prototype.capitalize = function(){
                   return this.replace( /(^|\s)([a-z])/g , function(m, p1 , p2) { return p1+p2.toUpperCase(); } );
                };

                metadataArray.forEach(function(item) {
                    let attribute = ((item['$'].id).split(' ').join('_x0020_'));
                    data[attribute] = item.value[0];
                });

                data['ContentTypeId'] = spLibContentTypeID;

                return done({ 'metadata': data, 'currentContentType': spLibContentTypeID });

            });

        });

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
                    opts.group = group[0];

                    SPService._processXML(opts, function(result) {
                        return done(result);
                    });

                });

        });
    }

}
