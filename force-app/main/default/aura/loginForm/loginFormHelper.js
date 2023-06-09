({
    
    qsToEventMap: {
        'startURL'  : 'e.c:setStartUrl'
    },
    
    qsToEventMap2: {
        'expid'  : 'e.c:setExpId'
    },
    readCookie: function(name) {
        console.log("readCokie called");
    var nameSG = name + "=";
    var nuller = '';
    if (document.cookie.indexOf(nameSG) == -1)
    return nuller;
    
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameSG) == 0) return c.substring(nameSG.length,c.length); }
 return null; },
 
 
 handleLogin: function (component, event, helpler) {
     console.log('handleLogin called');
    var username = component.find("username").get("v.value");
    var password = component.find("password").get("v.value");
    var action = component.get("c.login");
    var startUrl = component.get("v.startUrl");
    console.log('errormessage===>>>',window.location.href);
     var curUrl = window.location.href;
     var arr = curUrl.split('language=');
     console.log('secondPosition====>>>',arr[1]);
     
    startUrl = decodeURIComponent(startUrl);
    
     action.setParams({username:username, password:password, startUrl:startUrl,language:arr[1]});
    action.setCallback(this, function(a){
        var rtnValue = a.getReturnValue();
        if (rtnValue !== null) {
            component.set("v.errorMessage",rtnValue);
            component.set("v.showError",true);
        }
    });
    $A.enqueueAction(action);
},
    
    newCookie: function(name,value,days){
        console.log("newCookie called");
        var days = 30;   
        
        if (days) {
            console.log("days==>",days);
            console.log("name==>",name);
            console.log("value==>",value);
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString(); }
        else var expires = "";
        console.log("expires==>",expires);
        document.cookie = name+"="+value+expires+"; path=/";  
        console.log("document.cookie==>",document.cookie);
    },
        
        getIsUsernamePasswordEnabled : function (component, event, helpler) {
            var action = component.get("c.getIsUsernamePasswordEnabled");
            action.setCallback(this, function(a){
                var rtnValue = a.getReturnValue();
                if (rtnValue !== null) {
                    component.set('v.isUsernamePasswordEnabled',rtnValue);
                }
            });
            $A.enqueueAction(action);
        },
            
            getIsSelfRegistrationEnabled : function (component, event, helpler) {
                var action = component.get("c.getIsSelfRegistrationEnabled");
                action.setCallback(this, function(a){
                    var rtnValue = a.getReturnValue();
                    if (rtnValue !== null) {
                        component.set('v.isSelfRegistrationEnabled',rtnValue);
                    }
                });
                $A.enqueueAction(action);
            },
                
                getCommunityForgotPasswordUrl : function (component, event, helpler) {
                    var action = component.get("c.getForgotPasswordUrl");
                    action.setCallback(this, function(a){
                        var rtnValue = a.getReturnValue();
                        if (rtnValue !== null) {
                            component.set('v.communityForgotPasswordUrl',rtnValue);
                        }
                    });
                    $A.enqueueAction(action);
                },
                    
                    getCommunitySelfRegisterUrl : function (component, event, helpler) {
                        var action = component.get("c.getSelfRegistrationUrl");
                        action.setCallback(this, function(a){
                            var rtnValue = a.getReturnValue();
                            if (rtnValue !== null) {
                                component.set('v.communitySelfRegisterUrl',rtnValue);
                            }
                        });
                        $A.enqueueAction(action);
                    },
                        
                        setBrandingCookie: function (component, event, helpler) {
                            var expId = component.get("v.expid");
                            if (expId) {
                                var action = component.get("c.setExperienceId");
                                action.setParams({expId:expId});
                                action.setCallback(this, function(a){ });
                                $A.enqueueAction(action);
                            }
                        }
})