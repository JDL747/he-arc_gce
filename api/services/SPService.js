let request = require('request');
const path = require('path');
const fs = require('fs');

/**
 * Sharepoint Services
 * @type {Object}
 */
module.exports = {


    /**
     * Refresg Form Digest Token
     * @param {[type]}   opts options parameteres
     * @param {Function} done Callback
     */
    refreshFormDigestToken: function(opts, done) {

        let options = {
            url: sails.config.sp_api_url + '/contextinfo',
            method: 'POST',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'Authorization': 'Basic aGVhcmMuc2hhcmVwb2ludFxBZG1pbmlzdHJhdG9yOjk4Ny5zaGFyZXBvaW50'
            }
        };

        request(options, function(error, response, body) {
            if (error) sails.log.error(error);
            sails.config.sp_digest_token = JSON.parse(body).d.GetContextWebInformation.FormDigestValue
            return done();
        });

    },

    uploadDocument: function(opts, done) {

        SPService.refreshFormDigestToken({}, function() {

            let filePath = path.join(__dirname, '../../assets/uploads', opts.fileName);

            fs.readFile(filePath, 'utf8', function(err, data) {

                let uploadUrl = `${sails.config.sp_api_url}/Web/lists/getByTitle(@TargetLibrary)/RootFolder/files/add(url=@TargetFileName, overwrite='true')?@TargetLibrary='Sony Entertainment'&@TargetFileName='${opts.fileName}'`;

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

                    sails.log.info('Uploaded to Sharepoint Successfully:', opts.fileName);
                    return done(JSON.parse(body));

                });

            });

        });

    }

}
