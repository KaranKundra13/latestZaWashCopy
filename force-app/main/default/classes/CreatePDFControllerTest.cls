@isTest
private class CreatePDFControllerTest {
    static testMethod void testCreateAndAttachPDF() {
        Account acc = new Account(Name='Test Account');
        insert acc;
        
        String htmlContent = '<html><body><p>Test HTML Content</p></body></html>';
        
        // CreatePDFController pdfController = new CreatePDFController();
        
        account acc1=new account(name='acc',email__c='acc@gmail.com');
        insert acc1;
        worktype wt3=new worktype(Name='JUST Outside',EstimatedDuration=45,DurationType='Minutes',Country__c='Switzerland',icon__c='ghhh',English__c='JUST Outside');
        insert wt3;
        workorder wo3=new workorder(WorkTypeId=wt3.id,accountId=acc1.id,numberOfCars__c=1);
        insert wo3;
        zaWash_Quote__c quoteRecord = new zaWash_Quote__c(Work_Order__c = wo3.Id , Number_of_Cars__c = 5);
        insert quoteRecord;
        serviceappointment sa1=new serviceappointment(ParentRecordId=wo3.id,EarliestStartTime=system.now(),DueDate=system.now()+5,SchedEndTime=system.now()+5,SchedStartTime=system.now(),Total_Price__c=24,Include_VAT__c=true);
        insert sa1;
        
        //Id quoteId , String htmlContent , String zaWashAddress , String customer , Decimal Amount, id recordid
        CreatePDFController.createAndAttachPDF(quoteRecord.Id, htmlContent , 'zaWashAddress' , 'customer' , '109' , 'Refund');
        
        
    }
}