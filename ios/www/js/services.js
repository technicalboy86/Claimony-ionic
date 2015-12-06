var url = "http://stage.claimony.net:8080/camelgate/api/v2/";

angular.module('starter.services', [])

.factory('Auth', function($http, Storage) {
  var objService = {
    
    signin: function(email, password){
      var promise;
      console.log(url + 'users/email/'+email+'/password/'+password+'/validate');
      promise = $http({
        method  : 'GET',
        url     : url + 'users/email/'+email+'/password/'+password+'/validate',
        data    : "",
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        console.log(response);
        var data = response.data;
        
        if(data.responseCode == 10252){
          var user = data.body;

          Storage.setObject("user", user.user);
          return true;
        }
        return data.responseMessage;
      });
      
      return promise;
    },
    getUserInfo:function(userId, token){
      promise = $http({
        method  : 'GET',
        url     : url + 'users/userinfo?q=id=='+userId+'&usertoken='+token,
        data    : "",
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        
        var data = response.data;

        return data;
      });
      
      return promise;
    },
  };  
  return objService;
})

.factory('Collect', function($http, Storage) {
  var objService = {
    
    updateFromSteam: function(userId, token){
      var promise;
      console.log(url + 'publishers/users/'+userId+'/updatefromsteam?usertoken='+token);
      promise = $http({
        method  : 'POST',
        url     : url + 'publishers/users/'+userId+'/updatefromsteam?usertoken='+token,
        data    : "",
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        //console.log(response);
        var data = response.data;

        return data;
      });
      
      return promise;
    },    
    updateFromSteamCheck: function(userId, token){
      var promise;
      
      promise = $http({
        method  : 'POST',
        url     : url + 'publishers/users/'+userId+'/updatefromsteamcheck?usertoken='+token,
        data    : "",
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        //console.log(response);
        var data = response.data;

        return data;
      });
      
      return promise;
    }
  };  
  return objService;
})

.factory('Reward', function($http, Storage) {
  var objService = {
    
    getNormalRewards: function(){
      var promise;
      
      promise = $http({
        method  : 'GET',
        url     : url + 'merchants/rewards',
        data    : "",
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;

        return data;
      });
      
      return promise;
    },    
    getFlashDeals: function(){
      var promise;
      
      promise = $http({
        method  : 'GET',
        url     : url + 'merchants/rewards/flashdeals',
        data    : "",
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;

        return data;
      });
      
      return promise;
    },
    getCompetitions: function(){
      var promise;
      
      promise = $http({
        method  : 'GET',
        url     : url + 'competitions/current',
        data    : "",
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(function (response) {
        var data = response.data;

        return data;
      });
      
      return promise;
    }
  };  
  return objService;
})

.factory('ConnectionService', function() {
  var objService = {
    check: function() {
      var networkState = navigator.connection.type;

      var states = {};
      states[Connection.UNKNOWN]  = 1;//'Unknown connection';
      states[Connection.ETHERNET] = 2;//'Ethernet connection';
      states[Connection.WIFI]     = 3;//'WiFi connection';
      states[Connection.CELL_2G]  = 4;//'Cell 2G connection';
      states[Connection.CELL_3G]  = 5;//'Cell 3G connection';
      states[Connection.CELL_4G]  = 6;//'Cell 4G connection';
      states[Connection.CELL]     = 7;//'Cell generic connection';
      states[Connection.NONE]     = 8;//'No network connection';
          
      return states[networkState];
    }
  };
  
  return objService;
})

.factory('Storage', function(){
  return {
    getItem: function (key) {
      return localStorage.getItem(key);
    },

    getObject: function (key) {
      return JSON.parse(localStorage.getItem(key));
    },

    setItem: function (key, data) {
      localStorage.setItem(key, data);
    },

    setObject: function (key, data) {
      localStorage.setItem(key, JSON.stringify(data));
    },

    remove: function (key) {
      localStorage.removeItem(key);
    },

    clearAll : function () {
      localStorage.clear();
    }
  };
})
;
