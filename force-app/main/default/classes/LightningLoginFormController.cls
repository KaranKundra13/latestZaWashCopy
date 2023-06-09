global class LightningLoginFormController {
    
    public LightningLoginFormController() {
        
    }
    
    @AuraEnabled
    public static String login(String username, String password, String startUrl,string language) {
        try{
                 if (username == null || String.isEmpty(username)) {
                CalloutException e = new CalloutException();
    e.setMessage('Enter a value in the User Name field.');
    throw e;
            }
            
            if (password == null || String.isEmpty(password)) {
                   CalloutException e = new CalloutException();
    e.setMessage('Enter a value in the Password field.');
    throw e;
            }
            ApexPages.PageReference lgn = Site.login(username, password, startUrl);
            aura.redirect(lgn);
            return null;
        }
        catch (Exception ex) {
            if(language=='en_US'){
                return ex.getMessage();  
            }
            else if(language=='fr'){
                if(ex.getMessage()=='Enter a value in the User Name field.'){
                    return 'Saisissez une valeur dans le champ Nom d\'utilisateur.';
                }
                else if(ex.getMessage()=='Enter a value in the Password field.'){
                    return 'Saisissez une valeur dans le champ Mot de passe.';
                }
                else{
                    return 'Votre tentative de connexion a échoué. Assurez-vous que le nom d\'utilisateur et le mot de passe sont corrects.';
                }
                
            }else{
                if(ex.getMessage()=='Enter a value in the User Name field.'){
                    return 'Geben Sie einen Wert in das Feld Benutzername ein.';
                }
                else if(ex.getMessage()=='Enter a value in the Password field.'){
                    return 'Geben Sie einen Wert in das Feld Kennwort ein.';
                }
                else{
                    return 'Ihr Anmeldeversuch ist fehlgeschlagen. Stellen Sie sicher, dass der Benutzername und das Passwort korrekt sind.';
                }
                
                
            }
                      
        }
    }
    
    @AuraEnabled
    public static Boolean getIsUsernamePasswordEnabled() {
        Auth.AuthConfiguration authConfig = getAuthConfig();
        return authConfig.getUsernamePasswordEnabled();
    }
    
    @AuraEnabled
    public static Boolean getIsSelfRegistrationEnabled() {
        Auth.AuthConfiguration authConfig = getAuthConfig();
        return authConfig.getSelfRegistrationEnabled();
    }
    
    @AuraEnabled
    public static String getSelfRegistrationUrl() {
        Auth.AuthConfiguration authConfig = getAuthConfig();
        if (authConfig.getSelfRegistrationEnabled()) {
            return authConfig.getSelfRegistrationUrl();
        }
        return null;
    }
    
    @AuraEnabled
    public static String getForgotPasswordUrl() {
        Auth.AuthConfiguration authConfig = getAuthConfig();
        return authConfig.getForgotPasswordUrl();
    }
    
    @TestVisible
    private static Auth.AuthConfiguration getAuthConfig(){
        Id networkId = Network.getNetworkId();
        Auth.AuthConfiguration authConfig = new Auth.AuthConfiguration(networkId,'');
        return authConfig;
    }
    
    @AuraEnabled
    global static String setExperienceId(String expId) {
        // Return null if there is no error, else it will return the error message 
        try {
            if (expId != null) {
                Site.setExperienceId(expId);
            }
            return null; 
        } catch (Exception ex) {
            return ex.getMessage();            
        }
    }   
}