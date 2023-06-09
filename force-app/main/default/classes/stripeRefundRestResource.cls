@RestResource(urlMapping='/refund')





global with sharing class stripeRefundRestResource {
    
      
     @HttpPost
    global static void refund(){
          RestRequest req=Restcontext.request;
        Restresponse res =Restcontext.response;
        String parsebody=req.requestbody.tostring();
        JSONParser Par=JSON.createParser(parsebody);
        system.debug(parsebody);
                Map<String,Object> jsonbody=(Map<String,Object>)Json.deserializeUntyped(parsebody);
                        Map<String,Object> map1=(Map<String,Object>)(jsonbody.get('data'));
                                 Map<String,Object> map2=(Map<String,Object>)(map1.get('object'));


        string payment_inte=(string)map2.get('payment_intent');

         
        
        
     Stripe_Logs__c lg =new Stripe_Logs__c(Logs__c=parsebody );
        
        insert lg;
        try {
            
      stripeIntegrationHepler.CreatePay(payment_inte);
} catch(Exception e) {
         

    System.debug('The following exception has occurred: ' + e.getMessage());
}
        
      
        
        
    }
    
    
    
    
    
}