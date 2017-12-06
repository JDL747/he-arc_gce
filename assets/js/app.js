'use strict';

angular.module('gce-app',
    [
        'ngAnimate',
        'ngSanitize',
        'restangular',
        'xeditable',
        'smart-table',
        'ui.router',
        'toaster',
        'angular-loading-bar',
        'ui.bootstrap',
        'cp.ngConfirm',
        'ngCropper',
        'gce-app.directives',
        'gce-app.filters',
        'gce-app.controllers',
        'gce-app.services'
    ])

.run(['$rootScope', '$window', 'editableOptions',
    function($rootScope, $window, editableOptions) {

        editableOptions.theme = 'bs3';

        $rootScope.$on('$viewContentLoaded', function() {
            $window.scrollTo(0, 0);
        });

    }

 ])

.config(['$stateProvider', '$urlRouterProvider', '$logProvider', 'RestangularProvider', 'cfpLoadingBarProvider',
    function($stateProvider, $urlRouterProvider, $logProvider, RestangularProvider, cfpLoadingBarProvider) {

        $logProvider.debugEnabled(false);
        cfpLoadingBarProvider.includeSpinner = false;

        RestangularProvider.setBaseUrl('http://86.119.28.188/sites/mediacorp');
        RestangularProvider.setDefaultHttpFields({ 'withCredentials': true });

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
                controller: 'IndexCtrl',
            })
            .state('index.zoning', {
                url: '/zoning',
                templateUrl: '/templates/zoning.html',
                controller: 'ZoningCtrl',
            })
            .state('index.operations', {
                url: '/operations',
                templateUrl: '/templates/operations.html',
                controller: 'IndexCtrl',
            })
            .state('index.settings', {
                url: '/settings',
                templateUrl: '/templates/settings.html',
                controller: 'IndexCtrl',
            });

        /* If none of the above states are matched, use this as the fallback */
        $urlRouterProvider.otherwise('/documents');

    }

]);