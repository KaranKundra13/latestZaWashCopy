({
    initialize: function(component, event, helper) {
        $A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap}).fire();    
        $A.get("e.siteforce:registerQueryEventMap").setParams({"qsToEvent" : helper.qsToEventMap2}).fire();
        component.set('v.isUsernamePasswordEnabled', helper.getIsUsernamePasswordEnabled(component, event, helper));
        component.set("v.isSelfRegistrationEnabled", helper.getIsSelfRegistrationEnabled(component, event, helper));
        component.set("v.communityForgotPasswordUrl", helper.getCommunityForgotPasswordUrl(component, event, helper));
        component.set("v.communitySelfRegisterUrl", helper.getCommunitySelfRegisterUrl(component, event, helper));
        var usernames=component.find("username");
        var pass = component.find("password");
        usernames.set("v.value",helper.readCookie("username"));
        pass.set("v.value",helper.readCookie("Password"));
        console.log("retrived username===>",helper.readCookie("username"));
        

    },
    
    handleLogin: function (component, event, helpler) {
        helpler.handleLogin(component, event, helpler);
        console.log("checked===>",component.find("checker").get("v.checked"));
        if(component.find("checker").get("v.checked")==true){
            console.log("true called");
            helpler.newCookie("username",component.find("username").get("v.value"));     // add a new cookie as shown at left for every
            helpler.newCookie("Password",component.find("password").get("v.value"));
        }
    },
    /*onCheck: function(component,event,helpler){
        var checkCmp = component.find("checker");
        console.log('checkbox=>',checkCmp.get("v.checked"));
        component.set("v.checkval",checkCmp.get("v.checked"));
    },*/
    
    
    setStartUrl: function (component, event, helpler) {
        var startUrl = event.getParam('startURL');
        console.log('startURL==>',startUrl);
        if(startUrl) {
            component.set("v.startUrl", startUrl);
        }
    },
    
    setExpId: function (component, event, helper) {
        var expId = event.getParam('expid');
        if (expId) {
            component.set("v.expid", expId);
        }
        helper.setBrandingCookie(component, event, helper);
    },
    
    onKeyUp: function(component, event, helpler){
        //checks for "enter" key
        if (event.getParam('keyCode')===13) {
            helpler.handleLogin(component, event, helpler);
        }
    },
    
    navigateToForgotPassword: function(cmp, event, helper) {
        var forgotPwdUrl = cmp.get("v.communityForgotPasswordUrl");
        if ($A.util.isUndefinedOrNull(forgotPwdUrl)) {
            forgotPwdUrl = cmp.get("v.forgotPasswordUrl");
        }
        var startUrl = cmp.get("v.startUrl");
        if(startUrl){
            if(forgotPwdUrl.indexOf("?") === -1) {
                forgotPwdUrl = forgotPwdUrl + '?startURL=' + decodeURIComponent(startUrl);
            } else {
                forgotPwdUrl = forgotPwdUrl + '&startURL=' + decodeURIComponent(startUrl);
            }
        }
        var attributes = { url: forgotPwdUrl };
        $A.get("e.force:navigateToURL").setParams(attributes).fire();
    },
    
    navigateToSelfRegister: function(cmp, event, helper) {
        var selfRegUrl = cmp.get("v.communitySelfRegisterUrl");
        if (selfRegUrl == null) {
            selfRegUrl = cmp.get("v.selfRegisterUrl");
        }
        var startUrl = cmp.get("v.startUrl");
        if(startUrl){
            if(selfRegUrl.indexOf("?") === -1) {
                selfRegUrl = selfRegUrl + '?startURL=' + decodeURIComponent(startUrl);
            } else {
                selfRegUrl = selfRegUrl + '&startURL=' + decodeURIComponent(startUrl);
            }
        }
        var attributes = { url: selfRegUrl };
        $A.get("e.force:navigateToURL").setParams(attributes).fire();
    } 
})