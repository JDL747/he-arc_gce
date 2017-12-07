const request = require('request');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const parseString = require('xml2js').parseString;
const base64 = require('base-64');

/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    find: function(req, res) {
        Document.find({ owner: req.param('owner') })
            .then(function(documents) {
                return res.json(documents);
            });
    },

    OCRProcess: function(req, res) {
        Document.findOne(req.param('id'))
            .then(function(doc) {

                Group.findOne(doc.owner)
                    .then(function(group) {

                        let cridentials = {
                            'username': group.abbyy_user,
                            'password': group.abbyy_password,
                            'current_template': group.current_template,
                            'documentPath': doc.path,
                            'folder_name': group.folder_name
                        };

                        ABBYYService.submitImage(cridentials, function(results) {

                            parseString(results, function (err, result) {
                                doc.process_result = results;
                                doc.task_id = result.response.task[0]['$'].id;
                                cridentials['task_id'] = doc.task_id;
                                doc.save();
                            });

                            ABBYYService.getTaskStatus(cridentials, function(taskResult) {

                                parseString(taskResult, function (err, parsedResult) {
                                    if (parsedResult.response.task[0]['$'].status !== 'Completed') {
                                        doc.status = 'En attente de traitement';
                                    } else if (parsedResult.response.task[0]['$'].status === 'Completed') {
                                        doc.status = 'Prêt pour la LAD';
                                    }

                                    doc.result_url = parsedResult.response.task[0]['$'].resultUrl;

                                    let uploadFolder = `assets/uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}/${doc.name}_ocr.pdf`;

                                    if (parsedResult.response.task[0]['$'].status === 'Completed') {
                                        request(parsedResult.response.task[0]['$'].resultUrl).pipe(fs.createWriteStream(uploadFolder));
                                         doc.pdf_file = uploadFolder;
                                        doc.save();
                                        return res.ok();
                                    }

                                });

                            });

                        });

                    });

            });
    },

    LADProcess: function(req, res) {
        Document.findOne(req.param('id'))
            .then(function(doc) {

                Group.findOne(doc.owner)
                    .then(function(group) {

                        let cridentials = {
                            'username': group.abbyy_user,
                            'password': group.abbyy_password,
                            'current_template': group.current_template,
                            'documentPath': doc.path,
                            'folder_name': group.folder_name,
                            'task_id': doc.task_id
                        };

                        ABBYYService.getTaskStatus(cridentials, function(taskResult) {

                            parseString(taskResult, function (err, parsedResult) {

                                if (parsedResult.response.task[0]['$'].status === 'Completed') {

                                    ABBYYService.processFields(cridentials, function(fieldsResult) {
                                        doc.xml_file = parsedResult.response.task[0]['$'].resultUrl;
                                        doc.status = 'Terminer';
                                        doc.save();
                                        return res.ok();
                                    });

                                }

                            });

                        });

                    });

            });
    },

    upload: function(req, res) {

        req.file('file').upload({ maxBytes: 100000000 }, function(errUpload, files) {

            Group.findOne(req.param('id'))
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
                                'status': 'Chargement OK',
                                'owner': group.id
                            }, function(doc) { });

                        });

                    });

                });

                return res.json([]);
        });
    },

    uploadToSP: function(req, res) {

        Document.findOne(req.param('id'))
            .then(function(doc) {

                Group.findOne(doc.owner)
                    .then(function(group) {

                        SPService.refreshFormDigestToken({}, function() {

                            fs.readFile(doc.pdf_file, 'utf8', function(err, data) {

                                let uploadUrl = `${group.sp_url}/Web/lists/getByTitle(@TargetLibrary)/RootFolder/files/add(url=@TargetFileName, overwrite='true')?@TargetLibrary='${group.sp_document_library_name}'&@TargetFileName='${doc.name}'`;

                                let options = {
                                    url: uploadUrl,
                                    method: 'POST',
                                    body: data,
                                    headers: {
                                        'Accept': 'application/json;odata=verbose',
                                        'Content-Type': 'application/json;odata=verbose',
                                        'Authorization': 'Basic ' + base64.encode(group.sp_user + ':' + group.sp_password),
                                        'X-RequestDigest': sails.config.sp_digest_token,
                                    }
                                };

                                request(options, function (error, response, body) {
                                    if (error) sails.log.error(error);
                                    sails.log.info(body);
                                    doc.is_operation_completed = true;
                                    doc.save();
                                    return res.json(JSON.parse(body));
                                });

                            });

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
