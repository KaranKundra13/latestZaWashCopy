/**
 * An apex page controller that takes the user to the right start page based on credentials or lack thereof
 */
public with sharing class CommunitiesLandingController {
    
    // Code we will invoke on page load.
    public PageReference forwardToStartPage() {
   string communityUrl = 'https://zawash.my.site.com/zaWash/s/customer-booking'; //URL of new page
     return new PageReference(communityUrl);   
       // return Network.communitiesLanding();
    }
    
    public CommunitiesLandingController() {}
}