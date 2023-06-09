@isTest
public class odooHelperClassTest {
   @testSetup static void methodName() {
   

       lead l=new lead(lastname ='test',CustomerId__c='654321');
       account a=new account(name='test');
       Transactions__c t=new Transactions__c(amount__c=78,odooCustomerId__c=195);
      
       insert t;
       insert a;
       insert l;
       
       

}
   
    
    
   @isTest static void testCallout() {
lead l =[Select id from lead limit 1];
        account a=[select id from account limit 1];
       Transactions__c t =[Select id from Transactions__c limit 1];

       Test.setMock(HttpCalloutMock.class, new odooCalloutMockCustomer());
        Test.startTest();
      string result1= odooHelperClass.odooCustomer(l.id);
  
       
                Test.stopTest();
       

   

        
    }
        
   @isTest static void testCallout2() {
               id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

       worktypegroup wt=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
            
            insert wt;
            worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',ipaddress__c='1.1.1.1');
            insert wt1;
            worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
            insert wtr;
        account acc=new account(name='acc',email__c='acc@gmail.com');
        insert acc;
              Transactions__c t =[Select id from Transactions__c limit 1];

            workorder wo=new workorder(WorkTypeId=wt1.id,accountID=acc.id,Transaction__c=t.id);
            insert wo;
       serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,Transaction__c=t.id,Currency__c='CHF');
        insert sa;


