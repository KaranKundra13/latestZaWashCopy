@IsTest(SeeAllData = true)
public with sharing class LightningLoginFormControllerTest {

 @IsTest
 static void LightningLoginFormControllerInstantiation() {
  LightningLoginFormController controller = new LightningLoginFormController();
  System.assertNotEquals(controller, null);
 }

 @IsTest
 static void testIsUsernamePasswordEnabled() {
  System.assertEquals(true, LightningLoginFormController.getIsUsernamePasswordEnabled());
 }

 @IsTest
 static void testIsSelfRegistrationEnabled() {
  System.assertEquals(false, LightningLoginFormController.getIsSelfRegistrationEnabled());
 }

 @IsTest
 static void testGetSelfRegistrationURL() {
  System.assertEquals(null, LightningLoginFormController.getSelfRegistrationUrl());
 }

 @IsTest
 static void testAuthConfig() {
  Auth.AuthConfiguration authConfig = LightningLoginFormController.getAuthConfig();
  System.assertNotEquals(null, authConfig);
 }
    
     @IsTest
 static void mymethod() {
       LightningLoginFormController.setExperienceId(null);
       LightningLoginFormController.setExperienceId('null1');
     LightningLoginFormController.getForgotPasswordUrl();
       LightningLoginFormController.login('test','test','test','fr');



 }
       @IsTest
 static void mymethod2() {
              System.assertEquals('Saisissez une valeur dans le champ Nom d\'utilisateur.',LightningLoginFormController.login(null,'test','test','fr'));
                  System.assertEquals('Saisissez une valeur dans le champ Mot de passe.',LightningLoginFormController.login('test',null,'test','fr'));





 }
}