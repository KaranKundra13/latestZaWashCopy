public without sharing class odooHelperClass {
    @AuraEnabled
    public static string odooCustomer(string lId){
        Http h=new Http();
        HttpRequest req=new HttpRequest();
        
        req.setMethod('POST'); 
        req.setHeader('Content-Type', 'application/json');
        // lead l=new lead(Lastname='testforLead',Email='test@test.com');
        Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io =(id)lId;
        
        sobject so;
        if(io.getSobjectType()==LeadObject){
           
            so=[Select firstname,lastname ,odooCustomerId__c, email from lead where id=:lId];
            
        }
        else{
        //  RecordType recordTypeId = [SELECT Name, SobjectType,IsPersonType FROM RecordType WHERE SobjectType='Account' AND IsPersonType=True];

           
            list<account> personaccounts=[Select lastname,firstname,odooCustomerId__c,email__c from account where id=:lId and IsPersonAccount = true  limit 1];
            if (personaccounts.isEmpty()) {
              // If no Person Account records were found, query for a standard Account with the same Id
             so = [SELECT Id, Name ,email__c,odooCustomerId__c FROM Account WHERE Id = :lId limit 1];
            }
            else{
              so=personaccounts[0];
            }
            
        }
        
        if(so.get('odooCustomerId__c')!=null){
            
            
            return string.valueof(so.get('odooCustomerId__c'));
        }
        else{
           
            
            req.setEndpoint('https://zawash-dev.dator.lu/api-integration-sf/api-integration-sf');
            string s='{   "params":'+JSON.serialize(so)+'}';
            req.setBody(s);
            HttpResponse res=h.send(req);
            
            Map<String,Object> jsonbody=(Map<String,Object>)Json.deserializeUntyped(res.getBody());
            string odooCustomerId=string.valueof(jsonbody.get('result'));
            so.put('odooCustomerId__c', odooCustomerId);
            
            update so;
            System.debug(jsonbody);
            system.debug(odooCustomerId);
               Stripe_Logs__c sl=new Stripe_Logs__c(Logs__c='value done');
            insert sl;
             Stripe_Logs__c sl2=new Stripe_Logs__c(Logs__c=JSON.serialize(so));
            insert sl2;
             Stripe_Logs__c sl3=new Stripe_Logs__c(Logs__c=string.valueof(res.getBody()));
            insert sl3;
            return odooCustomerId;
        }
    }
    
   @AuraEnabled 
    public static string odooInvoice(string TId){
        system.debug('TID=>'+TId);
       Http h=new Http();
        HttpRequest req=new HttpRequest();
        
        req.setMethod('POST'); 
        req.setHeader('Content-Type', 'application/json');
        // lead l=new lead(Lastname='testforLead',Email='test@test.com');
        Transactions__c t=[Select amount__c,Qwantity__c ,odooCustomerId__c from Transactions__c where id=:TId];
        workorder wo=[Select WorkType.name  from workorder where Transaction__c=:TId];
        serviceappointment SA=[select Currency__c,odooInvoiceName__c,Payment_Status__c,Transaction__c,Include_VAT__c from serviceappointment where Transaction__c=:t.id];

        decimal discountAmount;
        if(sa.Include_VAT__c==true){
          decimal amountwithouttax;
          decimal disamount;
          if(sa.Currency__c=='CHF'){
           disamount=((t.Amount__c* 7.7)/ 100);
          }
          else{
            disamount=((t.Amount__c* 20)/ 100);
          }
           amountwithouttax=t.Amount__c-disamount;
                  discountAmount= amountwithouttax.setScale(2);
      }else{
          discountAmount= t.Amount__c;
      }

         string WorkTypename=JSON.serialize(t);   //'WorkType.name :'+wo.WorkType.name;
        req.setEndpoint('https://zawash-dev.dator.lu/api-integration-sf/api-integration-sf/invoice');
        // req.setEndpoint('https://www.zawash.ch/api-integration-sf/api-integration-sf/invoice');

        string s='{ "params":{"attributes":{"type":"Transactions__c"},"currencyId":"'+sa.Currency__c+'","Amount__c":'+discountAmount+',"Qwantity__c":"'+t.Qwantity__c+'","odooCustomerId__c":'+t.odooCustomerId__c+',"WorkType.name":"'+wo.WorkType.name+'" ,"Include_VAT__c":'+sa.Include_VAT__c+'} }';

      req.setBody(s);
        HttpResponse res=h.send(req);
        
        Map<String,Object> jsonbody=(Map<String,Object>)Json.deserializeUntyped(res.getBody());
       // String map1=(String)jsonbody.get('result');
        
        List<object> params=( List<object>)jsonbody.get('result');
        System.debug(jsonbody);
       // List<String> params = map1.split(',');
        system.debug(s);
        System.debug('==============');
        System.debug(params);
        odooInvoice__c od =new odooInvoice__c(Name=string.valueof(params[1]),Transaction__c=TId,amount__C=string.valueof(t.amount__c),odooInvoiceIds__c=string.valueof(params[0]),OdooInvoiceName__c=string.valueof(params[1]));
        insert od;
       
             stripe_logs__c stl=new stripe_logs__c(logs__c=s);
        insert stl;
        sa.odooInvoiceName__c=string.valueof(params[1]);
        sa.odooInvoiceId__c=string.valueof(params[0]);
        update sa;
       return 'Success';
        
    }
    
        @AuraEnabled 
    public static string odooInvoicemultilines(string TId){
        system.debug('TID=>'+TId);
       Http h=new Http();
        HttpRequest req=new HttpRequest();
        
        req.setMethod('POST'); 
        req.setHeader('Content-Type', 'application/json');
           Transactions__c t=[Select amount__c,Qwantity__c ,odooCustomerId__c from Transactions__c where id=:TId];
        list<workorder> wo=[Select WorkType.name  from workorder where Transaction__c=:TId];
        list<serviceappointment> SA=[select Currency__c,odooInvoiceName__c,Payment_Status__c,Transaction__c,Include_VAT__c from serviceappointment where Transaction__c=:TId];
        list<CustomerOrder__c> corders = database.query('select price__c,Name,id, AddOns__c,Quantity__c from  CustomerOrder__c where AddOns__c=\'' + wo[0].id + '\'');
        decimal discountAmount;
        if(sa[0].Include_VAT__c==true){
          decimal amountwithouttax;
          decimal disamount;
          if(sa[0].Currency__c=='CHF'){
            disamount=((t.Amount__c* 7.7)/ 100);
           }
           else{
             disamount=((t.Amount__c* 20)/ 100);
           }
           amountwithouttax=t.Amount__c-disamount;
                  discountAmount= amountwithouttax.setScale(2);
      }else{
          discountAmount= t.Amount__c;
      }
  

         string WorkTypename=JSON.serialize(t);   //'WorkType.name :'+wo.WorkType.name;
        req.setEndpoint('https://zawash-dev.dator.lu/api-integration-sf/api-integration-sf/invoice');
        string allInvoiceLine='[';
        string s='{ "params":{"attributes":{"type":"Transactions__c"},"currencyId":"'+sa[0].Currency__c+'","Amount__c":'+discountAmount+',"odooCustomerId__c":'+t.odooCustomerId__c+'} }';
        for(integer i=0;i<corders.size();i++){
            if(i==sa.size()-1){
            allInvoiceLine+='{"Amount__c":'+corders[i].Price__c+',"WorkType.name":'+corders[i].name+',"Qwantity__c":"'+corders[i].Price__c+'"} ]';
            }else{
                 allInvoiceLine+='{"Amount__c":'+corders[i].Price__c+',"WorkType.name":'+corders[i].name+',"Qwantity__c":"'+corders[i].Quantity__c+'"},';
            }
        }
      req.setBody(s);
        HttpResponse res=h.send(req);
        
        Map<String,Object> jsonbody=(Map<String,Object>)Json.deserializeUntyped(res.getBody());
       // String map1=(String)jsonbody.get('result');
        
        List<object> params=( List<object>)jsonbody.get('result');
        System.debug(jsonbody);
       // List<String> params = map1.split(',');
        system.debug(s);
        System.debug('==============');
        System.debug(params);
        odooInvoice__c od =new odooInvoice__c(Name=string.valueof(params[1]),Transaction__c=TId,amount__C=string.valueof(t.amount__c),odooInvoiceIds__c=string.valueof(params[0]),OdooInvoiceName__c=string.valueof(params[1]));
        insert od;
       
             stripe_logs__c stl=new stripe_logs__c(logs__c=s);
        insert stl;
     sa[0].odooInvoiceName__c=string.valueof(params[1]);
     sa[0].odooInvoiceId__c=string.valueof(params[0]);
        update sa;
       return 'Success';
    }
     @AuraEnabled 
      public static string odooRefund(string invoiceid){
        Http h=new Http();
        HttpRequest req=new HttpRequest();
        
        req.setMethod('POST'); 
        req.setHeader('Content-Type', 'application/json');
          
      
       
        
           
            
            req.setEndpoint('https://zawash-dev.dator.lu/api-integration-sf/api-integration-sf/refund');
            string s='{   "params":{"invoiceid":'+invoiceid+'}}';
            req.setBody(s);
            HttpResponse res=h.send(req);
            
         
            return 'Success';
        }
    
    
    
    
}