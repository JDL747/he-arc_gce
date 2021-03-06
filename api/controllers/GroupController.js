const path = require('path');
const fs = require('fs');

/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

    /**
     * Find group based on it's ID
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    findOne: function(req, res) {
        Group.findOne(req.param('id'))
            .then(function(group) {
                if (!req.session.group) {
                    req.session.group = group;
                }
                return res.json(group);
            });
    },

    /**
     * Update group info
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    update: function(req, res) {
        Group.update(req.param('id'), req.body)
            .then(function(group) {
                req.session.group = group[0];
                return res.ok();
            });
    },

    /**
     * Set group session
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    session: function(req, res) {
        Group.findOne(req.param('id'))
            .then(function(group) {
                req.session.group = group;
                return res.json({ groupName: group.name });
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

                        switch(uploadedFile.filename) {
                            case 'template_1.xml':
                                group.abbyy_template_1 = `${group.folder_name}/templates/${uploadedFile.filename}`;
                                break;
                            case 'template_2.xml':
                                group.abbyy_template_2 = `${group.folder_name}/templates/${uploadedFile.filename}`;
                                break;
                            case 'template_3.xml':
                                group.abbyy_template_3 = `${group.folder_name}/templates/${uploadedFile.filename}`;
                                break;
                        }

                        fs.rename(uploadedFile.fd, templatePath, function(err) {
                            if (err) return res.badRequest(err);
                            group.save();
                        });

                        callback();

                    });
                    return res.ok();
            });

        });

    }

};
