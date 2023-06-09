trigger changeWorkStep on WorkStep (before update) 
{
    if(trigger.new[0].Name == 'Before Photo')
    {       
        WorkPlan wp = [Select Id, Name, WorkOrderId from WorkPlan Where Id = :trigger.new[0].WorkPlanId Limit 1];
        ServiceAppointment sa = [Select Id, ParentRecordId from ServiceAppointment Where ParentRecordId = :wp.WorkOrderId Limit 1];
        List<ContentDocumentLink> Contdoclinklist = [SELECT Id, LinkedEntityId, ContentDocumentId,Visibility, IsDeleted, ShareType,ContentDocument.Title,
                                                     ContentDocument.createdDate, ContentDocument.FileType FROM ContentDocumentLink WHERE LinkedEntityId =:sa.Id];
        if(Contdoclinklist.size() <= 0){
            trigger.new[0].Status = 'New';
            trigger.new[0].Status.addError('Upload Before Stage Photo');
        }
    }
    else if(trigger.new[0].Name == 'After Photo')
    {    
        WorkPlan wp = [Select Id, Name, WorkOrderId from WorkPlan Where Id = :trigger.new[0].WorkPlanId Limit 1];
        ServiceAppointment sa = [Select Id, Status, ParentRecordId from ServiceAppointment Where ParentRecordId = :wp.WorkOrderId Limit 1];
        List<ContentDocumentLink> Contdoclinklist = [SELECT Id, LinkedEntityId, ContentDocumentId,Visibility, IsDeleted, ShareType,ContentDocument.Title,
                                                     ContentDocument.createdDate, ContentDocument.FileType FROM ContentDocumentLink WHERE LinkedEntityId =:sa.Id];
        if(Contdoclinklist.size() <= 1)
        {
            trigger.new[0].Status = 'New';
            trigger.new[0].Status.addError('Upload After Stage Photo');
        }
    }
}