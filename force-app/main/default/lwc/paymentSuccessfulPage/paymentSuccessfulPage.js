import { LightningElement, api, track } from 'lwc';
import icons from '@salesforce/resourceUrl/Zawash';
import getLabels from '@salesforce/apex/zawashHelperClass.getLabels';
import getServiceAppointment from '@salesforce/apex/getSlots.getServiceAppointment';
import getServiceResource from '@salesforce/apex/zawashHelperClass.getServiceResource';


export default class PaymentSuccessfulPage extends LightningElement {
    @api channelName = '/event/Check_Assigned_Resource__e';

    @track isSpinner = true;
    subscription = {};
    washerIcon = icons + '/ZawashIcons/washer.png';
    @track assigned = false;
    @track label = {
        thankyouText: "",
        carWashAgentDetails: "",
        paymentSuccessful: ""
    }

    @track serviceResourceJSON = {};
    @track assignedResource = '';
    @api textLanguage = 'English';
    @track orderNumber;
    rating;
    @track serviceAppointmentId = 'test';

    connectedCallback() {

        getLabels({ language: this.textLanguage }).then(result => {
            result.forEach(element => {
                this.label[element.Name] = element[this.textLanguage + '__c'];
            });
        }).catch(error => {
        })
    }

    @api setserviceResourceJSON(serviceResourceJSON, serviceApptId) {
        console.log(serviceResourceJSON, serviceApptId);
        // assignResource(serviceApptId);
        getServiceAppointment({ apptId: serviceApptId }).then(result => {
            this.orderNumber = result.AppointmentNumber;
            // this.serviceResourceJSON = serviceResourceJSON
            // this.assignedResource = this.serviceResourceJSON.Name;
            // var sig = this.serviceResourceJSON.Ratings__c;
            // var d = sig.split('<');
            // var e = d[1].split('=');
            // var f = e[1].split(' ');
            // var g = f[0].split('"');
            // this.rating = `https://zawash--sandbox.sandbox.lightning.force.com` + g[1];
            this.assignResource(serviceApptId);
        }).catch(err => {
            console.log(err);
        })

    }





    assignResource(serviceApptId) {
        console.log('in');
        var self = this;
        var count = 1;
        var intervalVar = setInterval(fun=> {
            getServiceResource({ apptId: serviceApptId }).then(result => {
                if (result != null) {
                    console.log('got resource');
                    clearInterval(intervalVar);
                    self.assignedResource = result.Name;
                    var sig = result.Ratings__c;
                    var d = sig.split('<');
                    var e = d[1].split('=');
                    var f = e[1].split(' ');
                    var g = f[0].split('"');
                    self.rating = `https://zawash--sandbox.sandbox.lightning.force.com` + g[1];
                    self.isSpinner = false;
                    self.assigned = true;
                    }
                else {
                    if (count == 3) {
                        clearInterval(intervalVar);
                        self.assigned = false;
                    }
                }
                count++;
            }).catch(err => {
                console.log(err);
            })

        }, 4000);



    }
}