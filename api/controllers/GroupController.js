const path = require('path');
const fs = require('fs');

/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    uploadTemplates: function(req, res) {

        req.file('file').upload({ maxBytes: 100000000 }, function(errUpload, files) {

            Group.findOne('5a280209595d36a8054e1728')
                .then(function(group) {

                    let templates = ['abbyy_template_1', 'abbyy_template_2'];

                    async.each(files, function (uploadedFile, callback) {

                        let uploadFolder = path.join(__dirname, `../../assets/uploads/ocr/${group.folder_name}/templates/${uploadedFile.filename}`);

                        fs.rename(uploadedFile.fd, uploadFolder, function(err) {
                            if (err) return sails.log.error(err);
                            group[templates[files.indexOf(uploadedFile)]] = `${group.folder_name}/templates/${uploadedFile.filename}`;
                            group.save();
                            sails.log.info('The file was saved!');
                        });

                        callback();

                    });

            });

        });

    }

};
