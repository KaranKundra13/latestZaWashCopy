@isTest
public class stripeIntegrationHepler_Test {

   @testSetup static void methodName() {
   
Transactions__c t=new Transactions__c(Payment_Id__c='1233');
       Subscription_Info__c subs=new Subscription_Info__c(subscription_Id__c='pi_3Lg74SEcuSui0LDP0DgLaZ8B');
       opportunity opp= new opportunity(name='test',CloseDate=date.newInstance(2024,02,02),StageName='Prospecting',Stripe_Customer__c='654321');
       lead l=new lead(lastname ='test',CustomerId__c='654321');
       Stripe_Key__c sk=new Stripe_Key__c(value__c='ahdvh',Price_key__c='dkandk',Country__c='Switzerland',Currency__c='USD',Product_Name__c='FULL');
     Stripe_Key__c sk1=new Stripe_Key__c(value__c='ahdvh',Price_key__c='dkandk',Country__c='Switzerland',Currency__c='USD',Product_Name__c='JUST INSIDE');
       Stripe_Key__c sk2=new Stripe_Key__c(value__c='ahdvh',Price_key__c='dkandk',Country__c='Switzerland',Currency__c='USD',Product_Name__c='JUST OUTSIDE');
insert sk1;
       insert sk2;
       account a=new account(name='test',customerId__c='654321');
       insert a;
       insert sk;
       insert l;
       insert subs;
       insert opp;
       insert t;
               id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

        worktypegroup wt=new worktypegroup(name='JUST Outside',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',Price__c=45,Currency__c='CHF');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        lead customer=new lead (lastname='raman',company='ui');
        insert customer;
        OperatingHours oh=new OperatingHours(name='Gold Appointments Calendar');
        insert oh;
          ServiceTerritory st1= new ServiceTerritory(name ='Switzerland1',OperatingHoursId=oh.id,IsActive=true,Latitude__c=1234.56,Longitude__c=1434.56);
        insert st1;
        WorkOrder wo = new WorkOrder(LeadId__c = customer.Id, Subject= 'Work for '+customer.lastName, WorkTypeId = wt1.Id, ServiceTerritoryId = st1.id,AccountId=a.id);
        insert wo;
        Transactions__c tr=new Transactions__c(amount__c=26);
       insert tr;

           ContentVersion ContVerFile = new ContentVersion();
            ContVerFile.VersionData = EncodingUtil.base64Decode('thank you');
            ContVerFile.Title = 'Invoice'; 
            ContVerFile.ContentLocation= 's';
            ContVerFile.PathOnClient='invoice.pdf';
      insert ContVerFile;
            Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:ContVerFile.Id].ContentDocumentId;
            Stripe_Logs__c stlog=new Stripe_Logs__c(logs__c =conDoc);
            insert stlog;
                ContentDocumentLink cDe = new ContentDocumentLink();
                cDe.ContentDocumentId = conDoc; 
                cDe.LinkedEntityId =  tr.id;
               // cDe.ShareType = 'I';
               // cDe.Visibility = 'AllUsers';
                insert cDe;
     ContentDistribution cd = new ContentDistribution();
cd.Name = 'Test';
       
cd.ContentVersionId = ContVerFile.id;
cd.PreferencesAllowViewInBrowser= true;
cd.PreferencesLinkLatestVersion=true;
cd.PreferencesNotifyOnVisit=false;
cd.PreferencesPasswordRequired=false;
cd.PreferencesAllowOriginalDownload= true;
            
insert cd; 
       
       
list<string> l1=new list<string>{'Customer_Name','Status','serviceDate','TypeOfService','carPlate','carModel','carWasher'};
list<Translation__c> labels=new list<Translation__c>();

for(integer i=0;i<l1.size();i++){
    Translation__c label=new Translation__c(name=l1[i],english__C='next',french__C='next',german__c='next');
    labels.add(label);
}
insert labels;
      
      /* serviceresource sr=new serviceresource(name='raman',resourcetype='T',RelatedRecordId='0057Q000006Eo3CQAS',isActive=true);
        insert sr;
        OperatingHours oh=new OperatingHours(name='Gold Appointments Calendar');
        insert oh;
       TimeSlot tm =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(1, 0, 0, 0),EndTime=Time.newInstance(3, 0, 0, 0),OperatingHoursId=oh.id);   
        TimeSlot tm1 =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(4, 0, 0, 0),EndTime=Time.newInstance(6, 0, 0, 0),OperatingHoursId=oh.id);    
        
        insert tm;
        insert tm1;
        ServiceTerritory st= new ServiceTerritory(Name='a',OperatingHoursId=oh.id ,IsActive=true);
        insert st;
        
        ServiceTerritoryMember stm=new ServiceTerritoryMember(ServiceResourceId=sr.id,ServiceTerritoryId=st.id,TerritoryType='P',EffectiveStartDate=system.now());
        insert stm;*/
              ServiceAppointment SA = new ServiceAppointment(Customer_Type__c = 'B2C', ParentRecordId = wo.id, EarliestStartTime = date.today(), DueDate = date.today(),Transaction__c=tr.id,SchedStartTime=date.today(),	SchedEndTime=date.today()+1);
 insert sa;
       //  AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa.id,ServiceResourceId=sr.id);
        //    insert as1;
       

}
    
     
    
    
    private static void TestMethod1(){
         WorkOrder wo=[select id from  WorkOrder limit 1];
        lead l =[Select id from lead limit 1];
        account a=[select id from account limit 1];
        ServiceAppointment SA=[select id from ServiceAppointment limit 1];

        string result1=stripeIntegrationHepler.createSubscription('1233',a.id,wo.id,'255','6',string.valueof(date.today()),sa.id,'1','CHF');
        stripeIntegrationHepler.CreatePay('1233');
    string result2= stripeIntegrationHepler.createPayment('123456','654321','Paid','67','194',wo.id,'Link',sa.id,'2','CHF');
       Stripe_Key__c result3=stripeIntegrationHepler.ApiKey('Switzerland','FULL','USD');
        sobject m=stripeIntegrationHepler.customer(l.id);
            sobject b =   stripeIntegrationHepler.customer(a.id);
           sobject c = stripeIntegrationHepler.updateLead(l.id,'test');
        sobject d=stripeIntegrationHepler.updateLead(a.id,'test');
         opportunity opp=new opportunity(name='test',CloseDate=date.newInstance(2024,02,02),StageName='Prospecting',Stripe_Customer__c='123456');
          Test.startTest();

                       stripeIntegrationHepler.CreateInvoice('pi_3Lg74SEcuSui0LDP0DgLaZ8B','67');

         Test.stopTest();
     

        
        stripeIntegrationHepler.CountryKey('Switzerland');
        list<Stripe_Key__c> listofKeys=[select id,Product_Name__c from Stripe_Key__c ];
        List<Map<String,Object>>  listOfAddOns=new List<Map<String,Object>>();
        for(integer i=0;i<listofKeys.size();i++){
            Map<String,Object> map1=new Map<String,Object>();
            map1.put('Name', listofKeys[i].Product_Name__c);
            map1.put('quantity', 2);
           listOfAddOns.add(map1);
        }
        stripeIntegrationHepler.addSubscriptionLineItems('Switzerland',listOfAddOns,'USD');
    }
    
