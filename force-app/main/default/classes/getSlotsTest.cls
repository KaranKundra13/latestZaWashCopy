@isTest 
public class getSlotsTest {
    
    @testSetup static void methodName(){
        account acc1=new account(name='acc',email__c='acc@gmail.com',Phone='3142536');
        insert acc1;
        worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',Price__c=23);
        insert wt3;
        workorder wo3=new workorder(WorkTypeId=wt3.id,accountId=acc1.id,numberOfCars__c=1);
        insert wo3;
        zaWash_Quote__c quoteRecord5 = new zaWash_Quote__c(Work_Order__c = wo3.Id , Number_of_Cars__c = 5);
        insert quoteRecord5;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo3.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=24,Include_VAT__c=true,Refund_Amount__c=150,Currency__c='CHF',Customer_Type__c='B2C',Street='Rampe de Switzerland');
        insert sa1;
        CustomerOrder__c corder=new CustomerOrder__c(name='add', AddOns__c=wo3.id,zaWash_Quote__c=quoteRecord5.Id ,Price__c=23,Quantity__c=5,Status__c = 'Included');
        insert corder;
        getSlots.getServiceAppointment(sa1.Id);
        getSlots.getServiceDetails(sa1.Id);

        List<String> addOnsList = new List<String>();
        addOnsList.add(corder.Id);
        getSlots.deleteAddons(addOnsList , sa1.Id , 20,'test','');
        //     serviceresource sr=new serviceresource(name='raman',resourcetype='T',RelatedRecordId='0057Q000006Eo3CQAS',isActive=false);
        //   insert sr;
        account  acc =new account(name='test',email__c='puneetsharma072000@gmail.com');
        insert acc;
        id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();
        worktypegroup wt=new worktypegroup(name='JUST Outside',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        account customer=new account (name='raman',email__c='ui@gmail.com');
        insert customer;
         OperatingHours oh=new OperatingHours(name='Gold Appointments Calendar');
        insert oh;
          ServiceTerritory st1= new ServiceTerritory(name ='Switzerland1',OperatingHoursId=oh.id,IsActive=true,Latitude__c=1234.56,Longitude__c=1434.56);
        insert st1;
        WorkOrder wo = new WorkOrder(accountId = customer.Id, Subject= 'Work for '+customer.lastName, WorkTypeId = wt1.Id, ServiceTerritoryId = st1.id,numberOfCars__c=2);
        insert wo;

        zaWash_Quote__c quoteRecord6 = new zaWash_Quote__c(Work_Order__c = wo.Id , Number_of_Cars__c = 2);
        insert quoteRecord6;
        
        serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,Total_Price__c=23,Include_VAT__c=true);
        insert sa;
        
        FSL__Scheduling_Policy__c fs=new FSL__Scheduling_Policy__c(name='Customer First One');
        insert fs;
       
        ServiceTerritory st= new ServiceTerritory(name ='Switzerland',OperatingHoursId=oh.id,IsActive=true,Latitude__c=1234.56,Longitude__c=1434.56);
        insert st;
        
