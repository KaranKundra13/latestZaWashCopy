@IsTest
public class displayTimezoneControllerTest {
    @IsTest
    public static void testUserTimezone() {
        // Create a test ServiceAppointment record
               account acc1=new account(name='acc',email__c='acc@gmail.com');
        insert acc1;
        worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
        insert wt3;
        workorder wo3=new workorder(WorkTypeId=wt3.id,accountId=acc1.id,numberOfCars__c=1);
        insert wo3;
        zaWash_Quote__c quoteRecord5 = new zaWash_Quote__c(Work_Order__c = wo3.Id , Number_of_Cars__c = 5);
        insert quoteRecord5;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo3.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=24,Include_VAT__c=true);
        insert sa1;
        
        // Create a new instance of the StandardController with the test appointment
        ApexPages.StandardController sc = new ApexPages.StandardController(sa1);
        
        // Create a new instance of the displayTimezoneController using the StandardController
        displayTimezoneController controller = new displayTimezoneController(sc);
        
        // Assert that the userTimezone property matches the user's timezone
        System.assertEquals(UserInfo.getTimeZone().getID(), controller.userTimezone);
        
        // Assert that the ServiceAppointment record in the controller matches the test appointment
        System.assertEquals(sa1.Id, controller.getServiceAppointment().Id);
    }
}