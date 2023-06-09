@RestResource(urlMapping='/invoice')


global without sharing class stripeIntegrationRestResources {
    
      
     @HttpPost
    global static void invoice(){
          RestRequest req=Restcontext.request;
        Restresponse res =Restcontext.response;
        String parsebody=req.requestbody.tostring();
        JSONParser Par=JSON.createParser(parsebody);
        system.debug(parsebody);
                Map<String,Object> jsonbody=(Map<String,Object>)Json.deserializeUntyped(parsebody);
                        Map<String,Object> map1=(Map<String,Object>)(jsonbody.get('data'));
                                 Map<String,Object> map2=(Map<String,Object>)(map1.get('object'));


        string subscriptionId=(string)map2.get('subscription');

         string subtotal=(string)map2.get('subtotal');
        
        
     Stripe_Logs__c lg =new Stripe_Logs__c(Logs__c=parsebody+subscriptionId );
        
        insert lg;
        try {
            
            stripeIntegrationHepler.CreateInvoice(subscriptionId,subtotal);

} catch(Exception e) {
         

    System.debug('The following exception has occurred: ' + e.getMessage());
}
        
      
        
        
    }
    
    
    
    
    
}