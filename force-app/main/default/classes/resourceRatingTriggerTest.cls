@isTest
public class resourceRatingTriggerTest {
    
    @TestSetup static void testSetupmethod(){
              
        

        
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
        WorkOrder wo = new WorkOrder(accountId = customer.Id, Subject= 'Work for '+customer.lastName, WorkTypeId = wt1.Id, ServiceTerritoryId = st1.id);
        insert wo;
        
        serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5);
        insert sa;
                
        ServiceTerritory st= new ServiceTerritory(name ='Switzerland',OperatingHoursId=oh.id,IsActive=true,Latitude__c=1234.56,Longitude__c=1434.56);
        insert st;
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
        
        
        String woId= getSlots.createWorkOrder(customer.id,wt1.id,'One Time',st.id, 6);        Test.stopTest();
        
        getSlots.submitForm(sa2.id,'rolls','white','2017');
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
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo2.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now());
        insert sa1;
        getSlots.createCustomerOrders(addons,customer.id,wo2.id,78.00,'done', sa1.Id);
        
        account acc=[select id from account limit 1];
        string abc=  getSlots.encryptCustomer(acc.id);
        getSlots.decryptCustomer(abc);
        account acc1=new account(name='trest',email__c='test67@gmail.com');
        insert acc1;
        contact con =new contact(lastname='trest');
        insert con;
        lead l2=new lead(lastname='trest',email='puneetsharma072000@gmail.com');
        insert l2;
        workorder w2=new workorder(leadId__c=l2.id);
        insert w2;
        //CustomerQuote__c c1=new CustomerQuote__c(Lead__c=l2.id,Price__c=90,name='89');
        //insert c1;
        
        getSlots.convertLead(l2.id, w2.Id);
        getSlots.getWorkOrder(acc1.id);
        
        
        serviceappointment sa=new serviceappointment(ParentRecordId=w2.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now());
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

}