'use strict';

function WelcomeCtrl($scope){
    $scope.username = 'Conan_Z';
    //$scope.path = path;
}

function TagsCtrl($scope) {
 //  $scope.tags = [
	// 	{name:'one'},
	// 	{name:'two'},
	// 	{name:'three'}
	// ];
 
  $scope.addTag = function() {
    $scope.tags.push({name:$scope.newTag});
    $scope.newTag = '';
  };
}
