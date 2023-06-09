trigger resourceRating on AssignedResource ( before Update ) 
{
	for(AssignedResource ar : trigger.new)
    {
        List<AssignedResource> arList = [Select Id, ServiceAppointmentId, Rating__c, ServiceResourceId From AssignedResource Where ServiceResourceId = :ar.ServiceResourceId AND Rating__c != null];
        ServiceResource sr = [Select Id, Rating__c From ServiceResource Where Id = :ar.ServiceResourceId];
        Decimal Sum = 0;
        Decimal Count = 0;
        for(AssignedResource assignedRes : arList)
        {
          	Sum = Sum + assignedRes.Rating__c;
           	Count++;
        }
        if(Count == 0)
        {
            sr.Rating__c = 0;
        }else{
            sr.Rating__c = Sum / Count;
        }
        
        update sr;
    }
    
}