    @istest
    public static void testMethod2(){
        testMethod1();
    } 
    
    
        static testMethod void myUnitTest() {
         RestRequest req = new RestRequest(); 
         RestResponse res = new RestResponse();
            
            
            string payload='{ "id": "evt_3Lg74SEcuSui0LDP0FzLEJv2", "object": "event", "api_version": "2019-03-14", "created": 1662729410, "data": { "object": { "id": "ch_3Lg74SEcuSui0LDP0mhgUa99", "object": "charge", "amount": 12034, "amount_captured": 12034, "amount_refunded": 12034, "application": null, "application_fee": null, "application_fee_amount": null, "balance_transaction": "txn_3Lg74SEcuSui0LDP05nfoRnW", "billing_details": { "address": { "city": null, "country": null, "line1": null, "line2": null, "postal_code": null, "state": null }, "email": null, "name": null, "phone": null }, "calculated_statement_descriptor": "ZAWASH SA", "captured": true, "created": 1662729396, "currency": "chf", "customer": "cus_MNQtVAgxQ7kLfa", "description": null, "destination": null, "dispute": null, "disputed": false, "failure_balance_transaction": null, "failure_code": null, "failure_message": null, "fraud_details": { }, "invoice": null, "livemode": false, "metadata": { }, "on_behalf_of": null, "order": null, "outcome": { "network_status": "approved_by_network", "reason": null, "risk_level": "normal", "risk_score": 51, "seller_message": "Payment complete.", "type": "authorized" }, "paid": true, "payment_intent": "pi_3Lg74SEcuSui0LDP0DgLaZ8B", "payment_method": "pm_1Lg74PEcuSui0LDPOa9P3I4c", "payment_method_details": { "card": { "brand": "visa", "checks": { "address_line1_check": null, "address_postal_code_check": null, "cvc_check": "pass" }, "country": "US", "exp_month": 1, "exp_year": 2027, "fingerprint": "bG69CPWJTcvC7gl5", "funding": "credit", "installments": null, "last4": "4242", "mandate": null, "network": "visa", "three_d_secure": null, "wallet": null }, "type": "card" }, "receipt_email": null, "receipt_number": null, "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xRU1hSk5FY3VTdWkwTERQKML57JgGMgazTMGwlsk6LBaEv4f2DOeB0Ozc38jv464cvSPbbrPoDJrcMma9hyLp7yLQRN-f5tqzFqvI", "refunded": true, "refunds": { "object": "list", "data": [ { "id": "re_3Lg74SEcuSui0LDP0hlpWEko", "object": "refund", "amount": 12034, "balance_transaction": "txn_3Lg74SEcuSui0LDP0w5UZFyL", "charge": "ch_3Lg74SEcuSui0LDP0mhgUa99", "created": 1662729410, "currency": "chf", "metadata": { }, "payment_intent": "pi_3Lg74SEcuSui0LDP0DgLaZ8B", "reason": "duplicate", "receipt_number": null, "source_transfer_reversal": null, "status": "succeeded", "transfer_reversal": null } ], "has_more": false, "total_count": 1, "url": "/v1/charges/ch_3Lg74SEcuSui0LDP0mhgUa99/refunds" }, "review": null, "shipping": null, "source": null, "source_transfer": null, "statement_descriptor": null, "statement_descriptor_suffix": null, "status": "succeeded", "transfer_data": null, "transfer_group": null }, "previous_attributes": { "amount_refunded": 0, "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xRU1hSk5FY3VTdWkwTERQKMH57JgGMgZmxJZGOK86LBaUNzI6Oa2Lu1N_iQqmecRaMIyfOgIlF9owCfcUa8Tidzy-cbChmuSe-ak4", "refunded": false, "refunds": { "data": [ ], "total_count": 0 } } }, "livemode": false, "pending_webhooks": 1, "request": { "id": "req_hrcsMRIuhx6fOZ", "idempotency_key": "347df6a8-391c-48fe-93f3-2fa7ba9ed2ab" }, "type": "charge.refunded" }';

         req.addHeader('httpMethod', 'POST');
         req.requestUri = '/services/apexrest/refund'; 
            req.addHeader('Content-Type', 'application/json');
       //  String postData = 'Your actual request which covers both scenario in JSON format';
       //  String JsonMsg=JSON.serialize(payload);
         req.requestBody = Blob.valueof(payload);
         RestContext.request = req; 
         RestContext.response= res;
         Test.startTest();
         stripeRefundRestResource.refund();
         Test.stopTest();
   }
    
