((): void => {

    var app = angular.module('demoApp', ['ngRoute', 'ngAnimate']);

    app.config(['$routeProvider', ($routeProvider) => {
        $routeProvider.when('/',
        {
            controller: 'demoApp.CustomersController',
            templateUrl: 'views/customers.html',
            controllerAs: 'vm'
        })
        .when('/orders/:customerId',
        {
            controller: 'demoApp.OrdersController',
            templateUrl: 'views/orders.html',
            controllerAs: 'vm'
        });
    }]);

})();
