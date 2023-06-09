@isTest
public class zawashHelperClassTest {
    
    @testSetup static void methodName() {


        Translation__c tr=new Translation__c(name='trans',english__c='trans',french__C='trans',german__c='trna');
        insert tr;
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

        worktypegroup wt=new worktypegroup(name='JUST Outside',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        
        zaWash__c zw=new zaWash__c(name__c='googleMapApiKey',value__c='AIzaSyA50_sS8NAwy7gHeObvhFlozNW3RTxsCG8');
        insert zw;

OperatingHours oh=new OperatingHours(name='Gold Appointments Calendar');
insert oh;        
        ServiceTerritory st= new ServiceTerritory(name ='Switzerland',OperatingHoursId=oh.id,IsActive=true,Latitude__c=1234.56,Longitude__c=1434.56);
        insert st;
        
    }
      @istest
    public static void TestMethod1(){
        zawashHelperClass.getworkTypeGroups('https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','One Time','bookNow','Switzerland','CHF');
        zawashHelperClass.getworkTypeGroups('https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','One Time','requestQuote','Switzerland', 'EUR');
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

        worktypegroup wtc=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        insert wtc;
        worktype wt1c=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
        insert wt1c;
        worktypegroupmember wtrc=new worktypegroupmember(WorkTypeGroupId=wtc.id,WorkTypeId=wt1c.id);
        insert wtrc;
       zawashHelperClass.getCharges('One Time',wt1c.Id,'https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','bookNow','Germany', 'CHF');
                id devRecordTypeId2 = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2B').getRecordTypeId();

         worktypegroup wtb=new worktypegroup(name='gerade außen',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId2);
        insert wtb;
        worktype wt1b=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
        insert wt1b;
        worktypegroupmember wtrb=new worktypegroupmember(WorkTypeGroupId=wtb.id,WorkTypeId=wt1b.id);
        insert wtrb;
       zawashHelperClass.getCharges('One Time',wt1b.Id,'https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','requestQuote','Germany', 'CHF');
         

        
         Test.setMock(HttpCalloutMock.class, new zaWashHelperMockCallout());
	Test.startTest();
    zawashHelperClass.getUserSessionId();
    zawashHelperClass.getCharges('One Time',wt1c.Id,'https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','bookNow','Switzerland', 'CHF');
               zawashHelperClass.getSearchSuggetions('Switzerland');
 	Test.stopTest();  
        
      case c= zawashHelperClass.createCase('test','test@gmail.com','68673793','Study');
        double a=78.32;
            double b=75.34;
       List<ServiceTerritory> lt= zawashHelperClass.closestServiceTerritory(a,b,'Switzerland');
     string s= zawashHelperClass.getVFOrigin();

    }
    
     
    @istest 
    public static void TestMethod2(){

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new zaWashHelperMockCallout());
        
        list<string> res = zawashHelperClass.getSearchSuggetions('Switzerland');
        Test.stopTest();
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

         worktypegroup wt=new worktypegroup(name='JUST Inside',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='Gerade Innen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Inside');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
                    zawashHelperClass.getCharges('One Time',wt1.Id,'https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','bookNow','Switzerland', 'CHF');

        
    }

	
    
    @istest 
    public static void TestMethod3(){

        
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new zaWashHelperMockCallout1());
        
        string res = zawashHelperClass.getLatLngFromPlaceId('ChIJgeJXTN9KbDkRCS7yDDrG4Qw');
        Test.stopTest();
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

