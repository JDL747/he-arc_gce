/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    tableName: 'col_groups',

    attributes: {

        'name': {
            type: 'string'
        },

        'abbyy_user': {
            type: 'string'
        },

        'abbyy_password': {
            type: 'string'
        },

        'abbyy_template_1': {
            type: 'string'
        },

        'abbyy_template_2': {
            type: 'string'
        },

        'sp_url': {
            type: 'string'
        },

        'sp_user': {
            type: 'string'
        },

        'sp_password': {
            type: 'string'
        },

        'batch_process_nb': {
            type: 'integer'
        },

        'documents': {
            collection: 'document',
            via: 'owner'
        }

    }
};
