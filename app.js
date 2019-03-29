var app = angular.module("myApp", ["ngRoute"]);
app.config(function($routeProvider) {
  $routeProvider.when("/register", {
    templateUrl: "/views/registration.html",
    controller: "regController"
  });
  $routeProvider.when("/messaged/:id", {
    templateUrl: "/views/messagedetail.html",
    controller: "messagedController",
    resolve: [
      "auth",
      function(auth) {
        return auth.validate();
      }
    ]
  });
  $routeProvider.when("/message", {
    templateUrl: "/views/message.html",
    controller: "messageController",
    resolve: [
      "auth",
      function(auth) {
        return auth.validate();
      }
    ]
  });
  $routeProvider.when("/home", {
    templateUrl: "/views/home.html",
    controller: "homeController",
    resolve: [
      "auth",
      function(auth) {
        return auth.validate();
      }
    ]
  });
  $routeProvider.when("/login", {
    templateUrl: "/views/login.html",
    controller: "loginController"
  });
  $routeProvider
    .when("/logout", {
      templateUrl: "/views/login.html",
      controller: "loginController"
    })
    .otherwise({
      template: "invalid page access"
    });
});
app.run(function($rootScope, $window, $location, $timeout) {
  $rootScope.$on("$locationChangeStart", function(event, next, current) {
    // handle route changes
    var compare = next.split(/[\s/]+/).pop();
    console.log(compare);
    if (compare == "home" || compare == "message") {
      $timeout(function() {
        $rootScope.items = ["home", "message", "logout"];
      }, 1000);
    }
    if (compare == "login" || compare == "register" || compare == "logout") {
      $rootScope.items = ["login", "register"];
    }
    if (compare == "logout") {
      console.log("entered logout");
      $window.localStorage.removeItem("isSession");
    }
  });
  $rootScope.getClass = function(path) {
    var cur_path = $location.path().substr(0, path.length);
    if (cur_path == path) {
      if ($location.path().substr(0).length > 1 && path.length == 1) return "";
      else return "active";
    } else {
      return "";
    }
  };
});
app.controller("appController", function($scope, $rootScope, $location) {
  (function() {
    $scope.url = $location.url();
    console.log($location.path());
  })();
});
app.controller("regController", function($scope, $window, $location) {
  if (!$window.localStorage.users) {
    $scope.users = [];
  } else {
    $scope.users = JSON.parse($window.localStorage.getItem("users"));
  }

  $scope.registration = function() {
    $scope.newuser = {
      username: $scope.username,
      password: $scope.password,
      fname: $scope.fname,
      lname: $scope.lname,
      phone: $scope.phone,
      gender: $scope.gender
    };

    console.log($scope.newuser);
    $scope.users.push($scope.newuser);
    $window.localStorage.setItem("users", JSON.stringify($scope.users));
    alert("you are registered successfully");
    $location.path(["/login"]);
  };
});
app.service("loginService", function() {});
app.controller("loginController", function($scope, $window, $location) {
  $scope.usernames = [];
  $scope.passwords = [];
  $scope.login = function() {
    console.log("entered");
    $scope.users = JSON.parse($window.localStorage.getItem("users"));
    angular.forEach($scope.users, function(value, key) {
      angular.forEach(value, function(value, key) {
        console.log("double loop");
        if (key == "username") {
          $scope.usernames.push(value);
        }
        if (key == "password") {
          $scope.passwords.push(value);
        }
      });
    });
    console.log($scope.usernames);
    console.log($scope.values);
    var keepGoing = true;
    angular.forEach($scope.usernames, function(value, key) {
      if (keepGoing) {
        if (
          $scope.usernames[key] == $scope.username &&
          $scope.passwords[key] == $scope.password
        ) {
          $location.path(["/home"]);
          $window.localStorage.setItem("isSession", $scope.username);
          keepGoing = false;
        }
      }
    });
    if (keepGoing) {
      alert("please enter valid details");
    }
  };
});
app.controller("homeController", function($scope, $window) {
  $scope.users = JSON.parse($window.localStorage.getItem("users"));
  $scope.sentid = $window.localStorage.getItem("isSession");
  if (!$window.localStorage.messages) {
    $scope.messages = [];
  } else {
    $scope.messages = JSON.parse($window.localStorage.getItem("messages"));
  }
  $scope.sendMessage = function() {
    console.log($scope.userId + "" + $scope.message);
    $scope.mess = {
      sendid: $scope.sentid, //sender id
      userid: $scope.userId, // receiver id
      message: $scope.message,
      imp: false
    };
    console.log($scope.mess);
    $scope.messages.push($scope.mess);

    $window.localStorage.setItem("messages", JSON.stringify($scope.messages));
    alert("Message Sent");
  };
});
app.controller("messageController", function($scope, $window, $location) {
  $scope.messages = JSON.parse($window.localStorage.getItem("messages"));
  $scope.loggedin = $window.localStorage.getItem("isSession");
});
app.controller("messagedController", function(
  $scope,
  $routeParams,
  $window,
  $location
) {
  $scope.messages = JSON.parse($window.localStorage.getItem("messages"));
  var mid = $routeParams.id;
  $scope.message = $scope.messages[mid];
  console.log(mid);
  $scope.sendReply = function() {
    console.log("entered reply");
    $scope.mess = {
      sendid: $scope.messages[mid].userid, //sender id
      userid: $scope.messages[mid].sendid, // receiver id
      message: $scope.reply,
      imp: false
    };
    console.log($scope.mess);
    $scope.messages.push($scope.mess);

    $window.localStorage.setItem("messages", JSON.stringify($scope.messages));
    alert("Reply sent");
  };
  $scope.deleteMessage = function() {
    confirm("do you want to delete the message ?");
    $scope.messages.splice(mid, 1);
    $window.localStorage.setItem("messages", JSON.stringify($scope.messages));
    $location.path(["/message"]);
  };
  $scope.markImp = function() {
    $window.localStorage.setItem("messages", JSON.stringify($scope.messages));
  };
  $scope.backToMessages = function() {
    $location.path(["/message"]);
  };
});
app.factory("auth", function($window, $location, $timeout, $q) {
  return {
    validate: function() {
      var defer = $q.defer();
      $timeout(function() {
        if (!window.localStorage.isSession) {
          defer.reject();
          $location.path(["/login"]);
        } else {
          defer.resolve();
        }
      }, 1000);
      return defer.promise;
    }
  };
});