       static testMethod void myUnitTest1() {
         RestRequest req = new RestRequest(); 
         RestResponse res = new RestResponse();
            
            
            string payload='{ "id": "evt_3Lg74SEcuSui0LDP0FzLEJv2", "object": "event", "api_version": "2019-03-14", "created": 1662729410, "data": { "object": { "id": "ch_3Lg74SEcuSui0LDP0mhgUa99", "object": "charge", "amount": 12034, "amount_captured": 12034, "amount_refunded": 12034, "application": null, "application_fee": null, "application_fee_amount": null, "balance_transaction": "txn_3Lg74SEcuSui0LDP05nfoRnW", "billing_details": { "address": { "city": null, "country": null, "line1": null, "line2": null, "postal_code": null, "state": null }, "email": null, "name": null, "phone": null }, "calculated_statement_descriptor": "ZAWASH SA", "captured": true, "created": 1662729396, "currency": "chf", "customer": "cus_MNQtVAgxQ7kLfa", "description": null, "destination": null, "dispute": null, "disputed": false, "failure_balance_transaction": null, "failure_code": null, "failure_message": null, "fraud_details": { }, "invoice": null, "livemode": false, "metadata": { }, "on_behalf_of": null, "order": null, "outcome": { "network_status": "approved_by_network", "reason": null, "risk_level": "normal", "risk_score": 51, "seller_message": "Payment complete.", "type": "authorized" }, "paid": true, "subscription": "pi_3Lg74SEcuSui0LDP0DgLaZ8B", "payment_method": "pm_1Lg74PEcuSui0LDPOa9P3I4c", "payment_method_details": { "card": { "brand": "visa", "checks": { "address_line1_check": null, "address_postal_code_check": null, "cvc_check": "pass" }, "country": "US", "exp_month": 1, "exp_year": 2027, "fingerprint": "bG69CPWJTcvC7gl5", "funding": "credit", "installments": null, "last4": "4242", "mandate": null, "network": "visa", "three_d_secure": null, "wallet": null }, "type": "card" }, "receipt_email": null, "receipt_number": null, "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xRU1hSk5FY3VTdWkwTERQKML57JgGMgazTMGwlsk6LBaEv4f2DOeB0Ozc38jv464cvSPbbrPoDJrcMma9hyLp7yLQRN-f5tqzFqvI", "refunded": true, "refunds": { "object": "list", "data": [ { "id": "re_3Lg74SEcuSui0LDP0hlpWEko", "object": "refund", "amount": 12034, "balance_transaction": "txn_3Lg74SEcuSui0LDP0w5UZFyL", "charge": "ch_3Lg74SEcuSui0LDP0mhgUa99", "created": 1662729410, "currency": "chf", "metadata": { }, "payment_intent": "pi_3Lg74SEcuSui0LDP0DgLaZ8B", "reason": "duplicate", "receipt_number": null, "source_transfer_reversal": null, "status": "succeeded", "transfer_reversal": null } ], "has_more": false, "total_count": 1, "url": "/v1/charges/ch_3Lg74SEcuSui0LDP0mhgUa99/refunds" }, "review": null, "shipping": null, "source": null, "source_transfer": null, "statement_descriptor": null, "statement_descriptor_suffix": null, "status": "succeeded", "transfer_data": null, "transfer_group": null }, "previous_attributes": { "amount_refunded": 0, "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xRU1hSk5FY3VTdWkwTERQKMH57JgGMgZmxJZGOK86LBaUNzI6Oa2Lu1N_iQqmecRaMIyfOgIlF9owCfcUa8Tidzy-cbChmuSe-ak4", "refunded": false, "refunds": { "data": [ ], "total_count": 0 } } }, "livemode": false, "pending_webhooks": 1, "request": { "id": "req_hrcsMRIuhx6fOZ", "idempotency_key": "347df6a8-391c-48fe-93f3-2fa7ba9ed2ab" }, "type": "charge.refunded" }';

         req.addHeader('httpMethod', 'POST');
         req.requestUri = '/services/apexrest/refund'; 
            req.addHeader('Content-Type', 'application/json');
       //  String postData = 'Your actual request which covers both scenario in JSON format';
       //  String JsonMsg=JSON.serialize(payload);
         req.requestBody = Blob.valueof(payload);
         RestContext.request = req; 
         RestContext.response= res;
         Test.startTest();
         stripeIntegrationRestResources.invoice();
         Test.stopTest();
   }
    
