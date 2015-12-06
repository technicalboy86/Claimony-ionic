angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('SigninCtrl', function($scope, $ionicLoading, Auth, Storage, $location) {
  //$scope.user = {email:"jonatan@claimony.com", password:"test"};
  $scope.user = {email:"", password:""};
  
  var mUser = Storage.getObject("user");
  
  function looksLikeMail(str) {
      var lastAtPos = str.lastIndexOf('@');
      var lastDotPos = str.lastIndexOf('.');
      return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2);
  }
  
  $scope.onFBSignin = function(){
    facebookConnectPlugin.api("me",["user_birthday"],
          function(response){
              //var ret = JSON.stringify(response);              
              //ret = JSON.parse(ret);
              console.log(response);
                              $scope.user.email = response.email;
                              $scope.$apply();
/*
              $ionicLoading.show();
              var promise = Auth.signin(response.email, "");
              promise.then(function(data) {
                if(data === true) { //success
                  $location.path("/collect");
                } else { //failed
                  $scope.showAlert('Warning', data);
                }
                $ionicLoading.hide();
              }, function(reason){
                $ionicLoading.hide();
                $scope.showAlert("Warning", "Please check your connection.");
              });
 */
          },
          function(response){
            console.log(response);  
    });
  };
  
  $scope.onSignin = function(){
    //$location.path("/collect");
    //return;
  
    if($scope.user.email === "" || $scope.user.password ===""){
      $scope.showAlert("Warning", "Please fill out all fields.");
      return;
    }
    
    if(looksLikeMail($scope.user.email) === false){
      $scope.showAlert("Warning", "Please input valid email address.");
      return;
    }
    
    $ionicLoading.show();
    
    var promise = Auth.signin($scope.user.email, $scope.user.password);
    promise.then(function(data) {
      if(data == true) { //success
        $location.path("/collect");
      } else { //failed
        $scope.showAlert('Warning', data);
      }
      $ionicLoading.hide();
    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    });
  };
  
  $scope.onSignup = function(){
    window.open("http://www.claimony.com", "_blank", "location=yes");
  };
  
  $scope.showAlert = function(title, template) {
    title = title!=""?title+" : ":title;
    window.plugins.toast.showLongBottom(title +template);
  };
})