       Test.setMock(HttpCalloutMock.class, new odooCalloutMockInvoice());
        Test.startTest();
      string result1= odooHelperClass.odooInvoice(t.id);  
                Test.stopTest();
       

   

        
    }

    @isTest
    public static void restResourcecall(){
                      Transactions__c t =[Select id from Transactions__c limit 1];

        odooInvoice__c oni=new odooInvoice__c(Transaction__c=t.id,odooInvoiceIds__c='evt_3Lg74SEcuSui0LDP0FzLEJv2');
        insert oni;
        RestRequest req = new RestRequest(); 
         RestResponse res = new RestResponse();
            
            
            string payload='{ "status_Payment": "evt_3Lg74SEcuSui0LDP0FzLEJv2", "attachment_data": "event", "api_version": "2019-03-14", "created": 1662729410, "data": { "object": { "id": "ch_3Lg74SEcuSui0LDP0mhgUa99", "object": "charge", "amount": 12034, "amount_captured": 12034, "amount_refunded": 12034, "application": null, "application_fee": null, "application_fee_amount": null, "balance_transaction": "txn_3Lg74SEcuSui0LDP05nfoRnW", "billing_details": { "address": { "city": null, "country": null, "line1": null, "line2": null, "postal_code": null, "state": null }, "email": null, "name": null, "phone": null }, "calculated_statement_descriptor": "ZAWASH SA", "captured": true, "created": 1662729396, "currency": "chf", "customer": "cus_MNQtVAgxQ7kLfa", "description": null, "destination": null, "dispute": null, "disputed": false, "failure_balance_transaction": null, "failure_code": null, "failure_message": null, "fraud_details": { }, "invoice": null, "livemode": false, "metadata": { }, "on_behalf_of": null, "order": null, "outcome": { "network_status": "approved_by_network", "reason": null, "risk_level": "normal", "risk_score": 51, "seller_message": "Payment complete.", "type": "authorized" }, "paid": true, "payment_intent": "pi_3Lg74SEcuSui0LDP0DgLaZ8B", "payment_method": "pm_1Lg74PEcuSui0LDPOa9P3I4c", "payment_method_details": { "card": { "brand": "visa", "checks": { "address_line1_check": null, "address_postal_code_check": null, "cvc_check": "pass" }, "country": "US", "exp_month": 1, "exp_year": 2027, "fingerprint": "bG69CPWJTcvC7gl5", "funding": "credit", "installments": null, "last4": "4242", "mandate": null, "network": "visa", "three_d_secure": null, "wallet": null }, "type": "card" }, "receipt_email": null, "receipt_number": null, "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xRU1hSk5FY3VTdWkwTERQKML57JgGMgazTMGwlsk6LBaEv4f2DOeB0Ozc38jv464cvSPbbrPoDJrcMma9hyLp7yLQRN-f5tqzFqvI", "refunded": true, "refunds": { "object": "list", "data": [ { "id": "re_3Lg74SEcuSui0LDP0hlpWEko", "object": "refund", "amount": 12034, "balance_transaction": "txn_3Lg74SEcuSui0LDP0w5UZFyL", "charge": "ch_3Lg74SEcuSui0LDP0mhgUa99", "created": 1662729410, "currency": "chf", "metadata": { }, "payment_intent": "pi_3Lg74SEcuSui0LDP0DgLaZ8B", "reason": "duplicate", "receipt_number": null, "source_transfer_reversal": null, "status": "succeeded", "transfer_reversal": null } ], "has_more": false, "total_count": 1, "url": "/v1/charges/ch_3Lg74SEcuSui0LDP0mhgUa99/refunds" }, "review": null, "shipping": null, "source": null, "source_transfer": null, "statement_descriptor": null, "statement_descriptor_suffix": null, "status": "succeeded", "transfer_data": null, "transfer_group": null }, "previous_attributes": { "amount_refunded": 0, "receipt_url": "https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xRU1hSk5FY3VTdWkwTERQKMH57JgGMgZmxJZGOK86LBaUNzI6Oa2Lu1N_iQqmecRaMIyfOgIlF9owCfcUa8Tidzy-cbChmuSe-ak4", "refunded": false, "refunds": { "data": [ ], "total_count": 0 } } }, "livemode": false, "pending_webhooks": 1, "request": { "id": "req_hrcsMRIuhx6fOZ", "idempotency_key": "347df6a8-391c-48fe-93f3-2fa7ba9ed2ab" }, "type": "charge.refunded" }';

         req.addHeader('httpMethod', 'POST');
         req.requestUri = '/services/apexrest/paymentInfo'; 
            req.addHeader('Content-Type', 'application/json');
       //  String postData = 'Your actual request which covers both scenario in JSON format';
       //  String JsonMsg=JSON.serialize(payload);
         req.requestBody = Blob.valueof(payload);
         RestContext.request = req; 
         RestContext.response= res;
         Test.startTest();
         odooRestResource.paymentInfo();
         Test.stopTest();
    }
       @isTest
    public static void restrefundmethod(){
        Test.setMock(HttpCalloutMock.class, new odooMockCalloutRefund());
        Test.startTest();
      string result1= odooHelperClass.odooRefund('123');
  
       
                Test.stopTest();
        
    }
    @isTest static void testCallout3() {
               id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

       worktypegroup wt=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
            
            insert wt;
            worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',ipaddress__c='1.1.1.1');
            insert wt1;
            worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
            insert wtr;
        account acc=new account(name='acc',email__c='acc@gmail.com');
        insert acc;
              Transactions__c t =[Select id from Transactions__c limit 1];

            workorder wo=new workorder(WorkTypeId=wt1.id,accountID=acc.id,Transaction__c=t.id);
            insert wo;
       serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,Transaction__c=t.id,odooInvoiceName__c='12',Currency__c='CHF');
        insert sa;
                zaWash_Quote__c quoteRecord5 = new zaWash_Quote__c(Work_Order__c = wo.Id , Number_of_Cars__c = 5);
        insert quoteRecord5;

        CustomerOrder__c ccd =new CustomerOrder__c(name='test',AddOns__c=wo.id,Price__c=23,Quantity__c=2,zaWash_Quote__c=quoteRecord5.id,status__c='Included');
        insert ccd;


       Test.setMock(HttpCalloutMock.class, new odooCalloutMockInvoice());
        Test.startTest();
      string result1= odooHelperClass.odooInvoicemultilines(t.id);  
                Test.stopTest();
       

   

        
    }


}