const request = require('request');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const parseString = require('xml2js').parseString;

/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    OCRProcess: function(req, res) {
        Document.findOne(req.param('id'))
            .then(function(doc) {

                Group.findOne(doc.owner)
                    .then(function(group) {

                        let cridentials = {
                            'username': group.abbyy_user,
                            'password': group.abbyy_password,
                            'documentPath': doc.path
                        };

                        ABBYYService.submitImage(cridentials, function(results) {

                            parseString(results, function (err, result) {
                                doc.process_result = results;
                                doc.task_id = result.response.task[0]['$'].id;
                                doc.save();
                            });

                            return res.ok();

                        });

                    });

            });
    },

    upload: function(req, res) {

        req.file('file').upload({ maxBytes: 100000000 }, function(errUpload, files) {

            Group.findOne('5a280209595d36a8054e1728')
                .then(function(group) {

                    if (!group.batch_process_nb) {
                        group.batch_process_nb = 0;
                    }

                    group.batch_process_nb = group.batch_process_nb + 1;
                    group.save();

                    async.each(files, function (uploadedFile, callback) {

                        let uploadFolder = path.join(__dirname, `../../assets/uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}/${uploadedFile.filename}`);
                        let folderPath = path.join(__dirname, `../../assets/uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}`);

                        if (!fs.existsSync(folderPath)) {
                            fs.mkdirSync(folderPath);
                            fs.chmod(folderPath, '0777');
                        }

                        fs.rename(uploadedFile.fd, uploadFolder, function(err) {
                            if (err) return sails.log.error(err);
                            Document.create({
                                'batch': group.batch_process_nb,
                                'name': uploadedFile.filename,
                                'path': `assets/uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}/${uploadedFile.filename}`,
                                'status': 'processing',
                                'owner': group.id
                            }, function(doc) { });

                        });

                    });

                });

                return res.json([]);
        });
    },

    _upload: function(req, res) {

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

    },

    _apiCall: function(req, res) {

        SPService.refreshFormDigestToken({}, function() {

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
    }

};