     @isTest 
    public static void testCallout() {

        stripeIntegrationHepler.hasRunOnce = true;
        
        // Call method to test.
        // This causes a fake response to be sent
        // from the class that implements HttpCalloutMock. 
                      Test.setMock(HttpCalloutMock.class, new stripeMockCallout());

                      serviceappointment sa=[select id from serviceappointment limit 1];

        
        Test.startTest();
        account a=new account(name='test');
        insert a;
      
         List<Discount_Coupons__c> opp=new List<Discount_Coupons__c>();
        opp.add(     new Discount_Coupons__c(name='test1',Coupon_Validate_for_months__c='2',Coupon_Off__c='2',Coupon_For_which_Stripe_Account__c='Switzerland',Applies_to__c='JUST Outside',Redemption_Limit_of_Coupon__c='2',Discount_Type__c='Fixed Amount',Expiry_Date__c=system.now(),AddonsRelatedTotheService__c='Travel'));
        insert opp;
           Stripe_Api_Keys__c sk=new Stripe_Api_Keys__c(Country__c='Switzerland',Api_Key__c='sk_test_FaMZfep2Ay2Tiy5l5v8hI0hO00CcVk6OwP',name='testrecord');
        insert sk;

        stripeIntegrationHepler.createStripeCoupon(new list<string>{opp[0].id},new list<string>{opp[0].Coupon_For_which_Stripe_Account__c});
                Test.stopTest();
        stripeIntegrationHepler.getCouponCode('012345',new list<string>{'Travel','JUST Outside'},a.id,'CHF','65','updating',sa.ID, 'Switzerland');
        stripeIntegrationHepler.getCouponCodesForUI(new list<string>{'Travel','FULL'},'Switzerland');
        stripeIntegrationHepler.createCouponRelatedRecord(sa.id,a.id,'test1','24','true');


     }
    
