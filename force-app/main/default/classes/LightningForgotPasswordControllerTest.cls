@IsTest(SeeAllData = true)
public with sharing class LightningForgotPasswordControllerTest {

 /* Verifies that ForgotPasswordController handles invalid usernames appropriately */
 @IsTest
 static void testLightningForgotPasswordControllerInvalidUserName() {

 System.assertEquals(LightningForgotPasswordController.forgotPassword('fakeUser', 'http://a.com','fr'), Label.Site.invalid_email);
  System.assertEquals(LightningForgotPasswordController.forgotPassword(null, 'http://a.com','fr'), Label.Site.invalid_email);
  System.assertEquals(LightningForgotPasswordController.forgotPassword('a', '/home/home.jsp','fr'), Label.Site.invalid_email);
 
 }

 /* Verifies that null checkEmailRef url throws proper exception. */
 @IsTest
 static void testLightningForgotPasswordControllerWithNullCheckEmailRef() {
  System.assertEquals(LightningForgotPasswordController.forgotPassword('a', null,'english'), 'Argument 1 cannot be null');
  System.assertEquals(LightningForgotPasswordController.forgotPassword('a@salesforce.com', null,'fr'), 'Adresse e-mail invalide');

 }

 /* Verifies that LightningForgotPasswordController object is instantiated correctly. */
 @IsTest
 static void LightningForgotPasswordControllerInstantiation() {
  LightningForgotPasswordController controller = new LightningForgotPasswordController();
  System.assertNotEquals(controller, null);
 }
    
     @IsTest
 static void mymethod() {
     LightningForgotPasswordController.setExperienceId(null);
          LightningForgotPasswordController.setExperienceId('null1');

            System.assertEquals( 'Ungültige E-Mail-Adresse',LightningForgotPasswordController.forgotPassword('a@salesforce.com', null,'de_CH'));


             // System.assertEquals(LightningForgotPasswordController.forgotPassword(null, 'http://a.com','de_CH'), Label.Site.invalid_email);
       //System.assertEquals(LightningForgotPasswordController.forgotPassword(null, 'http://a.com','english'), Label.Site.invalid_email);


 }
}