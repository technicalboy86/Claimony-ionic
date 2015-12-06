var first = true;

// result contains any message sent from the plugin call
function successHandler (result) {
    //window.plugins.toast.showLongBottom(result);
    //alert(result);
}

// result contains any error description text returned from the plugin call
function errorHandler (error) {
    //window.plugins.toast.showLongBottom(error);
    console.log(error);
}

function tokenHandler (result) {
  // Your iOS push server needs to know the token before it can push to this device
  // here is where you might want to send it the token for later use.
  //window.plugins.toast.showLongBottom(result);

  sendRegid(result).then(function(data) {
    //window.plugins.toast.showLongBottom(e.msg);
  });
}

// iOS
function onNotificationAPN (event) {
  if ( event.alert )
  {
    window.plugins.toast.showLongBottom(event.alert);
  }

  if ( event.badge )
  {
      pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
  }
}

// Android and Amazon Fire OS
function onNotification(e) {

  switch( e.event )
  {
    case 'registered':
        if ( e.regid.length > 0 )
        {

          localStorage.setItem("regid", e.regid);

          sendRegid(e.regid).then(function(data) {
            //window.plugins.toast.showLongBottom("Get Registration ID for this device.");
          }, function(error){
            window.plugins.toast.showLongBottom(error);
          });

        }
    break;

    case 'message':
        var data = e.payload;

        if ( e.foreground )
        {
            // INLINE NOTIFICATION
            window.plugins.toast.showLongBottom(data.message);
        }
        else
        {  // otherwise we were launched because the user touched a notification in the notification tray.
            
        }

    break;

    case 'error':
        // ERROR
        window.plugins.toast.showLongBottom(e.msg);
    break;

    default:
        // UNKNOWN EVENT
        window.plugins.toast.showLongBottom("Unknown, an event was received and we do not know what it is");
    break;
  }
}

function sendRegid(regid){
  var promise;
    
  var user = JSON.parse(localStorage.getItem("user"));
  
   promise = $.ajax({
           url:url + 'users/user/'+user.userid+'/deviceid/'+regid+'?usertoken='+user.token,
           type:"PUT",
           contentType:"application/json;charset=utf-8",
           dataType:"json",
           data:{},
           success:function(data){
            console.log(data);
           }
    });

  return promise;
}

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $location, Storage, $rootScope) {
  $ionicPlatform.ready(function() {
    $rootScope.regidDevice();
  });
  
  $rootScope.regidDevice = function(){
    if(true){//regid == null && token != null){
      var pushNotification = window.plugins.pushNotification;

      if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){

        pushNotification.register(
        successHandler,
        errorHandler,
        {
            "senderID":"763325109020",
            "ecb":"onNotification"
        });

      } else {

        pushNotification.register(
        tokenHandler,
        errorHandler,
        {
            "badge":"true",
            "sound":"true",
            "alert":"true",
            "ecb":"onNotificationAPN"
        });
      }
    }
  };
  
  $rootScope.$on('$stateChangeStart', function (event, next) {
    
    if(first){
      first = false;
      var mUser = Storage.getObject("user");
      if (mUser.userid != null && mUser.userid != "") {
        $location.path("/collect");
        return;
      }
      console.log(mUser);
    }  
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.swipeBackEnabled(false);
  
  $stateProvider
  
  .state('signin', {
    url: "/signin",
    templateUrl: "templates/signin.html",
    controller: 'SigninCtrl'
  })
  
  .state('collect', {
    url: "/collect",
    templateUrl: "templates/collect.html",
    controller: 'CollectCtrl',
    cache:false
  })
  
  .state('reward_detail', {
    url: "/reward_detail",
    templateUrl: "templates/reward_detail.html",
    controller: 'RewardDetailCtrl',
    cache:false
  })
  
  .state('collect_detail', {
    url: "/collect_detail",
    templateUrl: "templates/collect_detail.html",
    controller: 'CollectDetailCtrl'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/signin');
});
