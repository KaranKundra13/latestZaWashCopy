public without sharing  class stripeIntegrationHepler {
    public static Boolean hasRunOnce = false;

    
      @AuraEnabled

	
    public static string createPayment(string paymentId,string customerID,string status,string amount,string odooCustomerId,string workorderId,string methodToggle,string serviceAppointmentId,string Qwantity,string currentCurrency){
        Transactions__c trans =new Transactions__c();
        trans.Payment_Id__c=paymentId;
       
        system.debug('workorderId====>'+workorderId);
        workorder wo=[Select QuoteCreated__c, Transaction__c,id from workorder where id =:workorderId limit 1];
        
         Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        serviceappointment SA=[select Payment_Status__c,Transaction__c from serviceappointment where id=:serviceAppointmentId];
        SA.Payment_Status__c='Paid';
        
        
      //  sobject so;
        
           
            list<account> so=[Select name ,odooCustomerId__c,email__c from account where customerId__c=:customerID limit 1];
        if(so.size()>0){
            trans.Account__c=so[0].id;  
             trans.Payment_Status__c='Paid';
        }
        else{
              if(methodToggle=='link'){
            trans.Payment_Status__c='In Progress';
                  trans.paymentMethod__c='Iban';
                  sa.Payment_Method__c='Cash';
                  
        }else{
                        trans.Payment_Status__c='Paid';
                              trans.paymentMethod__c='Stripe';
                              sa.Payment_Method__c='Card';


        }
                        so=[Select name ,odooCustomerId__c,email__c from account where id=:customerID limit 1];
                        trans.Account__c=so[0].id;
        }
             
        list<string> amountdivide=amount.split('');
        if(amountdivide.contains('.')){
                    trans.amount__c=decimal.valueof(amount);
            trans.Payment_Type__c='Cash';

        }else{
                    trans.amount__c=decimal.valueof(amount)/100;
            trans.Payment_Type__c='Simple Payment';

        }
     
    trans.Qwantity__c=Qwantity;
      
      sa.Payment_Date__c=date.today();
        trans.odooCustomerId__c=integer.valueof(odooCustomerId);
        insert trans;
        wo.Transaction__c=trans.id;
        wo.Transaction_Or_Subscription_Id__c=trans.id;
        wo.QuoteCreated__c = True;
        sa.Currency__c=currentCurrency;
        update wo;
        
        sa.transaction__c=trans.id;
            update SA;
        system.debug('done');	
        return trans.id;
    }

    
    
    
    @future(callout=true)
    public static void createStripeCoupon(  list<string>couponId, list<string> couponIdscountries){
            
        //list<opportunity> opps=(List<opportunity>)Json.deserialize(jsonString,List<opportunity>.class);
        list<Discount_Coupons__c> coupons=[Select Expiry_Date__c,Discount_Type__c,Coupon_For_which_Stripe_Account__c, Stripe_Coupon_Id__c, Coupon_Validate_for_months__c,name,Coupon_Off__c ,Redemption_Limit_of_Coupon__c from Discount_Coupons__c where id in:couponId ];
        list<Discount_Coupons__c> updateCoupons=new list<Discount_Coupons__c>();
       list<Stripe_Api_Keys__c> apikey=[Select Country__c,Api_Key__c from  Stripe_Api_Keys__c where Country__c in:couponIdscountries];
        map<string,string> countrywithkeys=new map<string,string>();

        for(Stripe_Api_Keys__c sk:apikey){
            countrywithkeys.put(sk.Country__c,sk.Api_Key__c);
        }
      


Http http = new Http();

HttpRequest request = new HttpRequest();

request.setMethod('POST'); 

request.setEndpoint('https://api.stripe.com/v1/coupons');

        HttpResponse response = new HttpResponse();
        for(integer i=0;i<coupons.size();i++){
            String discountType='percent_off';
            String body = '';
            Long unixTimestamp = coupons[i].Expiry_Date__c.getTime() / 1000;
            body = 'name='+coupons[i].name+'&duration_in_months='+coupons[i].Coupon_Validate_for_months__c+'&'+discountType+'='+coupons[i].Coupon_Off__c+'&duration=repeating&redeem_by='+unixTimestamp;
            if(coupons[i].Discount_Type__c=='Fixed Amount'){
                discountType='amount_off';
                String curr ='CHF';
                if(coupons[i].Coupon_For_which_Stripe_Account__c=='France'){
                    curr='EUR';
                }
                body = 'currency='+curr+'&name='+coupons[i].name+'&duration_in_months='+coupons[i].Coupon_Validate_for_months__c+'&'+discountType+'='+coupons[i].Coupon_Off__c+'&duration=repeating&redeem_by='+unixTimestamp;
            }
           String accessToken =  countrywithkeys.get(coupons[i].Coupon_For_which_Stripe_Account__c);
             //   'sk_test_FaMZfep2Ay2Tiy5l5v8hI0hO00CcVk6OwP';
            request.setHeader('Content-Type','application/x-www-form-urlencoded');    request.setHeader('Authorization','Bearer '+accessToken );

            if(coupons[i].Stripe_Coupon_Id__c!=null){
                request.setEndpoint('https://api.stripe.com/v1/coupons?coupon='+coupons[i].Stripe_Coupon_Id__c)   ;             
           }
          request.setBody(body);
            response = http.send(request);
            String responseBody = response.getBody();
system.debug(responseBody);
if(coupons[i].Stripe_Coupon_Id__c==null){
             map<string,object> map1=(map<string,object>)JSON.deserializeUntyped(responseBody);
string s=(string)map1.get('id');
        system.debug(s);
            Discount_Coupons__c updateCoupon=new Discount_Coupons__c(id=coupons[i].id);
            updateCoupon.Stripe_Coupon_Id__c=s;
            updateCoupons.add(updateCoupon);
}
 
            
        }

        hasRunOnce = true;
 update updateCoupons;
    }
    
    
    @future
    public static void CreatePay(String payment_inte){
        try
        {
Transactions__c trans =[select name,Payment_Status__c from Transactions__c where Payment_Id__c=:payment_inte limit 1];
serviceappointment sa=[Select Payment_Status__c, Status from serviceappointment where Transaction__c=:trans.id];
 sa.status='Canceled';
 sa.Payment_Status__c='Refund';


            trans.Payment_Status__c='Refund';
            update trans;
            update sa;
        }
        catch(Exception e ){
            system.debug(e);
        }
    }
    
    @AuraEnabled
    public static string createSubscription(String subId,string accId,string workorderId,string amount,string months,string invoicedate,string serviceAppointmentId,string Qwantity,string currentCurrency){
                     
       // String dateString = invoicedate;
   Date date1 = Date.valueOf(invoicedate);
       

        Subscription_Info__c subInfo= new Subscription_Info__c(Subscription_Id__c=subId,Account__c=accId,Total_Amount__c=amount,Next_Invoice_Date__c=date1,Subscription_Months__c=months);
            insert subInfo;
           
              workorder wo=[Select Transaction__c,Transaction_Or_Subscription_Id__c,id from workorder where id =:workorderId limit 1];
          wo.Transaction_Or_Subscription_Id__c=subId;
          serviceappointment SA=[select Payment_Status__c,Transaction__c from serviceappointment where id=:serviceAppointmentId];
          SA.Payment_Status__c='Paid';

          sa.Currency__c=currentCurrency;
          sa.Payment_Method__c='Card';
            update wo;
            update sa;
         return 'Success';
        }
    
     @future
    public static void CreateInvoice(String subscriptionId,string amount ){
        try{
         
        
Subscription_Info__c subscription =[select name,Subscription_Id__c,id,total_amount__c from Subscription_Info__c where Subscription_Id__c=:subscriptionId limit 1];
        
        Transactions__c transactio=new Transactions__c( Subscription_Info__c =subscription.id,Payment_Type__c='Invoice',Payment_Status__c='Paid',amount__c=decimal.valueof(subscription.total_amount__c));
            insert  transactio;
        }
        catch(Exception E){
            system.debug(E);
        }
    }
    
    @AuraEnabled
    public static Stripe_Key__c ApiKey(string country,string servicename,string curren)
    {
       Stripe_Key__c sK=[Select value__c,Price_key__c from Stripe_Key__c where  Product_Name__c =:servicename and Currency__c=:curren limit 1];
        system.debug(sK.value__c);
       return sk;
    }
    
    
       @AuraEnabled
    public static sobject customer(string i)
    {
        system.debug(i);
        Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io =(id)i;
        system.debug('io.getSobjectType==>>'+io.getSobjectType());
        system.debug('LeadObject==>>'+LeadObject);
        if(io.getSobjectType()==LeadObject){
     lead l =[select name ,email from lead where  id =:i limit 1];
            return l;
        }
        else{
            account  a =[Select name ,email__c from account where id=:i limit 1];
            return a;
        }
      
    }
    
       @AuraEnabled
    public static sobject updateLead(string i, string io){
          Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io2 =(id)i;
        if(io2.getSobjectType()==LeadObject){
     lead l =[select lastname ,email,customerId__c from lead where  id =:i limit 1];
            l.customerId__c=io;
            update l;
            return l;
        }
        else{
            account  a =[Select lastname ,email__c,customerId__c from account where id=:i limit 1];
             a.customerId__c=io;
            update a;
            return a;
        }
      
       
    }
      @AuraEnabled
    public static   List<Map<String,Object>>  addSubscriptionLineItems(string country,List<Map<String,Object>>  listOfAddOns,string curren)
    {
      
        List<Map<String,Object>> adddonswithprices =new  List<Map<String,Object>>();
        list<string> addonsName=new list<string>();
        for(integer i=0;i<listOfAddOns.size();i++){
            addonsName.add((string)listOfAddOns[i].get('Name'));
        }
     list<Stripe_Key__c> sK=[Select value__c,Price_key__c from Stripe_Key__c where Country__c=:country and Product_Name__c in: addonsName and Currency__c=:curren ];
        for(integer i=0;i<sk.size();i++){
            Map<String,Object> mod=new Map<String,Object>();
            mod.put('price',sk[i].Price_key__c);
            mod.put('quantity',listOfAddOns[i].get('Quantity__c'));
            adddonswithprices.add(mod);
        }
        
       return adddonswithprices;
    }
    
@AuraEnabled
    public static Stripe_Key__c CountryKey(string country)
    {
       Stripe_Key__c sK=[Select value__c,Price_key__c from Stripe_Key__c where Country__c=:country limit 1 ];
        system.debug(sK.value__c);
       return sk;
    }
   
    @AuraEnabled
    public static serviceappointment selectPaymentMethod(string SAid)
    {
        system.debug(SAid);
        serviceappointment sa=[select id,Address,Total_Price__c, ParentRecordId from serviceappointment where id=:SAid];
        system.debug(sa.Total_Price__c);
  //      workorder wo=[select LeadId__c from workorder where id=:sa.ParentRecordId];
      
   //   lead l=[select name,email  from lead where id =:wo.LeadId__c];
      return sa;
    }
    
    @AuraEnabled
    public static Id selectLeadId(string SAid)
    {
        system.debug(SAid);
        serviceappointment sa=[select id,accountId,Address,Total_Price__c, ParentRecordId from serviceappointment where id=:SAid];
       workorder wo=[select LeadId__c from workorder where id=:sa.ParentRecordId];
      account acc=[select name,email__c  from account where id =:sa.accountId];
      //lead l=[select name,email  from lead where id =:wo.LeadId__c];
      return acc.id;
    }
   
   @AuraEnabled
    public static map<string,string> getServiceAppointment(string SAid,string language)
    {
         string query = 'select Name , '+ language +'__c from Translation__c';
         system.debug(query);
        list<Translation__c> labels = database.query(query);
        Map<String, String> labelsTranslated = new Map<String, String>();
        for(Translation__c transl : labels) {
            labelsTranslated.put(transl.Name, (String)transl.get(language + '__c'));
        }
        system.debug(labels);
        
        map<string,string> map1 = new map<string,string>();
        system.debug(SAid);
        serviceappointment sa=[select Payment_Status__c,currency__c,WorkTypeId,account.name, id,Status,SchedStartTime,Car_plate__c,Car_brand_and_model__c,Address,Total_Price__c, ParentRecordId from serviceappointment where id=:SAid];
        worktype wt=[select name,icon__c from worktype where id =:sa.WorkTypeId];
        
        AssignedResource ar= [select id,ServiceResource.name  from AssignedResource where ServiceAppointmentId=:sa.id ];
        //workorder wo=[select LeadId__c from workorder where id=:sa.ParentRecordId];
        //
        
        Map<String, String> fieldMap = new Map<String, String>{
            'Customer_Name' =>sa.account.name,
            'Status' => sa.Status,
            'serviceDate' => string.valueOf(sa.SchedStartTime),
            'TypeOfService' => wt.name,
            'carPlate' => sa.Car_plate__c,
            'carModel' => sa.Car_brand_and_model__c,
            'carWasher' => ar.ServiceResource.name,
            'payment_status'=>sa.Payment_Status__c
		};
        
        
        
        map1.put('icon',wt.icon__c);
        for(String field : fieldMap.keySet()) {
            map1.put(labelsTranslated.get(field), fieldMap.get(field));
        }
        //map1.put('Customer Name',sa.account.name);
        //map1.put('Status',sa.Status);
        //map1.put('Service Date',string.valueOf(sa.SchedStartTime));
        //map1.put('Type of Service',wt.name);
        
        
        
        //map1.put('Car Plate',sa.Car_plate__c);
        //map1.put('Car Model',sa.Car_brand_and_model__c); 
        //map1.put('Car Washer',ar.ServiceResource.name);
        //lead l=[select name,email  from lead where id =:wo.LeadId__c];
        
        return map1;
    }
      @AuraEnabled
    public static Attachment viewInvoice(string serviceAppointmentId ){
                serviceappointment SA=[select Payment_Status__c,Transaction__c from serviceappointment where id=:serviceAppointmentId];

//             Transactions__c t=[Select amount__c,Qwantity__c ,odooCustomerId__c from Transactions__c where id=:SA.Transaction__c];
// ContentDocumentLink cdl = [Select id, ContentDocumentId,ContentDocument.title, ContentDocument.LatestPublishedVersionId from ContentDocumentLink where LinkedEntityId =:t.id  limit 1];
//         ContentVersion cv=[select id from ContentVersion where ContentDocumentId=:cdl.ContentDocumentId];
//                 system.debug(cv);

//        ContentDistribution cd=[Select DistributionPublicUrl from ContentDistribution where ContentVersionId=:cv.id limit 1];
//         system.debug(cd);
//         return cd;
list<Attachment> invoiceAttachments = [SELECT Id, Name, Body, ParentId FROM Attachment WHERE Name LIKE 'Invoice%' and ParentId=:serviceAppointmentId limit 1 ];
if(invoiceAttachments.size()>0){
    return invoiceAttachments[0];
}
else{
    return null;
}

 
    }
    
    
        
    @AuraEnabled
    public static list<string>  getCouponCode(string coupon,list<string> servicename,string accountId ,string currenc,string amount,string updating,string serviceAppointmentId, string country){
        list<Discount_Coupons__c> couponToReturn=new list<Discount_Coupons__c>();
        list<Discount_Coupons__c> coupons=new list<Discount_Coupons__c>();
        if(servicename.size()==1){ 
            couponToReturn=[Select Discount_Type__c,One_user_can_use_coupon_multiple_times__c, Remaining_Coupon_Code_Limit__c, Coupon_For_which_Stripe_Account__c, Stripe_Coupon_Id__c, Coupon_Validate_for_months__c,name,Coupon_Off__c ,Redemption_Limit_of_Coupon__c from Discount_Coupons__c where   (name =:coupon and Applies_to__c includes(:servicename[servicename.size()-1])  and Coupon_For_which_Stripe_Account__c=:country) OR (name =:coupon  and Applies_to__c includes('All') and Coupon_For_which_Stripe_Account__c=:country)];
            for(Discount_Coupons__c dc: couponToReturn ){
                coupons.add(dc);
            }
        }else{
            // list<string> addonsnames=servicename.clone();
            set<string> addonsnames=new Set<String>(servicename.clone());
            addonsnames.remove(servicename[servicename.size()-1]);
            String rolesAsString = '(\'' + String.join(new List<String>(addonsnames), '\', \'') + '\')';

             
            couponToReturn=[Select AddonsRelatedTotheService__c,Discount_Type__c,One_user_can_use_coupon_multiple_times__c, Remaining_Coupon_Code_Limit__c, Coupon_For_which_Stripe_Account__c, Stripe_Coupon_Id__c, Coupon_Validate_for_months__c,name,Coupon_Off__c ,Redemption_Limit_of_Coupon__c from Discount_Coupons__c where   (name =:coupon and Applies_to__c includes(:servicename[servicename.size()-1]) and Coupon_For_which_Stripe_Account__c=:country) OR (name =:coupon  and Applies_to__c includes('All') and Coupon_For_which_Stripe_Account__c=:country)];
           // system.debug(so);

            //couponToReturn=database.query(so); 
            for(Discount_Coupons__c dc: couponToReturn ){
                if(dc.AddonsRelatedTotheService__c==null||String.isBlank(dc.AddonsRelatedTotheService__c)||addonsnames.containsAll(dc.AddonsRelatedTotheService__c.split(';'))){
                    coupons.add(dc);
                }
            
        }
        // for(Discount_Coupons__c dc: couponToReturn ){
        //     coupons.add(dc);
        // }
    }
        if(coupons.size()>0){
        if(integer.valueof(coupons[0].Remaining_Coupon_Code_Limit__c)>=1||coupons[0].Remaining_Coupon_Code_Limit__c==null){
            if(coupons[0].One_user_can_use_coupon_multiple_times__c=='No'){
                list<Coupons_Used_by_Customers__c> cd=[Select id from Coupons_Used_by_Customers__c where Account__c=:accountId];
                if(cd.size()>=1){
                    return null;
                }
            }



            list<workType> worktypes=[Select Price__c from workType where English__c =:servicename[servicename.size()-1] and Currency__c =:currenc] ;
            // decimal addonsamount=decimal.valueof(amount)-worktypes[0].Price__c;
            decimal discountAmount;
              decimal discountedPrice;
            if(coupons[0].Discount_Type__c=='Fixed Amount'){
                  discountAmount =  decimal.valueof(coupons[0].Coupon_Off__c);
   discountedPrice = (decimal.valueof(amount)  - decimal.valueof(coupons[0].Coupon_Off__c)).setScale(2);
            }
            else{
             discountAmount =  (decimal.valueof(amount) * (decimal.valueof(coupons[0].Coupon_Off__c) / 100)).setScale(2);
   discountedPrice = (decimal.valueof(amount) - discountAmount). setScale(2);
            }
                   string totalPricewithdiscount=string.valueof((discountedPrice).setScale(2));
           
        if(updating=='updating'){
            

        }
        if(decimal.valueof(totalPricewithdiscount)<=0){
            totalPricewithdiscount='0';
        }
                return new list<string>{coupons[0].id,totalPricewithdiscount,string.valueof(discountAmount),coupons[0].Stripe_Coupon_Id__c};
        }
        else{
            return null;
        }
    }else{
        return null;
    }

        
    }
    
    @AuraEnabled
    public static list<Discount_Coupons__c>  getCouponCodesForUI(list<string> servicenames ,string country){
        // String query = 'Select Expiry_Date__c , Discount_Type__c,One_user_can_use_coupon_multiple_times__c, Remaining_Coupon_Code_Limit__c, Coupon_For_which_Stripe_Account__c, Stripe_Coupon_Id__c, Coupon_Validate_for_months__c,name,Coupon_Off__c ,Redemption_Limit_of_Coupon__c from Discount_Coupons__c where ';
        // if(servicenames.size() > 0)
        // {
        //     query = query + '(';
        //     integer count = 0;
        //     for(String service : servicenames)
        //     {
        //         if(count == 0)
        //         {
        //             query = query + ' Applies_to__c  includes(\'' + service + '\')';
        //         }
        //         else
        //         {
        //             query = query + ' OR Applies_to__c  includes(\''+service+'\')';
        //         }
        //         count++;
        //     }
        //     query = query + ' OR Applies_to__c  includes(\'All\'))';
        // }
        datetime d=system.now();
        String formatedDt = d.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');

        set<string> addonsnames=new Set<String>(servicenames.clone());
        addonsnames.remove(servicenames[servicenames.size()-1]);
        string so;
        if(addonsnames.size()>0){
            String rolesAsString = '(\'' + String.join(new List<String>(addonsnames), '\', \'') + '\')';
         
            list<Discount_Coupons__c> coupons  =[Select AddonsRelatedTotheService__c, Discount_Type__c,One_user_can_use_coupon_multiple_times__c, Remaining_Coupon_Code_Limit__c, Coupon_For_which_Stripe_Account__c, Stripe_Coupon_Id__c, Coupon_Validate_for_months__c,name,Coupon_Off__c ,Redemption_Limit_of_Coupon__c from Discount_Coupons__c where   (Applies_to__c includes(:servicenames[servicenames.size()-1]) and Expiry_Date__c >=:d and Coupon_For_which_Stripe_Account__c=:country ) OR ( Expiry_Date__c >=:d and Coupon_For_which_Stripe_Account__c=:country and Applies_to__c includes('All'))];
           // system.debug(so);
           // list<Discount_Coupons__c> coupons = database.query(so);
            list<Discount_Coupons__c> couponToReturn = new list<Discount_Coupons__c>();
            
            for(Discount_Coupons__c dc: coupons ){
                if(dc.AddonsRelatedTotheService__c==null||String.isBlank(dc.AddonsRelatedTotheService__c)||addonsnames.containsAll(dc.AddonsRelatedTotheService__c.split(';'))){
                    couponToReturn.add(dc);
                }
                
            }
            return couponToReturn;

        }else{
            list<Discount_Coupons__c> coupons  =[Select AddonsRelatedTotheService__c, Discount_Type__c,One_user_can_use_coupon_multiple_times__c, Remaining_Coupon_Code_Limit__c, Coupon_For_which_Stripe_Account__c, Stripe_Coupon_Id__c, Coupon_Validate_for_months__c,name,Coupon_Off__c ,Redemption_Limit_of_Coupon__c from Discount_Coupons__c where   (Applies_to__c includes(:servicenames[servicenames.size()-1]) and Expiry_Date__c >=:d ) OR ( Expiry_Date__c >=:d and Applies_to__c includes('All'))];
            list<Discount_Coupons__c> couponToReturn = new list<Discount_Coupons__c>();
            
            for(Discount_Coupons__c dc: coupons ){
                if(dc.AddonsRelatedTotheService__c==null){
                    couponToReturn.add(dc);
                }
                
                
            }
            return couponToReturn;

        }
       
       
    }

      @AuraEnabled
    public static list<string> getRelatedAddons(string workOrderId){
        list<string> RelatedAddonsnames=new list<string>();
       list<CustomerOrder__c> RelatedAddons=[SELECT AddOns__c, Name, Id FROM CustomerOrder__c where AddOns__c =:workOrderId];
       for(CustomerOrder__c c:RelatedAddons){
        RelatedAddonsnames.add(c.Name);
       }
       return RelatedAddonsnames;
    }

    @AuraEnabled
    public static string createCouponRelatedRecord(string serviceAppointmentId,string accountId,string coupon,string discountAmount,string couponAppliedtrue){
        serviceappointment SA=[select Discount_Allowed__c,Discount_Amount__c,Payment_Status__c,Transaction__c from serviceappointment where id=:serviceAppointmentId];
        if(couponAppliedtrue=='true'){

        Discount_Coupons__c couponToReturn=[Select AddonsRelatedTotheService__c,Discount_Type__c,One_user_can_use_coupon_multiple_times__c, Remaining_Coupon_Code_Limit__c, Coupon_For_which_Stripe_Account__c, Stripe_Coupon_Id__c, Coupon_Validate_for_months__c,name,Coupon_Off__c ,Redemption_Limit_of_Coupon__c from Discount_Coupons__c where   name =:coupon ];

        sa.Discount_Allowed__c=true;
        if(string.valueof(discountAmount).containsIgnoreCase('.')){
            sa.Discount_Amount__c=string.valueof(discountAmount);
        }else{
            sa.Discount_Amount__c=string.valueof(discountAmount)+'.00';
        }
       // sa.Discount_Amount__c=string.valueof(discountAmount);
        update SA;
              
                Coupons_Used_by_Customers__c	c=new Coupons_Used_by_Customers__c	(Discount_Coupon__c	=couponToReturn.id,Account__c=accountId);
                insert c;
                return 'success';
        }
        else{
            return null;
        }
    }
     @AuraEnabled
     public static List<String> getSessionId() {
        // system.debug(userInfo.getUserId());
        return new List<String>{userInfo.getSessionId(),userInfo.getUserId()};
    }
    
       
    





    // tum sabki bhains ki
}