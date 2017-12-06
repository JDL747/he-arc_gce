'use strict';

angular.module('gce-app.controllers')

.controller('SettingsCtrl', ['$scope', '$rootScope', '$state', '$timeout', '$http',
    function($scope, $rootScope, $state, $timeout, $http) {

        let formData = new FormData();
        let contentArray = [];

        $http.get($rootScope.baseUrl + '/group/5a280209595d36a8054e1728')
            .then(function(response) {
                $scope.group = response.data;
            },
            function(response) {});

        $scope.$on('fileSelected', function(event, args) {
            $scope.$apply(function() {
                formData.append('file', args.file);
            });
        });

        $scope.save = function(group) {
            $http.put($rootScope.baseUrl + '/group/5a280209595d36a8054e1728', group)
                .then(function(response) {

                }, function(response) {});
        };

        $scope.saveTemplates = function(templates) {

            $http.post($rootScope.baseUrl + '/group/uploadTemplates', formData, {
                    'transformRequest': angular.identity,
                    'headers': { 'Content-Type': undefined }
                })
                .then(function(response) {

                }, function(response) {});
        };

    }

]);
