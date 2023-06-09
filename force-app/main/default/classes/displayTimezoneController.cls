public class displayTimezoneController {
    public String userTimezone { get; set; }
    private final ServiceAppointment serviceAppointment;

    public displayTimezoneController(ApexPages.StandardController controller) {
        serviceAppointment = (ServiceAppointment)controller.getRecord();
        userTimezone = UserInfo.getTimeZone().getID();
    }
    
    public ServiceAppointment getServiceAppointment() {
        return serviceAppointment;
    }
}