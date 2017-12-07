'use strict';

angular.module('gce-app.controllers')

.controller('DocumentCtrl', ['$rootScope', '$scope', '$state', '$http', '$ngConfirm',
    function($rootScope, $scope, $state, $http, $ngConfirm) {

        let formData = new FormData();
        let contentArray = [];

        $http.get($rootScope.baseUrl + '/document')
            .then(function(response) {
                $scope.documents = response.data;
            },function(response) {});


        $http.get($rootScope.baseUrl + '/group/5a280209595d36a8054e1728?fields=current_template')
            .then(function(response) {
                $scope.current_template = response.data.current_template;
            },function(response) {});

        $scope.$on('fileSelected', function(event, args) {
            $scope.$apply(function() {
                formData.append('file', args.file);
            });
        });

        $scope.templateChange = function() {
            $http.put($rootScope.baseUrl + '/group/5a280209595d36a8054e1728', { 'current_template': $scope.current_template })
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        $scope.upload = function() {
            $http.post($rootScope.baseUrl + '/document/upload', formData, {
                    'transformRequest': angular.identity,
                    'headers': { 'Content-Type': undefined }
                }).then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                }, function(response) {});
        };

        $scope.process = function(id) {
            $http.get($rootScope.baseUrl + '/document/ocrprocess/' + id)
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                },function(response) {});
        };

        $scope.sendToSP = function(id) {
            $http.get($rootScope.baseUrl + '/document/uploadToSP/' + id)
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                },function(response) {});
        };

        $scope.processLad = function(id) {
            $http.get($rootScope.baseUrl + '/document/ladprocess/' + id)
                .then(function(response) {
                    $state.go($state.current, {}, { reload: true });
                },function(response) {});
        };

    }

]);