         worktypegroup wt=new worktypegroup(name='FULL',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='FULL',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='FULL');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
                            zawashHelperClass.getCharges('One Time',wt1.Id,'https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','booknow','Switzerland', 'CHF');

    }
    
    @isTest
    public static void TestMethod4(){
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

         worktypegroup wt=new worktypegroup(name='Customize',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='Anpassen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='Customize');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
                Test.startTest();

       
        zawashHelperClass.getCharges('One Time',wt1.Id,'https://zawash--sandbox.sandbox.lightning.force.com/resource/1662545587000/Zawash','booknow','Switzerland', 'CHF');
        Test.stopTest();

    }
    
    @istest
    public static void TestMethod5()
    {
       zawashHelperClass.getLabels('english');
                id devRecordTypeId = Schema.SObjectType.worktypegroup.getRecordTypeInfosByName().get('B2C').getRecordTypeId();

         worktypegroup wt=new worktypegroup(name='Customize',payment_method__c='One Time',GroupType='Default',RecordTypeId=devRecordTypeId);
        
        insert wt;
        worktype wt1=new worktype(Name='Anpassen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='Travel',Currency__c='EUR');
        insert wt1;
        worktypegroupmember wtr=new worktypegroupmember(WorkTypeGroupId=wt.id,WorkTypeId=wt1.id);
        insert wtr;
        
        zawashHelperClass.getTravel('Switzerland','EUR');
        account acc=new account(name='try');
        insert acc;
        zawashHelperClass.test(acc.id,'Running');
        zawashHelperClass.getAppointments(acc.id);
        
        zawashHelperClass.getQuotes(acc.id);
    }

    @istest
    public static void TestMethod6()
    {
        OperatingHours oh=new OperatingHours(name='Gold Appointments Calendar');
        insert oh;
        
        TimeSlot tm =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(1, 0, 0, 0),EndTime=Time.newInstance(3, 0, 0, 0),OperatingHoursId=oh.id);   
        TimeSlot tm1 =new TimeSlot(DayOfWeek='Monday',Type='Normal',StartTime=Time.newInstance(4, 0, 0, 0),EndTime=Time.newInstance(6, 0, 0, 0),OperatingHoursId=oh.id);    
        
        insert tm;
        insert tm1;
        ServiceTerritory st= new ServiceTerritory(Name='a',OperatingHoursId=oh.id ,IsActive=true);
        insert st;
        
        
        String uniqueUserName = 'standarduser' + DateTime.now().getTime() + '@testorg.com';
        worktype wt1=new worktype(Name='gerade außen',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
            insert wt1;
            account acc=new account(name='acc',email__c='acc@gmail.com');
        insert acc;
        Profile p = [SELECT Id FROM Profile WHERE Name='System Administrator'];
        User u = new User(Alias = 'standt', Email='standarduser@testorg.com',
                          EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US',
                          LocaleSidKey='en_US', ProfileId = p.Id,
                          TimeZoneSidKey='America/Los_Angeles',
                          UserName=uniqueUserName);
                          insert u;
                List<User> userList = [Select Id, Name, Profile.UserLicense.Name From User WHERE Profile.Name = 'System Administrator' and isactive=true];
                workorder wo=new workorder(WorkTypeId=wt1.id,accountId=acc.id,numberOfCars__c=1);
            insert wo;
        serviceresource sr=new serviceresource(name='raman',resourcetype='T',RelatedRecordId=userList[0].id,isActive=true);
        insert sr;
        ServiceTerritoryMember stm=new ServiceTerritoryMember(ServiceResourceId=sr.id,ServiceTerritoryId=st.id,TerritoryType='P',EffectiveStartDate=system.now());
        insert stm;
        serviceappointment sa=new serviceappointment(ParentRecordId=wo.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=23,ServiceTerritoryId=st.id);
        insert sa;
            
        AssignedResource as1=new AssignedResource(ServiceAppointmentId=sa.id,ServiceResourceId=sr.id);
        insert as1;
        zawashHelperClass.getServiceResource(sa.Id);
    }

    @isTest
    static void testMethodSetAllRecords() {
        // Create test data
        Account acc = new Account(Name='Test Account', Email__c='test@example.com');
        insert acc;
         Lead testLead = new Lead(Company='Test Company', Email='testlead@example.com',LastName = 'Fry');
        insert testLead;
        
        // Convert the lead to an account and contact
        Database.LeadConvert lc = new database.LeadConvert();
        lc.setLeadId(testLead.Id);
        lc.setAccountId(acc.Id);
        //lc.setContactLastName('Test Contact');
        lc.setConvertedStatus('Qualified');
        Database.LeadConvertResult lcr = Database.convertLead(lc);

        User u = new User(Username='testu67586868686868686ser@example.com', Email='testuser@example.com', LastName='Test', 
                          FirstName='User', Alias='testuser', TimeZoneSidKey='GMT',
                          LocaleSidKey='en_US', EmailEncodingKey='UTF-8', LanguageLocaleKey='en_US',
                          ProfileId = UserInfo.getProfileId());
       // u.AccountId = acc.Id;
     //string uo=   Site.createPortalUser(u,'001x000xxx35tPN','cyntexa@123');
       insert u;
    worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside',Price__c=23);
        insert wt3;
        workorder wo3=new workorder(WorkTypeId=wt3.id,accountId=acc.id,numberOfCars__c=1);
        insert wo3;
        zaWash_Quote__c quoteRecord5 = new zaWash_Quote__c(Work_Order__c = wo3.Id , Number_of_Cars__c = 5,account__C=acc.id);
        insert quoteRecord5;

  

        // Call the method under test
        Test.startTest();
       zawashHelperClass.methodSetAllRecords('test@example.com',u.id);
        Test.stopTest();

        // Verify that the updates were made and the account was deleted

        //System.assertNull([SELECT Id FROM Account WHERE Email__c='test@example.com']);
    }
@isTest
    public static  void testContentVersionTrigger() {
        // Create a new ContentVersion record
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.Title = 'Test Content Version';
        contentVersion.PathOnClient = 'TestFile.txt';
        contentVersion.VersionData = Blob.valueOf('Test file contents');
        insert contentVersion;

        // Query for the created ContentDistribution record

        
    }

}