.controller('CollectCtrl', function($scope, $ionicLoading, Auth, Storage, Collect, $location, $ionicModal, $timeout) {
  //$scope.IsReward = false;
  var user = Storage.getObject("user");
    
  $scope.collect = {loading:false};
  $scope.isError = true;
  $scope.collectList = new Array();
  $scope.achievementscount = 0;
  $scope.isDone = true;
  
  function getUserInfor(){    
    $ionicLoading.show();
    
    var promise = Auth.getUserInfo(user.userid, user.token);
    promise.then(function(data) {
      
      if(data.responseCode == 10257){
          var user = data.body;

          Storage.setObject("userInfo", user.users[0]);
          $scope.userInfo = user.users[0];
      }else { //failed
        $scope.showAlert('Warning', data.responseMessage);
      }

      $ionicLoading.hide();
    }, function(reason){
      console.log(reason);
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    });
  }
  
  getUserInfor();
  
  $scope.onCollect = function(){
    
    //$ionicLoading.show();
    $scope.collect.loading = true;

    $timeout(function(){
      //$scope.collect.loading = false;
      //  $scope.$apply();
      //$location.path("/collect_detail");
    //return;
      var user = Storage.getObject("user");
      var promise = Collect.updateFromSteam(user.userid, user.token);
      promise.then(function(data) {      
        console.log(data);      
        //$scope.collect.loading = false;
        //$scope.$apply();
        //$location.path("/collect_detail");
        $scope.isDone = false;
        getCollectList();
        $scope.timer = setInterval(getCollectList, 5*1000);
      }, function(reason){
        $scope.collect.loading = false;
        $scope.showAlert("Warning", "Please check your connection.");
      });
    }, 2000);
  };
  
  $scope.onReward = function(){
    clearInterval($scope.timer);
    $location.path("/reward_detail");
  };
  
  $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal) {
      $scope.modal = modal;
  });
  
  $scope.closeHelp = function(){
    $scope.modal.hide();
  };
  
  $scope.openHelp = function(){
    $scope.modal.show();
  };

  $scope.showAlert = function(title, template) {
    title = title!=""?title+" : ":title;
    window.plugins.toast.showLongBottom(title +template);
  };
  
  function getCollectList(){
    //$ionicLoading.show();
    
    var promise = Collect.updateFromSteamCheck(user.userid, user.token);
    promise.then(function(data) {
      
      console.log(data.responseMessage);
      
      if (data.body.updateresults && (data.body.updateresults.addedGames != undefined) && (data.body.updateresults.updatingGames!= undefined)) {
        $scope.collectList = new Array();
        $scope.achievementscount = 0;
        for (var i in data.body.updateresults.addedGames) {
          for(var j in data.body.updateresults.addedGames[i].achievedAchievements){
            $scope.collectList.push(data.body.updateresults.addedGames[i].achievedAchievements[j]);
            //console.log(data.body.updateresults.addedGames[i].achievedAchievements[j]);
            $scope.achievementscount += parseInt(data.body.updateresults.addedGames[i].achievedAchievements[j].gainedcredits); 
          }
        }
        for (var i in data.body.updateresults.updatingGames) {
          for(var j in data.body.updateresults.updatingGames[i].achievedAchievements){
            $scope.collectList.push(data.body.updateresults.updatingGames[i].achievedAchievements[j]);
            //console.log(data.body.updateresults.updatingGames[i].achievedAchievements[j]);
            $scope.achievementscount += parseInt(data.body.updateresults.updatingGames[i].achievedAchievements[j].gainedcredits); 
          }
        }
      }
      
      if ($scope.collectList.length < 1) {
        $scope.isError = true;
        $scope.collect.loading = true;
        
        if (data.responseMessage == "Ready to update") {
          $scope.collect.loading = false;
        }
      }else{
        $scope.isError = false;
        $scope.collect.loading = false;
      }
      
      
      //$ionicLoading.hide();
    }, function(reason){
      //$ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    });
  };
  
  
  $scope.onDone = function(){
    clearInterval($scope.timer);
    $scope.isDone = true;
  };
})

.controller('CollectDetailCtrl', function($scope, $ionicLoading, Storage, Collect, $ionicHistory, $ionicModal, $location) {
  var user = Storage.getObject("user");
  $scope.isError = true;
  $scope.collectList = new Array();
  $scope.achievementscount = 0;
  
  $scope.collect = {loading:true};
  
  $scope.userInfo = Storage.getObject("userInfo");
  console.log($scope.userInfo);
  
  $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal) {
      $scope.modal = modal;
  });
  
  $scope.closeHelp = function(){
    $scope.modal.hide();
  };
  
  $scope.openHelp = function(){
    $scope.modal.show();
  };
  
  $scope.onReward = function(){
    clearInterval($scope.timer);
    $location.path("/reward_detail");
  };
  
  function getCollectList(){
    //$ionicLoading.show();
    
    var promise = Collect.updateFromSteamCheck(user.userid, user.token);
    promise.then(function(data) {
      
      console.log(data.responseMessage);
      
      if (data.body.updateresults && (data.body.updateresults.addedGames != undefined) && (data.body.updateresults.updatingGames!= undefined)) {
        $scope.collectList = new Array();
        $scope.achievementscount = 0;
        for (var i in data.body.updateresults.addedGames) {
          for(var j in data.body.updateresults.addedGames[i].achievedAchievements){
            $scope.collectList.push(data.body.updateresults.addedGames[i].achievedAchievements[j]);
            //console.log(data.body.updateresults.addedGames[i].achievedAchievements[j]);
            $scope.achievementscount += parseInt(data.body.updateresults.addedGames[i].achievedAchievements[j].gainedcredits); 
          }
        }
        for (var i in data.body.updateresults.updatingGames) {
          for(var j in data.body.updateresults.updatingGames[i].achievedAchievements){
            $scope.collectList.push(data.body.updateresults.updatingGames[i].achievedAchievements[j]);
            //console.log(data.body.updateresults.updatingGames[i].achievedAchievements[j]);
            $scope.achievementscount += parseInt(data.body.updateresults.updatingGames[i].achievedAchievements[j].gainedcredits); 
          }
        }
      }
      
      if ($scope.collectList.length < 1) {
        $scope.isError = true;
        $scope.collect.loading = true;
        
        if (data.responseMessage == "Ready to update") {
          $scope.collect.loading = false;
        }
      }else{
        $scope.isError = false;
        $scope.collect.loading = false;
      }
      
      
      //$ionicLoading.hide();
    }, function(reason){
      //$ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    });
  };
  
  getCollectList();
  $scope.timer = setInterval(getCollectList, 5*1000);
  
  
  $scope.onDone = function(){
    clearInterval($scope.timer);
    $ionicHistory.goBack();
  };
  
  $scope.showAlert = function(title, template) {
    title = title!=""?title+" : ":title;
    window.plugins.toast.showLongBottom(title +template);
  };
})

