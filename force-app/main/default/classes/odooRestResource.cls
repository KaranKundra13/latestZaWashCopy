@RestResource(urlMapping='/paymentInfo')

global without sharing  class odooRestResource {
        @HttpPost
    global static void paymentInfo(){
          RestRequest req=Restcontext.request;
        Restresponse res =Restcontext.response;
        String parsebody=req.requestbody.tostring();
      string odooId;
        try{
         	Map<String,Object> jsonbody=(Map<String,Object>)Json.deserializeUntyped(parsebody);
            odooID=jsonbody.get('status_Payment') + '';
        	Stripe_Logs__c stl=new Stripe_Logs__c(logs__c = string.valueof(jsonbody.get('attachment_data')));
            insert stl;
            
            odooInvoice__c odooInvoice=[Select Transaction__c, odooInvoiceIds__c  from odooInvoice__c where odooInvoiceIds__c=:odooID];
        	Transactions__c Transactio=[select Id, Payment_Status__c from  Transactions__c where id=:odooInvoice.Transaction__c];
            String jsonStr = string.valueof(jsonbody.get('attachment_data'));
/*Attachment attach = new Attachment();
attach.contentType = 'application/pdf';
attach.name = 'Invoice'+odooID+'.pdf';
attach.parentId = Transactio.id;
attach.body = EncodingUtil.base64Decode(jsonStr);
insert attach;*/
            ContentVersion ContVerFile = new ContentVersion();
            ContVerFile.VersionData = EncodingUtil.base64Decode(jsonStr);
            ContVerFile.Title = 'Invoice'+odooID+'.pdf'; 
            ContVerFile.ContentLocation= 's';
            ContVerFile.PathOnClient='invoice.pdf';
      insert ContVerFile;
            Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:ContVerFile.Id].ContentDocumentId;
            Stripe_Logs__c stlog=new Stripe_Logs__c(logs__c =conDoc);
            insert stlog;
                ContentDocumentLink cDe = new ContentDocumentLink();
                cDe.ContentDocumentId = conDoc; 
                cDe.LinkedEntityId =  Transactio.id;
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
            
        	Transactio.Payment_Status__c='Paid';
        	update Transactio;
        }catch(Exception e){
        	Stripe_Logs__c stl=new Stripe_Logs__c(logs__c =e.getMessage());
            insert stl;
        }
       
      
       

    }
}