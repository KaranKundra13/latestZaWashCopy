({
        qsToEventMap: {
            'expid'  : 'e.c:setExpId'
        },
        
        handleForgotPassword: function (component, event, helpler) {
            var username = component.find("username").get("v.value");
            var checkEmailUrl = component.get("v.checkEmailUrl");
            var action = component.get("c.forgotPassword");
            var curUrl = window.location.href;
            
         var arr = curUrl.split('language=');
            console.log('secondPosition====>>>',arr[1]);
            action.setParams({username:username, checkEmailUrl:checkEmailUrl,language:arr[1]});
            action.setCallback(this, function(a) {
                var rtnValue = a.getReturnValue();
                if (rtnValue != null) {
                   component.set("v.errorMessage",rtnValue);
                   component.set("v.showError",true);
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