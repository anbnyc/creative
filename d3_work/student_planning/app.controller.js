(function(){
    
'use strict';

var app = angular.module('plan-app', ['ngMaterial']);

app.controller('PlanAppController', function($scope, $http){

    $scope.data = [
        // {
        //     'osis': 5001,
        //     'gradplan': '',
        //     'cohort': 2017,
        //     'newX': 0
        // },
        // {
        //     'osis': 5002,
        //     'gradplan': '',
        //     'cohort': 2017,
        //     'newX': 0
        // },
        {
            'osis': 5003,
            'gradplan': '',
            'cohort': 2017,
            'newX': 0
        }
    ];

    $scope.vizWidth = angular.element(document.querySelector(".vizContainer"))[0].offsetWidth;
    $scope.vizHeight = angular.element(document.querySelector(".vizContainer"))[0].offsetHeight;

});

})();