'use strict';

angular.module('gce-app',
    [
        'ngAnimate',
        'ngSanitize',
        'ngCropper',
        'ngToast',
        'ui.router',
        'angular-loading-bar',
        'ui.bootstrap',
        'cp.ngConfirm',
        'gce-app.directives',
        'gce-app.filters',
        'gce-app.controllers',
        'gce-app.services'
    ])

.run(['$rootScope', '$window',
    function($rootScope, $window) {

        $rootScope.baseUrl = 'http://localhost:1339';

        switch($window.location.host) {
            case 'localhost:1339':
                $rootScope.baseUrl = 'http://localhost:1339';
                break;
            case '92.222.78.33:8082':
                $rootScope.baseUrl = 'http://92.222.78.33:8082';
                break;
        }

        $rootScope.$on('$viewContentLoaded', function() {
            $window.scrollTo(0, 0);
        });

    }

 ])

.config(['$stateProvider', '$urlRouterProvider', '$logProvider', 'cfpLoadingBarProvider',
    function($stateProvider, $urlRouterProvider, $logProvider, cfpLoadingBarProvider) {

        $logProvider.debugEnabled(false);
        cfpLoadingBarProvider.includeSpinner = false;

        $stateProvider
            .state('index', {
                url: '',
                abstract: true,
                templateUrl: '/templates/index.html',
                controller: 'IndexCtrl',
            })
            .state('index.documents', {
                url: '/documents',
                templateUrl: '/templates/documents.html',
                controller: 'DocumentCtrl',
            })
            .state('index.zoning', {
                url: '/zoning',
                templateUrl: '/templates/zoning.html',
                controller: 'ZoningCtrl',
            })
            /*.state('index.operations', {
                url: '/operations',
                templateUrl: '/templates/operations.html',
                controller: 'IndexCtrl',
            })*/
            .state('index.settings', {
                url: '/settings',
                templateUrl: '/templates/settings.html',
                controller: 'SettingsCtrl',
            });

        /* If none of the above states are matched, use this as the fallback */
        $urlRouterProvider.otherwise('/documents');

    }

]);
