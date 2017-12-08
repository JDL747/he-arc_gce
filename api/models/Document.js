/**
 * Document.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    tableName: 'col_documents',

    attributes: {

        'batch': {
            type: 'integer'
        },

        'name': {
            type: 'string'
        },

        'xml_file': {
            type: 'string'
        },

        'pdf_file': {
            type: 'string'
        },

        'status': {
            type: 'string'
        },

        'path': {
            type: 'string'
        },

        'process_result': {
            type: 'longtext'
        },

        'task_id': {
            type: 'string'
        },

        'result_url': {
            type: 'string'
        },

        'is_operation_completed': {
            type: 'boolean',
            defaultsTo : false
        },

        'sp_document_id': {
             type: 'string'
        },

        /* @assocition */
        'owner': {
            model: 'group'
        }

    }
};