        TimeSlot tm =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(1, 0, 0, 0),EndTime=Time.newInstance(3, 0, 0, 0),OperatingHoursId=oh.id);   
        TimeSlot tm1 =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(4, 0, 0, 0),EndTime=Time.newInstance(6, 0, 0, 0),OperatingHoursId=oh.id);    
        
        insert tm;
        insert tm1;
        WorkOrder wo1 = new WorkOrder(accountID = customer.Id, Subject= 'Work for ', WorkTypeId = wt1.Id, ServiceTerritoryId = st.id);
        insert wo1;
        WorkOrder wo2 = new WorkOrder(accountID = customer.Id, Subject= 'Za', WorkTypeId = wt1.Id, ServiceTerritoryId = st.id);
        insert wo2;
        ZaWash__c zw= new ZaWash__c(Name__c='schedulingPolicy',value__c=fs.id);
        insert zw;

        zaWash_Quote__c quoteRecord7 = new zaWash_Quote__c(Work_Order__c = wo2.Id , Work_Type__c = wt1.Id , Number_of_Cars__c = 5 , Service_Territory__c = st.id);
        insert quoteRecord7;
        
        
    }
    
    @isTest
    public static void Testmethod1(){
        String uniqueUserName = 'standarduser' + DateTime.now().getTime() + '@testorg.com';
        // This code runs as the system user
        Profile p = [SELECT Id FROM Profile WHERE Name='System Administrator'];
        User u = new User(Alias = 'standt', Email='standarduser@testorg.com',
                          EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US',
                          LocaleSidKey='en_US', ProfileId = p.Id,
                          TimeZoneSidKey='America/Los_Angeles',
                          UserName=uniqueUserName);
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
        
        insert u;
        System.runAs(u){
                    id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

            worktypegroup wt=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
            
            insert wt;
            worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
            insert wt1;
            worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
            insert wtr;
              account acc=new account(name='acc',email__c='acc@gmail.com');
        insert acc;
            workorder wo=new workorder(WorkTypeId=wt1.id,accountId=acc.id,numberOfCars__c=1);
            insert wo;

            zaWash_Quote__c quoteRecord8 = new zaWash_Quote__c(Work_Order__c = wo.Id , Work_Type__c = wt1.Id , Number_of_Cars__c = 5 , Service_Territory__c = st.id);
            insert quoteRecord8;
            
            serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=23);
            insert sa;
            
            AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa.id,ServiceResourceId=sr.id);
            insert as1;
            
            getSlots.sendTime(wo.id,string.valueOf(system.now()),string.valueOf(system.now()),'Currency');
            
            
            
        }
    }
    
    @isTest
    public static void Testmethod2(){
        workorder w=[select id from workorder limit 1];
        workorder wo=[select id from workorder Where numberOfCars__c = 2];
        workorder wo1=[select id from workorder where subject='Za' ];
        
        
        system.debug(system.today());
        system.debug(Date.today().toStartOfMonth());
        getSlots.getTimeSlots(system.today(),w.id, 'requestQuote' , 'Ajmer', 60);
        getSlots.getTimeSlots(system.today(),wo.id, 'bookNow' , 'Ajmer', 60);
        getSlots.getTimeSlots(Date.today().toStartOfMonth(),w.id, 'requestQuote' , 'Ajmer', 60);
        getSlots.getTimeSlots(Date.today().toStartOfMonth(),wo1.id, 'bookNow' , 'Ajmer', 60);
        
    }
    
    @isTest
    public static void testmethod11()
    {
        workorder w=[select id from workorder limit 1];
        Serviceappointment sa = new ServiceAppointment(ParentRecordId=w.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now());
        insert sa;
        
        getSlots.getTimeSlots(system.today(),sa.id, 'requestQuote' , 'Ajmer', 60);
        getSlots.getTimeSlots(Date.today().toStartOfMonth(),sa.id, 'bookNow' , 'Ajmer', 60);
    }
    
    
    @isTest
    public static void TestMethod3(){
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

        
        worktypegroup wt=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        workorder wo=new workorder(WorkTypeId=wt1.id);
        insert wo;
        
        
        getSlots.createLead('puneetsharma072000@gmail.com','b2b', '1234567890');
        lead customer=new lead (lastname='raman',company='ui');
        insert customer;
        ServiceTerritory st=[Select id from ServiceTerritory limit 1];
        getSlots.createLead('raman@gmail.com','b2b', '1234567890');
        
        getSlots.createWorkOrder(customer.id,wt1.id,'One Time',st.id, 7 , 'requestQuote' , 'CHF',False);
        
        
        
    }
    
    @isTest
    public static void TestMethod4(){
        getSlots.createLead('puneetsharma00@gmail.com','b2c', '1234589032');
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
        worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Inside');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
         account acc=new account(name='acc',email__c='acc@gmail.com');
        insert acc;
        workorder wo=new workorder(WorkTypeId=wt1.id,accountId=acc.id,numberOfCars__c=1);
        insert wo;
        
        serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=23);
        insert sa;
        AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa.id,ServiceResourceId=sr.id);
        insert as1;
        getSlots.sendTime(wo.id,string.valueOf(system.now()),string.valueOf(system.now()),'Currency');
        
        
        
        
        
        
    }
    
    @isTest
    public static void TestMethod5(){
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

        
        worktypegroup wt=new worktypegroup(name='FULL',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='FULL',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='FULL');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        account acc=new account(name='acc',email__c='acc@gmail.com');
        insert acc;
        workorder wo=new workorder(WorkTypeId=wt1.id,accountId=acc.id,numberOfCars__c=1);
        insert wo;
        
        serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=23);
        insert sa;
        AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa.id,ServiceResourceId=sr.id);
        insert as1;
        getSlots.sendTime(wo.id,string.valueOf(system.now()),string.valueOf(system.now()),'Currency');
    }
    
    @isTest
    public static void TestMethod6(){
        Test.startTest();
        workorder wo=new workorder();
        insert wo;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now());
        insert sa1;
        WorkPlan wp = new WorkPlan(Name='as', ParentRecordId = wo.Id);
        insert wp;
        WorkStep ws1 = new WorkStep(Name = 'Before Photo', WorkPlanId = wp.Id, ExecutionOrder = 1);
        insert ws1;
        ws1.ExecutionOrder=2;
        
        WorkStep ws2 = new WorkStep(Name = 'After Photo', WorkPlanId = wp.Id, ExecutionOrder = 2);
        insert ws2;
        ws1.ExecutionOrder=1;
        
        try
            
        {
            
            
            
            database.update (ws1,true);
            
            
            
        }
        
        catch(Exception error) {
            system.debug(error.getMessage());
            System.assert(error.getMessage().contains('Update failed.'));
            System.assert(error.getMessage().contains('FIELD_CUSTOM_VALIDATION_EXCEPTION'));
            System.assert(error.getMessage().contains('Upload Before Stage Photo'));
        }
        try
            
        {
            
            
            
            database.update (ws2,true);
            
            
            
        }
        
        catch(Exception error) {
            system.debug(error.getMessage());
            System.assert(error.getMessage().contains('Update failed.'));
            System.assert(error.getMessage().contains('FIELD_CUSTOM_VALIDATION_EXCEPTION'));
            System.assert(error.getMessage().contains('Upload After Stage Photo'));
        }
        Test.stopTest();
        
        
        
    }
    
    @isTest
    public static void testMethod7(){
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

        worktypegroup wt=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Inside');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        workorder wo=new workorder(WorkTypeId=wt1.id);
        insert wo;
        
        lead customer=new lead (lastname='raman',company='ui');
        insert customer;
        ServiceTerritory st=[Select id from ServiceTerritory limit 1];
        
        getSlots.createWorkOrder(customer.id,wt1.id,'One Time',st.id, 6 , 'requestQuote' , 'CHF',False);
        
        lead customer1=new lead (lastname='rama11n',company='uioj');
        insert customer1;
         account customeracc=new account (name='rama11n',email__c='uioj@gmail.com');
        insert customeracc;
                getSlots.createWorkOrder(customer.id,wt1.id,'One Time',st.id, 6 , 'requestQuote' , 'CHF',False);
                getSlots.createWorkOrder(customeracc.id,wt1.id,'One Time',st.id, 6 , 'requestQuote' , 'CHF',False);
             workorder wo2=new workorder(WorkTypeId=wt1.id,accountId=customeracc.id);
        insert wo2;
                        getSlots.createWorkOrder(customeracc.id,wt1.id,'One Time',st.id, 6 , 'requestQuote' , 'CHF',False);
getSlots.convertLead(customeracc.id,wo2.id);

        
    }
    
    @isTest
    public static void testMethod8(){
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

        worktypegroup wt=new worktypegroup(name='FULL',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='FULL');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        workorder wo=new workorder(WorkTypeId=wt1.id);
        insert wo;
        
        lead customer=new lead (lastname='raman',company='ui');
        insert customer;
        ServiceTerritory st=[Select id from ServiceTerritory limit 1];
        
        getSlots.createWorkOrder(customer.id,wt1.id,'One Time',st.id, 6 , 'requestQuote' , 'CHF',False);
        
    }
    
    @isTest
    public static void testMethod9(){
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

        worktypegroup wt=new worktypegroup(name='Customize',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='Anpassen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='Customize');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        lead customer=new lead (lastname='raman',company='ui');
        insert customer;
        ServiceTerritory st=[Select id from ServiceTerritory limit 1];
        serviceappointment sa2=[select id from serviceappointment limit 1 ];
        
        Test.startTest();
        
        
        String woId= getSlots.createWorkOrder(customer.id,wt1.id,'One Time',st.id, 6 , 'requestQuote' , 'CHF',False);        Test.stopTest();
        
        getSlots.submitForm(sa2.id,'rolls','white','2017', '8240822938');
        getSlots.updateServiceAppointmentTotalPrice(sa2.id,109);
        //CustomerQuote__c c=new CustomerQuote__c(Lead__c=customer.id,Price__c=90,name='89');
        //insert c;
        getSlots.convertLead(customer.id, woId);
        
        List<Map<String,Object>> addOns= new List<Map<String,Object>>();
        worktype wt2=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',Price__c=45);
        insert wt2;
        map <string,object> map1=new map<string,object>();
        map1.put('Quantity',2);
        map1.put('Id',wt2.id);
        map1.put( 'Price',45);
        map1.put('Name',wt2.name);
        addons.add(map1);
        workorder wo2=[Select id from workorder limit 1];
        zaWash_Quote__c quoteRecord1 = new zaWash_Quote__c(Work_Order__c = wo2.Id  , Number_of_Cars__c = 5 );
        insert quoteRecord1;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo2.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now());
        insert sa1;
        getSlots.createCustomerOrders(addons,customer.id,wo2.id,78.00,'done', sa1.Id , '1234567890');
        
        account acc=[select id from account limit 1];
        account acc1=new account(name='trest',email__c='test67@gmail.com');
        insert acc1;
        contact con =new contact(lastname='trest');
        insert con;
        lead l2=new lead(lastname='trest',email='puneetsharma072000@gmail.com');
        insert l2;
        workorder w2=new workorder(leadId__c=l2.id,numberOfCars__c=1);
        insert w2;
        //CustomerQuote__c c1=new CustomerQuote__c(Lead__c=l2.id,Price__c=90,name='89');
        //insert c1;
        zaWash_Quote__c quoteRecord2 = new zaWash_Quote__c(Work_Order__c = w2.Id , Number_of_Cars__c = 5);
        insert quoteRecord2;
        
        getSlots.convertLead(l2.id, w2.Id);
        getSlots.getWorkOrder(acc1.id);
        
        
        serviceappointment sa=new serviceappointment(ParentRecordId=w2.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=23);
        insert sa;
                List<User> userList = [Select Id, Name, Profile.UserLicense.Name From User WHERE Profile.Name = 'System Administrator' and isactive=true];

        serviceresource sr=new serviceresource(name='raman',resourcetype='T',RelatedRecordId=userList[0].id,isActive=true,rating__c=3);
        insert sr;
        
        OperatingHours oh=new OperatingHours(name='Gold Appointments Calendar');
        insert oh;
        
        TimeSlot tm =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(1, 0, 0, 0),EndTime=Time.newInstance(3, 0, 0, 0),OperatingHoursId=oh.id);   
        TimeSlot tm1 =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(4, 0, 0, 0),EndTime=Time.newInstance(6, 0, 0, 0),OperatingHoursId=oh.id);    
        
        insert tm;
        insert tm1;
        ServiceTerritory st1= new ServiceTerritory(Name='a',OperatingHoursId=oh.id ,IsActive=true);
        insert st1;
        
        ServiceTerritoryMember stm=new ServiceTerritoryMember(ServiceResourceId=sr.id,ServiceTerritoryId=st1.id,TerritoryType='P',EffectiveStartDate=system.now());
        insert stm;
        AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa.id,ServiceResourceId=sr.id,Rating__c=4);
        insert as1;
        
        getSlots.submitRating(2.0,sa.id);
        
    }
    @isTest
    public static void newTestMethod(){
        getSlots.getContactId();
        serviceappointment sa=[select id from serviceappointment limit 1];
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
            workorder wo=new workorder(WorkTypeId=wt1.id,accountID=acc.id);
            insert wo;

            zaWash_Quote__c quoteRecord3 = new zaWash_Quote__c(Work_Order__c = wo.Id , Number_of_Cars__c = 5);
            insert quoteRecord3;
            
            serviceappointment sa1=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=56.00);
            insert sa1;
            
            AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa1.id,ServiceResourceId=sr.id);
            insert as1;
        
        getSlots.editAppointment(sa1.id,'white','rolls','2017',string.valueof(system.now()),string.valueof(system.now()+1));
         getSlots.applyFilter(sa1.id,'notnull',string.valueOf(date.today()),'FULL','2017');
                 getSlots.applyFilter(sa1.id,'null',string.valueOf(date.today()),'FULL','2017');
                 getSlots.applyFilter(sa1.id,'null','null','FULL','2017-2021');
              //   getSlots.applyFilter(null,'null','null',null,null);


        getSlots.cancelAppointment(sa.id);
        
       getSlots.getCustomizeAddons(wo.id);
          worktype wt2=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='Customize',ipaddress__c='1.1.1.1');
            insert wt2;
            worktypegroupmember wtr1=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt2.id);
            insert wtr1;
      //  account acc=new account(name='acc',email__c='acc@gmail.com');
       // insert acc;
            workorder wo2=new workorder(WorkTypeId=wt2.id,accountID=acc.id);
           insert wo2;
           zaWash_Quote__c quoteRecord4 = new zaWash_Quote__c(Work_Order__c = wo2.Id, Work_Type__c = wt2.Id , Number_of_Cars__c = 5  );
           insert quoteRecord4;
        CustomerOrder__c corder=new CustomerOrder__c(name='add', AddOns__c=wo2.id,zaWash_Quote__c=quoteRecord4.Id ,Price__c=23,Status__c = 'Included');
        insert corder;

     

               getSlots.getCustomizeAddons(wo2.id);
             
        List<Map<String,Object>> addOns= new List<Map<String,Object>>();
        worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',Price__c=45);
        insert wt3;
        map <string,object> map1=new map<string,object>();
        map1.put('Quantity',2);
        map1.put('Id',wt3.id);
        map1.put( 'Price',45);
        map1.put('Name',wt3.name);
        addons.add(map1);
        
        getSlots.createCustomerOrders(addons,acc.id,wo2.id,78.00,'done', sa1.Id , '1234567890');
       getSlots.getFinalPrice(sa1.id);

       
    }
     @isTest
    public static void workorderupdateMethod(){
        workorder wo=[select street,id from workorder limit 1];
        zawashHelperClass.updateWorkOrder(wo.id,'Switzerland');
    }

    
    @isTest
    public static void testSendEmail() {
        // Create a new account
        worktype wt=[select id from worktype limit 1];
        workorder wo=[select id from workorder limit 1];
        Account acct = new Account(Name='Test Account',email__c='test@gmail.com');
        insert acct;

        // Create a new zaWash_Quote__c 
        zaWash_Quote__c zwq= new zaWash_Quote__c (account__c=acct.id,Work_Type__c=wt.id,Number_of_Cars__c=5,Work_Order__c=wo.id);
        insert zwq;

        // Create a new attachment
        Attachment attach = new Attachment();
        attach.ParentId = zwq.Id;
        attach.Name = 'Test Attachment.txt';
        attach.Body = Blob.valueOf('Test Attachment Body');
        insert attach;

        // Call the sendEmail method and pass in the record Id
        list<Id> recordIds = new list<Id>();
        recordIds.add(zwq.Id);
        Test.startTest();
        zawashHelperClass.sendEmail(recordIds);
        Test.stopTest();

        list<id> recordsIds1=new list<Id>();
        recordsIds1.add(zwq.id);
        
        // Test.startTest();
        getSlots.makePdfMethod(recordsIds1);
        // Test.stopTest();

        
    }

    @isTest
    public static void testCustomerOrders() {
        // Create a new account
        worktype wt=[select id from worktype limit 1];
        workorder wo=[select id from workorder limit 1];
        Account acct = new Account(Name='Test Account',email__c='test@gmail.com');
        insert acct;

        // Create a new zaWash_Quote__c 
        zaWash_Quote__c zwq= new zaWash_Quote__c (account__c=acct.id,Work_Type__c=wt.id,Number_of_Cars__c=5,Work_Order__c=wo.id);
        insert zwq;
        CustomerOrder__c co=new CustomerOrder__c(name='1',Price__c=23.00,Quantity__c=2,zaWash_Quote__c=zwq.Id,addons__c=wo.id,Status__c = 'Included');
        
        insert co;
        list<id> recordsIDs=new list<Id>();
        recordsIds.add(zwq.id);
        
        test.startTest();
        getSlots.makePdfMethod(recordsIds);
        test.stopTest();
    
      
        
    }
    @isTest
    public static void invoicepdfwithcustomerorders(){
        account acc1=new account(name='acc',email__c='acc@gmail.com',Phone='3142536');
        insert acc1;
        worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside' , Price__c=55);
        insert wt3;
        workorder wo3=new workorder(WorkTypeId=wt3.id,accountId=acc1.id,numberOfCars__c=1);
        insert wo3;
        zaWash_Quote__c quoteRecord5 = new zaWash_Quote__c(Work_Order__c = wo3.Id , Number_of_Cars__c = 5);
        insert quoteRecord5;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo3.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=24,Include_VAT__c=true,Refund_Amount__c=150,Currency__c='CHF',Customer_Type__c='B2C',Street='Rampe de Switzerland',Discount_Amount__c='0');
        insert sa1;
        CustomerOrder__c corder=new CustomerOrder__c(name='add', AddOns__c=wo3.id,zaWash_Quote__c=quoteRecord5.Id ,Price__c=23,Quantity__c=5,Status__c = 'Included');
        insert corder;
        
        list<id> recordsIDs1=new list<Id>();
        recordsIds1.add(sa1.id);
        test.startTest();
        getSlots.makePdfMethod(recordsIds1);
        test.stopTest();
    }

    

    @isTest
    public static void invoicepdf(){
        account acc1=new account(name='acc',email__c='acc@gmail.com',Phone='3142536');
        insert acc1;
        worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside' , Price__c=55);
        insert wt3;
        workorder wo3=new workorder(WorkTypeId=wt3.id,accountId=acc1.id,numberOfCars__c=1);
        insert wo3;
        zaWash_Quote__c quoteRecord5 = new zaWash_Quote__c(Work_Order__c = wo3.Id , Number_of_Cars__c = 5);
        insert quoteRecord5;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo3.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=24,Include_VAT__c=true,Refund_Amount__c=150,Currency__c='CHF',Customer_Type__c='B2C',Street='Rampe de Switzerland',Discount_Amount__c='0');
        insert sa1;
    
        
        list<id> recordsIDs1=new list<Id>();
        recordsIds1.add(sa1.id);
        test.startTest();
        getSlots.makePdfMethod(recordsIds1);
        test.stopTest();
    }

    
    
    @isTest
    static void testScheduleAppointment() {
        // Create test data
        account acc1=new account(name='acc',email__c='acc@gmail.com',Phone='3142536');
        insert acc1;
        worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside' , Price__c=55);
        insert wt3;
        workorder wo3=new workorder(WorkTypeId=wt3.id,accountId=acc1.id,numberOfCars__c=1);
        insert wo3;
        zaWash_Quote__c quoteRecord5 = new zaWash_Quote__c(Work_Order__c = wo3.Id , Number_of_Cars__c = 5);
        insert quoteRecord5;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo3.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=24,Include_VAT__c=true,Refund_Amount__c=150,Currency__c='CHF',Customer_Type__c='B2C',Street='Rampe de Switzerland',Discount_Amount__c='0');
        insert sa1;
        
        FSL__Scheduling_Policy__c fs=new FSL__Scheduling_Policy__c(name='Customer First One');
        insert fs;
        
        // Call the method being tested
        Test.startTest();
        getSlots.scheduleAppointment(sa1.Id, fs.Id);
        Test.stopTest();
        
    }


    

}