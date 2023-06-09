public without sharing class getSlots {

    

    @AuraEnabled
    public static String deleteAddons(List<String> addOnsList , String ServiceAppointmentId , decimal refundAmount ,string refundtype , String serviceChoosen)
    {
        ServiceAppointment SA = [Select Total_Price__c, worktype.name ,ParentRecordId, Refund_Amount__c , Currency__c , Customer_Type__c , Include_VAT__c , Street , Account.Name , Account.Phone , Account.Email__c from ServiceAppointment where Id = :ServiceAppointmentId];
        workOrder wo = [Select WorkType.Name ,numberOfCars__c, WorkType.Price__c , WorkType.Country__c,WorkType.Currency__c , (Select Name , Price__c from CustomerOrders__r where Status__c = 'Included') , (Select Currency__c , workType.Name , Street , Refund_Amount__c , Total_Price__c,odooInvoiceId__c  from ServiceAppointments) from workOrder where Id = :SA.ParentRecordId];

        if(SA.Refund_Amount__c == null){SA.Refund_Amount__c = refundAmount;}else{SA.Refund_Amount__c = SA.Refund_Amount__c + refundAmount; }
        update SA;
        Credit_Note__c CR = new  Credit_Note__c();

        if(serviceChoosen == 'Initiate Refund'){
         CR = new Credit_Note__c(Amount__c = refundAmount,Currency__c = SA.Currency__c,Service_Appointment__c = SA.Id);
            insert CR;
        }

        String Legalentity;
        String Legaladdress;

        if(SA.Currency__c == 'CHF'){ Legalentity = '<p>zaWash Suisse Sàrl,</p>';Legaladdress = '<p>Route des Jeunes 4bis </p><p>1227, Les Acacias<p>';}else{Legalentity = '<p>zaWash Lyon SAS,</p>';Legaladdress = '<p>74 rue Louis Rustin </p><p>74160, Saint-Julien-En-Genevois</p>';}

        string tax;
        decimal amountAfterTax;
        Decimal AmountExcludingTax = 0;

        if(SA.Include_VAT__c == false){
            tax = '0.0%';
        }
        else{
            if(SA.Currency__c == 'CHF')
            {
                tax = '7.7%';
                amountAfterTax = (wo.WorkType.Price__c - (wo.WorkType.Price__c / 107.7 * 7.7)).setScale(2);
                
            }
            else
            {
                tax = '20%';
                amountAfterTax = (wo.WorkType.Price__c - (wo.WorkType.Price__c / 120 * 20)).setScale(2);
            }
        }


        String htmlContent = '';

        if(refundtype=='FULL'){
            htmlContent = htmlContent +'<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+SA.worktype.name+'</td><td style="text-align: center;padding: 10px 5px;">'+wo.numberOfCars__c+'</td><td style="text-align: center;padding: 10px 5px;">'+amountAfterTax+'</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';

             AmountExcludingTax = AmountExcludingTax + amountAfterTax;

             if(tax == '0.0%'){htmlContent = htmlContent + ( (wo.WorkType.Price__c * wo.numberOfCars__c) - ((wo.WorkType.Price__c * wo.numberOfCars__c) / 107.7 * 7.7)).setScale(2);}else{htmlContent = htmlContent + (wo.WorkType.Price__c * wo.numberOfCars__c).setScale(2);}
            
        }

        List<CustomerOrder__c> addOns = [Select Id , Name , Price__c , Quantity__c from CustomerOrder__c where Id IN :addOnsList];
        for(CustomerOrder__c order : addOns)
        {
            order.Status__c = 'Refunded';

                htmlContent = htmlContent + '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+order.Name+'</td><td style="text-align: center;padding: 10px 5px;">'+order.Quantity__c+'</td><td style="text-align: center;padding: 10px 5px;">';
                if(SA.Customer_Type__c == 'B2C'){ if(SA.Currency__c == 'CHF'){htmlContent = htmlContent + ((order.Price__c / order.Quantity__c) / 1.077).setScale(2);AmountExcludingTax = AmountExcludingTax + (((order.Price__c / order.Quantity__c) /  1.077) * order.Quantity__c);}else{htmlContent = htmlContent + ((order.Price__c / order.Quantity__c) / 1.20).setScale(2);AmountExcludingTax = AmountExcludingTax + (((order.Price__c / order.Quantity__c) / 1.20) * order.Quantity__c);}}else{htmlContent = htmlContent + (order.Price__c / order.Quantity__c).setScale(2);AmountExcludingTax = AmountExcludingTax + (order.Price__c);}

                htmlContent = htmlContent + '</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                
                if(tax == '0.0%'){if(SA.Customer_Type__c == 'B2C'){if(SA.Currency__c == 'CHF') { htmlContent = htmlContent + (order.Price__c / 1.077).setScale(2); }else{ htmlContent = htmlContent + (order.Price__c / 1.20).setScale(2);}}else{ htmlContent = htmlContent + (order.Price__c).setScale(2); }} else{if(SA.Customer_Type__c == 'B2C'){ htmlContent = htmlContent + (order.Price__c).setScale(2);}else{if(SA.Currency__c == 'CHF') {htmlContent = htmlContent + (order.Price__c + (order.Price__c * 7.7 / 100)).setScale(2);}else{htmlContent = htmlContent + (order.Price__c + (order.Price__c * 20 / 100)).setScale(2);} }}
                
                htmlContent = htmlContent + '</td></tr>';
        }

        update addOns;

        String Phone = Sa.Account.Phone;
        String emailof = SA.Account.Email__c;
        String Street = SA.Street;

        CreatePDFController.createAndAttachPDF(SA.Id , htmlContent , Legalentity + Legaladdress , '<p>' + emailof + '</p><p>' + Phone + '</p><p>' + Street+'</p>' , ''+AmountExcludingTax.setScale(2)+'' , 'Refund');
        list<attachment> pdfstosend=[SELECT Id, Name, Body, ContentType, ParentId FROM Attachment where parentId=:cr.id and name like 'Refund%'];
        // Create a new email object
        //List<Attachment> attachments = [ SELECT Id, Name, Body, ContentType FROM Attachment WHERE ParentId in :recordIds ];
        // zaWash_Quote__c zwQ=[Select lead__c,lead__r.email,lead__r.name,account__r.email__c,account__r.name,name,Work_Type__r.name,Number_of_Cars__c from zaWash_Quote__c where id in:recordIds];
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        
        email.setToAddresses(new String[] {sa.account.email__c });
        
        String subject='Refund Email';
        String htmlbody='<p>Hello '+sa.account.name+' ,</p><p>Here is your refund of the payment of CHF '+sa.Total_Price__c+'</p><p>Service Type : '+sa.worktype.name+'</p><p>Number of Cars : '+wo.numberOfCars__c+'</p><p><br></p><p>Thank You .</p>';
        if(wo.WorkType.Country__c=='Switzerland'||wo.WorkType.Country__c=='France'){
            subject ='E-mail de remboursement';
         htmlbody='<p>Bonjour '+sa.account.name+' ,</p><p>Voici votre remboursement du paiement de  '+sa.Total_Price__c+'</p><p>Type de service : '+sa.worktype.name+'</p><p>Nombre de voitures : '+wo.numberOfCars__c+'</p><p><br></p><p>Merci .</p>';
            // accountHtmlbody='<p>Bonjour '+zwQ.account__r.name+' ,</p><p>Votre demande a été acceptée.</p><p>Voici les détails du devis :</p><p><br></p><p>Numéro de devis : '+zwQ.Name+'</p><p>Type de service : '+zwQ.Work_Type__r.name+'</p><p>Nombre de voitures  : '+zwQ.Number_of_Cars__c+'</p><p><br></p><p>Merci .</p>';
        }
        else if(wo.WorkType.Country__c=='Germany'){
            subject ='Rückerstattungs-E-Mail';
            htmlbody='<p>Hallo '+sa.account.name+' ,</p><p>Hier ist Ihre Rückerstattung der Zahlung von CHF '+sa.Total_Price__c+'</p><p>Diensttyp : '+sa.worktype.name+'</p><p>Anzahl der Autos : '+wo.numberOfCars__c+'</p><p><br></p><p>Danke .</p>';
            // accountHtmlbody=
        }
        email.setSubject(subject);
        email.setHtmlBody(htmlbody);
        
        List<Messaging.EmailFileAttachment> fileAttachments = new List<Messaging.EmailFileAttachment>();
        for(Attachment a : pdfstosend){
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
                                            
        return 'Deleted';
    }

    @AuraEnabled
    public static List<workOrder> getServiceDetails(String ServiceAppointmentId){
       ServiceAppointment SA = [Select odooInvoiceId__c, ParentRecordId , Transaction__r.Payment_Id__c from ServiceAppointment where Id = :ServiceAppointmentId];
       List<workOrder> wo = [Select WorkType.Name , WorkType.Price__c , WorkType.Currency__c , (Select Name , Price__c from CustomerOrders__r where Status__c = 'Included') , (Select Currency__c , workType.Name , Street , Refund_Amount__c , Total_Price__c,odooInvoiceId__c , Payment_Status__c  from ServiceAppointments) from workOrder where Id = :SA.ParentRecordId];
       return wo;   
    }
    
    @AuraEnabled
    public static ServiceAppointment getServiceAppointment(String apptId)
    {
        ServiceAppointment sa = [Select Id, AppointmentNumber , Transaction__r.Payment_Id__c from ServiceAppointment Where Id = :apptId];
        return sa;	
    }
    
    @AuraEnabled
    public static String submitRating(Decimal rate, String SAId)
    {
        ServiceAppointment SA = [Select Id from ServiceAppointment Where Id = :SAId];
        AssignedResource assignedRes = [Select Rating__c from AssignedResource Where ServiceAppointmentId = :SA.Id Limit 1];
        assignedRes.Rating__c = rate;
        update assignedRes;	
        return assignedRes.Id;
    }
    
    @AuraEnabled
    public static String submitForm(String SAId, String brand, String plate, String carYear, String phoneNum)
    {
        ServiceAppointment SA = [Select Id, Car_brand_and_model__c, Car_plate__c, Car_Year__c ,ParentRecordId from ServiceAppointment Where Id = :SAId];
        SA.Car_brand_and_model__c = brand;
        SA.Car_plate__c = plate;
        SA.Car_Year__c = carYear;
        SA.Client_Phone_Number__c = phoneNum;
        update SA;
        zaWash_Quote__c quoteRecord = [Select Id , Phone__c from zaWash_Quote__c where Work_Order__c = :SA.ParentRecordId limit 1];
        quoteRecord.Phone__c = phoneNum;
        update quoteRecord;
        return SA.Id;
    }
    
    @AuraEnabled
    public static List<CustomerOrder__c> createCustomerOrders(List<Map<String,Object>> addOns, String LeadId, String woId, Decimal totalPrice, String payData, String SaId , string mobileNoEntered )
    {
        system.debug(addOns);
        Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io =(id)LeadId;
        if(io.getSobjectType()==LeadObject)
        {
            Lead l = [Select Id, lastName from Lead Where Id = :LeadId];
            l.Phone = mobileNoEntered;
            WorkOrder wo = [Select Id, totalPriceExcVAT__c , (Select Price__c, Name from CustomerOrders__r) from WorkOrder Where Id = :woId ];
            zaWash_Quote__c quoteRecord = [Select Id , Lead__c from zaWash_Quote__c where Work_Order__c = :woId limit 1];
            ServiceAppointment SA = [Select Customer_Type__c, Total_Price__c from ServiceAppointment Where Id = :SaId];
            quoteRecord.Phone__c = mobileNoEntered;
            if(SA.Customer_Type__c == 'B2C')
            {
                SA.Include_VAT__c = True;
            }
            else if(SA.Customer_Type__c == 'B2B')
            {
                SA.Include_VAT__c = False;
                //wo.QuoteCreated__c = True;
            }
            wo.totalPriceExcVAT__c = totalPrice;if(wo.CustomerOrders__r.size() > 0){SA.Total_Price__c = totalPrice + wo.CustomerOrders__r[0].Price__c;}else{SA.Total_Price__c = totalPrice;}
            wo.PaymentData__c = payData;

            
            List<CustomerOrder__c> insertOrders = new List<CustomerOrder__c>();
            for(Map<String, Object> rec : addOns)
            {
                Decimal qty = (Decimal)rec.get('Quantity');
                Id wtId = (Id)rec.get('Id');
                Decimal price = (Decimal)rec.get('Price') * (Decimal)rec.get('Quantity');
                String naam = (String)rec.get('Name');
                CustomerOrder__c lco = new CustomerOrder__c(Price__c = price, Quantity__c = qty, Name = naam, Work_Type__c = wtId, AddOns__c= woId ,zaWash_Quote__c = quoteRecord.Id , Status__c = 'Included');
                insertOrders.add(lco);
            }
            update SA;
            update wo;
            update quoteRecord;
            update l;
            insert insertOrders;
            return insertOrders;
        }
        else
        {
            Account acc = [Select Id, Email__c from Account Where Id = :LeadId];
            acc.Phone = mobileNoEntered;
            WorkOrder wo = [Select Id , (Select Price__c,Name from CustomerOrders__r) from WorkOrder Where Id = :woId ];
            zaWash_Quote__c quoteRecord = [Select Id , Lead__c from zaWash_Quote__c where Work_Order__c = :woId limit 1];
            ServiceAppointment SA = [Select Customer_Type__c, Total_Price__c from ServiceAppointment Where Id = :SaId];
            quoteRecord.Phone__c = mobileNoEntered;
            if(SA.Customer_Type__c == 'B2C')
            {
                SA.Include_VAT__c = True;
            }
            else if(SA.Customer_Type__c == 'B2B')
            {
                SA.Include_VAT__c = False;
            }if(wo.CustomerOrders__r.size() > 0){SA.Total_Price__c = totalPrice + wo.CustomerOrders__r[0].Price__c;}else{SA.Total_Price__c = totalPrice;}
            wo.PaymentData__c = payData;
            wo.totalPriceExcVAT__c = totalPrice;
            List<CustomerOrder__c> insertOrders = new List<CustomerOrder__c>();
            for(Map<String, Object> rec : addOns)
            {
                Decimal qty = (Decimal)rec.get('Quantity');
                Id wtId = (Id)rec.get('Id');
                Decimal price = (Decimal)rec.get('Price') * (Decimal)rec.get('Quantity');
                String naam = (String)rec.get('Name');
                CustomerOrder__c lco = new CustomerOrder__c(Price__c = price, Quantity__c = qty, Name = naam,  Work_Type__c = wtId, AddOns__c= woId ,zaWash_Quote__c = quoteRecord.Id , Status__c = 'Included');
                //CustomQuote__c = lcq.Id,
                insertOrders.add(lco);
            }
            update SA;
            update wo;
            update quoteRecord;
            update acc;
            insert insertOrders;
            return insertOrders;
        }
    }
    
    @AuraEnabled
    public static Decimal getFinalPrice(String serviceApptId)
    {
        ServiceAppointment SA = [Select Id, Total_Price__c from ServiceAppointment Where Id = :serviceApptId];
        return SA.Total_Price__c;
    }
    
    @AuraEnabled
    public static String convertLead(String LeadId, String woId)
    {
        Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io =(id)LeadId;
        if(io.getSobjectType()==LeadObject)
        {
            Lead l = [Select LastName, Email, Company, Phone, CustomerId__c from Lead Where Id = :LeadId ];
            String mail = l.Email;
            String cusId = l.CustomerId__c;
            String phoneNum = l.Phone;
            WorkOrder wo = [Select LeadId__c, AccountId from WorkOrder Where LeadId__c = :l.Id Order By CreatedDate DESC Limit 1];
            //CustomerQuote__c cusquote= [Select relatedAccount__c, Lead__c from CustomerQuote__c Where Lead__c = :l.Id Order By CreatedDate DESC Limit 1];
            Database.LeadConvert lc = new database.LeadConvert();
            lc.setLeadId(l.Id);
            lc.setDoNotCreateOpportunity(True);
            LeadStatus convertStatus = [SELECT Id,MasterLabel,ApiName FROM LeadStatus WHERE IsConverted=true LIMIT 1];
            lc.setConvertedStatus(convertStatus.ApiName);
            Database.LeadConvertResult lcr = Database.convertLead(lc);
            Id accId = lcr.getaccountid();
            Account acc = [select Id, customerId__c, Email__c from Account Where Id = :accId ];
            acc.Email__c = mail;
            acc.customerId__c = cusId;
            acc.Phone = phoneNum;
            update acc;
            wo.AccountId = acc.Id;
            update wo;
            return (string)acc.Id;
        }else{
            List<Account> existacc = [Select Email__c from Account Where Id = :LeadId];
            WorkOrder wo = [Select LeadId__c, AccountId from WorkOrder Where Id = :woId ];
            wo.AccountId = existacc[0].Id;
            
            update wo;
            return (string)existacc[0].Id;
            
        }
    }
    
    @AuraEnabled
    public static List<WorkOrder> getWorkOrder(String accId)
    {
        Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io =(id)accId;
        if(io.getSobjectType()==LeadObject)
        {
            List<WorkOrder> woList = [Select id,(Select Name, Quantity__c, Price__c from CustomerOrders__r), 
                                      Subject, LeadId__c, LeadId__r.Name , WorkType.Name, WorkType.Currency__c, WorkType.icon__c, 
                                      CreatedDate, PaymentData__c, Transaction__c from WorkOrder Where LeadId__c = :accId ORDER By CreatedDate Desc];
            
            return woList;
        }
        else
        {
            List<WorkOrder> woList = [Select id,(Select Name, Quantity__c, Price__c from CustomerOrders__r), 
                                      Subject, AccountId, Account.Name , WorkType.Name, WorkType.Currency__c, WorkType.icon__c, 
                                      CreatedDate, PaymentData__c, Transaction__c from WorkOrder Where AccountId = :accId ORDER By CreatedDate Desc];
            
            return woList;
        }
    }
    
    @AuraEnabled
    public static void updateServiceAppointmentTotalPrice(String SAId , decimal price)
    {   
        ServiceAppointment SA = [Select Total_Price__c from ServiceAppointment where Id = :SAId];
        SA.Total_Price__c = price;
        update SA;
    }
    
    @future
    public static void scheduleAppointment(String serviceApptId, String schedulingId)
    {
        FSL.ScheduleResult myResult = new FSL.ScheduleResult();
        myResult = FSL.ScheduleService.schedule(schedulingId, serviceApptId);
        Check_Assigned_Resource__e event = new Check_Assigned_Resource__e();
    
        event.serviceAppointmentId__c = serviceApptId;
        EventBus.publish(event);
        
    }

    @AuraEnabled
    public static String sendTime(String worderId, String startT, String endT,string Currencystr)
    {
        Datetime startTime = Datetime.valueOf(startT);
        Datetime endTime = Datetime.valueOf(endT);
        System.debug('Received => startTime'+startTime + 'endTime' + endTime);
        WorkOrder wo = [Select id, Subject, WorkType.English__c, WorkType.Name from WorkOrder where Id = :worderId FOR UPDATE];
        ServiceAppointment sa = [Select EarliestStartTime, ArrivalWindowEndTime, ArrivalWindowStartTime, Id, Address, ParentRecordId, Proceed__c FROM ServiceAppointment WHERE ParentRecordId = :worderId AND Proceed__c = False Order By CreatedDate Desc Limit 1];
        sa.Proceed__c = True;
        sa.Currency__c=Currencystr;
        sa.ArrivalWindowStartTime = startTime;
        sa.ArrivalWindowEndTime = endTime;
        sa.EarliestStartTime = startTime;
        Database.SaveResult insertResult1 = Database.update(sa, false);
        // update sa;
        system.debug(sa.ArrivalWindowEndTime);
        system.debug(sa.ArrivalWindowStartTime);
        system.debug(sa.Proceed__c);
        
        
        // Database.SaveResult updateResult = Database.update(sa, false);
        // if(!updateResult.isSuccess()){
        //     System.debug('Reason'+ updateResult.errors + ' + ' + updateResult.getErrors());
        // }
        WorkPlan wp = new WorkPlan(Name=wo.Subject+' '+wo.WorkType.Name, ParentRecordId = wo.Id);
        system.debug('wp '+ wp);
        
        
        // insert wp;
        // 
        Database.SaveResult insertResult = Database.insert(wp, false);
        system.debug('insertResult' + insertResult);
        if(!insertResult.isSuccess()){
            System.debug('Reason'+ insertResult.errors + ' + ' + insertResult.getErrors());
        } 
        if(insertResult.isSuccess()&&insertResult1.isSuccess()){ 
            System.debug('Success');
            
            System.debug('SuccessOUTSide');
            
            if(wo.WorkType.English__c == 'JUST Inside')
            {
                WorkStep ws1 = new WorkStep(Name = 'Before Photo', WorkPlanId = wp.Id, ExecutionOrder = 1);
                insert ws1;
                WorkStep ws2 = new WorkStep(Name = 'Vacuum interior ', Description = 'Carpets, seats / sides, doors, gear shift, rail).', WorkPlanId = wp.Id, ExecutionOrder = 2);
                insert ws2;
                WorkStep ws3 = new WorkStep(Name = 'Mirrors and car sun visors', Description = '- Rearview.\n'+
                                            '- Inner windshield.\n'+
                                            '- Top of the dashboard.', WorkPlanId = wp.Id, ExecutionOrder = 3);
                insert ws3;
                WorkStep ws4 = new WorkStep(Name = 'Dashboard', Description = '- Steering wheel.\n'+
                                            '- Speedometer.\n'+
                                            '- Ventilation grid / buttons / gps screen.\n'+
                                            '- Armrest & gear lever.\n'+
                                            '- Hand brake.\n'+
                                            '- Door panels.', WorkPlanId = wp.Id, ExecutionOrder = 4);
                insert ws4;
                WorkStep ws5 = new WorkStep(Name = 'After Photo', WorkPlanId = wp.Id, ExecutionOrder = 5);
                insert ws5;
            }
            else if(wo.WorkType.English__c == 'JUST Outside')
            {
                WorkStep ws1 = new WorkStep(Name = 'Before Photo', WorkPlanId = wp.Id, ExecutionOrder = 1);
                insert ws1;
                WorkStep ws2 = new WorkStep(Name = 'Dust removal', Description = 'Undusting from top to bottom (Just pass slightly the microfiber, WITHOUT RUBBER).', WorkPlanId = wp.Id, ExecutionOrder = 2);
                insert ws2;
                WorkStep ws3 = new WorkStep(Name = 'Cleaning with Green product', Description = 'Apply the Green product in a small area (like one door at the time) then clean (Left - right movements) then dry right after (left - right movements).\n'+
                                            '(Always 2 microfibers, one for the product, second to dry).', WorkPlanId = wp.Id, ExecutionOrder = 3);
                insert ws3;
                WorkStep ws4 = new WorkStep(Name = 'Windows', Description = 'Cleaning the windows with two CLEAN microfiber,\n'+ 
                                            'MANDATORY(Microfiber with the product, vitro-fiber to wipe) otherwise risk of mediocreresult with traces!', WorkPlanId = wp.Id, ExecutionOrder = 4);
                insert ws4;
                WorkStep ws5 = new WorkStep(Name = 'Rims', Description = 'Cleaning the rims with the remains of used microfibres (No vitrofibers, only microfibers).\n'+
                                            'If necessary, you can use the white product only to just moisten the rim.', WorkPlanId = wp.Id, ExecutionOrder = 5);
                insert ws5;
                WorkStep ws6 = new WorkStep(Name = 'After Photo', WorkPlanId = wp.Id, ExecutionOrder = 6);
                insert ws6;
            }
            else if(wo.WorkType.English__c == 'FULL')
            {
                WorkStep ws1 = new WorkStep(Name = 'Before Photo', WorkPlanId = wp.Id, ExecutionOrder = 1);
                insert ws1;
                WorkStep ws2 = new WorkStep(Name = 'Vacuum interior ', Description = 'Carpets, seats / sides, doors, gear shift, rail, trunk', WorkPlanId = wp.Id, ExecutionOrder = 2);
                insert ws2;
                WorkStep ws3 = new WorkStep(Name = 'Mirrors and car sun visors', Description = '- Rearview.\n'+
                                            '- Inner windshield.\n'+
                                            '- Top of the dashboard.', WorkPlanId = wp.Id, ExecutionOrder = 3);
                insert ws3;
                WorkStep ws4 = new WorkStep(Name = 'Dashboard', Description = '- Steering wheel.\n'+
                                            '- Speedometer.\n'+
                                            '- Ventilation grid / buttons / gps screen\n'+
                                            '- Armrest & gear lever\n'+
                                            '- Hand brake\n'+
                                            '- Door panels', WorkPlanId = wp.Id, ExecutionOrder = 4);
                insert ws4;
                WorkStep ws5 = new WorkStep(Name = 'Car body dust removal', Description = 'Undusting from top to bottom (Just pass slightly the microfiber, WITHOUT RUBBING)', WorkPlanId = wp.Id, ExecutionOrder = 5);
                insert ws5;
                WorkStep ws6 = new WorkStep(Name = 'Clean car body with C30 Green product', Description = 'Apply the Green product in a small area (like one door at the time) then clean (Left - right movements) then dry right after (left - right movements) (Always 2 microfibers, one for the product, second to dry)', WorkPlanId = wp.Id, ExecutionOrder = 6);
                insert ws6;
                WorkStep ws7 = new WorkStep(Name = 'Rims', Description = 'Cleaning the rims with the remains of used microfibres (No vitrofibers, only microfibers).\n'+
                                            'If necessary, you can use the white product only to just moisten the rim.', WorkPlanId = wp.Id, ExecutionOrder = 7);
                insert ws7;
                WorkStep ws8 = new WorkStep(Name = 'Windows', Description = 'Cleaning the windows with CLEAN microfiber, vitro-fiber.', WorkPlanId = wp.Id, ExecutionOrder = 8);
                insert ws8;
                WorkStep ws9 = new WorkStep(Name = 'After Photo', WorkPlanId = wp.Id, ExecutionOrder = 9);
                insert ws9;
            }
            
            system.debug(sa.ArrivalWindowEndTime);
            system.debug(sa.ArrivalWindowStartTime);
            system.debug(sa.Proceed__c);
            // FSL.ScheduleResult myResult = new FSL.ScheduleResult();
            Id schedulingPolicy = [Select Id FROM FSL__Scheduling_Policy__c Where Name Like 'Customer First One'].Id;
            // myResult = FSL.ScheduleService.schedule(schedulingPolicy, sa.Id);
            // List<AssignedResource> assignedres = [Select Id, ServiceAppointmentId, ServiceResourceId From AssignedResource Where ServiceAppointmentId = :sa.Id];
            // ServiceResource Employee = [Select Id, Name, Rating__c, Ratings__c From ServiceResource Where Id = :assignedres[0].ServiceResourceId Limit 1];
            // system.debug('emp'+Employee);
            // return Employee;
             scheduleAppointment(sa.Id, schedulingPolicy);
            List<AssignedResource> assignedres = [Select Id, ServiceAppointmentId, ServiceResourceId From AssignedResource Where ServiceAppointmentId = :sa.Id];
            ServiceResource Employee = [Select Id, Name, Rating__c, Ratings__c From ServiceResource limit 1];
            // return Employee;
            System.debug('ServiceAppt => startTime'+sa.ArrivalWindowStartTime + 'endTime' + sa.ArrivalWindowEndTime);
            return sa.Id;
        }
        else{
            System.debug('ServiceAppt => startTime'+sa.ArrivalWindowStartTime + 'endTime' + sa.ArrivalWindowEndTime);
            return sa.Id;
        }
    }
    
    @AuraEnabled
    public static String createLead(String mail, String customerType, String phoneNumber)
    {
        if(customerType == 'b2b')
        {
            
            List<Lead> leadlist = [Select Id, Email, Company from Lead where Email = :mail AND isConverted = False];
            LisT<Account> acclist = [Select Id, Email__c from Account where Email__c = :mail];
            if(leadlist.size()==0)
            {
                if(acclist.size() == 0)
                {
                    List<String> userEmail = mail.split('@');
                    String customerName = userEmail[0];
                    string newString = customerName.replaceAll('[0-9]','');
                    string newString1 = newString.replaceAll('[^a-zA-Z0-9]','');
                    customerName = newString1;
                    Lead l = new Lead(lastName = customerName, Company = customerName,email=mail, Phone = phoneNumber);
                    insert l;
                    return l.Id;
                }
                else
                {
                    system.debug(acclist[0].Id);
                    return acclist[0].Id;
                }
                
            }
            else
            {
                return leadlist[0].Id;
            }
        }
        else
        {
            List<Lead> leadlist = [Select Id, Email, Company from Lead where Email = :mail AND isConverted = False];
            LisT<Account> acclist = [Select Id, Email__c from Account where Email__c = :mail];
            if(leadlist.size()==0)
            {
                if(acclist.size() == 0)
                {
                    List<String> userEmail = mail.split('@');
                    String customerName = userEmail[0];
                    string newString = customerName.replaceAll('[0-9]','');
                    string newString1 = newString.replaceAll('[^a-zA-Z0-9]','');
                    customerName = newString1;
                    Lead l = new Lead(lastName = customerName, Company = customerName,email=mail);
                    insert l;
                    return l.Id;
                }
                else
                {
                    system.debug(acclist[0].Id);
                    return acclist[0].Id;
                }
                
            }
            else
            {
                return leadlist[0].Id;
            }
        }
    }
    
    @AuraEnabled
    public static String createWorkOrder(String leadId, String serviceId, String paymentMode, String territoryId, Integer numOfCars , String customerType , String selectedCurrency , Boolean Travel)
    {
        Schema.SObjectType LeadObject = Schema.Lead.getSObjectType();
        id io =(id)leadId;
        if(io.getSobjectType()==LeadObject)
        {
            Lead customer = [Select Id, lastName From Lead Where Id = :io limit 1];
            system.debug(serviceId);
            WorkTypeGroupMember work = [Select Id, WorkType.Id, WorkType.Name, WorkType.English__c, WorkTypeGroup.Payment_Method__c from WorkTypeGroupMember Where 
                                        WorkType.Id = :serviceId AND WorkTypeGroup.Payment_Method__c = :paymentMode Limit 1 ];
            if(numOfCars==null||numOfCars<1){
                numOfCars=1;
            }
            WorkOrder wo = new WorkOrder(LeadId__c = customer.Id, Subject= 'Work for '+customer.lastName, WorkTypeId = work.WorkType.Id, ServiceTerritoryId = territoryId, numberOfCars__c = numOfCars);
            insert wo;
            zaWash_Quote__c quoteRecord = new zaWash_Quote__c(Work_Order__c = wo.Id, Lead__c = customer.Id , Work_Type__c = work.WorkType.Id , Number_of_Cars__c = numOfCars , Service_Territory__c = territoryId , Currency__c = selectedCurrency);
            if(customerType == 'requestQuote'){
                quoteRecord.Customer_Type__c = 'B2B';
            }
            else{
                quoteRecord.Customer_Type__c = 'B2C';
            }
            insert quoteRecord;
            if(Travel == true)
            {
                List<WorkType> WorkTypeList = [Select Name , Price__c from WorkType where English__c = 'Travel' AND Currency__c = :selectedCurrency];
                CustomerOrder__c travelCustomerOrder = new CustomerOrder__c(Price__c = WorkTypeList[0].Price__c, Name = WorkTypeList[0].Name, Work_Type__c = WorkTypeList[0].Id, Quantity__c = 1 , AddOns__c= wo.Id ,zaWash_Quote__c = quoteRecord.Id , Status__c = 'Included');
                insert travelCustomerOrder;
            }
            return wo.Id;          
        }
        else
        {
            Account customer = [Select Id, Name From Account Where Id = :io limit 1];
            WorkTypeGroupMember work = [Select Id, WorkType.Id, WorkType.Name, WorkType.English__c, WorkTypeGroup.Payment_Method__c from WorkTypeGroupMember Where 
                                        WorkType.Id = :serviceId AND WorkTypeGroup.Payment_Method__c = :paymentMode Limit 1];
            if(numOfCars==null||numOfCars<1){
                numOfCars=1;
            }
            WorkOrder wo = new WorkOrder(AccountId = customer.Id, Subject= 'Work for '+customer.Name, WorkTypeId = work.WorkType.Id, ServiceTerritoryId = territoryId, numberOfCars__c = numOfCars);
            insert wo;
            zaWash_Quote__c quoteRecord = new zaWash_Quote__c(Work_Order__c = wo.Id, Account__c = customer.Id , Work_Type__c = work.WorkType.Id , Number_of_Cars__c = numOfCars , Service_Territory__c = territoryId , Currency__c = selectedCurrency);
            if(customerType == 'requestQuote'){
                quoteRecord.Customer_Type__c = 'B2B';
            }
            else{
                quoteRecord.Customer_Type__c = 'B2C';
            }
            insert quoteRecord;
            if(Travel == true)
            {
                List<WorkType> WorkTypeList = [Select Name , Price__c from WorkType where English__c = 'Travel' AND Currency__c = :selectedCurrency];
                CustomerOrder__c travelCustomerOrder = new CustomerOrder__c(Price__c = WorkTypeList[0].Price__c, Name = WorkTypeList[0].Name, Work_Type__c = WorkTypeList[0].Id, Quantity__c = 1 , AddOns__c= wo.Id ,zaWash_Quote__c = quoteRecord.Id,Status__c='Included');
                insert travelCustomerOrder;
            }
            return wo.Id;            
        }
    }
    
    @AuraEnabled
    public static List<String> getTimeSlots(Date SelectedDate, Id workOrderId, String cusType, String Address, Integer Duration)
    {
        Date useDue = Date.newInstance(SelectedDate.year(), SelectedDate.month()+1, SelectedDate.day());
        DateTime due = datetime.newInstance(useDue, Time.newInstance(23,59,00,00));
        DateTime early = datetime.newInstance(SelectedDate, Time.newInstance(00,00,00,01));
        String dt = String.valueOf(Date.today().toStartOfMonth());
        list<string> a=String.valueOf(SelectedDate).split(' ');
        SObjectType t = workOrderId.getSObjectType();
        Schema.SObjectType WorkOrderObject = Schema.WorkOrder.getSObjectType();
        
        if(t == WorkOrderObject)
        {
            WorkOrder wzo = [Select Id, (Select Id from zaWash_Quotes__r) from WorkOrder Where Id = :workOrderId];
            if(a[0] == dt)
            {
                List<ServiceAppointment> SAlist = [Select Id, Street, Customer_Type__c, ParentRecordId, Proceed__c from ServiceAppointment Where ParentRecordId = :workOrderId AND Proceed__c = False Order By CreatedDate DESC];
                if(SAlist.size() == 0)
                {
                    if(cusType == 'requestQuote')
                    {
                        cusType = 'B2B';
                    }
                    else if(cusType == 'bookNow'){
                        cusType = 'B2C';
                    }
                    ServiceAppointment SA = new ServiceAppointment(zaWash_Quote__c = wzo.zaWash_Quotes__r[0].Id ,Street = Address, Customer_Type__c = cusType, ParentRecordId = workOrderId, EarliestStartTime = SelectedDate, DueDate = due );
                    insert SA;
                    List<String> timeSlots = new List<String>();
                    DateTime startTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, 0, 0, 0));
                    DateTime endTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, Duration, 0, 0));
                    
                    while(endTime <= DateTime.newInstanceGmt(endtime.year(), endtime.month(), endtime.day(), 17, 0, 0)){
                        // if(startTime > System.now())
                        // {
                        endTime = startTime.addMinutes(Duration);
                        if(endTime >= DateTime.newInstanceGmt(endtime.year(), endtime.month(), endtime.day(), 17, 30, 0)){
                            break;
                        }
                        DateTime strtDate = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(0, 0, 0, 0));
                        DateTime strtDate1 = DateTime.newInstanceGmt(SelectedDate+1, Time.newInstance(0, 0, 0, 0));
                        List<ServiceAppointment> appointments = [SELECT Id,SchedStartTime,SchedEndTime FROM ServiceAppointment WHERE SchedStartTime >= :strtDate AND SchedStartTime <= :strtDate1];
                        List<ServiceAppointment> appointmentsNewList = new List<ServiceAppointment>();                            
                        for(ServiceAppointment appointment:appointments){
                            if((appointment.SchedStartTime >= startTime &&  appointment.SchedStartTime <= endTime) || 
                               (appointment.SchedEndTime >= endTime &&  appointment.SchedEndTime <= startTime)){
                                   appointmentsNewList.add(appointment);
                               }else if((appointment.SchedStartTime >= endTime &&  appointment.SchedStartTime <= startTime) || 
                                        (appointment.SchedEndTime >= startTime &&  appointment.SchedEndTime <= endTime)){
                                            appointmentsNewList.add(appointment);
                                        }
                        }
                        if(appointmentsNewList.isEmpty())
                        {
                            timeSlots.add(startTime+','+endTime);
                        }
                        startTime = endTime;
                        startTime=startTime.addMinutes(15);
                        // Duration = Duration + 15;
                        system.debug('endTime'+endTime+'startTime'+startTime);
                        // }else{
                        //     endTime = startTime.addMinutes(Duration);
                        // }
                    }
                    timeSlots.add(SA.Id);
                    return timeSlots;
                }
                else
                {
                    SAlist[0].EarliestStartTime = SelectedDate;
                    SAlist[0].DueDate = due;
                    SAlist[0].Street = Address;
                    SAlist[0].zaWash_Quote__c = wzo.zaWash_Quotes__r[0].Id;
                    update SAlist[0];
                    List<String> timeSlots = new List<String>();
                    DateTime startTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, 0, 0, 0));
                    DateTime endTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, Duration, 0, 0));
                    while(endTime <= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 0, 0) ){
                        endTime = startTime.addMinutes(Duration);
                        if(endTime >= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 30, 0)){
                            break;
                        }
                        DateTime strtDate = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(0, 0, 0, 0));
                        DateTime strtDate1 = DateTime.newInstanceGmt(SelectedDate+1, Time.newInstance(0, 0, 0, 0));
                        List<ServiceAppointment> appointments = [SELECT Id,SchedStartTime,SchedEndTime FROM ServiceAppointment WHERE SchedStartTime >= :strtDate AND SchedStartTime <= :strtDate1];
                        List<ServiceAppointment> appointmentsNewList = new List<ServiceAppointment>();                            
                        for(ServiceAppointment appointment:appointments){
                            if((appointment.SchedStartTime >= startTime &&  appointment.SchedStartTime <= endTime) || 
                               (appointment.SchedEndTime >= endTime &&  appointment.SchedEndTime <= startTime)){
                                   appointmentsNewList.add(appointment);
                               }else if((appointment.SchedStartTime >= endTime &&  appointment.SchedStartTime <= startTime) || 
                                        (appointment.SchedEndTime >= startTime &&  appointment.SchedEndTime <= endTime)){
                                            appointmentsNewList.add(appointment);
                                        }
                        }
                        if(appointmentsNewList.isEmpty())
                        {
                            timeSlots.add(startTime+','+endTime);
                        }
                        startTime = endTime;
                        startTime=startTime.addMinutes(15);
                        system.debug('endTime'+endTime+'startTime'+startTime);

                    }
                    timeSlots.add(SAlist[0].Id);
                    return timeSlots;

                }
            }
            else
            {
                List<ServiceAppointment> SAlist = [Select Id, Street, ParentRecordId, Proceed__c from ServiceAppointment Where ParentRecordId = :workOrderId AND Proceed__c = False Order By CreatedDate DESC];
                if(SAlist.size() == 0)
                {
                    if(cusType == 'requestQuote')
                    {
                        cusType = 'B2B';
                    }
                    else if(cusType == 'bookNow'){
                        cusType = 'B2C';
                    }
                    ServiceAppointment SA = new ServiceAppointment(zaWash_Quote__c = wzo.zaWash_Quotes__r[0].Id, Street = Address, Customer_Type__c = cusType, ParentRecordId = workOrderId, EarliestStartTime = early, DueDate = due );
                    insert SA;
                    List<String> timeSlots = new List<String>();
                    DateTime startTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, 0, 0, 0));
                    DateTime endTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, Duration, 0, 0));
                    while(endTime <= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 0, 0) ){
                        endTime = startTime.addMinutes(Duration);
                        if(endTime >= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 30, 0)){
                            break;
                        }
                        
                        DateTime strtDate = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(0, 0, 0, 0));
                        DateTime strtDate1 = DateTime.newInstanceGmt(SelectedDate+1, Time.newInstance(0, 0, 0, 0));
                        List<ServiceAppointment> appointments = [SELECT Id,SchedStartTime,SchedEndTime FROM ServiceAppointment WHERE SchedStartTime >= :strtDate AND SchedStartTime <= :strtDate1];
                        List<ServiceAppointment> appointmentsNewList = new List<ServiceAppointment>();                            
                        for(ServiceAppointment appointment:appointments){
                            if((appointment.SchedStartTime >= startTime &&  appointment.SchedStartTime <= endTime) || 
                               (appointment.SchedEndTime >= endTime &&  appointment.SchedEndTime <= startTime)){
                                   appointmentsNewList.add(appointment);
                               }else if((appointment.SchedStartTime >= endTime &&  appointment.SchedStartTime <= startTime) || 
                                        (appointment.SchedEndTime >= startTime &&  appointment.SchedEndTime <= endTime)){
                                            appointmentsNewList.add(appointment);
                                        }
                        }
                        if(appointmentsNewList.isEmpty())
                        {
                            timeSlots.add(startTime+','+endTime);
                        }
                        startTime = endTime;
                        startTime=startTime.addMinutes(15);
                        system.debug('endTime'+endTime+'startTime'+startTime);
                    }
                    timeSlots.add(SA.Id);
                    return timeSlots;
                }
                else
                {
                    SAlist[0].EarliestStartTime = SelectedDate;
                    SAlist[0].DueDate = due;
                    SAlist[0].Street = Address;
                    SAlist[0].zaWash_Quote__c = wzo.zaWash_Quotes__r[0].Id;
                    update SAlist[0];
                    List<String> timeSlots = new List<String>();
                    DateTime startTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, 0, 0, 0));
                    DateTime endTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, Duration, 0, 0));
                    while(endTime <= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 0, 0) ){
                        endTime = startTime.addMinutes(Duration);
                        if(endTime >= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 30, 0)){
                            break;
                        }
                        
                        DateTime strtDate = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(0, 0, 0, 0));
                        DateTime strtDate1 = DateTime.newInstanceGmt(SelectedDate+1, Time.newInstance(0, 0, 0, 0));
                        List<ServiceAppointment> appointments = [SELECT Id,SchedStartTime,SchedEndTime FROM ServiceAppointment WHERE SchedStartTime >= :strtDate AND SchedStartTime <= :strtDate1];
                        List<ServiceAppointment> appointmentsNewList = new List<ServiceAppointment>();                            
                        for(ServiceAppointment appointment:appointments){
                            if((appointment.SchedStartTime >= startTime &&  appointment.SchedStartTime <= endTime) || 
                               (appointment.SchedEndTime >= endTime &&  appointment.SchedEndTime <= startTime)){
                                   appointmentsNewList.add(appointment);
                               }else if((appointment.SchedStartTime >= endTime &&  appointment.SchedStartTime <= startTime) || 
                                        (appointment.SchedEndTime >= startTime &&  appointment.SchedEndTime <= endTime)){
                                            appointmentsNewList.add(appointment);
                                        }
                        }
                        if(appointmentsNewList.isEmpty())
                        {
                            timeSlots.add(startTime+','+endTime);
                        }
                        startTime = endTime;
                        startTime=startTime.addMinutes(15);
                        system.debug('endTime'+endTime+'startTime'+startTime);
                    }
                    timeSlots.add(SAlist[0].Id);
                    return timeSlots;
                }
            }
        }
        else
        {
            if(a[0] == dt)
            {
                ServiceAppointment SA = [Select Id, DueDate, Street, EarliestStartTime, Customer_Type__c, ParentRecordId, Proceed__c from ServiceAppointment Where Id = :workOrderId];
                SA.EarliestStartTime = SelectedDate;
                SA.DueDate = due;
                SA.Street = Address;
                update SA;
                List<String> timeSlots = new List<String>();
                DateTime startTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, 0, 0, 0));
                DateTime endTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, Duration, 0, 0));
                while(endTime <= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 0, 0) ){
                    endTime = startTime.addMinutes(Duration);
                    if(endTime >= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 30, 0)){
                        break;
                    }
                    
                    DateTime strtDate = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(0, 0, 0, 0));
                    DateTime strtDate1 = DateTime.newInstanceGmt(SelectedDate+1, Time.newInstance(0, 0, 0, 0));
                    List<ServiceAppointment> appointments = [SELECT Id,SchedStartTime,SchedEndTime FROM ServiceAppointment WHERE SchedStartTime >= :strtDate AND SchedStartTime <= :strtDate1];
                    List<ServiceAppointment> appointmentsNewList = new List<ServiceAppointment>();                            
                    for(ServiceAppointment appointment:appointments){
                        if((appointment.SchedStartTime >= startTime &&  appointment.SchedStartTime <= endTime) || 
                           (appointment.SchedEndTime >= endTime &&  appointment.SchedEndTime <= startTime)){
                               appointmentsNewList.add(appointment);
                           }else if((appointment.SchedStartTime >= endTime &&  appointment.SchedStartTime <= startTime) || 
                                    (appointment.SchedEndTime >= startTime &&  appointment.SchedEndTime <= endTime)){
                                        appointmentsNewList.add(appointment);
                                    }
                    }
                    if(appointmentsNewList.isEmpty())
                    {
                        timeSlots.add(startTime+','+endTime);
                    }
                    startTime = endTime;
                    startTime=startTime.addMinutes(15);
                    system.debug('endTime'+endTime+'startTime'+startTime);
                }
                timeSlots.add(SA.Id);
                return timeSlots;
            }
            else
            {
                ServiceAppointment SA = [Select Id, DueDate, Street, EarliestStartTime, Customer_Type__c, ParentRecordId, Proceed__c from ServiceAppointment Where Id = :workOrderId];
                SA.EarliestStartTime = SelectedDate;
                SA.DueDate = due;
                SA.Street = Address;
                update SA;
                List<String> timeSlots = new List<String>();
                DateTime startTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, 0, 0, 0));
                DateTime endTime = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(9, Duration, 0, 0));
                while(endTime <= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 0, 0) ){
                    endTime = startTime.addMinutes(Duration);
                    if(endTime >= dateTime.newInstance(endtime.year(), endtime.month(), endtime.day(), 17, 30, 0)){
                        break;
                    }
                    
                    DateTime strtDate = DateTime.newInstanceGmt(SelectedDate, Time.newInstance(0, 0, 0, 0));
                    DateTime strtDate1 = DateTime.newInstanceGmt(SelectedDate+1, Time.newInstance(0, 0, 0, 0));
                    List<ServiceAppointment> appointments = [SELECT Id,SchedStartTime,SchedEndTime FROM ServiceAppointment WHERE SchedStartTime >= :strtDate AND SchedStartTime <= :strtDate1];
                    List<ServiceAppointment> appointmentsNewList = new List<ServiceAppointment>();                            
                    for(ServiceAppointment appointment:appointments){
                        if((appointment.SchedStartTime >= startTime &&  appointment.SchedStartTime <= endTime) || 
                           (appointment.SchedEndTime >= endTime &&  appointment.SchedEndTime <= startTime)){
                               appointmentsNewList.add(appointment);
                           }else if((appointment.SchedStartTime >= endTime &&  appointment.SchedStartTime <= startTime) || 
                                    (appointment.SchedEndTime >= startTime &&  appointment.SchedEndTime <= endTime)){
                                        appointmentsNewList.add(appointment);
                                    }
                    }
                    if(appointmentsNewList.isEmpty())
                    {
                        timeSlots.add(startTime+','+endTime);
                    }
                    startTime = endTime;
                    startTime=startTime.addMinutes(15);
                    system.debug('endTime'+endTime+'startTime'+startTime);
                }
                timeSlots.add(SA.Id);
                return timeSlots;
            }
        }
    }
    
    @AuraEnabled
    public static string  getContactId(){
        User u = [SELECT Id, accountId FROM User WHERE Id =: UserInfo.getUserId()];
        System.debug(u.accountId);
        return u.accountId;
    }
    
    @AuraEnabled
    public static ServiceResource editAppointment(String ServiceApptId, String carPlate, String carModel, String carYear, String startT, String endT )
    {
        ServiceAppointment SA = [Select Id, DueDate, EarliestStartTime, SchedStartTime, SchedEndTime, ArrivalWindowEndTime, ArrivalWindowStartTime, Car_brand_and_model__c, 
                                 Car_plate__c, Car_Year__c from ServiceAppointment Where Id = :ServiceApptId];
        if(startT != null && endT != null)
        {
            Datetime startTime = Datetime.valueOf(startT);
            Datetime endTime = Datetime.valueOf(endT);
            SA.ArrivalWindowStartTime = startTime;
            SA.ArrivalWindowEndTime = endTime; 
        }
        SA.Car_brand_and_model__c = carModel;
        SA.Car_plate__c = carPlate;
        SA.Car_Year__c = carYear; 
        update SA;
        List<AssignedResource> assignedres = [Select Id, ServiceAppointmentId, ServiceResourceId From AssignedResource Where ServiceAppointmentId = :ServiceApptId];
        ServiceResource Employee = [Select Id, Name, Rating__c, Ratings__c From ServiceResource Where Id = :assignedres[0].ServiceResourceId Limit 1];
        return Employee;
    }
    
    @AuraEnabled
    public static void cancelAppointment(String serviceApptId)
    {
        ServiceAppointment SA = [Select Id, Status from ServiceAppointment Where Id = :serviceApptId];
        SA.status = 'Canceled';
        update SA;
    }
    
    
    @AuraEnabled
    public static List<ServiceAppointment> applyFilter(String accId,string status,string serviceDate,string serviceType,string carYear)
    {
        system.debug('Called');
        string query = 'Select Id, ArrivalWindowEndTime, ArrivalWindowStartTime, Status, AccountId, Account.Name, WorkTypeId, WorkType.Name, WorkType.icon__c, Car_brand_and_model__c, Car_plate__c, Car_Year__c,Total_Price__c,(Select ServiceResource.Name, Rating__c from ServiceResources ) from ServiceAppointment Where Proceed__c = true AND AccountId = :accId';
        if(status!='null'){
            query += ' AND Status ='+'\''+ status +'\' ';
        }
        else if(serviceDate!='null'){
            string startTime = serviceDate + ' 00:00:00';
            string endtime = serviceDate + ' 23:59:59';
            DateTime temp1 = DateTime.valueOf(startTime);
            DateTime temp2 = DateTime.valueOf(endtime);
            
            query += ' AND ArrivalWindowStartTime >=:temp1 AND ArrivalWindowStartTime <=:temp2 ';
        }
        else if(serviceType!='null'){
            query += ' AND WorkType.Name ='+'\''+serviceType+'\'';
        }
        else{
            list<string> splitstr = carYear.split(' - ');
            Integer startYear = Integer.valueOf(splitstr[0]);
            Integer endYear = Integer.valueOf(splitstr[1]);
            query += ' AND Car_Year__c >= '+'\''+ startYear +'\''+' AND Car_Year__c <='+'\''+ endYear+'\'';
        }
        system.debug('query==>'+query);
        list<ServiceAppointment> data=Database.query(query);
        return data;
    }
    @AuraEnabled(cacheable=true)
    public static list<sobject> getCustomizeAddons(string woId){
        //woId = '0WO3M000001Ps5zWAC';
        list<sobject> workord = new    list<sobject>();
        workorder wo=[select account.name,account.email__c,leadId__r.lastname ,leadId__r.email	,WorkTypeId, WorkOrderNumber,numberOfCars__c , (Select Name , Phone__c from zaWash_Quotes__r) from workorder where id =:woid];
        worktype wt=[select id,english__C,Price__c,name,icon__c  from worktype where id=: wo.WorkTypeId];
        if(wt.English__c=='Customize'){
            list<CustomerOrder__c> corders = database.query('select price__c,Name,id, AddOns__c,Quantity__c from  CustomerOrder__c where AddOns__c=\'' + woId + '\'');
            for(integer i=0;i<corders.size();i++){
                workord.add(corders[i]);
            }
            workord.add(wo);
            workord.add(wt);
            
            system.debug(workord);	
            return workord;
        }
        else{ 
            workord.add(wo);
            workord.add(wt);
            system.debug(workord);
            return workord;
        }
        
    }
    
    
    @InvocableMethod(label='MakePdf')
    public static void makePdfMethod(list<id> recordIds){
        
        Schema.SObjectType zaWash_Quot = Schema.zaWash_Quote__c.getSObjectType();
        Schema.SObjectType record = recordIds[0].getsobjecttype();
        If(record == zaWash_Quot){
            
            // Create a list to store the PDFs
            List<Attachment> pdfs = new List<Attachment>();
            list<zaWash_Quote__c> accountnames=[select Number_of_Cars__c, Name,Service_Price__c, Currency__c , Customer_Type__c , Total_Quote_Price__c, lead__r.name , lead__r.Phone , lead__r.Email,Ex_VAT_Price__c, Work_Order__r.address, Work_Order__r.street,Work_Type__r.name,account__r.name , account__r.Phone , account__r.email__c from zaWash_Quote__c where id in:recordIds];
            list<CustomerOrder__c> customerOrders=[Select Name,Quantity__c,Price__c from CustomerOrder__c where zaWash_Quote__c in:recordIds Order By CreatedDate DESC];
            
            integer i=0;
            // Iterate through each order and generate a PDF
            for (zaWash_Quote__c quote : accountnames) {
                if(customerOrders.size()==0){
                    system.debug('quote'+ quote.Work_Order__r.street+quote.Work_Order__r.address+accountnames[i].Work_Order__r.address+accountnames[i].Work_Order__r.street);
                    string nameof='';
                    String emailof = '';
                    if(accountnames[i].lead__r!=null){
                        nameof=accountnames[i].lead__r.Email;
                        emailof = accountnames[i].lead__r.Phone;
                    }else{
                        nameof=accountnames[i].account__r.email__c;
                        emailof = accountnames[i].account__r.Phone;
                    }
                    Date myDate = Date.today();
                    String todaysDateStr = myDate.day() + '.' + myDate.month() + '.' + myDate.year();
                    System.debug(todaysDateStr);
                    string Tax='';
                    
                    decimal taxcost = quote.Total_Quote_Price__c;
                    string Legalentity = '';
                    string Legaladdress = '';
                    if(quote.Currency__c == 'CHF')
                    {
                        Legalentity = '<p>zaWash Suisse Sàrl,</p>';
                        Legaladdress = '<p>Route des Jeunes 4bis </p><p>1227, Les Acacias<p>';
                    }
                    else
                    {
                        Legalentity = '<p>zaWash Lyon SAS,</p>';
                        Legaladdress = '<p>74 rue Louis Rustin </p><p>74160, Saint-Julien-En-Genevois</p>';
                    }

                    if(quote.Ex_VAT_Price__c == true){
                        tax = '0.0%';
                    }
                    else{
                        if(quote.Currency__c == 'CHF')
                        {
                            tax = '7.7%';
                        }
                        else
                        {
                            tax = '20%';
                        }
                    }

                    string htmlContent = '';

                    if(accountnames[i].Work_Order__r.street == null)
                    {
                        accountnames[i].Work_Order__r.street = '';
                    }
                    htmlContent = htmlContent + '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+accountnames[i].Work_Type__r.name+'</td><td style="text-align: center;padding: 10px 5px;">'+quote.Number_of_Cars__c+'</td><td style="text-align: center;padding: 10px 5px;">';
                    if(quote.Customer_Type__c == 'B2C')
                    {
                        if(quote.Currency__c == 'CHF')
                        {
                            htmlContent = htmlContent + ( quote.Service_Price__c - (quote.Service_Price__c / 107.7 * 7.7)).setScale(2);
                            // htmlContent = htmlContent + (quote.Service_Price__c / 1.077).setScale(2);
                        }
                        else
                        {
                            htmlContent = htmlContent + (quote.Service_Price__c - ( quote.Service_Price__c / 120 * 20)).setScale(2);
                            // htmlContent = htmlContent + (quote.Service_Price__c / 1.20).setScale(2);
                        }
                    }
                    else
                    {
                        htmlContent = htmlContent + (quote.Service_Price__c).setScale(2);
                    }

                    htmlContent = htmlContent + '</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                    // htmlContent = htmlContent + '</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                    if(tax == '0.0%')
                    {
                        if(quote.Customer_Type__c == 'B2C')
                        {
                            if(quote.Currency__c == 'CHF')
                            {
                                htmlContent = htmlContent + ( quote.Service_Price__c * quote.Number_of_Cars__c - (quote.Service_Price__c * quote.Number_of_Cars__c / 107.7 * 7.7)).setScale(2);
                                // htmlContent = htmlContent + (quote.Service_Price__c * quote.Number_of_Cars__c / 1.077).setScale(2);
                            }
                            else
                            {
                                htmlContent = htmlContent + ( quote.Service_Price__c * quote.Number_of_Cars__c - (quote.Service_Price__c * quote.Number_of_Cars__c / 120 * 20)).setScale(2);
                                // htmlContent = htmlContent + (quote.Service_Price__c * quote.Number_of_Cars__c / 1.20).setScale(2);
                            }
                        }
                        else
                        {
                            htmlContent = htmlContent + (quote.Service_Price__c * quote.Number_of_Cars__c).setScale(2);
                        }
                    }
                    else
                    {
                        if(quote.Customer_Type__c == 'B2C')
                        {
                            htmlContent = htmlContent + (quote.Service_Price__c  * quote.Number_of_Cars__c).setScale(2);
                        }
                        else
                        {
                            if(quote.Currency__c == 'CHF')
                            {
                                htmlContent = htmlContent + ((quote.Service_Price__c * quote.Number_of_Cars__c) + (quote.Service_Price__c * quote.Number_of_Cars__c * 7.7 / 100)).setScale(2);
                            }
                            else
                            {
                                htmlContent = htmlContent + ((quote.Service_Price__c * quote.Number_of_Cars__c) + (quote.Service_Price__c * quote.Number_of_Cars__c * 20 / 100)).setScale(2);
                            }
                        }
                    }
                    htmlContent = htmlContent + '</td></tr>';
                    // htmlContent = htmlContent + '</td></tr></table><table style="width:100%"><tr><td style="width:50%"></td><td style="width:50%"><hr></td></tr><tr><td style="width:50%"></td><td style="width:50%;"><div style="width:calc(100% - 20px);display: flex;justify-content: space-between;margin:0;padding:0px 10px;"><table style="width:100%"><tr><td><p style="margin:0;padding:0;">Amount excluding tax</p></td><td style="text-align: right;"><p style="margin:0;padding:0;">';
                    
                    String Amount = '';
                    
                    if(quote.Customer_Type__c == 'B2C')
                    {
                        if(quote.Currency__c == 'CHF')
                        {
                            Amount = Amount + ((quote.Service_Price__c * quote.Number_of_Cars__c) -  ((quote.Service_Price__c * quote.Number_of_Cars__c) / 107.7 * 7.7)).setScale(2);
                        }
                        else
                        {
                            Amount = Amount + ( (quote.Service_Price__c * quote.Number_of_Cars__c) - ((quote.Service_Price__c * quote.Number_of_Cars__c) / 120 * 20) ).setScale(2);
                        }
                    }
                    else
                    {
                        Amount = Amount + (quote.Service_Price__c * quote.Number_of_Cars__c).setScale(2);
                    }
                    
                    system.debug('Line 1136 : '+ quote.Id +','+ Legalentity+Legaladdress+','+ '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].Work_Order__r.street+'</p>' +','+ Amount +','+ quote.Id);
                    CreatePDFController.createAndAttachPDF(quote.Id , htmlContent , Legalentity+Legaladdress , '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].Work_Order__r.street+'</p>' , Amount , 'Quote');
                    // Blob pdfData = Blob.toPDF('<HTML><BODY>'+htmlContent+'</BODY></HTML>');
                    i++;

                }
                
                // Insert the PDF attachments  
                else{
                    
                    system.debug('quote'+ quote.Work_Order__r.street+quote.Work_Order__r.address+accountnames[i].Work_Order__r.address+accountnames[i].Work_Order__r.street);
                    string nameof='';
                    string emailof = '';
                    if(accountnames[i].lead__r!=null){
                        nameof=accountnames[i].lead__r.Email;
                        emailof = accountnames[i].lead__r.Phone;
                    }else{
                        nameof=accountnames[i].account__r.email__c;
                        emailof = accountnames[i].account__r.Phone;
                    }
                    Date myDate = Date.today();
                    String todaysDateStr = myDate.day() + '.' + myDate.month() + '.' + myDate.year();
                    
                    System.debug(todaysDateStr);
                    string Tax='';

                    string Legalentity = '';
                    string Legaladdress = '';
                    if(quote.Currency__c == 'CHF')
                    {
                        Legalentity = '<p>zaWash Suisse Sàrl,</p>';
                        Legaladdress = '<p>Route des Jeunes 4bis </p><p>1227, Les Acacias</p>';
                    }
                    else
                    {
                        Legalentity = '<p>zaWash Lyon SAS,</p>';
                        Legaladdress = ' <p>74 rue Louis Rustin </p><p>74160, Saint-Julien-En-Genevois</p>';
                    }

                    if(quote.Ex_VAT_Price__c == true){
                        tax = '0.0%';
                    }
                    else{
                        if(quote.Currency__c == 'CHF'){
                            tax = '7.7%';
                        }
                        else{
                            tax = '20%';
                        }
                    }
                    
                    decimal taxcost = 0;
                    decimal AmountExcludingTax = 0;
                    
                    string htmlContent = '';
                    // string htmlContent = '<div style="padding: 20px;font-family: sans-serif;"><p style="line-height: 25px;">'+Legalentity+'<br>'+Legaladdress+'</p><hr><table style="width:100%"><tr><td style="width:25%"></td><td style="width:25%"></td><td style="width:25%"></td><td style="width:25%"><p style="line-height: 25px;max-width:200px">'+nameof+'<br>';
                    if(accountnames[i].Work_Order__r.street == null){
                        accountnames[i].Work_Order__r.street = '';
                    }

                    htmlContent = htmlContent + '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+accountnames[i].Work_Type__r.name+'</td><td style="text-align: center;padding: 10px 5px;">'+quote.Number_of_Cars__c+'</td><td style="text-align: center;padding: 10px 5px;">';
                    // htmlContent = htmlContent + accountnames[i].Work_Order__r.street;
                    // htmlContent = htmlContent + '</p></td></tr></table><br><h1 style="color:green;margin:0;padding: 0;">'+quote.name+'</h1><p style="margin:0;padding: 10px 0px;line-height: 25px;font-weight: 500;">Date of quote : <br>'+todaysDateStr+'</p><hr><table style="width:100%"><tr><th style="text-align: left;padding: 10px 5px;">Description</th><th style="text-align: center;padding: 10px 5px;">Quantity</th><th style="text-align: center;padding: 10px 5px;">Unit Price</th><th style="text-align: center;padding: 10px 5px;">Taxes</th><th style="text-align: right;padding: 10px 5px;">Total price</th></tr><tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+accountnames[i].Work_Type__r.name+'</td><td style="text-align: center;padding: 10px 5px;">'+quote.Number_of_Cars__c+'</td><td style="text-align: center;padding: 10px 5px;">';
                    //quote.Service_Price__c   
                    if(quote.Customer_Type__c == 'B2C'){
                        if(quote.Currency__c == 'CHF'){
                            htmlContent = htmlContent + ( quote.Service_Price__c - (quote.Service_Price__c / 107.7 * 7.7)).setScale(2);
                            AmountExcludingTax = AmountExcludingTax + ( quote.Service_Price__c - (quote.Service_Price__c / 107.7 * 7.7));
                        }
                        else{
                            htmlContent = htmlContent + (quote.Service_Price__c - (quote.Service_Price__c / 120 * 20)).setScale(2);
                            AmountExcludingTax = AmountExcludingTax + (quote.Service_Price__c - (quote.Service_Price__c / 120 * 20));
                        }
                    }
                    else{
                        htmlContent = htmlContent + (quote.Service_Price__c).setScale(2);
                        AmountExcludingTax = AmountExcludingTax + (quote.Service_Price__c);
                    }
                    htmlContent = htmlContent + '</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                    // htmlContent = htmlContent + '</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                    
                    if(tax == '0.0%'){
                        if(quote.Customer_Type__c == 'B2C'){
                            if(quote.Currency__c == 'CHF'){
                                htmlContent = htmlContent + ( (quote.Service_Price__c * quote.Number_of_Cars__c) - (quote.Service_Price__c * quote.Number_of_Cars__c / 107.7 * 7.7)).setScale(2);
                            }
                            else{
                                htmlContent = htmlContent + ( (quote.Service_Price__c * quote.Number_of_Cars__c) - (quote.Service_Price__c * quote.Number_of_Cars__c / 120 * 20) ).setScale(2);
                            }
                        }
                        else{
                            htmlContent = htmlContent + (quote.Service_Price__c * quote.Number_of_Cars__c).setScale(2);
                        }
                    }
                    else{
                        if(quote.Customer_Type__c == 'B2C'){
                            htmlContent = htmlContent + (quote.Service_Price__c  * quote.Number_of_Cars__c).setScale(2);
                        }
                        else{
                            if(quote.Currency__c == 'CHF'){
                                htmlContent = htmlContent + ((quote.Service_Price__c * quote.Number_of_Cars__c) + (quote.Service_Price__c * quote.Number_of_Cars__c * 7.7 / 100)).setScale(2);
                            }
                            else{
                                htmlContent = htmlContent + ((quote.Service_Price__c * quote.Number_of_Cars__c) + (quote.Service_Price__c * quote.Number_of_Cars__c * 20 / 100)).setScale(2);
                            }
                        }
                    }
                    
                    htmlContent = htmlContent +'</td></tr>';
                    // String htmlContent1 = '';
                    
                    for(CustomerOrder__c order : customerOrders){

                        htmlContent = htmlContent + '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+order.Name+'</td><td style="text-align: center;padding: 10px 5px;">'+order.Quantity__c+'</td><td style="text-align: center;padding: 10px 5px;">';
                        // htmlContent1 = htmlContent1 + '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+order.Name+'</td><td style="text-align: center;padding: 10px 5px;">'+order.Quantity__c+'</td><td style="text-align: center;padding: 10px 5px;">';
                        //(order.Price__c / order.Quantity__c)
                        if(quote.Customer_Type__c == 'B2C'){
                            if(quote.Currency__c == 'CHF'){
                                htmlContent = htmlContent + ((order.Price__c / order.Quantity__c) - (order.Price__c / order.Quantity__c / 107.7 * 7.7)).setScale(2);  AmountExcludingTax = AmountExcludingTax + (((order.Price__c / order.Quantity__c) - (order.Price__c / order.Quantity__c / 107.7 * 7.7)) * order.Quantity__c);
                            }
                            else{
                                htmlContent = htmlContent + ((order.Price__c / order.Quantity__c) - (order.Price__c / order.Quantity__c / 120 * 20)).setScale(2);  AmountExcludingTax = AmountExcludingTax + (((order.Price__c / order.Quantity__c) - (order.Price__c / order.Quantity__c / 120 * 20)) * order.Quantity__c);
                            }
                        }
                        else
                        {
                            htmlContent = htmlContent + (order.Price__c / order.Quantity__c).setScale(2); AmountExcludingTax = AmountExcludingTax + (order.Price__c);
                        }

                        htmlContent = htmlContent + '</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                        // htmlContent1 = htmlContent1 + '</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                        
                        
                        if(tax == '0.0%')
                        {
                            if(quote.Customer_Type__c == 'B2C')
                            {
                                if(quote.Currency__c == 'CHF')
                                {
                                    htmlContent = htmlContent + (order.Price__c - (order.Price__c / 107.7 * 7.7)).setScale(2);
                                }
                                else
                                {
                                    htmlContent = htmlContent + (order.Price__c - (order.Price__c / 120 * 20)).setScale(2);
                                }
                            }
                            else
                            {
                                htmlContent = htmlContent + (order.Price__c).setScale(2);
                            }
                        }
                        else
                        {
                            if(quote.Customer_Type__c == 'B2C')
                            {
                                htmlContent = htmlContent + (order.Price__c).setScale(2);
                            }
                            else
                            {
                                if(quote.Currency__c == 'CHF')
                                {
                                    htmlContent = htmlContent + (order.Price__c + (order.Price__c * 7.7 / 100)).setScale(2);
                                }
                                else
                                {
                                    htmlContent = htmlContent + (order.Price__c + (order.Price__c * 20 / 100)).setScale(2);
                                }
                            }
                        }
                        
                        htmlContent = htmlContent + '</td></tr>';
                    }

                    // htmlContent1 = htmlContent1 + '</table><table style="width:100%"><tr><td style="width:50%"></td><td style="width:50%"><hr></td></tr><tr><td style="width:50%"></td><td style="width:50%;"><div style="width:calc(100% - 20px);display: flex;justify-content: space-between;margin:0;padding:0px 10px;"><table style="width:100%"><tr><td><p style="margin:0;padding:0;">Amount excluding tax</p></td><td style="text-align: right;"><p style="margin:0;padding:0;">';
                    
                    String Amount = '';

                    if(tax == '0.0%')
                    {
                        Amount = Amount + quote.Total_Quote_Price__c;
                    }
                    else
                    {
                        Amount = Amount + ( AmountExcludingTax * quote.Number_of_Cars__c ).setScale(2);
                    }
                    

                    system.debug('Line 1367 : '+ quote.Id +','+ Legalentity+Legaladdress +','+ '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].Work_Order__r.street+'</p>' +','+ Amount +','+ quote.Id);
                    CreatePDFController.createAndAttachPDF(quote.Id , htmlContent , Legalentity+Legaladdress , '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].Work_Order__r.street+'</p>' , Amount , 'Quote');
                    // Blob pdfData = Blob.toPDF('<HTML><BODY>'+htmlContent+'</BODY></HTML>');
                    i++;
                    
                }
                
                // Insert the PDF attachments
                
                
            }
           // insert pdfs;
            
        }
        
       else{
        invoicePdfmethod(recordIds);
       }  
    }


       @AuraEnabled
        public static void invoicePdfmethod(list <id> recordIds){
                List<Attachment> pdfs = new List<Attachment>();
                list<ServiceAppointment> accountnames=[select Discount_Allowed__c,Discount_Amount__c,Currency__c, street,Include_VAT__c,Account.name,account.email__C , account.Phone ,WorkType.name,WorkType.Price__c,WorkType.Country__c, ParentRecordId,Total_Price__c from ServiceAppointment where id in:recordIds];
                list<workorder> workord=[select numberOfCars__c from WorkOrder where id =:accountnames[0].parentrecordId];
                list<CustomerOrder__c> customerOrders=[Select Name,Quantity__c,Price__c from CustomerOrder__c where AddOns__c =:accountnames[0].parentrecordId Order By CreatedDate DESC];
                decimal amountAfterTax;
                decimal taxAmount;
                integer i=0;
                
                for (ServiceAppointment quote : accountnames) {
                    if(customerOrders.size()==0){
                        // system.debug('quote'+ quote.Work_Order__r.street+quote.Work_Order__r.address+accountnames[i].Work_Order__r.address+accountnames[i].Work_Order__r.street);
                        // string nameof='';
                        //  if(accountnames[i].lead!=null){
                        //      nameof=accountnames[i].lead.name;
                        //  }else{
                        string nameof=accountnames[i].account.email__c;
                        String emailof = accountnames[i].account.Phone;
                        //  }
                        Date myDate = Date.today();
                        String todaysDateStr = myDate.day() + '.' + myDate.month() + '.' + myDate.year();
                        string Legalentity='<p>zaWash Lyon SAS,</p>';
                        
                        System.debug(todaysDateStr);
                        string Tax='';
                        string CompanyAdress='<p>74 rue Louis Rustin </p><p>74160, Saint-Julien-En-Genevois</p>';
                        
                        decimal taxcost = quote.Total_Price__c;
                        if(quote.Include_VAT__c == false){
                            tax = '0.0%';
                            taxcost = 0.00;
                        }
                        else{
                            if (accountnames[i].Currency__c=='CHF') {
                                tax = '7.7%';
                                CompanyAdress='<p>Route des Jeunes 4bis </p><p>1227, Les Acacias</p>';
                                Legalentity='<p>zaWash Suisse Sàrl,</p>';
                                taxAmount =( accountnames[i].Total_Price__c / 107.7 * 7.7).setScale(2);
                                amountAfterTax = (accountnames[i].Total_Price__c - taxAmount).setScale(2);
                                
                            } else {
                                tax = '20%';
                                taxAmount =(accountnames[i].Total_Price__c / 120 * 20).setScale(2);
                                amountAfterTax = (accountnames[i].Total_Price__c - taxAmount).setScale(2);
                                
                            }
                            
                        }
                        
                        string htmlContent = '';
                        if(accountnames[i].street == null)
                        {
                            accountnames[i].street = '';
                        }
                        htmlContent = htmlContent + '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+accountnames[i].WorkType.name+'</td><td style="text-align: center;padding: 10px 5px;">'+1+'</td><td style="text-align: center;padding: 10px 5px;">'+amountAfterTax+'</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                        
                        if(tax == '0.0%')
                        {
                            htmlContent = htmlContent + ( (accountnames[i].Total_Price__c * workord[0].numberOfCars__c) / 1.077 ).setScale(2);
                        }
                        else
                        {
                            htmlContent = htmlContent + (accountnames[i].Total_Price__c * workord[0].numberOfCars__c).setScale(2);
                        }
                        htmlContent = htmlContent + '</td></tr>';

                        string Amount = '';

                        Amount = Amount+amountAfterTax;
                        Stripe_Logs__c sl1=new Stripe_Logs__c(logs__c='<HTML><BODY>'+htmlContent+'</BODY></HTML>');
                        insert sl1;

                        system.debug('Line 1492: '+ quote.Id  +','+ Legalentity+CompanyAdress +','+ '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].street+'</p>' +','+ Amount +','+ quote.Id);
                        CreatePDFController.createAndAttachPDF(quote.Id , htmlContent , Legalentity+CompanyAdress , '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].street+'</p>' , Amount , 'Invoice');
                        // Blob pdfData = Blob.toPDF('<HTML><BODY>'+htmlContent+'</BODY></HTML>');
                        i++;
                        // records.add(io);
                        
                        //pdfs.add(new Attachment(ParentId = quote.Id, Body = pdfData, Name = 'Invoice' + quote.Id + '.pdf', ContentType='application/pdf'));
                    }
                    
                    // Insert the PDF attachments  
                    else{
                        
                        // string nameof='';
                        //  if(accountnames[i].lead!=null){
                        //      nameof=accountnames[i].lead.name;
                        //  }else{
                        String nameof=accountnames[i].account.email__c;
                        String emailof = accountnames[i].account.Phone;
                        //  }
                        Date myDate = Date.today();
                        String todaysDateStr = myDate.day() + '.' + myDate.month() + '.' + myDate.year();
                        
                        System.debug(todaysDateStr);
                        string Tax='';
                        decimal totalCost;
                        string Legalentity='<p>zaWash Lyon SAS,</p>';
                        string CompanyAdress='<p>74 rue Louis Rustin </p><p>74160, Saint-Julien-En-Genevois</p>';
                        decimal totaltaxAmount;
                        decimal taxcost = quote.WorkType.Price__c;
                        if(quote.Include_VAT__c == false){
                            tax = '0.0%';
                            taxcost = 0.00;
                            if (accountnames[i].Currency__c=='CHF') {
                                //tax = '7.7%';
                                CompanyAdress='<p>Route des Jeunes 4bis </p><p>1227, Les Acacias</p>';
                                Legalentity='<p>zaWash Suisse Sàrl,</p>';
                                taxAmount =(accountnames[i].WorkType.Price__c / 107.7 * 7.7).setScale(2);
                                amountAfterTax = (accountnames[i].WorkType.Price__c - taxAmount).setScale(2);
                                totaltaxAmount =(accountnames[i].Total_Price__c / 107.7 * 7.7).setScale(2);
                                totalCost = amountAfterTax;
                                
                            } else {
                                //tax = '20%';
                                taxAmount =(accountnames[i].WorkType.Price__c / 120 * 20).setScale(2);
                                amountAfterTax = (accountnames[i].WorkType.Price__c - taxAmount).setScale(2);
                                totaltaxAmount =(accountnames[i].Total_Price__c/ 120 * 20).setScale(2);
                                totalCost =amountAfterTax ;
                                
                            }
                        }
                        else{
                            if (accountnames[i].Currency__c=='CHF') {
                                tax = '7.7%';
                                CompanyAdress='<p>Route des Jeunes 4bis </p><p>1227, Les Acacias</p>';
                                Legalentity='<p>zaWash Suisse Sàrl,</p>';
                                taxAmount =(accountnames[i].WorkType.Price__c / 107.7 * 7.7).setScale(2);
                                amountAfterTax = (accountnames[i].WorkType.Price__c - taxAmount).setScale(2);
                                totaltaxAmount =(accountnames[i].Total_Price__c / 107.7 * 7.7).setScale(2);
                                totalCost = (accountnames[i].Total_Price__c - totaltaxAmount).setScale(2);
                                
                            } else {
                                tax = '20%';
                                taxAmount =(accountnames[i].WorkType.Price__c / 120 * 20).setScale(2);
                                amountAfterTax = (accountnames[i].WorkType.Price__c - taxAmount).setScale(2);
                                totaltaxAmount =(accountnames[i].Total_Price__c/ 120 * 20).setScale(2);
                                totalCost = (accountnames[i].Total_Price__c - totaltaxAmount).setScale(2);
                                
                            }
                            
                            
                        }if(accountnames[i].street == null)
                        {
                            accountnames[i].street = '';
                        }
                        // htmlContent = htmlContent + accountnames[i].street;
                        string htmlContent = '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+accountnames[i].WorkType.name+'</td><td style="text-align: center;padding: 10px 5px;">'+workord[0].numberOfCars__c+'</td><td style="text-align: center;padding: 10px 5px;">'+amountAfterTax+'</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                        // htmlContent = htmlContent + '</td></tr></table><br></br><table><tr><td><h1 style="color:green">Invoice</h1></td></tr><tr><td><h3>Date of invoice :</h3></td></tr><tr><td><h4>'+todaysDateStr+'</h4></td></tr></table><h1 style="color:#ccc">_______________________________________</h1><br></br><table><tr style="font-weight:bold"><td>Description</td><td style="text-align:center">Quantity</td><td style="text-align:center">Unit Price</td><td style="text-align:center">Taxes</td><td style="text-align:right">Total price</td></tr><tr style="color:#555"><td>'+accountnames[i].WorkType.name+'</td><td style="text-align:center">'+workord[0].numberOfCars__c+'</td><td style="text-align:center">'+amountAfterTax+'</td><td style="text-align:center">'+tax+'</td><td style="text-align:right">';
                        if(tax == '0.0%')
                        {
                            htmlContent = htmlContent + taxcost.setScale(2);
                        }
                        else
                        {
                            htmlContent = htmlContent + taxcost.setScale(2);
                        }
                        
                        decimal AmountExcludingTax = amountAfterTax;
                        
                        htmlContent = htmlContent +'</td></tr>';
                        
                        for(CustomerOrder__c order : customerOrders)
                        {
                            decimal  totaltaxAt;
                            decimal tootalCost;
                            if (accountnames[i].Currency__c=='CHF') {
                                totaltaxAt =(order.Price__c / 107.7 * 7.7).setScale(2);
                                tootalCost = (order.Price__c- totaltaxAt).setScale(2);
                                
                            } else {
                                totaltaxAt =(order.Price__c / 107.7 * 7.7).setScale(2);
                                tootalCost = (order.Price__c- totaltaxAt).setScale(2);
                            }
                            htmlContent = htmlContent + '<tr style="background: #f5f5f5;"><td style="padding: 10px 5px;">'+order.Name+'</td><td style="text-align: center;padding: 10px 5px;">'+order.Quantity__c+'</td><td style="text-align: center;padding: 10px 5px;">'+tootalCost.setScale(2)+'</td><td style="text-align: center;padding: 10px 5px;">'+tax+'</td><td style="text-align: right;padding: 10px 5px;">';
                            // htmlContent = htmlContent + '<tr style="color:#555"><td>'+order.Name+'</td><td style="text-align:center">'+order.Quantity__c+'</td><td style="text-align:center">'+tootalCost.setScale(2)+'</td><td style="text-align:center">'+tax+'</td><td style="text-align:right">';
                            if(tax == '0.0%')
                            {
                                
                                htmlContent = htmlContent + order.Price__c.setScale(2);
                            }
                            else
                            {
                                htmlContent = htmlContent + order.Price__c.setScale(2);
                            }
                            
                            AmountExcludingTax = (AmountExcludingTax + ( order.Price__c / 107.7 * 7.7 )).setScale(2);
                            
                            htmlContent = htmlContent +'</td></tr>';
                        }


                        String Amount = '';
                        Amount = Amount + totalCost.setScale(2);
                        Stripe_Logs__c sl1=new Stripe_Logs__c(logs__c=htmlContent );
                        insert sl1;

                        system.debug('Line 1643 : '+ quote.Id +','+ Legalentity+CompanyAdress +','+ '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].street+'</p>' +','+ Amount +','+ quote.Id);
                        CreatePDFController.createAndAttachPDF(quote.Id , htmlContent , Legalentity+CompanyAdress , '<p>'+nameof + '</p><p>' + emailof + '</p><p>' + accountnames[i].street+'</p>' , Amount , 'Invoice');
                        
                        i++;
                    }
                    
                    // Insert the PDF attachments
                    
                    
                }
                //insert pdfs;
              
                
                list<attachment> pdfstosend=[SELECT Id, Name, Body, ContentType, ParentId FROM Attachment where parentId=:accountnames[0].id and name like 'Invoice%'];
//                 ContentVersion cv = new ContentVersion();
// cv.Title = pdfstosend[0].Name;
// cv.PathOnClient = pdfstosend[0].Name;
// cv.VersionData = pdfstosend[0].Body;
// cv.ContentLocation = 'S';
// cv.ContentDocumentId = null;
// insert cv;

                // Create a new email object
                //List<Attachment> attachments = [ SELECT Id, Name, Body, ContentType FROM Attachment WHERE ParentId in :recordIds ];
                // zaWash_Quote__c zwQ=[Select lead__c,lead__r.email,lead__r.name,account__r.email__c,account__r.name,name,Work_Type__r.name,Number_of_Cars__c from zaWash_Quote__c where id in:recordIds];
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                
                email.setToAddresses(new String[] {accountnames[0].account.email__c });
                string amountvalue=string.valueof(accountnames[0].Total_Price__c);
                if(accountnames[0].Discount_Allowed__c==true){
                    amountvalue=string.valueof(accountnames[0].Total_Price__c-decimal.valueof(accountnames[0].Discount_Amount__c).setScale(2));
                    if(decimal.valueOf(amountvalue)<=0){
                        amountvalue='0';
                    }
                }
                
                if(accountnames[0].WorkType.Country__c == 'USA'){ email.setSubject('Invoice Email');email.setHtmlBody('<p>Hello '+accountnames[0].account.name+' ,</p><p>Here is your invoice of the payment of CHF '+amountvalue+'</p><p>Service Type : '+accountnames[0].worktype.name+'</p><p>Number of Cars : '+workord[0].numberOfCars__c+'</p><p><br></p><p>Thank You .</p> <br> zaWash Team'); }else if(accountnames[0].WorkType.Country__c == 'Switzerland'){ email.setSubject('E-mail de facturation');email.setHtmlBody('<p>Bonjour '+accountnames[0].account.name+' ,</p><p>Voici votre facture de votre paiement de CHF'+amountvalue+'</p><p>Type de service : '+accountnames[0].worktype.name+'</p><p>Nombre de vehicules : '+workord[0].numberOfCars__c+'</p><p><br></p><p>merci .</p> <br> zaWash Team '); }else if(accountnames[0].WorkType.Country__c == 'Germany'){ email.setSubject('Rechnungs-E-Mail');email.setHtmlBody('<p>Hallo '+accountnames[0].account.name+' ,</p><p>Hier ist Ihre Rechnung ūber die Zahlung von CHF'+amountvalue+'</p><p>Servicetyp : '+accountnames[0].worktype.name+'</p><p>Anzahi der Autos : '+workord[0].numberOfCars__c+'</p><p><br></p><p>Danke.</p> <br> zaWash Team '); }                
                List<Messaging.EmailFileAttachment> fileAttachments = new List<Messaging.EmailFileAttachment>();
                for(Attachment a : pdfstosend){
                    Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
                    efa.setFileName(a.Name);
                    efa.setBody(a.Body);
                    efa.setContentType(a.ContentType);
                    fileAttachments.add(efa);
                }
                email.setFileAttachments(fileAttachments);Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
                                                    
            

        
    }
}