         @isTest 
    public static void testStripeTrigger()
    {
                              Test.setMock(HttpCalloutMock.class, new stripeMockCallout());
        Test.startTest();

        Opportunity o = new opportunity(name='test1',CloseDate=date.newInstance(2024,02,02),StageName='Prospecting',Stripe_Customer__c='654321');
        insert o;
                        Test.stopTest();

        
    }
         @isTest 
    public static void newTestMethod()
    {
        serviceappointment sa=[select id from serviceappointment limit 1];
             stripeIntegrationHepler.selectPaymentMethod(sa.id);
        
        stripeIntegrationHepler.selectLeadId(sa.id);
        
        stripeIntegrationHepler.viewInvoice(sa.id);
        
        
                List<User> userList = [Select Id, Name, Profile.UserLicense.Name From User WHERE Profile.Name = 'System Administrator' and isactive=true];

        serviceresource sr=new serviceresource(name='raman',resourcetype='T',RelatedRecordId=userList[0].id,isActive=true);
        insert sr;
        OperatingHours oh=new OperatingHours(name='Gold Appointments Calendar');
        insert oh;
        
        TimeSlot tm =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(1, 0, 0, 0),EndTime=Time.newInstance(3, 0, 0, 0),OperatingHoursId=oh.id);   
        TimeSlot tm1 =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(4, 0, 0, 0),EndTime=Time.newInstance(6, 0, 0, 0),OperatingHoursId=oh.id);    
        
        insert tm;
        insert tm1;
        ServiceTerritory st= new ServiceTerritory(Name='a',OperatingHoursId=oh.id ,IsActive=true);
        insert st;
        
        ServiceTerritoryMember stm=new ServiceTerritoryMember(ServiceResourceId=sr.id,ServiceTerritoryId=st.id,TerritoryType='P',EffectiveStartDate=system.now());
        insert stm;
        
        
        
                    id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

            worktypegroup wt=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
            
            insert wt;
            worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',ipaddress__c='1.1.1.1');
            insert wt1;
            worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
            insert wtr;
        account acc=new account(name='acc',email__c='acc@gmail.com');
        insert acc;
            workorder wo=new workorder(WorkTypeId=wt1.id,accountID=acc.id,numberOfCars__c=1);
            insert wo;
            
            serviceappointment sa1=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=23);
            insert sa1;
            
            AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa1.id,ServiceResourceId=sr.id);
            insert as1;
        
        stripeIntegrationHepler.getServiceAppointment(sa1.id,'English');
        
        zaWash_Quote__c quoteRecord4 = new zaWash_Quote__c(Work_Order__c = wo.Id, Work_Type__c = wt1.Id , Number_of_Cars__c = 5  );
           insert quoteRecord4;
        CustomerOrder__c corder=new CustomerOrder__c(name='add', AddOns__c=wo.id,zaWash_Quote__c=quoteRecord4.Id ,Price__c=23,Status__c = 'Included');
        insert corder;

        stripeIntegrationHepler.getRelatedAddons(wo.id);

    }

    @isTest
    static void testGetSessionId() {
        // Create a mock of the UserInfo class
        // UserInfo mockUserInfo = new UserInfo();

        // Set the session ID to a dummy value
        // mockUserInfo.setSessionId('dummySessionId');

        // Call the getSessionId() method of the SessionIdUtils class and verify the result
        Test.startTest();
        List<String> sessionId = stripeIntegrationHepler.getSessionId();
        Test.stopTest();

        // System.assertEquals('dummySessionId', sessionId, 'Session ID should match the mock value');
    }


}