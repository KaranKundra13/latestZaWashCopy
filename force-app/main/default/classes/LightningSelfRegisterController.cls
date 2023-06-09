global without sharing class LightningSelfRegisterController {

    public LightningSelfRegisterController() {

    }

    @TestVisible 
    private static boolean isValidPassword(String password, String confirmPassword) {
        return password == confirmPassword;
    }
    
    @TestVisible 
    private static boolean siteAsContainerEnabled(String communityUrl) {
        Auth.AuthConfiguration authConfig = new Auth.AuthConfiguration(communityUrl,'');
        return authConfig.isCommunityUsingSiteAsContainer();
    }
    
    @TestVisible 
    private static void validatePassword(User u, String password, String confirmPassword) {
        if(!Test.isRunningTest()) {
        Site.validatePassword(u, password, confirmPassword);
        }
        return;
    }
    
    @AuraEnabled
    public static String selfRegister(String firstname ,String lastname, String email, String password, String confirmPassword, String accountId, String regConfirmUrl, String extraFields, String startUrl, Boolean includePassword,string language) {
        Savepoint sp = null;
        try {
            sp = Database.setSavepoint();
            
            if (lastname == null || String.isEmpty(lastname)) {
                CalloutException e = new CalloutException();
    e.setMessage('Last name is required.');
    throw e;
            }
            
            if (email == null || String.isEmpty(email)) {
                   CalloutException e = new CalloutException();
    e.setMessage('Email address is required.');
    throw e;
            }
            
            User u = new User();
            u.Username = email;
            u.put('Email',email);
            
            u.FirstName = firstname;
            u.LastName = lastname;
            
            String networkId = Network.getNetworkId();

            // If using site to host the community the user should not hit s1 after logging in from mobile.
            if(networkId != null && siteAsContainerEnabled(Network.getLoginUrl(networkId))) {
                u.put('UserPreferencesHideS1BrowserUI',true);
            }
            
            String nickname = ((firstname != null && firstname.length() > 0) ? firstname.substring(0,1) : '' ) + lastname.substring(0,1);
            nickname += String.valueOf(Crypto.getRandomInteger()).substring(1,7);
            u.put('CommunityNickname', nickname);
                     
            if (extraFields != null) {
                List<Object> extraFieldsList = (List<Object>) JSON.deserializeUntyped(extraFields);        
                for (Object thisFieldObject : extraFieldsList) {
                    Map<String,Object> thisField = (Map<String,Object>) thisFieldObject;
                    Schema.SObjectField sof = Schema.SObjectType.User.fields.getMap().get((String) thisField.get('fieldPath'));
                    //punee
                    System.debug('==============');
                    System.debug(sof);
                    System.debug( thisField.get('fieldPath'));
                    System.debug(thisField.get('value'));
                   u.put(sof, thisField.get('fieldPath'));
                }
            }
                        
            if (includePassword) {    
                if (!isValidPassword(password, confirmPassword)) {
                        CalloutException e = new CalloutException();
    e.setMessage('Passwords did not match.');
    throw e;
                }
             validatePassword(u, password, confirmPassword);
            }
            else {
                password = null;
            }
            
            // lastName is a required field on user, but if it isn't specified, we'll default it to the username
            String userId = Site.createPortalUser(u, accountId, password);
            // create a fake userId for test.
            if (Test.isRunningTest()) {
                userId = 'fakeUserId';           
            }
            if (userId != null) { 
                if (password != null && password.length() > 1) {
                    zawashHelperClass.methodSetAllRecords(email,userId);
                    ApexPages.PageReference lgn = Site.login(email, password, startUrl);
                    if(!Test.isRunningTest()) {
                     aura.redirect(lgn);
                    }
                }
                else {
                    ApexPages.PageReference confirmRef = new PageReference(regConfirmUrl);
                    if(!Test.isRunningTest()) {
                    aura.redirect(confirmRef);
                   }

                }
            }
            return null;
        }
        catch (Exception ex) {
            Database.rollback(sp);
            system.debug(ex.getMessage());
            if(language=='fr'){
                if(ex.getMessage()=='Last name is required.'){
                    return 'Le nom de famille est requis.';
                }
                else if(ex.getMessage()=='Email address is required.'){
                    return 'Adresse e-mail est nécessaire.';
                }
                else if(ex.getMessage()=='Your password cannot be null.'){
                    return 'Votre mot de passe ne peut pas être nul.';
                }
                else if(ex.getMessage()=='Passwords did not match.'){
                    return 'Les mots de passe ne correspondent pas.';
                }
                else if(ex.getMessage()=='Your password must be at least 8 characters long.'){
                    return 'Votre mot de passe doit comporter au moins 8 caractères.';
                }
                else if(ex.getMessage()=='Your password must include letters and numbers.'){
                    return 'Votre mot de passe doit contenir des lettres et des chiffres.';
                }
                else{
                    return 'Adresse e-mail invalide';
                }
            }
            else if(language=='de_CH'){
                if(ex.getMessage()=='Last name is required.'){
                    return 'Nachname ist erforderlich.';
                }
                else if(ex.getMessage()=='Email address is required.'){
                    return 'E-Mailadresse wird benötigt.';
                }
                else if(ex.getMessage()=='Your password cannot be null.'){
                    return 'Ihr Passwort darf nicht null sein.';
                }
                else if(ex.getMessage()=='Passwords did not match.'){
                    return 'Die Passwörter stimmen nicht überein.';
                }
                else if(ex.getMessage()=='Your password must be at least 8 characters long.'){
                    return 'Ihr Passwort muss mindestens 8 Zeichen lang sein.';
                }
                else if(ex.getMessage()=='Your password must include letters and numbers.'){
                    return 'Ihr Passwort muss Buchstaben und Zahlen enthalten.';
                }
                else{
                    return 'Ungültige E-Mail-Adresse';
                }
            }
            else{
                return ex.getMessage();
            }
                        
        }
    }
    
    @AuraEnabled
    public static List<Map<String,Object>> getExtraFields(String extraFieldsFieldSet) { 
        List<Map<String,Object>> extraFields = new List<Map<String,Object>>();
        Schema.FieldSet fieldSet = Schema.SObjectType.User.fieldSets.getMap().get(extraFieldsFieldSet);
        system.debug(fieldSet);
        if(!Test.isRunningTest()) {
        if (fieldSet != null) {
            for (Schema.FieldSetMember f : fieldSet.getFields()) {
                Map<String, Object> fieldDetail = new Map<String, Object>();
                fieldDetail.put('dbRequired', f.getDBRequired());
                fieldDetail.put('fieldPath', f.getFieldPath());
                fieldDetail.put('label', f.getLabel());
                fieldDetail.put('required', f.getRequired());
                fieldDetail.put('type', f.getType());
                fieldDetail.put('value', '');   // client will populate
                extraFields.add(fieldDetail);
            }}}
        system.debug(extraFields);
        return extraFields;
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