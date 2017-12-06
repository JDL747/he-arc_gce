const request = require('request');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    find: function(req, res) {

        SPService.RefreshFormDigestToken({}, function() {

            let url = sails.config.sp_api_url + "/Web/GetFolderByServerRelativeUrl('/sites/mediacorp/Sony Entertainment')/Files";

            let urlAddFolder = sails.config.sp_api_url + "/Web/Folders/add('/sites/mediacorp/Sony Entertainment/Test')";

            let options = {
                url: urlAddFolder,
                method: 'POST',
                headers: {
                    'Accept': 'application/json;odata=verbose',
                    'Content-Type': 'application/json;odata=verbose',
                    'Authorization': 'Basic aGVhcmMuc2hhcmVwb2ludFxBZG1pbmlzdHJhdG9yOjk4Ny5zaGFyZXBvaW50',
                    'X-RequestDigest': sails.config.sp_digest_token,
                }
            };

            request(options, function (error, response, body) {
                if (error) sails.log.error(error);
                return res.json(JSON.parse(body))
            });

        });

    },

    upload: function(req, res) {

        SPService.RefreshFormDigestToken({}, function() {

            let filePath = path.join(__dirname, '../../assets/uploads', 'Type_1.pdf');

            fs.readFile(filePath, 'utf8', function(err, data) {

                let uploadUrl = sails.config.sp_api_url + "/Web/lists/getByTitle(@TargetLibrary)/RootFolder/files/add(url=@TargetFileName, overwrite='true')?" +
                    "@TargetLibrary='Sony Entertainment'" + "&@TargetFileName='Type_1.pdf'";

                let options = {
                    url: uploadUrl,
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                        'Authorization': 'Basic aGVhcmMuc2hhcmVwb2ludFxBZG1pbmlzdHJhdG9yOjk4Ny5zaGFyZXBvaW50',
                        'X-RequestDigest': sails.config.sp_digest_token,
                    }
                };

                request(options, function (error, response, body) {

                    if (error) sails.log.error(error);

                    return res.json(JSON.parse(body));

                    /*let filedRelUrl = JSON.parse(body).d.ServerRelativeUrl;
                    let uploadUrl = sails.config.sp_api_url + "/Web/GetFileByServerRelativeUrl('" + filedRelUrl + "')/ListItemAllFields/Product Name";

                    sails.log.debug(uploadUrl);

                    let options = {
                        url: uploadUrl,
                        method: 'POST',
                        body: JSON.stringify({
                            '__metadata': {
                                'type': 'SP.Product_x0020_Name0'
                            },
                            'Product Name': 'Hello Work'
                        }),
                        headers: {
                            'Accept': 'application/json;odata=verbose',
                            'Content-Type': 'application/json;odata=verbose',
                            'Authorization': 'Basic aGVhcmMuc2hhcmVwb2ludFxBZG1pbmlzdHJhdG9yOjk4Ny5zaGFyZXBvaW50',
                            'X-RequestDigest': sails.config.sp_digest_token,
                            'X-Http-Method': 'PATCH',
                            'If-Match': '*'
                        }
                    };

                    request(options, function (error, response, body) {
                        if (error) sails.log.error(error);
                        return res.json(JSON.parse(body));
                    });*/

                });

            });

        });

    }

};
