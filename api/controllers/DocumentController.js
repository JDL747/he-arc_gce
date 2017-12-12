const fs = require('fs');
const path = require('path');
const request = require('request');
const parseString = require('xml2js').parseString;
const base64 = require('base-64');
const fetch = require('node-fetch');

/**
 * DocumentController
 *
 * @description :: Server-side logic for managing documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    /**
     * Find all documents based on the owner ID
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    find: function(req, res) {
        Document.find({ 'owner': req.param('owner') })
            .then(function(documents) {
                if (!req.session.group) return res.serverError();
                Group.findOne(req.session.group.id)
                    .then(function(group) {
                        return res.json(
                            {
                                documents: documents,
                                group: {
                                    'current_template': group.current_template,
                                    'abbyy_user':  group.abbyy_user
                                }
                            }
                        );
                    });
            });
    },

    /**
     * Process a document for OCR
     * @param {[type]} req [description]
     * @param {[type]} res [description]
     */
    OCRProcess: function(req, res) {
        Document.findOne(req.param('id'))
            .then(function(doc) {

                let group = req.session.group;
                let cridentials = {
                    'username': group.abbyy_user,
                    'password': group.abbyy_password,
                    'current_template': group.current_template,
                    'folder_name': group.folder_name,
                    'documentPath': doc.path,
                    'task_id': doc.task_id
                };

                ABBYYService.getTaskStatus(cridentials, function(taskResult) {

                    let documentPath = `uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}/${doc.id}_ocr.pdf`;
                    let uploadFolder = `assets/${documentPath}`;

                    parseString(taskResult, function (err, parsedResult) {

                        doc.result_url = parsedResult.response.task[0]['$'].resultUrl;
                        doc.status = doc.status = 'Prêt pour la LAD';

                        if (parsedResult.response.task[0]['$'].status === 'Completed') {
                            request(parsedResult.response.task[0]['$'].resultUrl).pipe(fs.createWriteStream(uploadFolder));
                            doc.pdf_file = documentPath;
                            doc.save();
                        }

                        return res.ok();

                    });

                });

            });
    },

    /**
     * LAD document processing
     * @param {[type]} req [description]
     * @param {[type]} res [description]
     */
    LADProcess: function(req, res) {

        Document.findOne(req.param('id'))
            .then(function(doc) {

                let group = req.session.group;
                let cridentials = {
                    'username': group.abbyy_user,
                    'password': group.abbyy_password,
                    'current_template': group.current_template,
                    'folder_name': group.folder_name,
                    'documentPath': doc.path,
                    'task_id': doc.task_id
                };

                return ABBYYService.getTaskStatus(cridentials, function(taskResult) {

                    parseString(taskResult, function (err, parsedResult) {

                        if (parsedResult.response.task[0]['$'].status === 'Completed') {

                            let documentPath = `uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}/${doc.id}_ocr.xml`;
                            let uploadFolder = `assets/${documentPath}`;

                            ABBYYService.processFields(cridentials, function(fieldsResult) {

                                if (fieldsResult.code === 'ENOENT') return res.badRequest();

                                async.each([0, 1], function(item, callback) {
                                    setTimeout(function() {
                                        fetch(parsedResult.response.task[0]['$'].resultUrl)
                                            .then(function(result) {
                                                result.body.pipe(fs.createWriteStream(uploadFolder));
                                                doc.xml_file = documentPath;
                                                callback();
                                            });
                                    }, 1500);

                                }, function(err) {
                                    doc.status = 'Terminer';
                                    doc.save();
                                    return res.ok();
                                });

                            });

                        }

                    });

                });

            });
    },

    /**
     * Upload documents for processing
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    upload: function(req, res) {

        req.file('file').upload({ 'maxBytes': 100000000 }, function(errUpload, files) {

            Group.findOne(req.param('id'))
                .then(function(group) {

                    if (!group.batch_process_nb) {
                        group.batch_process_nb = 0;
                    }

                    group.batch_process_nb = group.batch_process_nb + 1;
                    group.save();

                    req.session.group = group;

                    async.each(files, function (uploadedFile, callback) {

                        let folderPath = path.join(__dirname, `../../assets/uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}`);
                        let uploadFolder = path.join(`${folderPath}/${uploadedFile.filename}`);

                        if (!fs.existsSync(folderPath)) {
                            fs.mkdirSync(folderPath);
                            fs.chmod(folderPath, '0777');
                        }

                        fs.rename(uploadedFile.fd, uploadFolder, function(err) {
                            if (err) return sails.log.error(err);
                            Document.create({
                                'batch': group.batch_process_nb,
                                'name': uploadedFile.filename,
                                'path': `uploads/ocr/${group.folder_name}/docs/batch_${group.batch_process_nb}/${uploadedFile.filename}`,
                                'owner': group.id
                            }).then(function(doc) {

                                let cridentials = {
                                    'username': group.abbyy_user,
                                    'password': group.abbyy_password,
                                    'current_template': group.current_template,
                                    'documentPath': 'assets/' + doc.path,
                                    'folder_name': group.folder_name
                                };

                                ABBYYService.submitImage(cridentials, function(results) {
                                    parseString(results, function (err, result) {
                                        doc.process_result = results;
                                        doc.task_id = result.response.task[0]['$'].id;
                                        doc.status = 'Prêt pour l\'OCR';
                                        doc.save();
                                        callback();
                                    });
                                });

                            });

                        });

                    }, function(err) {
                        return res.ok();
                    });

                });

        });
    },

    /**
     * Upload document to SharePoint
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    uploadToSP: function(req, res) {

        Document.findOne(req.param('id'))
            .then(function(doc) {

                let group = req.session.group;

                return SPService.refreshFormDigestToken(group, function(formDigestToken) {

                    let docName = (doc.name).replace('.tif', '.pdf'),
                        uploadUrl = `${group.sp_url}/Web/lists/getByTitle(@TargetLibrary)/RootFolder/files/add(url=@TargetFileName, overwrite='true')?@TargetLibrary='${group.sp_document_library_name}'&@TargetFileName='${docName}'`,
                        filePath = path.join(__dirname, `../../assets/${doc.pdf_file}`);

                    let options = {
                        url: uploadUrl,
                        method: 'POST',
                        formData: { 'file': fs.createReadStream(filePath) },
                        headers: {
                            'Accept': 'application/json;odata=verbose',
                            'Content-Type': 'application/json;odata=verbose',
                            'Authorization': `Basic ${base64.encode(group.sp_user + ':' + group.sp_password)}`,
                            'X-RequestDigest': formDigestToken,
                        }
                    };

                    request(options, function (error, response, body) {
                        if (error) return res.badRequest();
                        let opts = {
                            'doc': doc,
                            'group': group,
                            'formDigestToken': formDigestToken
                        };

                        doc.is_operation_completed = true;
                        doc.sp_document_id = JSON.parse(body).d.__metadata.id;
                        doc.sp_list_item_all_fields = JSON.parse(body).d.ListItemAllFields.__deferred.uri;
                        doc.save();

                        SPService.updateFileMetaData(opts, function() {

                        });

                        return res.json(JSON.parse(body));

                    });

                });

            });

    }

};
