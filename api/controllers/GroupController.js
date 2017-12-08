const path = require('path');
const fs = require('fs');

/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    session: function(req, res) {
        Group.findOne(req.param('id'))
            .then(function(group) {
                req.session.group = group;
                return res.ok();
            });
    },

    /**
     * Upload XML templates for fields recognition
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    uploadTemplates: function(req, res) {

        req.file('file').upload({ 'maxBytes': 100000000 }, function(errUpload, files) {

            Group.findOne(req.param('id'))
                .then(function(group) {

                    let templates = ['abbyy_template_1', 'abbyy_template_2', 'abbyy_template_3'];

                    async.each(files, function (uploadedFile, callback) {

                        let templatePath = path.join(__dirname, `../../assets/uploads/ocr/${group.folder_name}/templates/${uploadedFile.filename}`);

                        fs.rename(uploadedFile.fd, templatePath, function(err) {
                            if (err) return sails.log.error(err);
                            group[templates[files.indexOf(uploadedFile)]] = `${group.folder_name}/templates/${uploadedFile.filename}`;
                            group.save();
                            sails.log.info('The file was saved!');
                        });

                        callback();

                    });
                    return res.ok();
            });

        });

    }

};