.controller('RewardDetailCtrl', function($scope, $ionicLoading, Storage, $ionicHistory, Reward, $ionicModal, $location, $timeout) {
  var user = Storage.getObject("user");
  $scope.userInfo = Storage.getObject("userInfo");
  console.log($scope.userInfo);
  
  $scope.rewardList = new Array();
  
  function getColor(state){
    var color = "#00da6f";
    
    if (state == "UPCOMING") {
      color = "#12b1df";
    }
    
    return color;
  }
  
  function getRewardList(){
    $ionicLoading.show();

    var promise = Reward.getCompetitions();
    promise.then(function(data) {      
      console.log(data);
      for(var i in data.body.competitions){
        for(var j in data.body.competitions[i].competitionproducts)
        {
          //console.log(data.body.competitions[i].competitionproducts[j]);
          var title="", image="", description="", credit="", date="", listprice="", salesprice="", brand="", url="http://www.claimony.com";
          if (data.body.competitions[i].competitionproducts[j].product.title) {
            title = data.body.competitions[i].competitionproducts[j].product.title;
          }
          if (data.body.competitions[i].competitionproducts[j].product.images) {
            image = data.body.competitions[i].competitionproducts[j].product.images.thumb[0];
          }
          if (data.body.competitions[i].competitionproducts[j].product.description) {
            //description = $("<div>").html(data.body.products[i].description).text();
            description = data.body.competitions[i].competitionproducts[j].product.description;
          }
          if (data.body.competitions[i].competitionproducts[j].product.cooldown) {
            credit = data.body.competitions[i].competitionproducts[j].product.cooldown;
          }
          //if (data.body.products[i].activedate) {
          //  date = moment(data.body.products[i].activedate).format("h:mm:ss");
          //}
          if (data.body.competitions[i].competitionproducts[j].product.listprice) {
            listprice = data.body.competitions[i].competitionproducts[j].product.listprice + " SEK";
          }
          if (data.body.competitions[i].competitionproducts[j].product.salesprice) {
            salesprice = data.body.competitions[i].competitionproducts[j].product.salesprice + " SEK";
          }
          if (data.body.competitions[i].competitionproducts[j].product.brand) {
            brand = data.body.competitions[i].competitionproducts[j].product.brand;
          }
          if (data.body.competitions[i].competitionproducts[j].product.externalurl) {
            url = data.body.competitions[i].competitionproducts[j].product.externalurl;
          }
          
          var aItem = {  productId:data.body.competitions[i].competitionproducts[j].productid,
                         title:title,
                         image:image,
                         description:description,
                         credit:"",
                         date:date,
                         listprice:listprice,
                         salesprice:salesprice,
                         brand:brand,
                         url:url,
                         isExpend:false,
                         state:"Competition",
                         name:data.body.competitions[i].name,
                         color:"#ef5687"
                         };
          var isExist = false;
          for(var index in $scope.rewardList)
          {
            if ($scope.rewardList[index].productId == aItem.productId) {
              isExist = true;
              console.log("isExist");
            }
          }
          if (isExist == false) {
            $scope.rewardList.push(aItem);
          }
          
        }
      }
      
      return Reward.getFlashDeals();
    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    }).then(function(data) {
      for(var i in data.body.products){
        console.log(data.body.products[i]);
        var title="", image="", description="", credit="", date="",countdown="",startTime="",endTime="" ,listprice="", salesprice="", brand="", url="http://www.claimony.com", state="", color="";
        if (data.body.products[i].title) {
          title = data.body.products[i].title;
        }
        if (data.body.products[i].images) {
          image = data.body.products[i].images.thumb[0];
        }
        if (data.body.products[i].description) {
          //description = $("<div>").html(data.body.products[i].description).text();
          description = data.body.products[i].description;
        }
        if (data.body.products[i].creditcost) {
          credit = data.body.products[i].creditcost;
        }
        if (data.body.products[i].activedate) {
          date = moment(data.body.products[i].activedate).format("h:mm:ss");
        }
        if (data.body.products[i].listprice) {
          listprice = data.body.products[i].listprice + " SEK";
        }
        if (data.body.products[i].salesprice) {
          salesprice = data.body.products[i].salesprice + " SEK";
        }
        if (data.body.products[i].brand) {
          brand = data.body.products[i].brand;
        }
        if (data.body.products[i].externalurl) {
          url = data.body.products[i].externalurl;
        }
        if (data.body.products[i].state) {
          state = data.body.products[i].state;
          color = getColor(state);
          
          if (state == "UPCOMING") {
            state ="Upcoming";
            credit = "";
            
            if (data.body.products[i].timedstart) {
              startTime = moment(parseInt(data.body.products[i].timedstart)).format("LLL");
              endTime = moment(parseInt(data.body.products[i].timedend)).format("LLL");
              //countdown = moment(parseInt(data.body.products[i].activedate) - new Date().getTime()).format("h:mm:ss");
            }else{
              countdown = moment(parseInt(data.body.products[i].activedate) - new Date().getTime()).format("h:mm:ss");
            }
          }
          if (state == "ACTIVE") {
            state ="ACTIVE";
          }
          if (state == "LASTCALL") {
            state ="Last call";
          }
          if (state == "OUT") {
            state ="Claimed";
          }
          if (state == "MISSED") {
            state ="Missed IT";
            color = "#d73939";
          }
        }
        var aItem = {  title:title,
                       image:image,
                       description:description,
                       credit:credit,
                       date:date,
                       listprice:listprice,
                       salesprice:salesprice,
                       brand:brand,
                       url:url,
                       state:state,
                       color:color,
                       isExpend:false,
                       startTime:startTime,
                       endTime:endTime,
                       countdown:countdown
        };
       // console.log(aItem);
                       
        if (state != "Claimed") {
          $scope.rewardList.push(aItem);
        }
        
      }
      //console.log(data);
      return Reward.getNormalRewards();
    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    }).then(function(data) {
     //console.log(data);
      for(var i in data.body.products){
        console.log(1111);
        console.log(data.body.products[i]);
        console.log(11111);
        var title="", image="", description="", credit="",state="", countdown="",color="",date="", startTime="", endTime="", listprice="", salesprice="", brand="", url="http://www.claimony.com";
        if (data.body.products[i].title) {
          title = data.body.products[i].title;
        }
        if (data.body.products[i].images) {
          image = data.body.products[i].images.thumb[0];
        }
        if (data.body.products[i].description) {
          //description = $("<div>").html(data.body.products[i].description).text();
          description = data.body.products[i].description;
        }
        if (data.body.products[i].creditcost) {
          credit = data.body.products[i].creditcost;
        }
        if (data.body.products[i].activedate) {
          date = moment(data.body.products[i].activedate).format("h:mm:ss");
        }
        if (data.body.products[i].listprice) {
          listprice = data.body.products[i].listprice + " SEK";
        }
        if (data.body.products[i].salesprice) {
          salesprice = data.body.products[i].salesprice + " SEK";
        }
        if (data.body.products[i].brand) {
          brand = data.body.products[i].brand;
        }
        if (data.body.products[i].externalurl) {
          url = data.body.products[i].externalurl;
        }
        if (data.body.products[i].state) {
          state = data.body.products[i].state;
          color = getColor(state);
          
          if (state == "UPCOMING") {
            state ="Upcoming";
            credit = "";

            if (data.body.products[i].timedstart) {
              startTime = moment(parseInt(data.body.products[i].timedstart)).format("LLL");
              endTime = moment(parseInt(data.body.products[i].timedend)).format("LLL");
              
              if (data.body.products[i].creditcost) {
                credit = data.body.products[i].creditcost;
              }
              //countdown = moment(parseInt(data.body.products[i].activedate) - new Date().getTime()).format("h:mm:ss");
            }else{
              countdown = moment(parseInt(data.body.products[i].activedate) - new Date().getTime()).format("h:mm:ss");
            }
          }
          if (state == "ACTIVE") {
            state ="ACTIVE";
          }
          if (state == "LASTCALL") {
            state ="Last call";
          }
          if (state == "OUT") {
            state ="Claimed";
          }
          if (state == "MISSED") {
            state ="Missed IT";
            color = "#d73939";
          }
        }
        var aItem = {  title:title,
                       image:image,
                       description:description,
                       credit:credit,
                       date:date,
                       listprice:listprice,
                       salesprice:salesprice,
                       brand:brand,
                       url:url,
                       state:state,
                       color:color,
                       isExpend:false,
                       startTime:startTime,
                       endTime:endTime,
                       countdown:countdown
        };
                       
        //console.log(aItem);
                       
        if (state != "Claimed") {
          $scope.rewardList.push(aItem);
        }
        
      }
      $ionicLoading.hide();
    }, function(reason){
      $ionicLoading.hide();
      $scope.showAlert("Warning", "Please check your connection.");
    });
  };
  
  getRewardList();
  
  $scope.CountdownTimer = setInterval(function(){
    if($scope.rewardList.length > 0 )
    {
      for(var index in $scope.rewardList)
      {
        if ($scope.rewardList[index].state == "Upcoming") {
          if ($scope.rewardList[index].countdown) {
            //console.log($scope.rewardList[index].date);
            $scope.rewardList[index].countdown = moment(parseInt($scope.rewardList[index].date) - new Date().getTime()).format("h:mm:ss");
            //console.log($scope.rewardList[index].countdown);
          }
        }
      }
      $scope.$apply();
    }
  }, 1000);
  
  $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'fade-in'
    }).then(function(modal) {
      $scope.modal = modal;
  });
  
  $scope.closeHelp = function(){
    $scope.modal.hide();
  };
  
  $scope.openHelp = function(){
    $scope.modal.show();
  };

  $scope.onClickExpend = function(index){
    
    if ($scope.rewardList[index].isExpend == true) {
      $scope.rewardList[index].isExpend = !$scope.rewardList[index].isExpend;
      return;
    }
    $ionicLoading.show();
    $scope.rewardList[index].isExpend = !$scope.rewardList[index].isExpend;
    $timeout(function(){
      $ionicLoading.hide();      
    }, 500);
  }
  
  $scope.openURL = function(index){
    window.open($scope.rewardList[index].url, "_blank", "location=yes");
  }
  
  $scope.onBack = function(){
    clearInterval($scope.CountdownTimer);
    //$ionicHistory.goBack();
    $location.path("/collect");
  };
  
  $scope.showAlert = function(title, template) {
    title = title!=""?title+" : ":title;
    window.plugins.toast.showLongBottom(title +template);
  };
})
;
