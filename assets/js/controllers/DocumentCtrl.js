'use strict';

angular.module('gce-app.controllers')

.controller('DocumentCtrl', ['$rootScope', '$scope', '$state', '$http', '$window', '$ngConfirm', 'ngToast',
    function($rootScope, $scope, $state, $http, $window, $ngConfirm, ngToast) {

        $scope.groupId = $window.localStorage.getItem('groupId');
        $scope.showNotification = false;

        let formData = new FormData();
        let contentArray = [];

        if ($scope.groupId !== null) {
            $http.get($rootScope.baseUrl + '/document?owner=' + $scope.groupId)
                .then(function(response) {
                    $scope.documents = response.data.documents;
                    $scope.current_template = response.data.group.current_template;
                    if (!response.data.group.abbyy_user || response.data.group.abbyy_user === '') {
                        $scope.showNotification = true;
                    }
                }, function(response) {
                    $window.localStorage.clear();
                    $state.go($state.current, {}, { reload: true });
                });
        }

        $scope.$on('fileSelected', function(event, args) {
            $scope.$apply(function() {
                formData.append('file', args.file);
            });
        });

        $scope.templateChange = function() {
            $http.put($rootScope.baseUrl + '/group/' + $scope.groupId, { 'current_template': $scope.current_template })
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        /**
         * Documents upload
         */
        $scope.upload = function() {
            $http.post($rootScope.baseUrl + '/document/upload/' + $scope.groupId, formData, {
                    'transformRequest': angular.identity,
                    'headers': { 'Content-Type': undefined }
                }).then(function(response) {
                    ngToast.create('Chargement effectué avec succès');
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        /**
         * Process OCR on selected document
         * @param {string} id Document ID
         */
        $scope.ocrProcess = function(id) {
            $http.get($rootScope.baseUrl + '/document/ocrprocess/' + id)
                .then(function(response) {
                    ngToast.create('Océrisation effectué avec succès');
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        /**
         * Process LAD on selected document
         * @param {string} id Document ID
         */
        $scope.ladProcess = function(id) {
            $http.get($rootScope.baseUrl + '/document/ladprocess/' + id)
                .then(function(response) {
                    ngToast.create('LAD effectué avec succès');
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {
                    ngToast.create({'content': 'Erreur de traitement ! <br> Assurez-vous d\'avoir bien télécharger un template', 'className': 'danger' });
                });
        };

        /**
         * Upload the specified document to SharePoint
         * @param {string} id Document ID
         */
        $scope.sendToSP = function(id) {
            $http.get($rootScope.baseUrl + '/document/uploadToSP/' + id)
                .then(function(response) {
                    ngToast.create('L\'envoi vers Sharepoint effectué avec succès');
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        /**
         * Delete a specified document
         * @param {string} id Document ID
         */
        $scope.deleteDoc = function(id) {
            $ngConfirm({
                columnClass: 'small',
                title: 'Suppression de document',
                content: 'Êtes-vous sûr de vouloir supprimer ce document ?',
                scope: $scope,
                buttons: {
                    delete: {
                        text: 'Supprimer',
                        btnClass: 'btn-red',
                        action: function(scope) {
                            $http.delete($rootScope.baseUrl + '/document/' + id)
                                .then(function(response) {
                                    ngToast.create('Document supprimé avec succes');
                                    $state.go($state.current, {}, { reload: true });
                                },function(response) {});
                        }
                    },
                    'Fermer': function() {}
                }
            });

        };

    }

]);
