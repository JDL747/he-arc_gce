/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

    /***************************************************************************
     * Set the default database connection for models in the development       *
     * environment (see config/connections.js and config/models.js )           *
     ***************************************************************************/

    cors: {
        origin: '*'
    },

    port: process.env.PORT || 1339,

    baseUrl: 'http://locahost:1339/',

    sp_api_url: 'http://86.119.28.188/sites/mediacorp/_api',

    abbyy_api_url: 'https://cloud.ocrsdk.com',

    sp_digest_token: ''

};
