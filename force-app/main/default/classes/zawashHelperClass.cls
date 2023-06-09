public without sharing class zawashHelperClass {
    

    @AuraEnabled
    public static ServiceResource getServiceResource(String apptId){
        List<ServiceAppointment> st = [select ServiceTerritoryId from ServiceAppointment Where Id = :apptId];
        List<ServiceTerritoryMember> stm =new List<ServiceTerritoryMember>();
        if(st.size() > 0){
            stm= [Select  ServiceTerritoryId, ServiceResourceId from ServiceTerritoryMember Where ServiceTerritoryId = :st[0].ServiceTerritoryId AND TerritoryType = 'P' Limit 1];
        }
        List<AssignedResource> assignedres = [Select Id, ServiceAppointmentId, ServiceResourceId From AssignedResource Where ServiceAppointmentId = :apptId];
        if(assignedRes.size() > 0)
        {
            if(stm.size() > 0)
            {
                assignedRes[0].ServiceResourceId = stm[0].ServiceResourceId;
                update assignedRes;
            }
            ServiceResource Employee = [Select Id, Name, Rating__c, Ratings__c From ServiceResource Where Id = :assignedRes[0].ServiceResourceId];
            return Employee;
        }else{
            return null;
        }
        
    }

    @AuraEnabled
    public static string getUserSessionId(){
        return UserInfo.getSessionId();
    }

    @AuraEnabled
    public static list<worktype> getworkTypeGroups(String iconLink, String paymentMode, String businessCategory, String country, String curr){
        String recordType = '';
        if(businessCategory == 'requestQuote')
        {
            recordType = Schema.SObjectType.WorkTypeGroup.getRecordTypeInfosByDeveloperName().get('B2B').getRecordTypeId();
        }
        else if(businessCategory == 'bookNow')
        {
            recordType = Schema.SObjectType.WorkTypeGroup.getRecordTypeInfosByDeveloperName().get('B2C').getRecordTypeId();
        }
        list<worktypegroup> servicesList = [SELECT name , payment_method__c FROM worktypegroup WHERE payment_method__c = :paymentMode AND RecordTypeId = :recordType];
        Set<String> uniqWorkTypeGroupIds = new Set<String>();
        Set<String> uniqworkTypeGroupNames = new Set<String>();
        for(worktypegroup wtg :  servicesList)
        {
            uniqWorkTypeGroupIds.add(wtg.Id);
            uniqworkTypeGroupNames.add(wtg.Name);
        }
        list<worktypegroupmember> groupmemberlist = new List<worktypegroupmember>();
        if(country == 'Ghana')
        {
            groupmemberlist = [SELECT WorkType.Name, WorkType.icon__c, WorkType.EstimatedDuration, WorkType.Price__c, WorkType.Currency__c,
                                                     WorkType.Country__c, WorkType.English__c, WorkType.Comment__c
                                                     FROM WorkTypeGroupMember WHERE WorkTypeGroupId IN :uniqWorkTypeGroupIds 
                                                     AND WorkType.English__c IN :uniqworkTypeGroupNames AND WorkType.Country__c = :country Order By WorkType.English__c ];
        }else{
        	groupmemberlist = [SELECT WorkType.Name, WorkType.icon__c, WorkType.EstimatedDuration, WorkType.Price__c, WorkType.Currency__c,
                                                     WorkType.Country__c, WorkType.English__c, WorkType.Comment__c
                                                     FROM WorkTypeGroupMember WHERE WorkTypeGroupId IN :uniqWorkTypeGroupIds 
                                                     AND WorkType.English__c IN :uniqworkTypeGroupNames AND WorkType.Country__c = :country AND WorkType.Currency__c = :curr Order By WorkType.English__c ];
        }
        List<WorkType> services = new List<WorkType>();
        for(WorkTypeGroupMember w : groupmemberlist)
        {
            w.WorkType.icon__c = iconLink + w.WorkType.icon__c; 
            services.add(w.WorkType);
        }
        return services;
    }
    
    
    @AuraEnabled
    public static list<WorkType> getCharges(String paymentMode, String serviceId, String iconLink, String businessCategory, String country, String curr){
        String recordType = '';
        if(businessCategory == 'requestQuote')
        {
            recordType = Schema.SObjectType.WorkTypeGroup.getRecordTypeInfosByDeveloperName().get('B2B').getRecordTypeId();
        }
        else if(businessCategory == 'bookNow')
        {
            recordType = Schema.SObjectType.WorkTypeGroup.getRecordTypeInfosByDeveloperName().get('B2C').getRecordTypeId();
        }
        List<workTypeGroupmember> oneTimeList = [Select WorkTypeGroup.Id, WorkTypeGroup.Name, WorkType.Id from WorkTypeGroupMember Where WorkType.Id = :serviceId AND WorkTypeGroup.RecordTypeId = :recordType];
        List<WorkTypeGroupMember> wtgList = [Select Id, WorkType.Name, WorkType.English__c, WorkType.icon__c , WorkType.EstimatedDuration, WorkType.Price__c, WorkTypeGroupId, WorkType.Id,
                                             WorkType.Currency__c, WorkType.Country__c, WorkType.Comment__c
                                             FROM WorkTypeGroupMember Where WorkTypeGroupId = :oneTimeList[0].WorkTypeGroup.Id AND WorkType.English__c != :oneTimeList[0].WorkTypeGroup.Name 
                                             AND WorkType.Country__c = :country AND WorkType.Currency__c = :curr Order By WorkType.English__c];
        List<WorkType> charges = new List<WorkType>();
        for(WorkTypeGroupMember wtgm : wtgList)
        {
            wtgm.WorkType.icon__c = iconLink + wtgm.WorkType.icon__c; 
            charges.add(wtgm.WorkType);
        }
        return charges;
    }   
    
    @AuraEnabled
    public static list<string> getSearchSuggetions(String place)
    {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        zaWash__c ApiKey = [SELECT Name__c,value__c from zaWash__c where name__c = 'googleMapApiKey' limit 1];
      //  req.setEndpoint('https://maps.googleapis.com/maps/api/place/autocomplete/json?key='+ApiKey.value__c+'&type=establishment&input='+place);
    req.setEndpoint('https://maps.googleapis.com/maps/api/place/autocomplete/json?key='+ApiKey.value__c+'&libraries=places&input='+place);

        req.setMethod('GET');
        HttpResponse res= http.send(req);
        Map<String,Object> responseBody=(Map<String,Object>) Json.deserializeUntyped(res.getBody());
        List<Object> responseBodyPrediction = (List<Object>) responseBody.get('predictions');
        list<String> suggetionsList = new List<string>();
        if(responseBodyPrediction != null)
        {
            for(object prediction : responseBodyPrediction)
            {
                String predictionString = json.serialize(prediction);
                Map<String,Object> predictionMap = (Map<String,Object>) json.deserializeUntyped(predictionString);
                String stringDescription = json.serialize(predictionMap.get('description'));
                String stringPlaceId = json.serialize(predictionMap.get('place_id'));
                suggetionsList.add(stringDescription+','+stringPlaceId);
            }
        }
        return suggetionsList;
    }
    
    @AuraEnabled
    public static String getLatLngFromPlaceId(String placeId)
    {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        zaWash__c ApiKey = [SELECT Name__c,value__c from zaWash__c where name__c = 'googleMapApiKey' limit 1];
        req.setEndpoint('https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeId+'&key='+ApiKey.value__c);
        req.setMethod('GET');
        HttpResponse res= http.send(req);
        Map<String,Object> responseBody=(Map<String,Object>) Json.deserializeUntyped(res.getBody());
        String responseBodyResultsString = json.serialize(responseBody.get('result'));
        Map<String,Object> responseBodyResultsMap = (Map<String,Object>) json.deserializeUntyped(responseBodyResultsString);
        String ResultString = json.serialize(responseBodyResultsMap);
        Map<String,Object> ResultMap = (Map<String,Object>) json.deserializeUntyped(ResultString);
        String stringGeometry = json.serialize(ResultMap.get('geometry'));
        Map<String,Object> GeometryMap = (Map<String,Object>) json.deserializeUntyped(stringGeometry);
        String stringLocation = json.serialize(GeometryMap.get('location'));
        Map<String,Object> locationMap = (Map<String,Object>) json.deserializeUntyped(stringLocation);
        String stringAddressComponents = json.serialize(ResultMap.get('address_components'));
        List<Object> AddressComponentsMap = (List<Object>) json.deserializeUntyped(stringAddressComponents);
        Map<string,object> country = (map<string,object>)AddressComponentsMap[AddressComponentsMap.size()-1];
        return json.serialize(locationMap.get('lat'))+','+json.serialize(locationMap.get('lng')+','+country.get('long_name'));
    }
    
    @AuraEnabled
    public static Case createCase(String name, String Email, String Phone, String Subject)
    {
        Case c = new Case(Status = 'New', Origin = 'Web', Description= Subject, SuppliedName = name, SuppliedEmail = Email, SuppliedPhone = Phone);
        insert c;
        return c;
    }
    
    @AuraEnabled
    public static List<ServiceTerritory> closestServiceTerritory(Decimal userlongitude, Decimal userlatitude, string  country)
    {
        List<ServiceTerritory> territoryList= [Select Name, Longitude__c, Latitude__c, Address,Country from ServiceTerritory];
        Decimal p = 0.017453292519943295;
        List<ServiceTerritory> nearestList = new List<ServiceTerritory>();
        for(ServiceTerritory st : territoryList)
        {
            if(st.Latitude__c != null && st.Longitude__c != null)
            {
                Decimal a = 0.5 - Math.cos((userlatitude - st.Latitude__c) * p) / 2 +
                                Math.cos(st.Latitude__c * p) * Math.cos(userlatitude * p) * (1 - Math.cos((userlongitude - st.Longitude__c) * p)) / 2;
                Decimal temp = (12742 * Math.asin(Math.sqrt(a)));
                if(temp <= 50 && st.Country==country)
                {
                    nearestList.add(st);
                }
            }
        }
        return nearestList;
    }

    @AuraEnabled(cacheable=true)
    public static string getVFOrigin() 
    {
        string vfOrigin = '';
        string baseURL = URL.getOrgDomainUrl().toExternalForm();
        vfOrigin = baseURL.split('.sandbox.my.')[0] + '--c.sandbox.vf.force.com';
        return vfOrigin;
    }
    
    @AuraEnabled(cacheable=true)
    public static list<Translation__c> getLabels(String language) 
    {
        string query = 'select Name , '+ language +'__c from Translation__c';
        list<Translation__c> labels = database.query(query);
        system.debug(labels);
        return labels;
    }
    
    @AuraEnabled
    public static WorkType getTravel(String Country, String Curr)
    {
        WorkType wt = [Select Name, English__c, icon__c, Country__c, Currency__c, Price__c, EstimatedDuration, Comment__c From WorkType where English__c = 'Travel' AND Country__c = :Country AND Currency__c = :Curr];
        system.debug(wt);
        return wt;
    }
    
/*	@AuraEnabled
    public static List<WorkOrder> decryptContact(String conId)
    {
        String getId;
        Contact con = [Select  Id,Email from Contact Where Id = :conId];
        List<Account> accList = [Select Id, Email__c from Account Where Email__c = :con.Email];
        if(accList.size()==0)
        {
            List<Lead> leadList = [Select Id, Email from Lead Where Email = :con.Email];
            if(leadList.size()==0)
            {
                List<WorkOrder> nullList = new List<WorkOrder>();
                return nullList;
            }
            else
            {
                getId = leadList[0].Id;
            }
        }
        else
        {
            getId = accList[0].Id;
        }
        Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io =(id)getId;
        if(io.getSobjectType()==LeadObject)
        {
            List<WorkOrder> woList = [Select id,(Select Name, Quantity__c, Price__c from CustomerOrders__r), 
                                      Subject, LeadId__c, LeadId__r.Name , WorkType.Name, WorkType.Currency__c, WorkType.icon__c, 
                                      CreatedDate, PaymentData__c, Transaction__c from WorkOrder Where LeadId__c = :getId ORDER By CreatedDate Desc];
            return woList;
        }
        else
        {
            List<WorkOrder> woList = [Select id,(Select Name, Quantity__c, Price__c from CustomerOrders__r), 
                                      Subject, Account.Name , WorkType.Name, WorkType.Currency__c, WorkType.icon__c, WorkType.Price__c, 
                                      CreatedDate from WorkOrder Where AccountId = :getId ORDER By CreatedDate Desc];
            return woList;
        }
    }*/
    
    @AuraEnabled
    public static List<WorkOrder> getQuotes(String accId)
    {
        List<WorkOrder> woList = [Select id,(Select Name, Quantity__c, Price__c from CustomerOrders__r), (Select Number_of_Cars__c, Name, Total_Price__c from zaWash_Quotes__r) , 
                                        (Select Id from ServiceAppointments Where Status = 'Scheduled' OR Status = 'Canceled'),
                                      Subject, WorkOrderNumber, LeadId__c, Account.Name , WorkType.Name, WorkType.Currency__c, WorkType.icon__c, WorkType.Price__c,
                                       CreatedDate, PaymentData__c, Street ,  Transaction__c from WorkOrder Where QuoteCreated__c = True AND AccountId = :accId ORDER By CreatedDate Desc];
            return woList;
    }
    
    @AuraEnabled
    public static List<ServiceAppointment> getAppointments(String accId)
    {
        List<ServiceAppointment> SaList = [Select Id, endTime__c, startTime__c, zawash_quote__r.Name, Duration,DurationType,parentrecordId, ArrivalWindowEndTime, ArrivalWindowStartTime, Status, AccountId, Account.Name, WorkTypeId, WorkType.Name, WorkType.icon__c, Car_brand_and_model__c, Car_plate__c, Car_Year__c,
                                           Total_Price__c,(Select ServiceResource.Name, ServiceResource.Ratings__c, Rating__c  from ServiceResources ) from ServiceAppointment Where Proceed__c = true AND AccountId = :accId AND Customer_Type__c = 'B2B'];
        system.debug(SaList); for(ServiceAppointment sa : SaList) { sa.startTime__c = sa.ArrivalWindowStartTime.format('HH:mm'); sa.endTime__c = sa.ArrivalWindowEndTime.format('HH:mm'); } 
        return SaList;
    }
    
  /*  @AuraEnabled
    public static List<ServiceAppointment> applyFilter(String accId,string status,string serviceDate,string serviceType,string carYear)
    {
        system.debug('Called');
        string query = 'Select Id, ArrivalWindowEndTime, ArrivalWindowStartTime, Status, AccountId, Account.Name, WorkTypeId, WorkType.Name, WorkType.icon__c, Car_brand_and_model__c, Car_plate__c, Car_Year__c,Total_Price__c,(Select ServiceResource.Name, Rating__c from ServiceResources ) from ServiceAppointment Where Proceed__c = true AND AccountId = :accId';
        if(status!='null'){
          	query += ' AND Status ='+status;
        }
        else if(serviceDate!='null'){
            query += ' AND ArrivalWindowStartTime= '+serviceDate;
        }
        else if(serviceType!='null'){
            query += ' AND WorkType.Name like :serviceType';
        }
        else{
            list<string> splitstr = carYear.split(' - ');
            Integer startYear = Integer.valueOf(splitstr[0]);
            Integer endYear = Integer.valueOf(splitstr[1]);
            query += ' AND Car_Year__c >= '+startYear +' AND Car_Year__c <='+ endYear;
        }
        system.debug('query==>'+query);
        list<ServiceAppointment> data=Database.query(query);
        return data;
    }*/
    @AuraEnabled
    public static string test(String accId,string status){
        system.debug(status);
        return status;
    }
    
    @AuraEnabled
    public static string updateWorkOrder(string workorderId,string address){
        workorder wo=[Select street from workorder where id=:workorderId];
        wo.Street=address;
        update wo;
        return wo.id;
        
        
    }

    
        @InvocableMethod(label='Send Email With Attachment')
        public static void sendEmail(list<Id> recordIds) {
            // Create a new email object
            List<Attachment> attachments = [ SELECT Id, Name, Body, ContentType FROM Attachment WHERE ParentId in :recordIds ];
            zaWash_Quote__c zwQ=[Select lead__c,lead__r.email,lead__r.name,account__r.email__c,account__r.name,name,Work_Type__r.name,Work_Type__r.Country__c,Number_of_Cars__c from zaWash_Quote__c where id in:recordIds];
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
               string subject='Quote Approval Email';
               string nameofcustomer;
               if(zwQ.lead__c!=null){
                nameofcustomer=zwQ.lead__r.name;
               }else{
                nameofcustomer=zwQ.account__r.name;
               }
               string htmlbody='<p>Hello '+nameofcustomer+' ,</p><p>Your request has been accepted .</p><p>Here are the quote details :</p><p><br></p><p>Quote Number : '+zwQ.Name+'</p><p>Service Type : '+zwQ.Work_Type__r.name+'</p><p>Number of Cars : '+zwQ.Number_of_Cars__c+'</p><p><br></p><p>Thank You .</p> <br> zaWash Team ';
             //  string accountHtmlbody='<p>Hello '+zwQ.account__r.name+' ,</p><p>Your request has been accepted .</p><p>Here are the quote details :</p><p><br></p><p>Quote Number : '+zwQ.Name+'</p><p>Service Type : '+zwQ.Work_Type__r.name+'</p><p>Number of Cars : '+zwQ.Number_of_Cars__c+'</p><p><br></p><p>Thank You .</p>';
            if(zwQ.Work_Type__r.Country__c=='Switzerland'||zwQ.Work_Type__r.Country__c=='France'){
                subject ='E-mail d\'approbation de devis';
                htmlbody='<p>Bonjour '+nameofcustomer+' ,</p><p>Votre demande a été acceptée.</p><p>Voici les détails du devis :</p><p><br></p><p>Numéro de devis : '+zwQ.Name+'</p><p>Type de service : '+zwQ.Work_Type__r.name+'</p><p>Nombre de voitures  : '+zwQ.Number_of_Cars__c+'</p><p><br></p><p>Merci .</p> <br> zaWash Team ';
                // accountHtmlbody='<p>Bonjour '+zwQ.account__r.name+' ,</p><p>Votre demande a été acceptée.</p><p>Voici les détails du devis :</p><p><br></p><p>Numéro de devis : '+zwQ.Name+'</p><p>Type de service : '+zwQ.Work_Type__r.name+'</p><p>Nombre de voitures  : '+zwQ.Number_of_Cars__c+'</p><p><br></p><p>Merci .</p>';
            }
            else if(zwQ.Work_Type__r.Country__c=='Germany'){
                subject ='Zitieren Genehmigungs-E-Mail';
                htmlbody='<p>Hallo '+nameofcustomer+' ,</p><p>Ihre Anfrage wurde akzeptiert.</p><p>Hier sind die Angebotsdetails :</p><p><br></p><p>Angebotsnummer : '+zwQ.Name+'</p><p>Servicetyp : '+zwQ.Work_Type__r.name+'</p><p>Anzahl der Autos  : '+zwQ.Number_of_Cars__c+'</p><p><br></p><p>Danke .</p> <br> zaWash Team ';
                // accountHtmlbody=
            }
            // Set the recipient email address
            if(zwQ.lead__c!=null){
                email.setToAddresses(new String[] {zwQ.lead__r.email });
                
            // Set the subject and body of the email

            email.setSubject(subject);
            //email.setPlainTextBody('This is a test email with an attachment.');
            email.setHtmlBody(htmlbody);
                
            }
            else{
            email.setToAddresses(new String[] {zwQ.account__r.email__c });
    
            // Set the subject and body of the email
            email.setSubject(subject);
            //email.setPlainTextBody('This is a test email with an attachment.');
            email.setHtmlBody(htmlbody); 
                   }
            // Create a new attachment
          
            List<Messaging.EmailFileAttachment> fileAttachments = new List<Messaging.EmailFileAttachment>();
for(Attachment a : attachments){
    Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
    efa.setFileName(a.Name);
    efa.setBody(a.Body);
    efa.setContentType(a.ContentType);
    fileAttachments.add(efa);
}

// Add the attachments to the email
email.setFileAttachments(fileAttachments);
            
    
            // Send the email
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
        }


        @AuraEnabled
        public static void methodSetAllRecords(string email,string userId){
            system.debug('userID'+userID);
            List<Account> accounts  =[select PersonEmail,id from account where email__c=:email and personemail=null];
            if (!accounts.isEmpty() && accounts[0].PersonEmail == null) {
            lead l=[Select id from lead where convertedaccountID=:accounts[0].id];
            
            User u =[SELECT AccountId FROM User WHERE Id=:userId];
    
        // Update AccountId on zaWash_Quote__c and WorkOrder records1`  
        List<sObject> updates = new List<sObject>();
        for (zaWash_Quote__c quote : [SELECT Id, Account__c FROM zaWash_Quote__c WHERE Account__c=:accounts[0].Id OR lead__c=:l.id]) {
            quote.Account__c = u.AccountId;
            updates.add(quote);
        }
        for (WorkOrder wo : [SELECT Id, AccountId FROM WorkOrder WHERE AccountId=:accounts[0].Id]) {
            wo.AccountId = u.AccountId;
            updates.add(wo);
        }
    
        // Perform the updates
        if (!updates.isEmpty()) {
            update updates;
        }
    
        // Delete the account
        delete accounts[0];
    }
    assigningPermissionSets(userId);
      
        }

        @future
        public static void assigningPermissionSets(string userId){
                     // Find the permission set
list<string> permissionSetsNames=new list<string>{'FieldServiceMobileStandardPermSet','FSL_Guest_User_Permissions','Permission_set_for_guest_user'};
list<PermissionSet> ps = [SELECT Id FROM PermissionSet WHERE Name in:permissionSetsNames];
list<PermissionSetAssignment> PermissionSetAssignments=new list<PermissionSetAssignment> ();
// Create a new PermissionSetAssignment object
for(integer i=0;i<ps.size();i++){
PermissionSetAssignment psa = new PermissionSetAssignment();
psa.AssigneeId = userId;
psa.PermissionSetId = ps[i].Id;
PermissionSetAssignments.add(psa);
}
// list<string> permissionSetsLicenseNames=new list<string>{'FieldServiceStandardPsl','FieldServiceSchedulingPsl'};
// list<PermissionSetLicense> permSetLicenseId = [SELECT Id FROM PermissionSetLicense WHERE DeveloperName in:permissionSetsLicenseNames];

List<PermissionSetLicenseAssign> permSetAssignments = new List<PermissionSetLicenseAssign>();
// for(PermissionSetLicense permSetLicenseAssignmentId : permSetLicenseId){
//     PermissionSetLicenseAssign assignment = new PermissionSetLicenseAssign();
//     assignment.AssigneeId = userId;
//     //assignment.PermissionSetId = permissionSetId;
//     assignment.PermissionSetLicenseId = permSetLicenseAssignmentId.id;
//     permSetAssignments.add(assignment);
// }
// // Insert the PermissionSetAssignment object
// insert PermissionSetAssignments;
insert permSetAssignments;
// return 'success';
    
        }

    
    
    
    
}